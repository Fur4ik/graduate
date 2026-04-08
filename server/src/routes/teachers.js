const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/teachers
router.get('/teachers', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT "Код" AS id, "Преподаватель" AS name, "Почта" AS email
       FROM "Преподаватели" ORDER BY "Код"`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/teachers/:id
router.get('/teachers/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT "Код" AS id, "Преподаватель" AS name, "Почта" AS email
       FROM "Преподаватели" WHERE "Код" = $1`,
      [parseInt(req.params.id)]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/teachers
router.post('/teachers', async (req, res) => {
  const { name, email } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  try {
    const result = await pool.query(
      `INSERT INTO "Преподаватели" ("Преподаватель", "Почта") VALUES ($1, $2)
       RETURNING "Код" AS id`,
      [name, email || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/teachers/:id
router.put('/teachers/:id', async (req, res) => {
  const { name, email } = req.body;

  try {
    const result = await pool.query(
      `UPDATE "Преподаватели"
       SET "Преподаватель" = COALESCE($1, "Преподаватель"),
           "Почта" = COALESCE($2, "Почта")
       WHERE "Код" = $3
       RETURNING "Код" AS id, "Преподаватель" AS name, "Почта" AS email`,
      [name || null, email || null, parseInt(req.params.id)]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/teachers/:id
router.delete('/teachers/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM "Преподаватели" WHERE "Код" = $1 RETURNING "Код" AS id`,
      [parseInt(req.params.id)]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
