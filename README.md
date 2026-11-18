# ReportaYa

Aplicación para que alumnos reporten problemas de la escuela y el personal les dé seguimiento.

## Funcionalidades

- Registro de alumnos e inicio/cierre de sesión.
- Roles: **alumno**, **mantenimiento** y **administrador**. El registro público siempre crea alumnos.
- Reportes asociados a su autor, con categoría, ubicación, descripción y fotografía opcional.
- Consulta de reportes propios para alumnos y bandeja general con búsqueda y filtros para mantenimiento/administración.
- Cambios de estado con comentario e historial visible para el alumno que creó el reporte.
- Notificaciones dentro de la aplicación cuando el personal actualiza un reporte; se pueden marcar como leídas.
- Edición del nombre y cambio de contraseña validando la contraseña actual. El correo y el número de control permanecen inmutables.
- Asignación y revocación de roles de personal desde la cuenta de administrador.
- Centro de ayuda con preguntas frecuentes y solicitudes que administración puede revisar y resolver.
- Preferencia de tema claro u oscuro guardada en el navegador.
- En **Mi cuenta** se puede editar el nombre, actualizar la contraseña validando la actual, revisar la política de privacidad, consultar notificaciones y administrar preferencias y solicitudes de ayuda.
- Contraseñas con hash scrypt, sesiones de 8 horas en MySQL y fotografías guardadas en `backend/uploads`.

Los reportes y las imágenes solo son accesibles con sesión; un alumno únicamente puede consultar los reportes que creó. Las imágenes aceptadas son JPG/PNG de hasta 5 MB.

## Preparar MySQL

La base que ya creaste con `database/mysql_setup.sql` conserva tus usuarios y reportes. Ejecuta **una vez** estos scripts en MySQL Workbench para actualizarla sin borrar los datos existentes:

1. `database/mysql_migration_roles.sql`
2. `database/mysql_migration_auth_sessions.sql`
3. `database/mysql_migration_report_history.sql`
4. `database/mysql_migration_report_images.sql`
5. `database/mysql_migration_account_features.sql`
5. `database/mysql_migration_account_features.sql`

Los scripts de migración se pueden volver a ejecutar. Para una instalación nueva, ejecuta solamente `database/mysql_setup.sql`, que crea el esquema completo.

## Crear al primer administrador

1. Inicia la aplicación y registra una cuenta normal desde **Crear una cuenta**.
2. Abre `database/promote_initial_admin.sql`, reemplaza `REEMPLAZA_CON_CORREO_REGISTRADO` por el correo registrado y ejecuta el script.
3. La cuenta ya puede abrir **Mi cuenta → Gestionar usuarios** y promover otras cuentas registradas a mantenimiento o administración. No hay un selector de rol en el registro público.

El script informa `accounts_promoted`: debe mostrar `1`. Si muestra `0`, comprueba el correo y que la cuenta exista antes de continuar.

## Configurar y ejecutar

1. Copia `backend/.env.example` a `backend/.env`; completa `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD` y `MYSQL_DATABASE`. No subas ni compartas `backend/.env`.
2. Desde una terminal, inicia el backend:

   ```powershell
   cd backend
   npm install
   npm run dev
   ```

   El servidor comprueba la conexión a MySQL antes de aceptar solicitudes. `UPLOADS_DIRECTORY` es opcional; por defecto, las fotografías se guardan en `backend/uploads`, carpeta ignorada por Git.

3. En otra terminal, inicia el frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

4. Abre la URL que muestra Vite, normalmente `http://localhost:5173`.

Vite reenvía `/api` al backend en `http://localhost:3001`. Para esta versión local, frontend y backend se usan bajo el mismo origen. Las sesiones se guardan en MySQL, vencen a las 8 horas y se actualiza el rol efectivo en cada solicitud. Las cookies son `HttpOnly` y `SameSite=Lax`; en producción HTTPS se agrega `Secure`.

## Pruebas automatizadas

```powershell
cd backend
npm test
```

Las pruebas `.test.ts` se compilan y ejecutan con Node; usan un repositorio en memoria y no necesitan credenciales ni un servidor MySQL. Cubren login, edición de cuenta, roles, privacidad de reportes, cambios de estado, historial, notificaciones, soporte y límites/acceso a fotografías. No sustituyen una prueba de integración con tu instancia MySQL.

## Alcance del avance

El backend es Node.js, Express y TypeScript; el frontend es React, TypeScript y Vite. La persistencia está implementada para cuentas, sesiones, reportes, estados, notificaciones y solicitudes de soporte en MySQL. Las fotografías se guardan como archivos en el servidor y MySQL almacena su nombre; realiza respaldos de `backend/uploads` junto con la base. Las notificaciones son internas a la aplicación; no se incluyen correo automático, despliegue público ni recuperación de contraseñas.
