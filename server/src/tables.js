const pool = require('./db');

// Кеш загружается один раз при старте сервера
let cache = []; // [{ id, alias }]

async function init() {
  const result = await pool.query('SELECT id, alias FROM directions ORDER BY id');
  cache = result.rows.map((r) => ({
    id: r.id,
    alias: r.alias,
  }));
}

function isValidAlias(alias) {
  return cache.some((t) => t.alias === alias);
}

function getByAlias(alias) {
  return cache.find((t) => t.alias === alias) ?? null;
}

function getTables() {
  return cache;
}

module.exports = { init, isValidAlias, getByAlias, getTables };
