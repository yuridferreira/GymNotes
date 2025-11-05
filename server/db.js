const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL ||
  `postgresql://${process.env.POSTGRES_USER || 'meu_usuario'}:${process.env.POSTGRES_PASSWORD || 'senha'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || 5432}/${process.env.POSTGRES_DB || 'meu_banco'}`;

const pool = new Pool({ connectionString });

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
