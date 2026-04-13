const express = require('express');
const router = express.Router();
const pool = require('../db');
const { getByAlias } = require('../tables');

router.get('/subjects/:alias', async (req, res) => {
  const entry = getByAlias(req.params.alias);
  if (!entry) return res.status(400).json({ error: 'Unknown direction' });

  try {
    const result = await pool.query(
      `SELECT s.id, s.subject, s.status_id,
              p.id AS teacher_id, p.name AS teacher_name, p.email AS teacher_email,
              st.name AS status_name
       FROM subjects s
       LEFT JOIN teachers p ON s.teacher_id = p.id
       LEFT JOIN statuses st ON s.status_id = st.id
       WHERE s.direction_id = $1
       ORDER BY s.id`,
      [entry.id],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/subjects/:alias/:id', async (req, res) => {
  const entry = getByAlias(req.params.alias);
  if (!entry) return res.status(400).json({ error: 'Unknown direction' });
  const id = parseInt(req.params.id);

  try {
    const result = await pool.query(
      `SELECT s.id, s.subject, s.status_id,
              p.id AS teacher_id, p.name AS teacher_name, p.email AS teacher_email,
              st.name AS status_name
       FROM subjects s
       LEFT JOIN teachers p ON s.teacher_id = p.id
       LEFT JOIN statuses st ON s.status_id = st.id
       WHERE s.id = $1 AND s.direction_id = $2`,
      [id, entry.id],
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/subjects/:alias', async (req, res) => {
  const entry = getByAlias(req.params.alias);
  if (!entry) return res.status(400).json({ error: 'Unknown direction' });

  const { subject, teacherId, statusId } = req.body;
  if (!subject) return res.status(400).json({ error: 'subject is required' });

  try {
    const result = await pool.query(
      `INSERT INTO subjects (direction_id, subject, teacher_id, status_id)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [entry.id, subject, teacherId || null, statusId || null],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/subjects/:alias/:id', async (req, res) => {
  const entry = getByAlias(req.params.alias);
  if (!entry) return res.status(400).json({ error: 'Unknown direction' });
  const id = parseInt(req.params.id);

  const { subject, teacherId, statusId } = req.body;
  try {
    const result = await pool.query(
      `UPDATE subjects
       SET subject    = COALESCE($1, subject),
           teacher_id = COALESCE($2, teacher_id),
           status_id  = COALESCE($3, status_id)
       WHERE id = $4 AND direction_id = $5
       RETURNING *`,
      [subject || null, teacherId || null, statusId || null, id, entry.id],
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/subjects/:alias/:id', async (req, res) => {
  const entry = getByAlias(req.params.alias);
  if (!entry) return res.status(400).json({ error: 'Unknown direction' });
  const id = parseInt(req.params.id);

  try {
    const result = await pool.query(
      `DELETE FROM subjects WHERE id = $1 AND direction_id = $2 RETURNING id`,
      [id, entry.id],
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
