const TABLES = [
  { alias: '090301_rpkvrtdp', name: 't_090301_rpkvrtdp', files: 't_090301_rpkvrtdp_files' },
  { alias: '090302_is', name: 't_090302_is', files: 't_090302_is_files' },
  { alias: '090303_mkmps', name: 't_090303_mkmps', files: 't_090303_mkmps_files' },
  { alias: '090304_saippk', name: 't_090304_saippk', files: 't_090304_saippk_files' },
  { alias: '090401_igikg', name: 't_090401_igikg', files: 't_090401_igikg_files' },
  { alias: '090401_iibd', name: 't_090401_iibd', files: 't_090401_iibd_files' },
  { alias: '090401_is', name: 't_090401_is', files: 't_090401_is_files' },
  { alias: '090401_kmsts', name: 't_090401_kmsts', files: 't_090401_kmsts_files' },
  { alias: '090401_uppip', name: 't_090401_uppip', files: 't_090401_uppip_files' },
  { alias: '090401_utspp', name: 't_090401_utspp', files: 't_090401_utspp_files' },
  { alias: '090404_trispk', name: 't_090404_trispk', files: 't_090404_trispk_files' },
];

function getByAlias(alias) {
  return TABLES.find((t) => t.alias === alias) ?? null;
}

function isValidAlias(alias) {
  return TABLES.some((t) => t.alias === alias);
}

function getFilesTable(alias) {
  const entry = getByAlias(alias);
  return entry ? entry.files : null;
}

module.exports = { TABLES, isValidAlias, getByAlias, getFilesTable };
