const TABLES = [
  { name: 't_090301_rpkvrtdp', files: 't_090301_rpkvrtdp_files' },
  { name: 't_090302_is', files: 't_090302_is_files' },
  { name: 't_090303_mkmps', files: 't_090303_mkmps_files' },
  { name: 't_090304_saippk', files: 't_090304_saippk_files' },
  { name: 't_090401_igikg', files: 't_090401_igikg_files' },
  { name: 't_090401_iibd', files: 't_090401_iibd_files' },
  { name: 't_090401_is', files: 't_090401_is_files' },
  { name: 't_090401_kmsts', files: 't_090401_kmsts_files' },
  { name: 't_090401_uppip', files: 't_090401_uppip_files' },
  { name: 't_090401_utspp', files: 't_090401_utspp_files' },
  { name: 't_090404_trispk', files: 't_090404_trispk_files' },
];

function isValidTable(name) {
  return TABLES.some((t) => t.name === name);
}

function getFilesTable(name) {
  const entry = TABLES.find((t) => t.name === name);
  return entry ? entry.files : null;
}

module.exports = { TABLES, isValidTable, getFilesTable };
