const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/statuses
router.get('/statuses', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT "Код" AS id, "Тип статуса" AS name FROM "Статус" ORDER BY "Код"`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;