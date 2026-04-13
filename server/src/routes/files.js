const express = require('express');
const router = express.Router();
const multer = require('multer');
const JSZip = require('jszip');
const pool = require('../db');
const { isValidAlias, getByAlias } = require('../tables');

const upload = multer({ storage: multer.memoryStorage() });

function dirFolderName(entry) {
  return `${entry.code} ${entry.name}`.replace(/[/\\:*?"<>|]/g, '_').trim();
}

async function fetchDirectionLabel(alias) {
  const res = await pool.query('SELECT code, name FROM directions WHERE alias = $1', [alias]);
  return res.rows[0] ?? null;
}

// ─── Скачать все файлы по дисциплине ─────────────────────────────────────────

router.get('/files/:alias/subject/:subjectId/download-all', async (req, res) => {
  const entry = getByAlias(req.params.alias);
  if (!entry) return res.status(400).json({ error: 'Unknown direction' });
  const subjectId = parseInt(req.params.subjectId);

  try {
    const [dirLabel, subjectRow, filesRes] = await Promise.all([
      fetchDirectionLabel(req.params.alias),
      pool.query('SELECT subject FROM subjects WHERE id = $1 AND direction_id = $2', [
        subjectId,
        entry.id,
      ]),
      pool.query('SELECT id, file_name, file_data FROM files WHERE subject_id = $1', [subjectId]),
    ]);

    if (filesRes.rows.length === 0) return res.status(404).json({ error: 'No files' });

    const folderName = dirFolderName(dirLabel ?? { code: req.params.alias, name: '' });
    const subjectName = (subjectRow.rows[0]?.subject ?? String(subjectId)).replace(
      /[/\\:*?"<>|]/g,
      '_',
    );

    const zip = new JSZip();
    const folder = zip.folder(`${folderName}/${subjectName}`);
    for (const f of filesRes.rows) {
      folder.file(f.file_name, f.file_data);
    }

    const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(subjectName)}.zip"`,
    );
    res.send(buf);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Скачать все файлы по направлению ────────────────────────────────────────

router.get('/files/:alias/download-all', async (req, res) => {
  const entry = getByAlias(req.params.alias);
  if (!entry) return res.status(400).json({ error: 'Unknown direction' });

  try {
    const [dirLabel, subjectsRes] = await Promise.all([
      fetchDirectionLabel(req.params.alias),
      pool.query('SELECT id, subject FROM subjects WHERE direction_id = $1 ORDER BY id', [
        entry.id,
      ]),
    ]);

    const folderName = dirFolderName(dirLabel ?? { code: req.params.alias, name: '' });
    const zip = new JSZip();
    const root = zip.folder(folderName);

    for (const subj of subjectsRes.rows) {
      const filesRes = await pool.query(
        'SELECT file_name, file_data FROM files WHERE subject_id = $1',
        [subj.id],
      );
      if (filesRes.rows.length === 0) continue;
      const subjectName = subj.subject.replace(/[/\\:*?"<>|]/g, '_');
      const subfolder = root.folder(subjectName);
      for (const f of filesRes.rows) {
        subfolder.file(f.file_name, f.file_data);
      }
    }

    const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(folderName)}.zip"`,
    );
    res.send(buf);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CRUD ─────────────────────────────────────────────────────────────────────

router.get('/files/:alias/:subjectId', async (req, res) => {
  if (!isValidAlias(req.params.alias)) return res.status(400).json({ error: 'Unknown direction' });
  const subjectId = parseInt(req.params.subjectId);

  try {
    const result = await pool.query(
      'SELECT id, subject_id, file_name AS name, file_type AS type FROM files WHERE subject_id = $1',
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

  try {
    const result = await pool.query(
      'SELECT file_data, file_name, file_type FROM files WHERE id = $1 AND subject_id = $2',
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

  try {
    const fileName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
    const result = await pool.query(
      'INSERT INTO files (subject_id, file_data, file_name, file_type) VALUES ($1, $2, $3, $4) RETURNING id',
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

  try {
    const result = await pool.query(
      'DELETE FROM files WHERE id = $1 AND subject_id = $2 RETURNING id',
      [fileId, subjectId],
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'File not found' });
    res.json({ deleted: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
