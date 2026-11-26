USE reportaya;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'reports'
    AND COLUMN_NAME = 'photo_path'
);

SET @migration = IF(
  @column_exists = 0,
  'ALTER TABLE reports ADD COLUMN photo_path VARCHAR(255) NULL AFTER status',
  'SELECT 1'
);
PREPARE migration_statement FROM @migration;
EXECUTE migration_statement;
DEALLOCATE PREPARE migration_statement;
