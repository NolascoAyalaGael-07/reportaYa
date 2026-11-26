# Instrucciones para generar el Manual de Usuario en PDF

Si se necesita entregar el manual como PDF, comparte con la IA de documentos:

1. Este archivo, `INSTRUCCIONES_PDF_MANUAL_IA.md`.
2. El contenido completo de [`../05_Manual_de_Usuario/README.md`](../05_Manual_de_Usuario/README.md).
3. Las nueve imágenes PNG de [`../08_Capturas_de_Pantalla/`](../08_Capturas_de_Pantalla/).

## Prompt para copiar en Abacus.ai

```text
Actúa como diseñador editorial y editor técnico. Con los archivos adjuntos crea un
documento PDF profesional, claro y completamente en español titulado
"Manual de Usuario — ReportaYa".

Usa el archivo README.md del manual como fuente principal y respeta su contenido,
orden, pasos, funcionalidades, restricciones y nombres de botones. Coloca cada
captura en la sección que le corresponde por el nombre y la leyenda del manual.
Mantén proporciones, buena resolución y márgenes; no estires ni recortes controles
importantes. Las capturas son de la versión final y ya ocultan datos personales.

El documento debe tener portada, índice, numeración de páginas, encabezados de
sección, tipografía legible y diseño consistente apto para impresión tamaño carta.
Incluye nombre del proyecto, curso y repositorio que ya aparecen en el manual.

No inventes integrantes, credenciales, fechas de prueba, enlaces, resultados,
funciones ni datos institucionales. Conserva los marcadores entre corchetes
(por ejemplo, [Agregar nombres completos de las personas integrantes]) para que
el equipo pueda completarlos; no los reemplaces con nombres ficticios.
No agregues contraseñas ni datos reales de cuentas.

Entrega el resultado como un único PDF descargable. Antes de finalizar, verifica
que el índice, los encabezados, las imágenes y los pies de página estén completos,
que las capturas no se salgan de página y que no existan páginas en blanco.
```

Antes de generar el PDF, completa los nombres oficiales del equipo en el README del
manual. Después de exportarlo, revísalo visualmente y coloca el archivo final en esta
carpeta `05_Manual_de_Usuario/` para incluirlo en la entrega.
