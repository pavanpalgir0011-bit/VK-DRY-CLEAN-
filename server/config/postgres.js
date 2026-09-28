const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

let pool = null;
if (connectionString) {
  try {
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    pool.query('SELECT NOW()')
      .then(() => console.log('✅ Supabase PostgreSQL Pool connected successfully!'))
      .catch((err) => console.error('Supabase Postgres connection error:', err.message));
  } catch (err) {
    console.error('Failed to initialize Supabase PostgreSQL Pool:', err.message);
  }
}

module.exports = {
  query: (text, params) => (pool ? pool.query(text, params) : Promise.reject(new Error('Postgres not connected'))),
  pool,
};
