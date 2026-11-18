USE reportaya;

-- Sustituye el valor por el correo de una cuenta ya registrada.
-- Este paso manual crea el primer administrador; no lo ejecutes con un correo desconocido.
SET @initial_admin_email = 'REEMPLAZA_CON_CORREO_REGISTRADO';

UPDATE users
SET role = 'administrador'
WHERE email = LOWER(TRIM(@initial_admin_email))
  AND role = 'alumno';

SELECT ROW_COUNT() AS accounts_promoted;
