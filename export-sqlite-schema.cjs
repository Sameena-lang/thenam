const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync('./data/thenam.db', { readOnly: true });

const rows = db.prepare(`
  SELECT name, sql
  FROM sqlite_master
  WHERE type IN ('table', 'index')
    AND name NOT LIKE 'sqlite_%'
    AND sql IS NOT NULL
  ORDER BY type, name
`).all();

for (const row of rows) {
  console.log(row.sql + ';\n');
}

db.close();
