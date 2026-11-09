const { DatabaseSync } = require("node:sqlite");
const fs = require("node:fs");
const path = require("node:path");

const dbPath = path.join(process.cwd(), "data", "thenam.db");

if (!fs.existsSync(dbPath)) {
  throw new Error("SQLite database not found: " + dbPath);
}

const db = new DatabaseSync(dbPath, { readOnly: true });

try {
  const objects = db.prepare(`
    SELECT type, name, tbl_name, sql
    FROM sqlite_master
    WHERE name NOT LIKE 'sqlite_%'
    ORDER BY type, name
  `).all();

  const tables = objects.filter(x => x.type === "table");
  const report = [];

  report.push("THENAM SQLITE MIGRATION INVENTORY");
  report.push("Database: " + dbPath);
  report.push("");

  for (const table of tables) {
    const name = table.name;
    const safeName = name.replace(/"/g, '""');

    const count = db.prepare(
      `SELECT COUNT(*) AS total FROM "${safeName}"`
    ).get();

    report.push("========================================");
    report.push("TABLE: " + name);
    report.push("ROW COUNT: " + count.total);
    report.push("CREATE SQL:");
    report.push(table.sql || "Not available");
    report.push("COLUMNS:");
    report.push(JSON.stringify(
      db.prepare(`PRAGMA table_info("${safeName}")`).all(),
      null,
      2
    ));
    report.push("FOREIGN KEYS:");
    report.push(JSON.stringify(
      db.prepare(`PRAGMA foreign_key_list("${safeName}")`).all(),
      null,
      2
    ));
    report.push("INDEXES:");
    report.push(JSON.stringify(
      db.prepare(`PRAGMA index_list("${safeName}")`).all(),
      null,
      2
    ));
    report.push("");
  }

  report.push("ALL DATABASE OBJECTS:");
  report.push(JSON.stringify(objects, null, 2));

  fs.writeFileSync(
    "sqlite-migration-inventory.txt",
    report.join("\n"),
    "utf8"
  );

  console.log("Inventory created: sqlite-migration-inventory.txt");
  console.log("Tables inspected:", tables.length);
} finally {
  db.close();
}
