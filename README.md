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
3. Configura el backend. Copia `01_Codigo_Fuente/backend/.env.example` como `01_Codigo_Fuente/backend/.env` y completa la conexión MySQL. No publiques el archivo `.env`.
4. En una terminal, inicia el backend:

   ```powershell
   cd 01_Codigo_Fuente/backend
   npm.cmd install
   npm.cmd run dev
   ```

5. En otra terminal, desde la raíz del repositorio, inicia el frontend:

   ```powershell
   cd 01_Codigo_Fuente/frontend
   npm.cmd install
   npm.cmd run dev
   ```

6. Abre la dirección local que indique Vite, normalmente `http://localhost:5173`.

En Windows también puedes seguir primero la configuración de MySQL y el `.env`, instalar las dependencias de ambos proyectos y ejecutar [`02_Sistema_Ejecutable/iniciar_reportaya.cmd`](02_Sistema_Ejecutable/iniciar_reportaya.cmd) para abrir el backend y frontend en terminales separadas. Los ejemplos usan `npm.cmd` para evitar bloqueos de la política de ejecución de Windows PowerShell. Vite reenvía las solicitudes `/api` al servidor local en el puerto `3001`.

## Base de datos y primer administrador

Los archivos SQL están en [`03_Base_de_Datos/sql/`](03_Base_de_Datos/sql/). Para una instalación nueva, ejecuta una sola vez [`mysql_setup.sql`](03_Base_de_Datos/sql/mysql_setup.sql) en MySQL Workbench.

Para actualizar una base existente sin recrearla, ejecuta los scripts de migración en este orden:

1. [`mysql_migration_roles.sql`](03_Base_de_Datos/sql/mysql_migration_roles.sql)
2. [`mysql_migration_auth_sessions.sql`](03_Base_de_Datos/sql/mysql_migration_auth_sessions.sql)
3. [`mysql_migration_report_history.sql`](03_Base_de_Datos/sql/mysql_migration_report_history.sql)
4. [`mysql_migration_report_images.sql`](03_Base_de_Datos/sql/mysql_migration_report_images.sql)
5. [`mysql_migration_account_features.sql`](03_Base_de_Datos/sql/mysql_migration_account_features.sql)

El registro público crea cuentas de estudiante. Para preparar la cuenta administradora inicial:

1. Registra la cuenta que se usará como administradora desde la pantalla **Crear una cuenta**.
2. En [`promote_initial_admin.sql`](03_Base_de_Datos/sql/promote_initial_admin.sql), reemplaza el marcador de correo por el correo de esa cuenta.
3. Ejecuta el script y comprueba el resultado que devuelve.
4. Inicia sesión con esa cuenta. Desde **Mi cuenta → Gestionar usuarios**, administración puede crear cuentas de mantenimiento.

No se permite cambiar el rol de una cuenta existente desde la aplicación. Mantén las contraseñas y los datos de conexión fuera del repositorio.

## Pruebas

Ejecuta las pruebas automatizadas del servidor:

```powershell
cd 01_Codigo_Fuente/backend
npm.cmd test
```

Para compilar la interfaz:

```powershell
cd 01_Codigo_Fuente/frontend
npm.cmd run build
```

También puedes ejecutar `powershell -NoProfile -ExecutionPolicy Bypass -File .\07_Pruebas\run_validation.ps1` desde la raíz. Guarda salidas de prueba fechadas en `07_Pruebas/resultados/`. El resumen está en [`07_Pruebas/README.md`](07_Pruebas/README.md). Las pruebas automatizadas del backend usan un repositorio en memoria; no reemplazan una prueba de integración con una instancia MySQL real.

## Estructura de entrega

| Carpeta | Contenido |
| --- | --- |
| `01_Codigo_Fuente/` | Código fuente completo: backend y frontend, con sus manifiestos y configuraciones. |
| `02_Sistema_Ejecutable/` | Lanzador para Windows y guía para iniciar la aplicación web después de configurarla. |
| `03_Base_de_Datos/` | Scripts SQL para instalación, migraciones y cuenta administradora inicial. |
| `04_Documentacion/` | Arquitectura, permisos y documentación técnica del sistema. |
| `05_Manual_de_Usuario/` | Manual ilustrado con instrucciones de uso y solución de problemas. |
| `06_Evidencias/` | Captura del entorno ejecutando el sistema e historial verificable del repositorio. |
| `07_Pruebas/` | Script reproducible, matriz resumida y salidas reales de pruebas/compilación. |
| `08_Capturas_de_Pantalla/` | Capturas anonimizadas de las pantallas funcionales de ReportaYa. |

La estructura conserva separado el código fuente, la base de datos, la documentación, las evidencias y las pruebas. `02_Sistema_Ejecutable/` incluye un lanzador local: al ser una aplicación web con MySQL no existe un ejecutable `.exe` autónomo. Sigue las instrucciones de configuración antes de usarlo.

## Credenciales de prueba

El repositorio no incluye credenciales predeterminadas ni cuentas de demostración. Registra un estudiante para probar el flujo público; para probar las funciones administrativas, configura una cuenta inicial siguiendo la sección anterior y crea una cuenta de mantenimiento desde la aplicación.
