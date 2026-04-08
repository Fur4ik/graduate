const express = require('express');
const router = express.Router();
const multer = require('multer');
const pool = require('../db');
const { isValidTable, getFilesTable } = require('../tables');

const upload = multer({ storage: multer.memoryStorage() });

// GET /api/files/:table/:subjectId — список файлов предмета (без бинарных данных)
router.get('/files/:table/:subjectId', async (req, res) => {
  const table = req.params.table;
  const subjectId = parseInt(req.params.subjectId);
  if (!isValidTable(table)) return res.status(400).json({ error: 'Unknown table' });

  const filesTable = getFilesTable(table);
  try {
    const result = await pool.query(
      `SELECT "Копия 090304_Поле1" AS "Код", "_Поле1", "FileName", "FileType", "FileTimeStamp", "FileURL"
       FROM "${filesTable}"
       WHERE "_Поле1" = $1`,
      [subjectId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/files/:table/:subjectId/:fileId/download — скачать файл
router.get('/files/:table/:subjectId/:fileId/download', async (req, res) => {
  const table = req.params.table;
  const subjectId = parseInt(req.params.subjectId);
  const fileId = parseInt(req.params.fileId);
  if (!isValidTable(table)) return res.status(400).json({ error: 'Unknown table' });

  const filesTable = getFilesTable(table);
  try {
    const result = await pool.query(
      `SELECT "FileData", "FileName", "FileType"
       FROM "${filesTable}"
       WHERE "Копия 090304_Поле1" = $1 AND "_Поле1" = $2`,
      [fileId, subjectId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'File not found' });

    const file = result.rows[0];
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.FileName)}"`);
    res.setHeader('Content-Type', file.FileType || 'application/octet-stream');
    res.send(file.FileData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/files/:table/:subjectId — загрузить файл
router.post('/files/:table/:subjectId', upload.single('file'), async (req, res) => {
  const table = req.params.table;
  const subjectId = parseInt(req.params.subjectId);
  if (!isValidTable(table)) return res.status(400).json({ error: 'Unknown table' });
  if (!req.file) return res.status(400).json({ error: 'Файл не передан' });

  const filesTable = getFilesTable(table);
  try {
    const result = await pool.query(
      `INSERT INTO "${filesTable}" ("_Поле1", "FileData", "FileFlags", "FileName", "FileTimeStamp", "FileType")
       VALUES ($1, $2, $3, $4, NOW(), $5)
       RETURNING "Копия 090304_Поле1" AS "Код"`,
      [subjectId, req.file.buffer, 0, req.file.originalname, req.file.mimetype]
    );
    res.status(201).json({ Код: result.rows[0].Код });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/files/:table/:subjectId/:fileId — удалить файл
router.delete('/files/:table/:subjectId/:fileId', async (req, res) => {
  const table = req.params.table;
  const subjectId = parseInt(req.params.subjectId);
  const fileId = parseInt(req.params.fileId);
  if (!isValidTable(table)) return res.status(400).json({ error: 'Unknown table' });

  const filesTable = getFilesTable(table);
  try {
    const result = await pool.query(
      `DELETE FROM "${filesTable}"
       WHERE "Копия 090304_Поле1" = $1 AND "_Поле1" = $2
       RETURNING "Копия 090304_Поле1"`,
      [fileId, subjectId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'File not found' });
    res.json({ deleted: result.rows[0]['Копия 090304_Поле1'] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;