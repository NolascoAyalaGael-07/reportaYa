USE reportaya;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'role'
);

SET @migration = IF(
  @column_exists = 0,
  "ALTER TABLE users ADD COLUMN role ENUM('alumno', 'mantenimiento', 'administrador') NOT NULL DEFAULT 'alumno' AFTER password_hash",
  'SELECT 1'
);
PREPARE migration_statement FROM @migration;
EXECUTE migration_statement;
DEALLOCATE PREPARE migration_statement;
