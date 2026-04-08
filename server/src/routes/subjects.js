const express = require('express');
const router = express.Router();
const pool = require('../db');
const { TABLES, isValidTable, getFilesTable } = require('../tables');

// GET /api/tables — список всех таблиц (специальностей)
router.get('/tables', (req, res) => {
  res.json(TABLES.map((t) => t.name));
});

// GET /api/subjects/:table — все предметы из таблицы
router.get('/subjects/:table', async (req, res) => {
  const table = req.params.table;
  if (!isValidTable(table)) return res.status(400).json({ error: 'Unknown table' });

  try {
    const result = await pool.query(
      `SELECT s."Код" AS id,
              s."Предмет" AS subject,
              s."Статус" AS statusId,
              p."Код" AS teacherId,
              p."Преподаватель" AS teacherName,
              p."Почта" AS teacherEmail,
              st."Тип статуса" AS statusName
       FROM "${table}" s
       LEFT JOIN "Преподаватели" p ON s."Преподаватель" = p."Код"
       LEFT JOIN "Статус" st ON s."Статус" = st."Код"
       ORDER BY s."Код"`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/subjects/:table/:id — один предмет
router.get('/subjects/:table/:id', async (req, res) => {
  const table = req.params.table;
  const id = parseInt(req.params.id);
  if (!isValidTable(table)) return res.status(400).json({ error: 'Unknown table' });

  try {
    const result = await pool.query(
      `SELECT s."Код" AS id,
              s."Предмет" AS subject,
              s."Статус" AS statusId,
              p."Код" AS teacherId,
              p."Преподаватель" AS teacherName,
              p."Почта" AS teacherEmail,
              st."Тип статуса" AS statusName
       FROM "${table}" s
       LEFT JOIN "Преподаватели" p ON s."Преподаватель" = p."Код"
       LEFT JOIN "Статус" st ON s."Статус" = st."Код"
       WHERE s."Код" = $1`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/subjects/:table — добавить предмет
router.post('/subjects/:table', async (req, res) => {
  const table = req.params.table;
  if (!isValidTable(table)) return res.status(400).json({ error: 'Unknown table' });

  const { subject, teacherId, statusId } = req.body;
  if (!subject) return res.status(400).json({ error: 'subject is required' });

  try {
    const result = await pool.query(
      `INSERT INTO "${table}" ("Предмет", "Преподаватель", "Статус")
       VALUES ($1, $2, $3)
       RETURNING "Код" AS id`,
      [subject, teacherId || null, statusId || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/subjects/:table/:id — обновить предмет
router.put('/subjects/:table/:id', async (req, res) => {
  const table = req.params.table;
  const id = parseInt(req.params.id);
  if (!isValidTable(table)) return res.status(400).json({ error: 'Unknown table' });

  const { subject, teacherId, statusId } = req.body;

  try {
    const result = await pool.query(
      `UPDATE "${table}"
       SET "Предмет" = COALESCE($1, "Предмет"),
           "Преподаватель" = COALESCE($2, "Преподаватель"),
           "Статус" = COALESCE($3, "Статус")
       WHERE "Код" = $4
       RETURNING "Код" AS id, "Предмет" AS subject, "Преподаватель" AS teacherId, "Статус" AS statusId`,
      [subject || null, teacherId || null, statusId || null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/subjects/:table/:id — удалить предмет
router.delete('/subjects/:table/:id', async (req, res) => {
  const table = req.params.table;
  const id = parseInt(req.params.id);
  if (!isValidTable(table)) return res.status(400).json({ error: 'Unknown table' });

  try {
    const result = await pool.query(
      `DELETE FROM "${table}" WHERE "Код" = $1 RETURNING "Код" AS id`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;