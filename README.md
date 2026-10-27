# reportaYa

Primera maqueta navegable de ReportaYa para presentar el concepto del proyecto en clase.

## Estructura

- `frontend`: interfaz React + TypeScript + Tailwind CSS.
- `backend`: base minima en Node.js + TypeScript, sin conexion con el frontend en esta etapa.

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

## Alcance actual

### Avance de interfaz

El frontend ofrece las pantallas de inicio de sesi?n, registro, inicio, reportes, configuraci?n y creaci?n de reportes. Desde el inicio de sesi?n puedes usar cualquier correo v?lido y una contrase?a no vac?a para entrar a la demostraci?n; el registro tambi?n es local. Los reportes creados y la cuenta solo se mantienen en memoria mientras la aplicaci?n est? abierta. No se guardan contrase?as ni se autentica contra el backend o una base de datos.

La interfaz permite recorrer los reportes de ejemplo y crear otros desde un formulario. El inicio de sesi?n y el registro son demostraciones locales; las cuentas y los reportes nuevos solo viven en memoria y no se conectan con SQL Server.

Los reportes y los datos del perfil son ficticios. Las cuentas y los reportes nuevos solo viven en memoria y se pierden al recargar; no hay autenticaci?n real, persistencia ni conexi?n con servicios o base de datos. Las categor?as y ubicaciones son opciones de demostraci?n, no cat?logos conectados a la base de datos.
