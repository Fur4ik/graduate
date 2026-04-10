-- Migration: rename all columns to English

-- ========== Справочники ==========

ALTER TABLE "Преподаватели"
  RENAME COLUMN "Код" TO id;
ALTER TABLE "Преподаватели"
  RENAME COLUMN "Преподаватель" TO name;
ALTER TABLE "Преподаватели"
  RENAME COLUMN "Почта" TO email;

ALTER TABLE "Статус"
  RENAME COLUMN "Код" TO id;
ALTER TABLE "Статус"
  RENAME COLUMN "Тип статуса" TO name;

-- ========== Предметные таблицы (subject tables) ==========

DO $$
DECLARE
  t TEXT;
  subject_tables TEXT[] := ARRAY[
    '090301 РПКвРЦТДП',
    '090302 ИС',
    '090303 КС',
    '090303 МКМПиС',
    '090304 САиППК',
    '090401 ИГиКГ',
    '090401 ИИБД',
    '090401 ИС',
    '090401 КМСТС',
    '090401 ПКТ',
    '090401 УППиП',
    '090401 УЦТПП',
    '090404 ТРИСиПК',
    '150304',
    '150501',
    '~TMPCLP490901'
  ];
BEGIN
  FOREACH t IN ARRAY subject_tables LOOP
    EXECUTE format('ALTER TABLE %I RENAME COLUMN "Код" TO id', t);
    EXECUTE format('ALTER TABLE %I RENAME COLUMN "Предмет" TO subject', t);
    EXECUTE format('ALTER TABLE %I RENAME COLUMN "Преподаватель" TO teacher_id', t);
    EXECUTE format('ALTER TABLE %I RENAME COLUMN "Поле1" TO file_ref', t);
    EXECUTE format('ALTER TABLE %I RENAME COLUMN "Статус" TO status_id', t);

    -- Комментарий есть не у всех таблиц
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = t AND column_name = 'Комментарий'
    ) THEN
      EXECUTE format('ALTER TABLE %I RENAME COLUMN "Комментарий" TO comment', t);
    END IF;
  END LOOP;
END $$;

-- ========== Таблицы файлов (file tables) ==========

DO $$
DECLARE
  t TEXT;
  pk_col TEXT;
  file_tables TEXT[] := ARRAY[
    '090301 РПКвРЦТДП_Поле1',
    '090302 ИС_Поле1',
    '090303 КС_Поле1',
    '090303 МКМПиС_Поле1',
    '090304 САиППК_Поле1',
    '090401 ИГиКГ_Поле1',
    '090401 ИИБД_Поле1',
    '090401 ИС_Поле1',
    '090401 КМСТС_Поле1',
    '090401 ПКТ_Поле1',
    '090401 УППиП_Поле1',
    '090401 УЦТПП_Поле1',
    '090404 ТРИСиПК_Поле1',
    '150304_Поле1',
    '150501_Поле1',
    '~TMPCLP490901_Поле1'
  ];
BEGIN
  FOREACH t IN ARRAY file_tables LOOP
    -- Переименовать subject_id
    EXECUTE format('ALTER TABLE %I RENAME COLUMN "_Поле1" TO subject_id', t);

    -- Переименовать PK (у каждой таблицы своё имя) → id
    SELECT kcu.column_name INTO pk_col
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      USING (constraint_name, table_name)
    WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_name = t;

    IF pk_col IS NOT NULL AND pk_col != 'id' THEN
      EXECUTE format('ALTER TABLE %I RENAME COLUMN %I TO id', t, pk_col);
    END IF;

    -- FileData, FileFlags, FileName, FileTimeStamp, FileType, FileURL → snake_case
    EXECUTE format('ALTER TABLE %I RENAME COLUMN "FileData" TO file_data', t);
    EXECUTE format('ALTER TABLE %I RENAME COLUMN "FileFlags" TO file_flags', t);
    EXECUTE format('ALTER TABLE %I RENAME COLUMN "FileName" TO file_name', t);
    EXECUTE format('ALTER TABLE %I RENAME COLUMN "FileTimeStamp" TO file_timestamp', t);
    EXECUTE format('ALTER TABLE %I RENAME COLUMN "FileType" TO file_type', t);
    EXECUTE format('ALTER TABLE %I RENAME COLUMN "FileURL" TO file_url', t);
  END LOOP;
END $$;
