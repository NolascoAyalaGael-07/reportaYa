# reportaYa

Primera maqueta navegable de ReportaYa para presentar el concepto del proyecto en clase.

## Estructura

- `frontend`: interfaz React + TypeScript + Tailwind CSS.
- `backend`: base minima en Node.js + TypeScript, sin conexion con el frontend en esta etapa.
- `database`: script idempotente para crear la base de datos `ReportaYa` en SQL Server.

## Ejecutar la maqueta

1. En una terminal, instala las dependencias del frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. Abre la URL que muestre Vite, normalmente `http://localhost:5173`.

Para comprobar el backend minimo:

```bash
cd backend
npm install
npm run build
npm start
```

## Crear la base de datos en SQL Server

Abre `database/01_create_reportaya.sql` en SQL Server Management Studio o Azure Data Studio y ejecútalo con una cuenta que pueda crear bases de datos. El script crea la base `ReportaYa`, sus tablas, relaciones, índices y catálogos iniciales de estados y categorías.

## Alcance actual

### Avance de interfaz

El frontend ofrece las pantallas de inicio de sesión, registro, inicio, reportes, configuración y creación de reportes. Desde el inicio de sesión puedes usar cualquier correo válido y una contraseña no vacía para entrar a la demostración; el registro también es local. Los reportes creados y la cuenta solo se mantienen en memoria mientras la aplicación está abierta. No se guardan contraseñas ni se autentica contra el backend o una base de datos.

La interfaz permite recorrer los reportes de ejemplo y crear otros desde un formulario. El inicio de sesión y el registro son demostraciones locales; las cuentas y los reportes nuevos solo viven en memoria y no se conectan con SQL Server.

Los reportes y los datos del perfil son ficticios. Las cuentas y los reportes nuevos solo viven en memoria y se pierden al recargar; no hay autenticación real, persistencia ni conexión con servicios o base de datos. Las categorías y ubicaciones son opciones de demostración, no catálogos conectados a la base de datos.
