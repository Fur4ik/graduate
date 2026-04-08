// Список всех таблиц с предметами и соответствующих таблиц с файлами
const TABLES = [
  { name: '090301 РПКвРЦТДП', files: '090301 РПКвРЦТДП_Поле1' },
  { name: '090302 ИС',         files: '090302 ИС_Поле1' },
  { name: '090303 КС',         files: '090303 КС_Поле1' },
  { name: '090303 МКМПиС',     files: '090303 МКМПиС_Поле1' },
  { name: '090304 САиППК',     files: '090304 САиППК_Поле1' },
  { name: '090401 ИГиКГ',      files: '090401 ИГиКГ_Поле1' },
  { name: '090401 ИИБД',       files: '090401 ИИБД_Поле1' },
  { name: '090401 ИС',         files: '090401 ИС_Поле1' },
  { name: '090401 КМСТС',      files: '090401 КМСТС_Поле1' },
  { name: '090401 ПКТ',        files: '090401 ПКТ_Поле1' },
  { name: '090401 УППиП',      files: '090401 УППиП_Поле1' },
  { name: '090401 УЦТПП',      files: '090401 УЦТПП_Поле1' },
  { name: '090404 ТРИСиПК',    files: '090404 ТРИСиПК_Поле1' },
  { name: '150304',             files: '150304_Поле1' },
  { name: '150501',             files: '150501_Поле1' },
  { name: '~TMPCLP490901',      files: '~TMPCLP490901_Поле1' },
];

// Проверка что имя таблицы допустимо (защита от SQL-инъекций)
function isValidTable(name) {
  return TABLES.some((t) => t.name === name);
}

function getFilesTable(name) {
  const entry = TABLES.find((t) => t.name === name);
  return entry ? entry.files : null;
}

module.exports = { TABLES, isValidTable, getFilesTable };