const express = require('express');
const router = express.Router();
const pool = require('../db');
const tables = require('../tables');

router.get('/directions', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.id, d.code, d.name AS direction, d.profile,
              dl.id AS degree_level_id, dl.name AS degree_level
       FROM directions d
       JOIN degree_levels dl ON d.degree_level_id = dl.id
       ORDER BY dl.id, d.code, d.id`,
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/degree-levels', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name FROM degree_levels ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/directions', async (req, res) => {
  const { degreeLevelId, code, name, profile } = req.body;
  if (!degreeLevelId || !code || !name || !profile) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO directions (degree_level_id, code, name, profile)
       VALUES ($1, $2, $3, $4) RETURNING id, code, name AS direction, profile`,
      [degreeLevelId, code, name, profile],
    );
    await tables.init();
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/directions/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { degreeLevelId, code, name, profile } = req.body;
  try {
    const result = await pool.query(
      `UPDATE directions
       SET degree_level_id = COALESCE($1, degree_level_id),
           code            = COALESCE($2, code),
           name            = COALESCE($3, name),
           profile         = COALESCE($4, profile)
       WHERE id = $5
       RETURNING id, code, name AS direction, profile`,
      [degreeLevelId || null, code || null, name || null, profile || null, id],
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    await tables.init();
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/directions/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await pool.query('DELETE FROM directions WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    await tables.init();
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/degree-levels', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  try {
    const result = await pool.query(
      'INSERT INTO degree_levels (name) VALUES ($1) RETURNING id, name',
      [name],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Already exists' });
    res.status(500).json({ error: err.message });
  }
});

router.delete('/degree-levels/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await pool.query('DELETE FROM degree_levels WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    if (err.code === '23503') return res.status(409).json({ error: 'Has linked directions' });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
