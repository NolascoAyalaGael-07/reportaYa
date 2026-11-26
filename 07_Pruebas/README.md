# Pruebas y validación

## Ejecutar y guardar evidencias

Desde la raíz del repositorio en Windows PowerShell, ejecuta:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\07_Pruebas\run_validation.ps1
```

El script corre las pruebas automatizadas del backend y compila el frontend. Guarda
la salida real de cada comando con fecha y hora en `07_Pruebas/resultados/`.

También se pueden ejecutar manualmente:

```powershell
cd 01_Codigo_Fuente/backend
npm.cmd test

cd ..\frontend
npm.cmd run build
```

## Alcance automatizado

| Área | Cobertura registrada |
| --- | --- |
| Cuenta y sesión | Registro, autenticación, restauración de sesión, validación de contraseña y datos inmutables. |
| Roles y usuarios | Restricción de roles, privacidad de datos y creación administrativa de cuentas de mantenimiento. |
| Reportes | Autorización, acceso privado, filtros, estado e historial de seguimiento. |
| Imágenes | Tipo y tamaño permitidos, acceso autenticado y limpieza de archivos inválidos. |
| Notificaciones y soporte | Avisos de cambio de estado, lectura de notificaciones y solicitudes de soporte. |
| Interfaz | Comprobación TypeScript y compilación de producción con Vite. |

Las pruebas del backend usan un repositorio en memoria; no sustituyen una prueba de
integración con MySQL ni las pruebas manuales realizadas por el equipo.

## Último resultado registrado

El 25 de noviembre de 2026 se ejecutó el script de validación: **19 pruebas del
backend aprobadas, 0 fallidas**, y compilación del frontend completada. Los registros
de esa ejecución están en [resultados/](resultados/); son salidas guardadas directamente
por los comandos, sin reconstruir ni editar para aparentar resultados.
