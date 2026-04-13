const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const pool = require('../db');
const { isValidAlias, getByAlias } = require('../tables');

const FONT = '/Library/Fonts/Arial Unicode.ttf';

const STATUS_LABELS = { 1: 'Готово', 2: 'В процессе', 3: 'Шаблон' };
const STATUS_COLORS = { 1: '#16a34a', 2: '#d97706', 3: '#64748b' };

router.get('/report/:alias', async (req, res) => {
  const entry = getByAlias(req.params.alias);
  if (!entry) return res.status(400).json({ error: 'Unknown direction' });

  try {
    // Направление
    const dirRes = await pool.query(
      `SELECT d.code, d.name, d.profile, dl.name AS degree_level
       FROM directions d JOIN degree_levels dl ON d.degree_level_id = dl.id
       WHERE d.alias = $1`,
      [req.params.alias],
    );
    const dir = dirRes.rows[0];

    // Дисциплины с преподавателями и статусами
    const subjectsRes = await pool.query(
      `SELECT s.id, s.subject, s.status_id,
              t.name AS teacher_name,
              st.name AS status_name
       FROM subjects s
       LEFT JOIN teachers t ON s.teacher_id = t.id
       LEFT JOIN statuses st ON s.status_id = st.id
       WHERE s.direction_id = $1
       ORDER BY s.id`,
      [entry.id],
    );
    const subjects = subjectsRes.rows;

    // Файлы для всех дисциплин
    const subjectIds = subjects.map((s) => s.id);
    const fileRows =
      subjectIds.length > 0
        ? await pool.query(
            `SELECT subject_id, file_name FROM files WHERE subject_id = ANY($1) ORDER BY subject_id, id`,
            [subjectIds],
          )
        : { rows: [] };

    const filesBySubject = {};
    for (const f of fileRows.rows) {
      if (!filesBySubject[f.subject_id]) filesBySubject[f.subject_id] = [];
      filesBySubject[f.subject_id].push(f.file_name);
    }

    // Статистика
    const total = subjects.length;
    const done = subjects.filter((s) => s.status_id === 1).length;
    const inProgress = subjects.filter((s) => s.status_id === 2).length;
    const template = subjects.filter((s) => s.status_id === 3).length;

    // ─── Формирование PDF ────────────────────────────────────────────────────
    const doc = new PDFDocument({ margin: 48, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(dir.code)}_report.pdf"`,
    );
    doc.pipe(res);

    doc.registerFont('main', FONT);
    doc.font('main');

    const W = doc.page.width - 96;
    const COL = { subject: 0, teacher: W * 0.42, files: W * 0.68, status: W * 0.86 };

    // ── Шапка ────────────────────────────────────────────────────────────────
    doc
      .fontSize(10)
      .fillColor('#64748b')
      .text(dir.degree_level.toUpperCase(), { characterSpacing: 0.5 });
    doc.moveDown(0.3);
    doc.fontSize(14).fillColor('#0f172a').font('main').text(`${dir.code}  ${dir.name}`);
    doc.moveDown(0.2);
    doc.fontSize(11).fillColor('#334155').text(dir.profile);
    doc.moveDown(0.6);

    // ── Статистика ───────────────────────────────────────────────────────────
    const statsY = doc.y;
    const statW = W / 4;
    const stats = [
      { label: 'Всего дисциплин', value: total, color: '#0f172a' },
      { label: 'Готово', value: done, color: STATUS_COLORS[1] },
      { label: 'В процессе', value: inProgress, color: STATUS_COLORS[2] },
      { label: 'Шаблон', value: template, color: STATUS_COLORS[3] },
    ];
    for (let i = 0; i < stats.length; i++) {
      const x = 48 + i * statW;
      doc
        .roundedRect(x, statsY, statW - 8, 48, 4)
        .fillColor('#f8fafc')
        .fill();
      doc
        .fontSize(20)
        .fillColor(stats[i].color)
        .text(String(stats[i].value), x + 10, statsY + 6, { width: statW - 20, align: 'left' });
      doc
        .fontSize(8)
        .fillColor('#64748b')
        .text(stats[i].label, x + 10, statsY + 30, { width: statW - 20 });
    }
    doc.y = statsY + 60;
    doc.moveDown(0.4);

    // ── Прогресс-бар ─────────────────────────────────────────────────────────
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    const barY = doc.y;
    const barH = 14;
    const barRadius = 4;

    doc.fontSize(8).fillColor('#64748b').text('ГОТОВНОСТЬ', 48, barY, { continued: true });
    doc.fillColor('#0f172a').text(`  ${percent}%`, { align: 'left' });

    const labelBottom = doc.y + 4;

    doc.roundedRect(48, labelBottom, W, barH, barRadius).fillColor('#e2e8f0').fill();
    const fillW = Math.max(total > 0 ? (done / total) * W : 0, barRadius * 2);
    const fillColor = percent >= 80 ? '#16a34a' : percent >= 40 ? '#d97706' : '#dc2626';
    doc.roundedRect(48, labelBottom, fillW, barH, barRadius).fillColor(fillColor).fill();

    doc.y = labelBottom + barH + 12;

    // ── Разделитель ──────────────────────────────────────────────────────────
    doc
      .moveTo(48, doc.y)
      .lineTo(48 + W, doc.y)
      .strokeColor('#e2e8f0')
      .lineWidth(1)
      .stroke();
    doc.moveDown(0.6);

    // ── Заголовок таблицы ────────────────────────────────────────────────────
    const headerY = doc.y;
    doc.fontSize(8).fillColor('#64748b');
    doc.text('ДИСЦИПЛИНА', 48 + COL.subject, headerY, { width: COL.teacher - 4 });
    doc.text('ПРЕПОДАВАТЕЛЬ', 48 + COL.teacher, headerY, { width: COL.files - COL.teacher - 4 });
    doc.text('ФАЙЛЫ', 48 + COL.files, headerY, { width: COL.status - COL.files - 4 });
    doc.text('СТАТУС', 48 + COL.status, headerY, { width: W - COL.status });
    doc.moveDown(0.4);
    doc
      .moveTo(48, doc.y)
      .lineTo(48 + W, doc.y)
      .strokeColor('#e2e8f0')
      .lineWidth(0.5)
      .stroke();
    doc.moveDown(0.3);

    const LINE_H = 14;
    const FILE_LINE_H = 10;
    const ROW_PAD = 10;
    const PAGE_BOTTOM = doc.page.height - 60;

    // ── Строки таблицы ───────────────────────────────────────────────────────
    for (const subj of subjects) {
      const files = filesBySubject[subj.id] ?? [];
      const statusLabel = subj.status_name ?? '—';
      const statusColor = STATUS_COLORS[subj.status_id] ?? '#64748b';

      const fileColW = COL.status - COL.files - 4;
      const charsPerFileLine = Math.floor(fileColW / 5.5);
      const colSubjectLines = Math.ceil(subj.subject.length / 38) || 1;
      const colFilesLines = files.reduce(
        (sum, name) => sum + (Math.ceil((name.length + 2) / charsPerFileLine) || 1),
        0,
      );
      const estimatedH = Math.max(colSubjectLines * LINE_H, colFilesLines * FILE_LINE_H) + ROW_PAD;

      if (doc.y + estimatedH > PAGE_BOTTOM) {
        doc.addPage();
        doc.y = 48;
      }

      const lineY = doc.y;
      let bottomY = lineY;

      doc
        .fontSize(9)
        .fillColor('#0f172a')
        .text(subj.subject, 48 + COL.subject, lineY, {
          width: COL.teacher - 8,
          lineGap: 2,
        });
      bottomY = Math.max(bottomY, doc.y);

      doc
        .fontSize(9)
        .fillColor('#334155')
        .text(subj.teacher_name ?? '—', 48 + COL.teacher, lineY, {
          width: COL.files - COL.teacher - 8,
          lineGap: 2,
        });
      bottomY = Math.max(bottomY, doc.y);

      if (files.length === 0) {
        doc
          .fontSize(9)
          .fillColor('#94a3b8')
          .text('—', 48 + COL.files, lineY, {
            width: COL.status - COL.files - 4,
          });
      } else {
        let fileY = lineY;
        for (const name of files) {
          doc
            .fontSize(7)
            .fillColor('#64748b')
            .text(`• ${name}`, 48 + COL.files, fileY, {
              width: COL.status - COL.files - 4,
              lineGap: 1,
            });
          fileY = doc.y;
        }
      }
      bottomY = Math.max(bottomY, doc.y);

      doc
        .fontSize(8)
        .fillColor(statusColor)
        .text(statusLabel, 48 + COL.status, lineY, {
          width: W - COL.status,
        });
      bottomY = Math.max(bottomY, doc.y);

      doc.y = bottomY + 6;
      doc
        .moveTo(48, doc.y)
        .lineTo(48 + W, doc.y)
        .strokeColor('#f1f5f9')
        .lineWidth(0.5)
        .stroke();
      doc.y += 4;
    }

    doc.end();
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

module.exports = router;
