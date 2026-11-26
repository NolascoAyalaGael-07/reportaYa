# Sistema ejecutable

ReportaYa es una aplicación web; no requiere ni genera un instalador `.exe` autónomo. Esta carpeta contiene un lanzador para Windows y su guía. El programa abre los dos procesos de desarrollo en terminales separadas; necesita Node.js, dependencias instaladas, MySQL configurado y `01_Codigo_Fuente/backend/.env`.

1. Prepara MySQL y el `.env` siguiendo el [README principal](../README.md).
2. Desde la raíz del repositorio, instala una vez las dependencias en cada carpeta:

   ```powershell
   cd 01_Codigo_Fuente/backend
   npm.cmd install
   cd ..\frontend
   npm.cmd install
   ```

3. Regresa a la raíz del repositorio y ejecuta `02_Sistema_Ejecutable/iniciar_reportaya.cmd` (doble clic o desde PowerShell).
4. Si la configuración funciona, el backend estará en `http://localhost:3001` y Vite mostrará la dirección de la interfaz, normalmente `http://localhost:5173`.

El frontend envía las llamadas `/api` al backend local. Para compilar la interfaz para producción, ejecuta `npm.cmd run build` desde `01_Codigo_Fuente/frontend/`; ese resultado no es un ejecutable autónomo y no se incluye en el repositorio.
