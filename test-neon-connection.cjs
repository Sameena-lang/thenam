const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000
});

async function main() {
  try {
    const result = await pool.query(
      "SELECT current_database() AS database, current_user AS role"
    );

    console.log("Connected successfully:", result.rows[0]);
  } catch (error) {
    console.error("Connection failed:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
