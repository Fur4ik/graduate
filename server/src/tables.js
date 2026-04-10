const pool = require('./db');

// Кеш загружается один раз при старте сервера
let cache = []; // [{ alias, table_name, files_table }]

async function init() {
  const result = await pool.query('SELECT alias, table_name FROM directions ORDER BY id');
  cache = result.rows.map((r) => ({
    alias: r.alias,
    name: r.table_name,
    files: r.table_name + '_files',
  }));
}

function isValidAlias(alias) {
  return cache.some((t) => t.alias === alias);
}

function getByAlias(alias) {
  return cache.find((t) => t.alias === alias) ?? null;
}

function getFilesTable(alias) {
  const entry = getByAlias(alias);
  return entry ? entry.files : null;
}

function getTables() {
  return cache;
}

module.exports = { init, isValidAlias, getByAlias, getFilesTable, getTables };
