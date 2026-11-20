# Facturas y lecturas: experiencia guiada

La sección empresarial conserva los datos y endpoints existentes, y reorganiza su presentación. La navegación doméstica no se modifica.

## Cambios

- Dos vistas: **Facturas y registros** y **Lecturas del medidor**. Cada una explica qué dato se debe introducir.
- Inicio vacío con pasos concretos. La demostración ofrece ejemplos locales mediante un botón explícito.
- Resumen del último periodo, promedio diario, cambio respecto al anterior y total de los registros filtrados.
- Filtros por año de cierre y origen. La tabla y las gráficas muestran el mismo conjunto filtrado.
- Gráfico de los últimos doce periodos visibles, sin interpolar fechas ausentes; seleccionar una barra abre su detalle.
- Comparación de dos periodos normalizada por duración inclusiva. Un consumo anterior de cero no genera porcentajes infinitos.
- Registro en dos pasos: introducir datos y revisar. Se puede volver a corregir sin guardar; guardar requiere el segundo paso.
- Validación de fechas reales, orden cronológico, energía no negativa y solapamientos antes de enviar. El servidor mantiene sus validaciones y control de revisión.
- Confirmación de borrado con el periodo y los kWh exactos.
- Descarga CSV de lo filtrado, con escape de campos y protección contra fórmulas de hojas de cálculo.
- Contraste con inventario normalizado a treinta días, presentado como referencia y no como factura o diagnóstico de causas.

## Probar

Abre `http://127.0.0.1:3000/empresarial#demo&sec=facturas` y pulsa **Probar con ejemplos** si el historial está vacío. Los ejemplos y sus cambios se guardan solo en localStorage, junto con la demostración. No se envían a MySQL. Para datos propios, sal de la demostración e inicia sesión.

El historial registra **energía, fechas y origen**. No se añadió importe pagado, subida de PDF, OCR o cálculo de impuestos. Se explica esa distinción en la ayuda para evitar confundir pesos, consumo del periodo y lectura acumulada.

## Verificación

```powershell
cd backend
npm run check
npm test
npm run e2e:billing
```

- Suite general: **101 aprobadas, 6 omitidas** por configuración de las integraciones MySQL. No se vuelven a declarar verificadas las integraciones reales a partir de esta ejecución.
- Seis pruebas nuevas cubren fechas UTC y bisiestos, normalización por día, cero frente a desconocido, solapamientos, agregados y escape CSV.
- **21 comprobaciones de Chrome real** en la demostración: inicio vacío, ejemplos, filtros, detalles, errores, revisión sin guardado, corrección, confirmación, cero, comparación, CSV, recarga, móvil de 500 px, explicación de medidores, borrado y ausencia de escrituras HTTP o errores de página.
- Se detectó y corrigió una carrera entre el cierre de un diálogo anterior y la instalación de los controles del registro en dos pasos. Los listeners del asistente ahora se cancelan al cambiar de diálogo.
- Evidencias: `tmp/billing-experience/results.json`, capturas y CSV descargado en la misma carpeta.

No se verificó móvil físico ni lector de pantalla. La revisión de medidores en esta batería usa el estado vacío de la demostración; no sustituye la integración autenticada con medidores reales.
