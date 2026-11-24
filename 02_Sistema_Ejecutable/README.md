# Sistema ejecutable

ReportaYa es una aplicación web; no requiere ni genera un instalador `.exe`. Se ejecuta localmente con dos procesos: el backend y el servidor de desarrollo del frontend.

1. Prepara MySQL y `backend/.env` siguiendo el [README principal](../README.md).
2. En una terminal, ejecuta `cd backend` y `npm install`, luego `npm run dev`.
3. En otra terminal, ejecuta `cd frontend` y `npm install`, luego `npm run dev`.
4. Abre `http://localhost:5173` o la dirección que indique Vite.

El frontend envía las llamadas `/api` al backend local. Para compilar la interfaz para producción, ejecuta `npm run build` desde `frontend/`; ese resultado no es un ejecutable autónomo y no se incluye en el repositorio.
