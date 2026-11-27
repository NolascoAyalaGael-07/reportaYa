<img width="402" height="307" alt="image" src="https://github.com/user-attachments/assets/0877d8ef-23ee-4f79-99fd-85c6c28a93ce" />

# ReportaYa

Sistema web para que la comunidad escolar reporte problemas de infraestructura y consulte su seguimiento.

**Repositorio:** [github.com/NolascoAyalaGael-07/reportaYa](https://github.com/NolascoAyalaGael-07/reportaYa) | **Curso:** Gestión de Proyectos de Software

## Integrantes del equipo

- Santoyo Torres Santos Abraham
- Cruz Sanchez Kevin Alfredo
- García Caro Carlos Alejandro
- Nolasco Ayala Gael

## Contenido

- [Problema y objetivo](#problema-y-objetivo)
- [Descripción y funciones](#descripción-y-funciones)
- [Tecnologías](#tecnologías)
- [Requisitos](#requisitos)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Base de datos y primer administrador](#base-de-datos-y-primer-administrador)
- [Pruebas](#pruebas)
- [Estructura de entrega](#estructura-de-entrega)
- [Credenciales de prueba](#credenciales-de-prueba)
- [Solución de problemas](#solución-de-problemas)
- [Alcance y mejoras futuras](#alcance-y-mejoras-futuras)

## Problema y objetivo

En el Instituto Tecnológico de Tijuana no siempre existe un medio rápido y organizado para reportar fallas en las instalaciones, como lámparas que no funcionan, fugas de agua, salones sucios o mobiliario dañado. Cuando los avisos se hacen de manera informal pueden perderse, y quien reporta no sabe si fueron atendidos.

**Objetivo:** ofrecer una aplicación web donde los estudiantes reporten problemas de mantenimiento o limpieza y el personal pueda consultarlos y actualizar su estado.

**Lema:** "Reporta fácil. Mejora rápido."

## Descripción y funciones

ReportaYa centraliza avisos sobre problemas escolares y permite dar seguimiento a sus estados.

### Tipos de cuenta

| Función | Estudiante | Mantenimiento | Administrador |
| --- | :---: | :---: | :---: |
| Registrarse desde la pantalla pública | Sí | No | No |
| Crear reportes | Sí | No | No |
| Consultar reportes | Solo los propios | Todos | Todos |
| Cambiar el estado de un reporte | No | Sí, mientras no esté solucionado | Sí, incluso si está solucionado |
| Consultar usuarios y crear cuentas de mantenimiento | No | No | Sí |
| Enviar solicitudes de soporte | Sí | Sí | Sí |
| Marcar solicitudes de soporte como resueltas | No | No | Sí |

### Funciones principales

- **Cuentas:** registro público de estudiantes, inicio y cierre de sesión. El personal de mantenimiento lo crea un administrador.
- **Reportes:** categoría, ubicación, descripción y fotografía opcional.
- **Consulta:** búsqueda y filtros por estado.
- **Seguimiento:** historial con cada cambio de estado, quién lo hizo, cuándo y la nota del personal (opcional, hasta 300 caracteres).
- **Notificaciones:** aviso dentro de la aplicación cuando otra persona cambia el estado de un reporte propio, con contador y vista emergente.
- **Mi cuenta:** cambio de nombre y contraseña, tema claro u oscuro y centro de ayuda. El correo y el número de control no se pueden cambiar desde la aplicación.
- Los roles no se pueden cambiar desde la aplicación.

### Estados de un reporte

| Estado | Significado |
| --- | --- |
| **Pendiente** | Estado inicial de todo reporte nuevo. |
| **En atención** | El personal indica que está trabajando en el problema. |
| **Solucionado** | El problema se marcó como resuelto. Queda en solo lectura para estudiantes y mantenimiento. |

El flujo habitual es **Pendiente → En atención → Solucionado**.

### Datos de un reporte

| Campo | Obligatorio | Regla |
| --- | :---: | --- |
| Categoría | Sí | Electricidad, Plomería, Limpieza, Mobiliario u Otro. |
| Ubicación | Sí | De 2 a 200 caracteres. |
| Descripción | Sí | De 5 a 500 caracteres. |
| Fotografía | No | Un archivo JPG o PNG de hasta 5 MB. |

## Tecnologías

| Parte | Tecnología |
| --- | --- |
| Interfaz | React, TypeScript, Vite y Tailwind CSS |
| Servidor (API) | Node.js, Express y TypeScript |
| Base de datos | MySQL con `mysql2` |
| Carga de imágenes | `multer` |
| Pruebas automatizadas | Ejecutor de pruebas de Node.js (`node --test`) |

**Lenguajes:** TypeScript, JavaScript, SQL, HTML y CSS.

### Cómo se comunican las partes

```text
Navegador (interfaz React, puerto 5173)
        |  solicitudes /api
        v
API con Express (puerto 3001)
        |-- MySQL: cuentas, sesiones, reportes, historial, notificaciones y soporte
        |-- Carpeta uploads/: fotografías de los reportes
```

### Medidas de seguridad

- Las contraseñas se guardan como hash con `scrypt`; deben tener entre 8 y 128 caracteres.
- La sesión dura 8 horas y usa una cookie `HttpOnly`; en la base se guarda el hash del token.
- El servidor comprueba la sesión y el rol, además de lo que muestra la interfaz.
- De cada fotografía se revisan el tipo, el tamaño y la firma del archivo. Para verla se necesita acceso al reporte.

## Requisitos

- **Node.js 20.19 o posterior de la versión 20, o 22.12 en adelante**, con npm. Lo requiere la versión de Vite del proyecto.
- **MySQL Server** y un cliente como MySQL Workbench.
- **Git**, para clonar el repositorio.
- Un navegador web actualizado.

## Instalación y ejecución

1. Clona el repositorio y entra a su carpeta:

   ```powershell
   git clone https://github.com/NolascoAyalaGael-07/reportaYa.git
   cd reportaYa
   ```

2. Crea la base de datos siguiendo [Base de datos y primer administrador](#base-de-datos-y-primer-administrador).
3. Configura el backend. Copia `01_Codigo_Fuente/backend/.env.example` como `01_Codigo_Fuente/backend/.env` y completa la conexión MySQL. No publiques el archivo `.env`.

   | Variable | Para qué sirve | Valor del ejemplo |
   | --- | --- | --- |
   | `PORT` | Puerto de la API | `3001` |
   | `MYSQL_HOST` | Servidor de MySQL | `localhost` |
   | `MYSQL_PORT` | Puerto de MySQL | `3306` |
   | `MYSQL_USER` | Usuario de MySQL | `root` |
   | `MYSQL_PASSWORD` | Contraseña de ese usuario | Vacío; escribe la de tu instalación |
   | `MYSQL_DATABASE` | Nombre de la base de datos | `reportaya` |
   | `UPLOADS_DIRECTORY` | Carpeta de las fotografías | `uploads` |

   La interfaz envía sus solicitudes al puerto `3001`. Si cambias `PORT`, actualiza también `01_Codigo_Fuente/frontend/vite.config.ts`.

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

Si todo inició bien, la terminal del backend muestra `ReportaYa API disponible en http://localhost:3001`. Mantén abiertas las dos terminales mientras uses el sistema; para detener cada servidor, presiona `Ctrl + C`.

En Windows también puedes seguir primero la configuración de MySQL y el `.env`, instalar las dependencias de ambos proyectos y ejecutar [`02_Sistema_Ejecutable/iniciar_reportaya.cmd`](02_Sistema_Ejecutable/iniciar_reportaya.cmd) para abrir el backend y frontend en terminales separadas. Los ejemplos usan `npm.cmd` para evitar bloqueos de la política de ejecución de Windows PowerShell. Vite reenvía las solicitudes `/api` al servidor local en el puerto `3001`.

## Base de datos y primer administrador

Los archivos SQL están en [`03_Base_de_Datos/sql/`](03_Base_de_Datos/sql/). Para una instalación nueva, ejecuta una sola vez [`mysql_setup.sql`](03_Base_de_Datos/sql/mysql_setup.sql) en MySQL Workbench.

Para actualizar una base existente sin recrearla, ejecuta los scripts de migración en este orden:

1. [`mysql_migration_roles.sql`](03_Base_de_Datos/sql/mysql_migration_roles.sql)
2. [`mysql_migration_auth_sessions.sql`](03_Base_de_Datos/sql/mysql_migration_auth_sessions.sql)
3. [`mysql_migration_report_history.sql`](03_Base_de_Datos/sql/mysql_migration_report_history.sql)
4. [`mysql_migration_report_images.sql`](03_Base_de_Datos/sql/mysql_migration_report_images.sql)
5. [`mysql_migration_account_features.sql`](03_Base_de_Datos/sql/mysql_migration_account_features.sql)

### Tablas principales

| Tabla | Qué guarda |
| --- | --- |
| `users` | Nombre, número de control, correo, hash de la contraseña y rol. |
| `auth_sessions` | Sesiones activas y su fecha de expiración. |
| `reports` | Datos del reporte, autor, estado y referencia a la fotografía. |
| `report_status_history` | Cambios de estado, responsable, fecha y nota. |
| `user_notifications` | Avisos de cada usuario y si ya los leyó. |
| `support_requests` | Solicitudes de soporte y su estado. |

### Primer administrador

El registro público crea cuentas de estudiante. Para preparar la cuenta administradora inicial:

1. Registra la cuenta que se usará como administradora desde la pantalla **Crear una cuenta**.
2. En [`promote_initial_admin.sql`](03_Base_de_Datos/sql/promote_initial_admin.sql), reemplaza el marcador de correo por el correo de esa cuenta.
3. Ejecuta el script y comprueba que `accounts_promoted` sea `1`. Si es `0`, revisa que el correo esté bien escrito y que la cuenta todavía sea de estudiante.
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

### Qué cubren las pruebas automatizadas

| Área | Ejemplos de lo que se comprueba |
| --- | --- |
| Cuentas y sesiones | Validación del registro, contraseña guardada como hash, credenciales incorrectas y restauración de la sesión. |
| Permisos | Acceso con sesión, privacidad de los reportes, roles que no se pueden cambiar y funciones exclusivas del administrador. |
| Reportes | Creación, categorías válidas, filtros, cambios de estado e historial. |
| Fotografías | Rechazo de archivos inválidos o mayores de 5 MB y acceso autorizado. |
| Notificaciones y soporte | Avisos por cambios de estado y atención de solicitudes. |

En la ejecución guardada el **25 de noviembre de 2026** pasaron **19 de 19 pruebas** del backend y la interfaz compiló. Consulta las [salidas guardadas](07_Pruebas/resultados/).

Estos resultados no demuestran el funcionamiento con MySQL, las pantallas en distintos navegadores o celulares ni los tiempos de carga.

## Estructura de entrega

| Carpeta | Contenido |
| --- | --- |
| `01_Codigo_Fuente/` | Código fuente completo: backend y frontend, con sus manifiestos y configuraciones. |
| `02_Sistema_Ejecutable/` | Lanzador para Windows y guía para iniciar la aplicación web después de configurarla. |
| `03_Base_de_Datos/` | Scripts SQL para instalación, migraciones y cuenta administradora inicial. |
| `04_Documentacion/` | Arquitectura, permisos y documentación técnica del sistema. |
| `05_Manual_de_Usuario/` | Manual ilustrado en Markdown y PDF, con instrucciones de uso y solución de problemas. |
| `06_Evidencias/` | Captura del entorno ejecutando el sistema e historial verificable del repositorio. |
| `07_Pruebas/` | Script reproducible, matriz resumida y salidas reales de pruebas/compilación. |
| `08_Capturas_de_Pantalla/` | Capturas de las pantallas de ReportaYa. |

La estructura conserva separado el código fuente, la base de datos, la documentación, las evidencias y las pruebas. `02_Sistema_Ejecutable/` incluye un lanzador local: al ser una aplicación web con MySQL no existe un ejecutable `.exe` autónomo. Sigue las instrucciones de configuración antes de usarlo.

## Credenciales de prueba

El repositorio **no incluye credenciales predeterminadas ni cuentas de demostración**. Cada instalación crea las suyas:

| Tipo de cuenta | Cómo se crea |
| --- | --- |
| Estudiante | Desde la pantalla **Crear una cuenta**. |
| Administrador | Se registra una cuenta y se ejecuta [`promote_initial_admin.sql`](03_Base_de_Datos/sql/promote_initial_admin.sql). Usa una cuenta distinta a la de estudiante de prueba. |
| Mantenimiento | El administrador la crea en **Mi cuenta → Gestionar usuarios**. |

Usa datos de prueba y no publiques contraseñas reales.

## Solución de problemas

| Problema | Qué revisar |
| --- | --- |
| La aplicación no carga | Que la terminal del frontend siga abierta y que uses la dirección que muestra Vite. |
| La interfaz no conecta con el servidor | Que el backend esté iniciado en el puerto `3001`. |
| El backend no inicia | Que MySQL esté activo, que exista la base de datos y que los datos de `.env` sean correctos. |
| No puedes iniciar sesión | El correo y la contraseña de la cuenta registrada. |
| El registro indica un dato repetido | El correo y el número de control no pueden estar registrados en otra cuenta. |
| No se envía el reporte | La ubicación y la descripción deben respetar la longitud indicada en [Datos de un reporte](#datos-de-un-reporte). |
| No se adjunta la fotografía | Que sea JPG o PNG y pese 5 MB o menos. |
| PowerShell bloquea `npm` | Usa `npm.cmd`. |

## Alcance y mejoras futuras

ReportaYa es un prototipo académico que se ejecuta de forma local. Esta versión no incluye:

- Aplicación móvil. Queda como mejora futura.
- Que el personal de mantenimiento adjunte pruebas de que solucionó un reporte; puede escribir una nota al cambiar el estado.
- Integración con los sistemas de la institución.
- Gestión de presupuestos, inventarios o materiales.
- Despliegue en la infraestructura oficial de la institución.
