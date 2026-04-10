const express = require('express');
const router = express.Router();
const pool = require('../db');
const { TABLES, isValidTable } = require('../tables');

router.get('/tables', (req, res) => {
  res.json(TABLES.map((t) => t.name));
});

router.get('/teachers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM teachers ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/subjects/:table', async (req, res) => {
  const table = req.params.table;
  if (!isValidTable(table)) return res.status(400).json({ error: 'Unknown table' });

  try {
    const hasComment = await pool.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_name = $1 AND column_name = 'comment'`,
      [table],
    );
    const commentCol = hasComment.rows.length > 0 ? 's.comment,' : '';

    const result = await pool.query(
      `SELECT s.id, s.subject, s.status_id, ${commentCol}
              p.id AS teacher_id, p.name AS teacher_name, p.email AS teacher_email,
              st.name AS status_name
       FROM "${table}" s
       LEFT JOIN teachers p ON s.teacher_id = p.id
       LEFT JOIN statuses st ON s.status_id = st.id
       ORDER BY s.id`,
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/subjects/:table/:id', async (req, res) => {
  const table = req.params.table;
  const id = parseInt(req.params.id);
  if (!isValidTable(table)) return res.status(400).json({ error: 'Unknown table' });

  try {
    const hasComment = await pool.query(
      `SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = 'comment'`,
      [table],
    );
    const commentCol = hasComment.rows.length > 0 ? 's.comment,' : '';

    const result = await pool.query(
      `SELECT s.id, s.subject, s.status_id, ${commentCol}
              p.id AS teacher_id, p.name AS teacher_name, p.email AS teacher_email,
              st.name AS status_name
       FROM "${table}" s
       LEFT JOIN teachers p ON s.teacher_id = p.id
       LEFT JOIN statuses st ON s.status_id = st.id
       WHERE s.id = $1`,
      [id],
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/subjects/:table', async (req, res) => {
  const table = req.params.table;
  if (!isValidTable(table)) return res.status(400).json({ error: 'Unknown table' });

  const { subject, teacherId, statusId } = req.body;
  if (!subject) return res.status(400).json({ error: 'subject is required' });

  try {
    const result = await pool.query(
      `INSERT INTO "${table}" (subject, teacher_id, status_id)
       VALUES ($1, $2, $3) RETURNING id`,
      [subject, teacherId || null, statusId || null],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/subjects/:table/:id', async (req, res) => {
  const table = req.params.table;
  const id = parseInt(req.params.id);
  if (!isValidTable(table)) return res.status(400).json({ error: 'Unknown table' });

  const { subject, teacherId, statusId } = req.body;
  try {
    const result = await pool.query(
      `UPDATE "${table}"
       SET subject = COALESCE($1, subject),
           teacher_id = COALESCE($2, teacher_id),
           status_id = COALESCE($3, status_id)
       WHERE id = $4 RETURNING *`,
      [subject || null, teacherId || null, statusId || null, id],
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/subjects/:table/:id', async (req, res) => {
  const table = req.params.table;
  const id = parseInt(req.params.id);
  if (!isValidTable(table)) return res.status(400).json({ error: 'Unknown table' });

  try {
    const result = await pool.query(`DELETE FROM "${table}" WHERE id = $1 RETURNING id`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
