# Mejora integral empresarial — 19 de noviembre de 2026

La entrega conserva la aplicación doméstica y mantiene `/empresarial` sin enlaces en su navegación. Integra mejoras sobre los módulos existentes; las 1.000 líneas del encargo son instrucciones y criterios, no una promesa de 1.000 funciones nuevas.

## Cambios nuevos

- Navegación agrupada por propósito, iconos SVG, texto más legible y selectores consistentes.
- Guía voluntaria de cinco pasos y cuatro indicadores de preparación del edificio.
- Búsqueda con teclado de pisos, salas, equipos, luces de pasillo y servicios comunes, limitada al edificio activo.
- Pronóstico próximo visible, con procedencia, rango orientativo y separación respecto al mes típico del inventario.
- Meta de ahorro que prepara horarios para revisar, exclusiones por grupo, filtro por piso y explicación de metas inalcanzables.
- Tabla equivalente y descarga CSV real de los cuatro escenarios, con origen, periodo y revisión.
- Enfoque de equipos de una misma sala, límites de zoom por contexto y ángulos interiores que evitan quedar mirando una pared.
- Visor antes del listado de equipos; nombres de pisos legibles y acceso directo a «Añadir piso».
- Previsualización de oficinas, lobby y corredor antes de crear el piso. Con cuenta, creación transaccional recalculada por el servidor; límite de 200 pisos.
- Cobertura que incorpora circulación y permite corregir su grupo directamente. Todos los equipos pausados producen cero excluido, coherente con el resumen; un desconocido activo sigue pendiente.
- Factor de uso opcional en un desplegable, conservando el supuesto explicado de potencia constante.
- Recuperación ante cubierta insuficiente: ajustar cantidad a capacidad calculada o seguir explorando sin verificar área.
- Patrón de rayas para superficies sin datos en WebGL, además de leyenda y etiquetas.
- Fachadas repetidas agrupadas con instancias, geometrías compartidas y vista general simplificada para edificios grandes; interiores completos al abrir un piso.
- Limpieza de recursos y listeners al salir de pantallas o volver al acceso.

## Funciones existentes conservadas

Se mantienen el algoritmo histórico con validación temporal, los planes revisables, el presupuesto ajustable, los balances solares sin duplicar ahorro, los medidores generales y submedidores, el inventario comercial con fuentes, las reglas en observación, el recorrido por tarjetas, las copias versionadas y Deshacer con revisión. No se sustituyó el modelo GLB original: se mejoraron el visor y las plantas generadas.

## Cobertura de los 50 bloques

| Bloques del encargo | Resultado |
|---|---|
| 01–02 · Alcance y diagnóstico | Estado local inspeccionado; trabajo previo preservado; defectos reproducidos y corregidos. |
| 03–05 · Organización, diseño y bienvenida | Menú por propósito, iconos, guía y preparación contextual. |
| 06–08 · Resumen, contexto y gráficas | Totales compartidos conservados; pronóstico visible y tabla/exportación de escenarios. |
| 09–10 · Navegación y cámara | Buscador, selección sincronizada, enfoque por equipo y límites de cámara. |
| 11–14 · Arquitectura, pisos y equipos | Fachadas instanciadas, vista previa de planta y creación atómica con identidades nuevas. |
| 15–16 · Capas y movimiento | Patrón sin datos, efectos opcionales y movimiento reducido conservado. |
| 17–19 · Inventario, catálogo y cobertura | Formularios simplificados y circulación incluida; fuentes y respaldo manual del catálogo conservados. |
| 20–21 · Predicción y explicación | Modelos existentes conservados y comprobados; resultado próximo explicado en portada. |
| 22–24 · Ahorro, aires y horarios | Meta, exclusiones y filtros nuevos; horarios revisables y ejemplo 844,8 → 633,6 kWh conservados. |
| 25–26 · Escenarios y presupuesto | Tabla/CSV nuevos; balances y tarifa empresarial existente conservados. |
| 27–31 · Solar y cubierta | Datos principales sencillos, agrupación visual honesta y recuperación de capacidad. |
| 32–36 · Sensores y circulación | Demostración didáctica y reglas en observación conservadas; búsqueda y corrección de luces incorporadas. |
| 37–40 · Medición, historial y comparación | Funciones existentes preservadas; historial independiente de cambios de planificación. |
| 41–42 · Accesibilidad y móvil | Foco, teclado y alternativas revisados; anchos 320, 360, 390 y 500 px comprobados. |
| 43–46 · Rendimiento, código y datos | Menos dibujos/geometrías; contratos compartidos y validación del nuevo piso en servidor. |
| 47–50 · Pruebas, evidencias y entrega | Comprobaciones actuales, capturas, instrucciones y límites documentados. |

## Verificación

- Sintaxis: `npm run check`; visor: `npm run build:glb`.
- Pruebas generales al preparar publicación: **197 aprobadas, 7 omitidas** que necesitan MySQL.
- MySQL real: **47 empresariales y 14 domésticas**, sin omisiones en esas ejecuciones. Incluyen atomicidad del nuevo piso, propiedad, conflicto y rechazo del piso 201.
- Chrome: `npm run e2e:integral`; incluye búsqueda con teclado, enfoque, meta, descarga CSV, capacidad solar, corrección de pasillo, móvil y sin WebGL.
- Regresiones: 25 comprobaciones de ahorro/circulación, 31 solares y 9 secuencias de pisos. Resultados en `tmp/`; esas evidencias locales no se publican como datos de la aplicación.
- Adaptadores Vercel: método, origen, tamaño, validación, curva sintética explícita y sesión de demostración comprobados automáticamente.

El script de cámara espera a que exista la escena antes de consultar su objetivo; no presupone que cualquier máquina cargará el GLB en un número fijo de milisegundos.

## Rendimiento observado

Chrome headless con SwiftShader, sin aceleración de GPU. Vista general con 6 espacios y 4 grupos por piso. La medición incluye dibujo y actualización de posiciones de etiquetas; no son FPS sostenidos.

| Pisos | Grupos | Dibujos por cuadro | Geometrías | Media observada |
|---|---:|---:|---:|---:|
| 3 | 72 | 166 | 13 | 7,3 ms |
| 12 | 288 | 652 | 13 | 13,6 ms |
| 40 | 960 | 292 | 13 | 20,7 ms |

En el diagnóstico de 40 pisos había 5.124 llamadas de dibujo y 1.933 geometrías. La versión optimizada conserva detalle al abrir un piso, comprobado con el nivel 18. Los tiempos varían con la carga del equipo y no son una garantía para otros dispositivos. Evidencia: `tmp/integral/rendimiento.json`.

## Límites

No se verificó un lector de pantalla ni un teléfono físico. No hay órdenes a dispositivos: las reglas siguen en observación y el recorrido usa datos ilustrativos. El pronóstico con datos sintéticos demuestra el procedimiento, no precisión en empresas reales. La cubierta es esquemática y no sustituye el diseño técnico de una instalación.

La demostración pública usa almacenamiento del navegador. Cuentas, MySQL, medidores persistentes e integraciones privadas requieren el backend completo configurado; los datos locales no se convierten automáticamente en datos de Vercel.
