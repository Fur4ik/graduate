const pool = require('./db');

// Кеш загружается один раз при старте сервера
let validIds = new Set(); // Set<number>

async function init() {
  const result = await pool.query('SELECT id FROM directions ORDER BY id');
  validIds = new Set(result.rows.map((r) => r.id));
}

function isValidId(id) {
  return validIds.has(id);
}

function getIds() {
  return [...validIds];
}

module.exports = { init, isValidId, getIds };
