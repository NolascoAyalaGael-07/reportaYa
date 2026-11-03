# reportaYa

Primera maqueta navegable de ReportaYa para presentar el concepto del proyecto en clase.

## Estructura

- `frontend`: interfaz React + TypeScript + Tailwind CSS.
- `backend`: API en Node.js + TypeScript conectada a MySQL para cuentas y reportes.
- `database`: script SQL para crear las tablas de MySQL usadas en este avance.

## Ejecutar la maqueta

1. En una terminal, instala las dependencias del frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. Abre la URL que muestre Vite, normalmente `http://localhost:5173`.

## Probar la versión con MySQL

1. Ejecuta `database/mysql_setup.sql` en MySQL Workbench para crear las tablas `users` y `reports` en la base `reportaya`.
2. Copia `backend/.env.example` como `backend/.env` y completa host, usuario, contraseña y nombre de tu base de datos. No subas el archivo `.env` al repositorio.
3. En una terminal, inicia el backend:

```bash
cd backend
npm install
npm run dev
```

4. En otra terminal, inicia la interfaz:

```bash
cd frontend
npm install
npm run dev
```

Abre la dirección que muestra Vite, normalmente `http://localhost:5173`. Vite reenvía `/api` al backend en `http://localhost:3001`. Para crear una cuenta de prueba, registra un correo y número de control que no estén usados; después podrás iniciar sesión, crear reportes y consultar los reportes guardados de esa cuenta.

Las sesiones usan una cookie `HttpOnly` temporal y se invalidan cuando se detiene el backend. Las contraseñas se guardan con scrypt; el servidor no las devuelve al frontend. Los reportes se guardan en MySQL, pero la foto sigue siendo solo una vista previa local en este avance.

## Pruebas automatizadas del backend

```bash
cd backend
npm test
```

Las pruebas usan un repositorio en memoria y no necesitan que MySQL esté iniciado. Cubren validación, registro, inicio de sesión, sesiones y creación/consulta de reportes. Para la aplicación normal, sí necesitas configurar una base de datos MySQL en `backend/.env`.
