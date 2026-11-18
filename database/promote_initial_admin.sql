USE reportaya;

-- Sustituye el valor por el correo de una cuenta ya registrada.
-- Este paso manual crea el primer administrador; no lo ejecutes con un correo desconocido.
SET @initial_admin_email = 'REEMPLAZA_CON_CORREO_REGISTRADO';

UPDATE users
SET role = 'administrador'
WHERE email = (
  CONVERT(LOWER(TRIM(@initial_admin_email)) USING utf8mb4)
  COLLATE utf8mb4_unicode_ci
)
  AND role = 'alumno';

SELECT ROW_COUNT() AS accounts_promoted;
