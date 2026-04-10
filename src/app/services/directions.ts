export interface DirectionEntry {
  direction: string;
  profile: string;
}

export const BACHELOR_DIRECTIONS: Record<string, DirectionEntry> = {
  t_090301_rpkvrtdp: {
    direction: '09.03.01 Информатика и вычислительная техника',
    profile:
      'Разработка программных комплексов в рамках цифровой трансформации деятельности предприятий',
  },
  t_090302_is: {
    direction: '09.03.02 Информационные системы и технологии',
    profile: 'Цифровые системы управления в промышленности и социально-экономической сфере',
  },
  t_090303_mkmps: {
    direction: '09.03.03 Прикладная информатика',
    profile: 'Математическое и компьютерное моделирование процессов и систем',
  },
  t_090304_saippk: {
    direction: '09.03.04 Программная инженерия',
    profile: 'Системный анализ и проектирование программных комплексов',
  },
};

export const MASTER_DIRECTIONS: Record<string, DirectionEntry> = {
  t_090401_uppip: {
    direction: '09.04.01 Информатика и вычислительная техника',
    profile: 'Управление программными продуктами и проектами',
  },
  t_090401_kmsts: {
    direction: '09.04.01 Информатика и вычислительная техника',
    profile: 'Компьютерное моделирование сложных технических систем',
  },
  t_090401_iibd: {
    direction: '09.04.01 Информатика и вычислительная техника',
    profile: 'Искусственный интеллект и большие данные',
  },
  t_090401_utspp: {
    direction: '09.04.01 Информатика и вычислительная техника',
    profile: 'Интегрированное управление цифровыми предприятиями и умными производствами',
  },
  t_090401_igikg: {
    direction: '09.04.01 Информатика и вычислительная техника',
    profile: 'Инженерная геометрия и компьютерная графика',
  },
  t_090401_is: {
    direction: '09.04.01 Информатика и вычислительная техника',
    profile: 'Интеллектуальный анализ данных',
  },
  t_090404_trispk: {
    direction: '09.04.04 Программная инженерия',
    profile: 'Технологии разработки интеллектуальных систем и программных комплексов',
  },
};

const ALL_DIRECTIONS: Record<string, DirectionEntry> = {
  ...BACHELOR_DIRECTIONS,
  ...MASTER_DIRECTIONS,
};

export function getDirectionEntry(key: string): DirectionEntry {
  return ALL_DIRECTIONS[key] ?? { direction: key, profile: '' };
}

export function getDirectionLabel(key: string): string {
  const entry = ALL_DIRECTIONS[key];
  return entry ? `${entry.direction} — ${entry.profile}` : key;
}
