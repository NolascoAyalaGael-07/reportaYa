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

La pantalla permite recorrer una presentacion local de reportes de ejemplo, filtrar su estado y abrir un formulario de creacion. El formulario solo muestra una confirmacion en pantalla: no guarda datos, no usa una base de datos y no se conecta a servicios reales.

Los reportes visibles y sus fechas son ficticios. La maqueta no define todavia instituciones, ubicaciones, categorias, reglas de negocio ni campos derivados de los diagramas de analisis. Esos detalles quedan pendientes para una siguiente etapa.
