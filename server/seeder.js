require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const sqlPath = path.join(__dirname, '..', 'infra', 'seed_users.sql');
if (!fs.existsSync(sqlPath)) {
  console.error('Seed file not found:', sqlPath);
  process.exit(1);
}

const sql = fs.readFileSync(sqlPath, 'utf8');

const connectionString = process.env.DATABASE_URL ||
  `postgresql://${process.env.POSTGRES_USER || 'YuriFerreira'}:${process.env.POSTGRES_PASSWORD || 'Yuri2005'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || 5432}/${process.env.POSTGRES_DB || 'postgres'}`;

const pool = new Pool({ connectionString });

(async () => {
  try {
    console.log('Running seed against', connectionString);
    await pool.query(sql);
    console.log('Seed completed successfully.');
  } catch (err) {
    console.error('Seed failed:', err.message || err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
