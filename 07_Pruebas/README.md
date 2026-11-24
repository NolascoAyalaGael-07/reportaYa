# Pruebas y validación

## Pruebas automatizadas del backend

Desde `backend/`, ejecuta:

```powershell
npm test
```

El comando compila TypeScript y ejecuta los casos automatizados con el repositorio en memoria. Comprueba autenticación y sesiones, edición de cuenta, roles, privacidad, reportes, historial, notificaciones, soporte y validación de fotografías.

## Compilación del frontend

Desde `frontend/`, ejecuta:

```powershell
npm run build
```

## Última verificación registrada

El 24 de noviembre de 2026, `npm test` terminó con **19 pruebas aprobadas y 0 fallidas**. `npm run build` del frontend completó la comprobación de TypeScript y generó la compilación de producción.

Estas pruebas automatizadas no sustituyen una prueba de integración contra MySQL ni una revisión manual de todos los flujos en un entorno desplegado.
