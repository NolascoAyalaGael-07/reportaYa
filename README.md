# ReportaYa

Sistema web para que la comunidad escolar reporte problemas de infraestructura y consulte su seguimiento.

**Repositorio:** [github.com/NolascoAyalaGael-07/reportaYa](https://github.com/NolascoAyalaGael-07/reportaYa) | **Curso:** Gestión de Proyectos de Software
**Equipo:** [Agregar los nombres de las personas integrantes antes de entregar]

## Contenido

- [Descripción y funciones](#descripción-y-funciones)
- [Tecnologías](#tecnologías)
- [Requisitos](#requisitos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Base de datos y primer administrador](#base-de-datos-y-primer-administrador)
- [Pruebas](#pruebas)
- [Estructura de entrega](#estructura-de-entrega)
- [Credenciales de prueba](#credenciales-de-prueba)

## Descripción y funciones

ReportaYa centraliza avisos sobre problemas escolares y permite dar seguimiento a sus estados. Incluye:

- Registro público e inicio de sesión para estudiantes.
- Creación de reportes con categoría, ubicación, descripción y fotografía JPG/PNG opcional de hasta 5 MB.
- Consulta de reportes propios por estudiantes y bandeja general para mantenimiento y administración.
- Búsqueda, filtros por estado, historial de cambios y notas de seguimiento.
- Personal de mantenimiento creado por un administrador. Los roles no se pueden cambiar desde la aplicación.
- Reportes solucionados en modo de solo lectura para estudiantes y mantenimiento.
- Notificaciones dentro de la aplicación con contador y vista emergente.
- Edición del nombre, cambio de contraseña, preferencias de tema, centro de ayuda y solicitudes de soporte.

## Tecnologías

- **Lenguajes:** TypeScript, JavaScript, SQL, HTML y CSS.
- **Interfaz:** React, Vite y Tailwind CSS.
- **Servidor:** Node.js, Express y TypeScript.
- **Persistencia:** MySQL con `mysql2`.
- **Seguridad:** contraseñas con hash scrypt, sesiones en MySQL y cookies `HttpOnly`.

## Requisitos

- Node.js y npm instalados.
- MySQL Server y un cliente como MySQL Workbench.
- Git para clonar el repositorio.

## Instalación y ejecución

1. Clona el repositorio y entra a su carpeta:

   ```powershell
   git clone https://github.com/NolascoAyalaGael-07/reportaYa.git
   cd reportaYa
   ```

2. Crea la base de datos siguiendo [Base de datos y primer administrador](#base-de-datos-y-primer-administrador).
3. Configura el backend. Copia `backend/.env.example` como `backend/.env` y completa la conexión MySQL. No publiques el archivo `.env`.
4. En una terminal, inicia el backend:

   ```powershell
   cd backend
   npm install
   npm run dev
   ```

5. En otra terminal, desde la raíz del proyecto, inicia el frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

6. Abre la dirección local que indique Vite, normalmente `http://localhost:5173`.

En Windows PowerShell, si la política del equipo bloquea `npm`, usa `npm.cmd` en los mismos comandos. Vite reenvía las solicitudes `/api` al servidor local en el puerto `3001`.

## Base de datos y primer administrador

Para una instalación nueva, ejecuta una sola vez [`database/mysql_setup.sql`](database/mysql_setup.sql) en MySQL Workbench.

Para actualizar una base existente sin recrearla, ejecuta los scripts de migración en este orden:

1. [`database/mysql_migration_roles.sql`](database/mysql_migration_roles.sql)
2. [`database/mysql_migration_auth_sessions.sql`](database/mysql_migration_auth_sessions.sql)
3. [`database/mysql_migration_report_history.sql`](database/mysql_migration_report_history.sql)
4. [`database/mysql_migration_report_images.sql`](database/mysql_migration_report_images.sql)
5. [`database/mysql_migration_account_features.sql`](database/mysql_migration_account_features.sql)

El registro público crea cuentas de estudiante. Para preparar la cuenta administradora inicial:

1. Registra la cuenta que se usará como administradora desde la pantalla **Crear una cuenta**.
2. En [`database/promote_initial_admin.sql`](database/promote_initial_admin.sql), reemplaza el marcador de correo por el correo de esa cuenta.
3. Ejecuta el script y comprueba el resultado que devuelve.
4. Inicia sesión con esa cuenta. Desde **Mi cuenta → Gestionar usuarios**, administración puede crear cuentas de mantenimiento.

No se permite cambiar el rol de una cuenta existente desde la aplicación. Mantén las contraseñas y los datos de conexión fuera del repositorio.

## Pruebas

Ejecuta las pruebas automatizadas del servidor:

```powershell
cd backend
npm test
```

Para compilar la interfaz:

```powershell
cd frontend
npm run build
```

El resumen de las comprobaciones realizadas está en [`07_Pruebas/README.md`](07_Pruebas/README.md). Las pruebas automatizadas del backend usan un repositorio en memoria; no reemplazan una prueba de integración con una instancia MySQL real.

## Estructura de entrega

| Carpeta | Contenido |
| --- | --- |
| `01_Codigo_Fuente/` | Índice del código fuente, ubicado en `backend/` y `frontend/`. |
| `02_Sistema_Ejecutable/` | Instrucciones para ejecutar la aplicación web localmente. |
| `03_Base_de_Datos/` | Índice de scripts y migraciones, ubicados en `database/`. |
| `04_Documentacion/` | Descripción técnica y enlaces de instalación. |
| `05_Manual_de_Usuario/` | Manual paso a paso con capturas anonimizadas. |
| `06_Evidencias/` | Referencias a evidencias reales del proyecto y su historial Git. |
| `07_Pruebas/` | Comandos y resultados de las pruebas ejecutadas. |
| `08_Capturas_de_Pantalla/` | Capturas de la versión final para el manual. |

Se conserva el orden convencional de carpetas del código para facilitar su instalación. `02_Sistema_Ejecutable/` explica cómo poner en marcha esta aplicación web; no se distribuye un instalador `.exe`.

## Credenciales de prueba

El repositorio no incluye credenciales predeterminadas ni cuentas de demostración. Registra un estudiante para probar el flujo público; para probar las funciones administrativas, configura una cuenta inicial siguiendo la sección anterior y crea una cuenta de mantenimiento desde la aplicación.
