const express = require('express');
const router = express.Router();
const pool = require('../db');
const { getTables } = require('../tables');

router.get('/teachers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM teachers ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/teachers/:id/subjects', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const parts = getTables().map(
      (t) =>
        `SELECT '${t.alias}' AS table_name, s.id, s.subject FROM "${t.name}" s WHERE s.teacher_id = ${id}`,
    );
    const result = await pool.query(parts.join(' UNION ALL ') + ' ORDER BY table_name, id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/teachers', async (req, res) => {
  const { name, email } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  try {
    const result = await pool.query(
      'INSERT INTO teachers (name, email) VALUES ($1, $2) RETURNING *',
      [name, email || null],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/teachers/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, email } = req.body;
  try {
    const result = await pool.query(
      'UPDATE teachers SET name = COALESCE($1, name), email = $2 WHERE id = $3 RETURNING *',
      [name || null, email ?? null, id],
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/teachers/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await pool.query('DELETE FROM teachers WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
