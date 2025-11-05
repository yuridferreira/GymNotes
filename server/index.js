require('dotenv').config();
const express = require('express');
const db = require('./db');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

app.get('/users', async (req, res) => {
  try {
    // exemplo: tabela 'users' deve existir no seu banco
    const { rows } = await db.query('SELECT id, name, email FROM users LIMIT 100');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
