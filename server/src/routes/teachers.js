const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/teachers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Преподаватели" ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/teachers/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Преподаватели" WHERE id = $1', [parseInt(req.params.id)]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/teachers', async (req, res) => {
  const { name, email } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  try {
    const result = await pool.query(
      'INSERT INTO "Преподаватели" (name, email) VALUES ($1, $2) RETURNING *',
      [name, email || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/teachers/:id', async (req, res) => {
  const { name, email } = req.body;
  try {
    const result = await pool.query(
      `UPDATE "Преподаватели"
       SET name = COALESCE($1, name), email = COALESCE($2, email)
       WHERE id = $3 RETURNING *`,
      [name || null, email || null, parseInt(req.params.id)]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/teachers/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM "Преподаватели" WHERE id = $1 RETURNING id', [parseInt(req.params.id)]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
