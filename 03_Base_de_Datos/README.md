# Base de datos

Los scripts SQL están en [`../database/`](../database/):

- `mysql_setup.sql`: crea el esquema completo para una instalación nueva.
- `mysql_migration_*.sql`: actualizan una base ya existente; ejecútalos en el orden indicado en el [README principal](../README.md#base-de-datos-y-primer-administrador).
- `promote_initial_admin.sql`: promueve una cuenta registrada a administradora. Reemplaza el marcador con el correo correspondiente antes de ejecutarlo; no guardes datos personales ni credenciales en commits.

Se requiere MySQL Server y una base configurada mediante las variables de `backend/.env.example`.
