const STOP_WORDS = new Set([
  'и',
  'в',
  'а',
  'или',
  'на',
  'с',
  'из',
  'по',
  'для',
  'при',
  'у',
  'о',
  'об',
]);

const RU_TO_LAT = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'j',
  з: 'z',
  и: 'i',
  й: 'j',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'c',
  ч: 'c',
  ш: 's',
  щ: 's',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'u',
  я: 'y',
};

/**
 * Генерирует alias из кода направления и профиля.
 * Пример: '09.03.01' + 'Разработка программных комплексов...' → '090301_rpks...'
 */
function generateAlias(code, profile) {
  const codePart = code.replace(/\./g, '');
  const initials = profile
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w && !STOP_WORDS.has(w))
    .map((w) => RU_TO_LAT[w[0]] ?? w[0])
    .join('');
  return `${codePart}_${initials}`;
}

module.exports = { generateAlias };
