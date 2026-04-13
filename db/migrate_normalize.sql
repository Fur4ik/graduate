-- ============================================================
-- Миграция: нормализация схемы
-- Из 22 таблиц (t_* + t_*_files) → 2 таблицы (subjects + files)
-- ============================================================

BEGIN;

-- ── 1. Создать единую таблицу дисциплин ─────────────────────
CREATE TABLE subjects (
  id           SERIAL PRIMARY KEY,
  direction_id INTEGER NOT NULL REFERENCES directions (id) ON DELETE CASCADE,
  subject      TEXT    NOT NULL,
  teacher_id   INTEGER REFERENCES teachers (id) ON DELETE SET NULL,
  status_id    INTEGER REFERENCES statuses (id) ON DELETE SET NULL
);

-- ── 2. Создать единую таблицу файлов ────────────────────────
CREATE TABLE files (
  id          SERIAL PRIMARY KEY,
  subject_id  INTEGER NOT NULL REFERENCES subjects (id) ON DELETE CASCADE,
  file_name   TEXT    NOT NULL,
  file_type   TEXT,
  file_data   BYTEA   NOT NULL
);

-- ── 3. Перенос данных ────────────────────────────────────────
-- Для каждого направления переносим дисциплины и их файлы.
-- Используем временную таблицу для маппинга старый id → новый id.

CREATE TEMP TABLE id_map (
  alias      TEXT,
  old_id     INTEGER,
  new_id     INTEGER
);

DO $$
DECLARE
  rec       RECORD;
  old_id    INTEGER;
  new_id    INTEGER;
  file_rec  RECORD;
BEGIN
  FOR rec IN
    SELECT id, alias, table_name FROM directions ORDER BY id
  LOOP
    -- Перенос дисциплин
    FOR old_id IN
      EXECUTE format('SELECT id FROM %I ORDER BY id', rec.table_name)
    LOOP
      EXECUTE format(
        'INSERT INTO subjects (direction_id, subject, teacher_id, status_id)
         SELECT %L::integer, subject, teacher_id, status_id FROM %I WHERE id = %L
         RETURNING id',
        rec.id, rec.table_name, old_id
      ) INTO new_id;

      INSERT INTO id_map VALUES (rec.alias, old_id, new_id);
    END LOOP;

    -- Перенос файлов
    FOR file_rec IN
      EXECUTE format(
        'SELECT f.file_name, f.file_type, f.file_data, m.new_id AS subject_id
         FROM %I f
         JOIN id_map m ON m.old_id = f.subject_id AND m.alias = %L',
        rec.table_name || '_files', rec.alias
      )
    LOOP
      INSERT INTO files (subject_id, file_name, file_type, file_data)
      VALUES (file_rec.subject_id, file_rec.file_name, file_rec.file_type, file_rec.file_data);
    END LOOP;
  END LOOP;
END;
$$;

-- ── 4. Убрать table_name из directions ──────────────────────
ALTER TABLE directions DROP COLUMN table_name;

-- ── 5. Удалить старые таблицы ────────────────────────────────
DROP TABLE t_090301_rpkvrtdp_files;
DROP TABLE t_090302_is_files;
DROP TABLE t_090303_mkmps_files;
DROP TABLE t_090304_saippk_files;
DROP TABLE t_090401_uppip_files;
DROP TABLE t_090401_kmsts_files;
DROP TABLE t_090401_iibd_files;
DROP TABLE t_090401_utspp_files;
DROP TABLE t_090401_igikg_files;
DROP TABLE t_090401_is_files;
DROP TABLE t_090404_trispk_files;

DROP TABLE t_090301_rpkvrtdp;
DROP TABLE t_090302_is;
DROP TABLE t_090303_mkmps;
DROP TABLE t_090304_saippk;
DROP TABLE t_090401_uppip;
DROP TABLE t_090401_kmsts;
DROP TABLE t_090401_iibd;
DROP TABLE t_090401_utspp;
DROP TABLE t_090401_igikg;
DROP TABLE t_090401_is;
DROP TABLE t_090404_trispk;

COMMIT;