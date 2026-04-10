const express = require('express');
const router = express.Router();
const multer = require('multer');
const pool = require('../db');
const { isValidTable, getFilesTable } = require('../tables');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/files/:table/:subjectId', async (req, res) => {
  const table = req.params.table;
  const subjectId = parseInt(req.params.subjectId);
  if (!isValidTable(table)) return res.status(400).json({ error: 'Unknown table' });

  const filesTable = getFilesTable(table);
  try {
    const result = await pool.query(
      `SELECT id, subject_id, file_name AS name, file_type AS type,
              file_timestamp AS timestamp, file_url AS url
       FROM "${filesTable}" WHERE subject_id = $1`,
      [subjectId],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/files/:table/:subjectId/:fileId/download', async (req, res) => {
  const table = req.params.table;
  const subjectId = parseInt(req.params.subjectId);
  const fileId = parseInt(req.params.fileId);
  if (!isValidTable(table)) return res.status(400).json({ error: 'Unknown table' });

  const filesTable = getFilesTable(table);
  try {
    const result = await pool.query(
      `SELECT file_data, file_name, file_type
       FROM "${filesTable}" WHERE id = $1 AND subject_id = $2`,
      [fileId, subjectId],
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'File not found' });
    const file = result.rows[0];
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(file.file_name)}"`,
    );
    res.setHeader('Content-Type', file.file_type || 'application/octet-stream');
    res.send(file.file_data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/files/:table/:subjectId', upload.single('file'), async (req, res) => {
  const table = req.params.table;
  const subjectId = parseInt(req.params.subjectId);
  if (!isValidTable(table)) return res.status(400).json({ error: 'Unknown table' });
  if (!req.file) return res.status(400).json({ error: 'File is required' });

  const filesTable = getFilesTable(table);
  try {
    const result = await pool.query(
      `INSERT INTO "${filesTable}" (subject_id, file_data, file_flags, file_name, file_timestamp, file_type)
       VALUES ($1, $2, 0, $3, NOW(), $4) RETURNING id`,
      [subjectId, req.file.buffer, req.file.originalname, req.file.mimetype],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/files/:table/:subjectId/:fileId', async (req, res) => {
  const table = req.params.table;
  const subjectId = parseInt(req.params.subjectId);
  const fileId = parseInt(req.params.fileId);
  if (!isValidTable(table)) return res.status(400).json({ error: 'Unknown table' });

  const filesTable = getFilesTable(table);
  try {
    const result = await pool.query(
      `DELETE FROM "${filesTable}" WHERE id = $1 AND subject_id = $2 RETURNING id`,
      [fileId, subjectId],
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'File not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
