# Documentación técnica

## Arquitectura

La solución tiene tres partes:

1. **Frontend**: interfaz React/TypeScript servida por Vite. Las solicitudes `/api` se reenvían al backend local.
2. **Backend**: API Express/TypeScript que valida entradas, autentica sesiones y aplica los permisos por rol.
3. **Persistencia**: MySQL almacena usuarios, sesiones, reportes, historial, notificaciones y solicitudes de soporte. Las fotografías se guardan en `backend/uploads/`, que se excluye de Git.

## Roles y acceso

- **Estudiante**: registra y consulta sus propios reportes.
- **Mantenimiento**: cuenta creada por administración; consulta los reportes del plantel y actualiza su seguimiento. No puede modificar un reporte solucionado.
- **Administrador**: gestiona usuarios, crea cuentas de mantenimiento y supervisa reportes.
- Los roles existentes no se cambian desde la aplicación. El registro público siempre crea estudiantes.

## Referencias

- Instalación, variables de entorno y base de datos: [README principal](../README.md).
- Uso por rol: [Manual de Usuario](../05_Manual_de_Usuario/README.md).
- Pruebas: [Resultados de Pruebas](../07_Pruebas/README.md).
