const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/statuses', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM statuses ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
