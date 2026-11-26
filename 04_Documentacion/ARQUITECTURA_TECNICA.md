# Arquitectura técnica de ReportaYa

## 1. Propósito y alcance

ReportaYa es una aplicación web para registrar problemas de infraestructura escolar y dar seguimiento a sus estados. Este documento resume su arquitectura, módulos, permisos, API, persistencia, controles de seguridad y operación local. No sustituye el [Manual de Usuario](../05_Manual_de_Usuario/README.md) ni las instrucciones de instalación del [README principal](../README.md).

## 2. Arquitectura general

El sistema se organiza en tres capas:

```text
Navegador
  React + TypeScript + Tailwind CSS
  Vite (interfaz local, normalmente puerto 5173)
       |
       | solicitudes /api
       v
  Express + TypeScript (API, puerto 3001)
       |
       +---- Repositorio MySQL (mysql2/promise)
       |       usuarios, sesiones, reportes, historial,
       |       notificaciones y solicitudes de soporte
       |
       +---- Archivos de fotografías en uploads/
```

Durante el desarrollo, Vite reenvía `/api` a `http://127.0.0.1:3001`. El backend puede configurar su puerto mediante `PORT`; si no se define, utiliza `3001`. La persistencia se implementa en MySQL. Las fotografías se guardan en el sistema de archivos local del backend, en `uploads/` por defecto o en la ruta indicada mediante `UPLOADS_DIRECTORY`.

## 3. Tecnologías y organización

| Componente | Tecnología | Ubicación |
| --- | --- | --- |
| Interfaz web | React, TypeScript, Vite y Tailwind CSS | `01_Codigo_Fuente/frontend/` |
| API | Node.js, Express y TypeScript | `01_Codigo_Fuente/backend/` |
| Base de datos | MySQL y `mysql2/promise` | Scripts en `03_Base_de_Datos/sql/` |
| Pruebas automatizadas | Node.js Test Runner y repositorio de prueba en memoria | `01_Codigo_Fuente/backend/src/tests/` |

Las dependencias instaladas, compilaciones, archivos `.env` y fotografías subidas localmente no forman parte del control de versiones. La configuración de conexión se inicia copiando `01_Codigo_Fuente/backend/.env.example` a `.env` y completando los valores localmente.

## 4. Módulos funcionales y permisos

| Rol | Capacidades principales |
| --- | --- |
| Alumno | Se registra públicamente, consulta sus propios reportes, crea reportes y revisa historial y notificaciones. |
| Mantenimiento | Es creado por administración; consulta los reportes del plantel y cambia su estado, excepto cuando ya está solucionado. |
| Administrador | Consulta y supervisa reportes, gestiona usuarios, crea cuentas de mantenimiento y resuelve solicitudes de soporte. |

El registro público crea cuentas de alumno. Los roles existentes no se pueden cambiar desde la aplicación; el endpoint legado de cambio de rol responde con conflicto. El alumno solo ve sus reportes. Mantenimiento y administración pueden consultar la bandeja general. Los reportes solucionados se presentan como solo lectura para alumnos y mantenimiento.

Los módulos disponibles son autenticación y perfil; reportes y fotografías; historial de estados; administración de usuarios; notificaciones; solicitudes de soporte; y preferencias e información de ayuda en la interfaz.

## 5. API HTTP

Todas las rutas usan el prefijo `/api`. Salvo registro, inicio/cierre de sesión, las rutas de la tabla requieren una sesión válida. Los permisos se verifican en el backend, además de las restricciones visuales de la interfaz.

| Método y ruta | Acceso | Función |
| --- | --- | --- |
| `POST /auth/register` | Público | Registrar alumno e iniciar sesión. |
| `POST /auth/login` | Público | Autenticar y crear sesión. |
| `POST /auth/logout` | Sesión opcional | Cerrar la sesión existente y limpiar la cookie. |
| `GET /auth/me`, `PATCH /auth/me` | Sesión | Consultar perfil; cambiar nombre o contraseña. |
| `GET /users`, `POST /users` | Administrador | Consultar usuarios y crear cuentas de mantenimiento. |
| `PATCH /users/:id/role` | Administrador | Rechazado; los roles no se pueden cambiar. |
| `GET /reports`, `GET /reports/:id` | Sesión | Consultar reportes; alumnos quedan limitados a los propios. |
| `POST /reports` | Alumno | Crear un reporte, con fotografía opcional. |
| `PATCH /reports/:id/status` | Mantenimiento o administrador | Actualizar el estado y agregar comentario al historial. |
| `GET /reports/:id/history`, `GET /reports/:id/photo` | Sesión | Consultar historial o fotografía con las mismas reglas de acceso al reporte. |
| `GET /notifications`, `PATCH /notifications/:id/read`, `POST /notifications/read-all` | Sesión | Consultar y marcar notificaciones como leídas. |
| `GET /support`, `POST /support` | Sesión | Consultar las solicitudes permitidas por rol y crear una solicitud. |
| `PATCH /support/:id/status` | Administrador | Cambiar el estado de una solicitud de soporte. |

La lista de reportes admite filtros por estado, categoría y texto de búsqueda. Las entradas se validan en el backend antes de acceder al repositorio.

## 6. Modelo de datos

El esquema de instalación se define en `03_Base_de_Datos/sql/mysql_setup.sql`. Las migraciones posteriores están en la misma carpeta.

| Tabla | Responsabilidad y relaciones |
| --- | --- |
| `users` | Identidad, número de control, correo, hash de contraseña y rol. |
| `auth_sessions` | Hash del token de sesión, usuario y fecha de expiración; se elimina al borrar el usuario. |
| `reports` | Reporte, autor, categoría, ubicación, descripción, estado y ruta opcional de fotografía. |
| `report_status_history` | Cambios de estado, autor del cambio, fecha y comentario. |
| `user_notifications` | Avisos de cambios de reportes para el usuario y estado de lectura. |
| `support_requests` | Solicitudes de soporte, solicitante, estado y fechas. |

Las relaciones se implementan con claves foráneas. El alta de un reporte y su estado inicial se registran dentro de una transacción. Los cambios de estado guardan historial y generan una notificación al autor cuando el cambio lo realiza otra persona.

## 7. Seguridad y validación

- Las contraseñas se derivan con `scrypt` y una sal aleatoria; no se devuelven hashes en las respuestas públicas.
- La sesión usa un token aleatorio. Se almacena su hash SHA-256 y el navegador recibe una cookie `HttpOnly`, `SameSite=Lax`, con duración de ocho horas; la cookie añade `Secure` cuando `NODE_ENV` es `production`.
- El backend valida sesión y rol por ruta. Las consultas de datos se realizan en el repositorio MySQL mediante parámetros.
- Los reportes se filtran por autor para los alumnos; las fotografías requieren una sesión y autorización sobre el reporte.
- La carga acepta un solo archivo JPG o PNG de hasta 5 MB y comprueba su firma binaria antes de guardarlo.
- Las credenciales de MySQL y los archivos subidos se mantienen fuera del repositorio.

Esta sección describe controles implementados; no representa una auditoría de seguridad ni afirma que el sistema esté libre de vulnerabilidades.

## 8. Ejecución local

1. Instalar Node.js/npm y MySQL Server.
2. Crear el esquema nuevo con `03_Base_de_Datos/sql/mysql_setup.sql` o aplicar las migraciones indicadas en el [README principal](../README.md).
3. Configurar `01_Codigo_Fuente/backend/.env` localmente a partir de `.env.example`; no versionar credenciales.
4. Instalar dependencias y ejecutar `npm.cmd run dev` en `01_Codigo_Fuente/backend/`.
5. En otra terminal, instalar dependencias y ejecutar `npm.cmd run dev` en `01_Codigo_Fuente/frontend/`.
6. Abrir la dirección local de Vite, normalmente `http://localhost:5173`.

En Windows también está disponible el lanzador descrito en `02_Sistema_Ejecutable/README.md`. La aplicación requiere MySQL y procesos Node.js; no se distribuye como un ejecutable `.exe` autónomo.

## 9. Verificación y límites conocidos

El script `07_Pruebas/run_validation.ps1` ejecuta las pruebas automatizadas del backend y el build de producción del frontend. La ejecución registrada el 25 de noviembre de 2026 aprobó 19 pruebas del backend y compiló el frontend correctamente; sus salidas se conservan en `07_Pruebas/resultados/`.

Las pruebas backend usan un repositorio en memoria y no sustituyen una prueba de integración con una base MySQL real. El repositorio no incluye credenciales predeterminadas. Las bitácoras, cronogramas y registros del trabajo individual del equipo deben añadirse únicamente si existen y son verificables.

## 10. Referencias del proyecto

- [README e instalación](../README.md)
- [Scripts de base de datos](../03_Base_de_Datos/README.md)
- [Manual de Usuario](../05_Manual_de_Usuario/README.md)
- [Pruebas y resultados](../07_Pruebas/README.md)
- [Evidencias](../06_Evidencias/README.md)
