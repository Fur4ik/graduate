const express = require('express');
const router = express.Router();
const multer = require('multer');
const pool = require('../db');
const { isValidAlias, getFilesTable } = require('../tables');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/files/:alias/:subjectId', async (req, res) => {
  if (!isValidAlias(req.params.alias)) return res.status(400).json({ error: 'Unknown direction' });
  const subjectId = parseInt(req.params.subjectId);
  const filesTable = getFilesTable(req.params.alias);

  try {
    const result = await pool.query(
      `SELECT id, subject_id, file_name AS name, file_type AS type
       FROM "${filesTable}" WHERE subject_id = $1`,
      [subjectId],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/files/:alias/:subjectId/:fileId/download', async (req, res) => {
  if (!isValidAlias(req.params.alias)) return res.status(400).json({ error: 'Unknown direction' });
  const subjectId = parseInt(req.params.subjectId);
  const fileId = parseInt(req.params.fileId);
  const filesTable = getFilesTable(req.params.alias);

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

router.post('/files/:alias/:subjectId', upload.single('file'), async (req, res) => {
  if (!isValidAlias(req.params.alias)) return res.status(400).json({ error: 'Unknown direction' });
  if (!req.file) return res.status(400).json({ error: 'File is required' });
  const subjectId = parseInt(req.params.subjectId);
  const filesTable = getFilesTable(req.params.alias);

  try {
    const fileName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
    const result = await pool.query(
      `INSERT INTO "${filesTable}" (subject_id, file_data, file_name, file_type)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [subjectId, req.file.buffer, fileName, req.file.mimetype],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/files/:alias/:subjectId/:fileId', async (req, res) => {
  if (!isValidAlias(req.params.alias)) return res.status(400).json({ error: 'Unknown direction' });
  const subjectId = parseInt(req.params.subjectId);
  const fileId = parseInt(req.params.fileId);
  const filesTable = getFilesTable(req.params.alias);

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
