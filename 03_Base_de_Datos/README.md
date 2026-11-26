# Base de datos

Los scripts SQL están en [`sql/`](sql/):

- [`sql/mysql_setup.sql`](sql/mysql_setup.sql): crea el esquema completo para una instalación nueva.
- `sql/mysql_migration_*.sql`: actualizan una base ya existente; ejecútalos en el orden indicado en el [README principal](../README.md#base-de-datos-y-primer-administrador).
- [`sql/promote_initial_admin.sql`](sql/promote_initial_admin.sql): promueve una cuenta registrada a administradora. Reemplaza el marcador con el correo correspondiente antes de ejecutarlo; no guardes datos personales ni credenciales en commits.

Se requiere MySQL Server y una base configurada mediante las variables de [`../01_Codigo_Fuente/backend/.env.example`](../01_Codigo_Fuente/backend/.env.example).
