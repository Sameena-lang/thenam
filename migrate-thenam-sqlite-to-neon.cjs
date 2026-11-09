// THENAM SQLite -> Neon PostgreSQL data migration.
// Copies rows only. Does not alter, delete, or rename anything in SQLite.
// Safety checks: expected database, exactly 16 target tables, empty target tables,
// matching source/target columns, one PostgreSQL transaction, and row-count checks.

const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { Client } = require('pg');

// Parent table must be copied before admin_sessions because of its foreign key.
const TABLES = [
  'admin_users',
  'admin_notifications',
  'admin_sessions',
  'analytics_events',
  'analytics_pageviews',
  'applications',
  'audit_logs',
  'inquiries',
  'login_attempts',
  'media',
  'products',
  'projects',
  'services',
  'site_content',
  'site_settings',
  'users',
];

function quoteIdentifier(identifier) {
  // Identifiers are read from the fixed table list / SQLite PRAGMA metadata.
  return `"${String(identifier).replace(/"/g, '""')}"`;
}

function toCount(value) {
  const count = Number(value);
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new Error(`Invalid row count returned by database: ${value}`);
  }
  return count;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL was not found. Check the project .env file.');
  }

  const configuredDbPath = process.env.DATABASE_PATH || './data/thenam.db';
  const sqlitePath = path.resolve(process.cwd(), configuredDbPath);
  if (!fs.existsSync(sqlitePath)) {
    throw new Error(`SQLite database file was not found: ${sqlitePath}`);
  }

  console.log(`SQLite source: ${sqlitePath}`);
  const sqlite = new DatabaseSync(sqlitePath, { readOnly: true });
  const pg = new Client({ connectionString });
  let pgTransactionStarted = false;
  let sqliteTransactionStarted = false;

  try {
    // Hold a consistent read snapshot for the full export.
    sqlite.exec('PRAGMA query_only = ON');
    sqlite.exec('BEGIN');
    sqliteTransactionStarted = true;

    const sourceTables = sqlite.prepare(`
      SELECT name
      FROM sqlite_master
      WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `).all().map((row) => row.name);

    const missingSourceTables = TABLES.filter((table) => !sourceTables.includes(table));
    if (missingSourceTables.length) {
      throw new Error(`SQLite is missing expected table(s): ${missingSourceTables.join(', ')}`);
    }

    await pg.connect();
    const identity = await pg.query(
      'SELECT current_database() AS database_name, current_user AS connected_role'
    );
    const { database_name, connected_role } = identity.rows[0];
    console.log(`Connected Neon database: ${database_name}`);
    console.log(`Connected role: ${connected_role}`);

    if (database_name !== 'neondb') {
      throw new Error(`Safety stop: expected Neon database neondb, but connected to ${database_name}.`);
    }

    const targetTablesResult = await pg.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    const targetTables = targetTablesResult.rows.map((row) => row.table_name);
    const expectedSorted = [...TABLES].sort();
    if (targetTables.length !== TABLES.length ||
        targetTables.some((table, index) => table !== expectedSorted[index])) {
      throw new Error(
        `Safety stop: expected exactly the 16 THENAM tables in public, found ${targetTables.length}. No data was copied.`
      );
    }

    // Never merge into or overwrite a database that already contains rows.
    const existingTargetRows = [];
    for (const table of TABLES) {
      const result = await pg.query(`SELECT COUNT(*)::bigint AS count FROM public.${quoteIdentifier(table)}`);
      const count = toCount(result.rows[0].count);
      if (count > 0) existingTargetRows.push(`${table}=${count}`);
    }
    if (existingTargetRows.length) {
      throw new Error(
        `Safety stop: Neon tables are not empty (${existingTargetRows.join(', ')}). Nothing was copied.`
      );
    }

    const sourceCounts = {};
    let sourceTotal = 0;
    for (const table of TABLES) {
      const sourceCount = toCount(sqlite.prepare(`SELECT COUNT(*) AS count FROM ${quoteIdentifier(table)}`).get().count);
      sourceCounts[table] = sourceCount;
      sourceTotal += sourceCount;

      const sourceColumns = sqlite.prepare(`PRAGMA table_info(${quoteIdentifier(table)})`)
        .all().map((column) => column.name);
      const targetColumnsResult = await pg.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [table]);
      const targetColumns = targetColumnsResult.rows.map((column) => column.column_name);

      if (sourceColumns.length !== targetColumns.length ||
          sourceColumns.some((column, index) => column !== targetColumns[index])) {
        throw new Error(
          `Safety stop: columns do not match for ${table}. SQLite: [${sourceColumns.join(', ')}]; PostgreSQL: [${targetColumns.join(', ')}].`
        );
      }
    }

    console.log(`\nSource contains ${sourceTotal} record(s) across ${TABLES.length} tables:`);
    for (const table of TABLES) console.log(`- ${table}: ${sourceCounts[table]}`);

    await pg.query('BEGIN');
    pgTransactionStarted = true;

    let copiedTotal = 0;
    for (const table of TABLES) {
      const columns = sqlite.prepare(`PRAGMA table_info(${quoteIdentifier(table)})`)
        .all().map((column) => column.name);
      const quotedColumns = columns.map(quoteIdentifier).join(', ');
      const sourceRows = sqlite.prepare(
        `SELECT ${quotedColumns} FROM ${quoteIdentifier(table)}`
      ).all();

      const batchSize = 50;
      for (let offset = 0; offset < sourceRows.length; offset += batchSize) {
        const batch = sourceRows.slice(offset, offset + batchSize);
        const values = [];
        const rowPlaceholders = batch.map((row) => {
          const placeholders = columns.map((column) => {
            values.push(row[column] === undefined ? null : row[column]);
            return `$${values.length}`;
          });
          return `(${placeholders.join(', ')})`;
        });

        await pg.query(
          `INSERT INTO public.${quoteIdentifier(table)} (${quotedColumns}) VALUES ${rowPlaceholders.join(', ')}`,
          values
        );
      }

      copiedTotal += sourceRows.length;
      console.log(`Copied ${table}: ${sourceRows.length}`);
    }

    // Verify every table inside the same transaction before committing.
    for (const table of TABLES) {
      const result = await pg.query(`SELECT COUNT(*)::bigint AS count FROM public.${quoteIdentifier(table)}`);
      const targetCount = toCount(result.rows[0].count);
      if (targetCount !== sourceCounts[table]) {
        throw new Error(
          `Verification failed for ${table}: SQLite=${sourceCounts[table]}, Neon=${targetCount}. Transaction will be rolled back.`
        );
      }
    }

    await pg.query('COMMIT');
    pgTransactionStarted = false;

    console.log(`\nSUCCESS: copied and verified ${copiedTotal} record(s) across all 16 tables.`);
    console.log('The original SQLite database was opened read-only and was not changed.');
  } catch (error) {
    if (pgTransactionStarted) {
      try { await pg.query('ROLLBACK'); } catch (rollbackError) {
        console.error('Warning: PostgreSQL rollback reported:', rollbackError.message || rollbackError);
      }
    }
    throw error;
  } finally {
    if (sqliteTransactionStarted) {
      try { sqlite.exec('ROLLBACK'); } catch { /* read-only snapshot cleanup */ }
    }
    try { sqlite.close(); } catch { /* already closed */ }
    try { await pg.end(); } catch { /* connection may not have opened */ }
  }
}

main().catch((error) => {
  console.error('\nDATA MIGRATION STOPPED:');
  console.error(error.message || error);
  console.error('Do not delete or modify the SQLite database. Share this output before retrying.');
  process.exitCode = 1;
});
