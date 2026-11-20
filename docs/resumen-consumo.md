# Resumen empresarial por inventario

El resumen muestra análisis del edificio seleccionado o del conjunto de edificios reales. Si solo hay demostración, muestra sus gráficas con una identificación explícita. El selector permite consultar un ejemplo por separado; nunca se suma al consolidado real.

Incluye:

- Consumo conocido del mes típico, unidades registradas, cobertura de líneas activas y aporte del grupo principal.
- Gráfico circular por categoría, con agrupación de categorías menores y tabla equivalente completa.
- Barras por piso cuando se consulta un edificio; por edificio cuando se consolida más de uno.
- Ranking de cinco o diez líneas de inventario con nombre, cantidad, ubicación, kWh y porcentaje del consumo conocido. Cada fila incluye la cantidad total de la línea; no es una comparación por unidad física.
- Apertura directa del equipo en su espacio 3D. Los servicios comunes abren el inventario del edificio.
- Espacios pendientes de completar, últimos registros de consumo consultables por separado y tarjetas de edificios.

Los pausados no participan en consumo ni ranking. Los desconocidos se excluyen del subtotal y se señalan. Un cero válido se conserva. Los servicios comunes se incluyen una sola vez en total y categorías, y quedan separados de los pisos. La cobertura del 100 % de equipos registrados no implica que los espacios vacíos tengan inventario: ambos indicadores se explican por separado.

No se inventó una tendencia histórica: las gráficas principales representan el inventario de un mes típico. Las facturas no se suman al consumo estimado. No se identifica ineficiencia únicamente por ocupar el primer lugar.

Verificación de esta etapa:

```powershell
cd backend
npm run check
npm test
node tools/cdp-overview.mjs
```

106 pruebas aprobadas y 6 integraciones MySQL omitidas por configuración en la ejecución general. Cinco pruebas específicas validan ranking, cantidades, pausados, desconocidos, cero, servicios comunes, inmutabilidad y separación de demostraciones. Doce comprobaciones en Chrome verifican gráficas de la demostración, cifras esperadas, clasificación, navegación a equipo/piso, expansión del ranking y móvil emulado de 500 px sin desbordamiento. No se ejecutaron nuevamente integraciones autenticadas contra MySQL ni pruebas con lector de pantalla o teléfono físico.

Capturas y resultado: `tmp/overview-experience/`.
