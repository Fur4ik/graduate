const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/directions', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.alias, d.code, d.name AS direction, d.profile, dl.name AS degree_level
       FROM directions d
       JOIN degree_levels dl ON d.degree_level_id = dl.id
       ORDER BY dl.id, d.code, d.id`,
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;