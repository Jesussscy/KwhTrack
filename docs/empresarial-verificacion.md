# KWH Empresarial: qué se verificó y cómo

Fecha: 2026-11-17 (etapa: oficinas compartidas, puertas, indicadores y recorrido por tarjetas). Windows 11, Chrome (headless, render por software), MySQL 8.4.6 portable (ZIP oficial de `cdn.mysql.com/archives`, SHA-256 `b6c152f9…ecd204`). Operación diaria: ver `empresarial-operacion.md`.

## Pruebas automáticas (resultados reales de la última ejecución)
| Comando | Resultado |
|---|---|
| `node --test` (sin base de datos) | 95 aprobadas, 0 fallidas, 6 omitidas (requieren MySQL) |
| `test/enterprise.integration.test.js` contra MySQL real (`kwhtrack_test`) | 35 subpruebas aprobadas, 0 omitidas (incluye puestos, cubículos, capacidad, copias v4, deshacer) |
| `test/api.integration.test.js` (doméstico) contra MySQL real | 14 aprobadas |
| `tools/cdp-transitions.mjs` (Piso 1↔2↔3, secuencias rápidas) con demostración, 3 pisos generados y 3 pisos del modelo | 9 secuencias × 3 escenarios, todas correctas |
| `cdp-e2e.mjs`, `cdp-e2e2.mjs`, `cdp-e2e3.mjs`, `cdp-e2e4.mjs` (Chrome real, cuenta nueva) | 19, 14, 32 y 37 comprobaciones, sin falsos |
| `tools/smoke-persist.mjs` en la base persistente | registro, login, edificio guardado y recuperado tras reiniciar servidor y MySQL (etapa anterior) |

Una omisión no valida nada: las pruebas de integración se omiten sin base de datos.

## Oficinas compartidas (esta etapa)
- **Puestos:** se declaran, no se infieren. Guardar puestos **no crea equipos**; las unidades se añaden con el diálogo “Añadir equipos por lote”, que muestra la revisión (1 línea × cantidad, cobertura y kWh estimados) y no crea nada hasta confirmar.
- **Capacidad:** `EnterpriseLayout.workstations` reserva holgura con paredes y una franja de circulación junto a la puerta (abiertos 1,6 × 1,5 m por puesto; cubículos 2,1 × 2,0 m). Cantidades que no caben se explican **antes de guardar** (cliente y servidor) y también si una nueva distribución o el asistente dejarían un espacio sin capacidad. Ejemplo medido: sala de 10,8 × 5,2 m → hasta 12 abiertos o 4 en cubículos.
- **Cubículos:** son una disposición del espacio (separadores visuales), no espacios independientes; el espacio sigue siendo uno solo.
- **Puertas:** hoja con pivote en la bisagra que abre hacia el corredor; el ángulo máximo se limita al espacio libre (con corredor, hasta media anchura del corredor; sin corredor, el margen hasta el borde). Las hojas no son seleccionables (no bloquean datos ni controles). Con movimiento reducido pasan al estado final al instante (comprobado). La interfaz aclara que es ilustración, no una simulación ni control de puertas reales. Solo los pisos generados tienen puertas; los pisos con el módulo del modelo conservan su geometría.
- **Indicadores:** kWh por puesto (denominador: puestos declarados totales; por separado, por puesto ocupado) y kWh/m² (solo con superficie real declarada; las medidas del plano esquemático no se usan). Muestran periodo, cobertura, método y la advertencia de que no prueban eficiencia. Si falta un dato, no se calcula nada (sin cifras inventadas).
- **Recorrido por tarjetas:** independiente de WebGL (probado con `--disable-3d-apis`), sin autoavance ni cambios de foco, con ← → y Esc cuando el foco está en la región, y las mismas paradas y contenido que el recorrido 3D (secuencia idéntica comparada). Muestra nombre, ubicación, inventario, consumo y explicación.
- **Persistencia y copias:** migración 007 y copias versión 4 (acepta 1–3). Duplicar espacio/piso copia puestos y superficie; deshacer restaura ediciones y espacios eliminados con sus puestos.

## Diagnóstico de la transición entre pisos
Se reprodujo con una prueba dirigida (`cdp-transitions.mjs`): alterna Piso 1/2/3 sin esperar y compara el estado final con el esperado calculado de forma independiente (altura del objetivo de cámara, apertura por piso, visibilidad, piso activo, asentamiento).
- **Estado final tras secuencias rápidas:** correcto en los tres escenarios; la última selección siempre gana. No se encontró herencia de apertura entre pisos ni reinicio de cámara al refrescar cálculos (movimiento de cámara 0,000 al alternar la capa de consumo).
- **Defecto real encontrado y corregido:** en pisos generados, la fachada y la cubierta levantadas seguían visibles y tapaban el interior. La prueba **falla con el defecto reintroducido** (“piso 2 (generado) abierto pero con fachada visible”) y **pasa con la corrección**.
- **Animación:** el movimiento viene de dos fuentes: los clips `Roof_Open`/`Facade_Open` del GLB (pisos con el módulo del modelo) y una interpolación propia para altura, apertura y cámara (pisos generados y todo el desplazamiento de pisos).
- No se comprobó en una grabación de vídeo ni a velocidad de GPU real; las capturas son instantáneas del estado final.

## Hallazgos corregidos gracias a las pruebas reales
1. `active` llegaba como 0/1 desde MySQL y un equipo pausado seguía sumando.
2. El total medido daba 0 (en vez de “incompleto”) si faltaba una lectura.
3. En pisos generados la cubierta levantada tapaba el interior.
4. El MySQL persistente se apagaba al cerrarse la herramienta que lo lanzó: el arranque oficial ahora usa procesos independientes (`kwh-local.ps1`).

## Accesibilidad
**Verificado (Chrome, automatizado):** orden de foco con Tab; foco dentro del diálogo y retorno al disparador al cerrar con Escape; sin desplazamiento horizontal a 500 px en las secciones nuevas; alternativas al 3D (tarjetas 2D, árbol de estructura, tablas equivalentes, respaldo esquemático con aviso y “Reintentar 3D”); editor de planta con arrastre, flechas y campos numéricos etiquetados; estado “sin datos” presente como texto en etiquetas y paneles.

**Contraste medido (WCAG, razón):** texto principal 14,64; secundario 6,19; nota 7,69; botón primario 11,02; menú activo 10,89; badge “incompleto” 7,69 (mínimo AA para texto normal: 4,5). Sobre la escala de consumo el texto oscuro daría 13,78 / 11,02 / 7,27 / **3,84 / 1,61**: los dos tonos más oscuros **no** admiten texto oscuro encima. Por diseño ningún texto se coloca sobre esos colores (las cifras van en etiquetas blancas y en tablas), y el color nunca es el único canal (número, etiqueta “sin datos”, tabla equivalente).

**No verificado:** lector de pantalla (NVDA/JAWS/VoiceOver): no hay uno disponible en esta sesión ni forma de manejarlo; el uso con daltonismo real; dispositivos físicos. Todo lo móvil se probó **solo en emulación** (ventana de 500 px de Chrome), no en teléfonos ni tabletas reales.

## Rendimiento (Chrome headless, render por software, i5-12500H)
Tres medidas distintas: **carga** (recarga → primeras etiquetas visibles, modelo de 2,2 MB en caché), **duración de render** (`renderer.render` + etiquetas por cuadro, dentro del visor mientras se rota la cámara) y **respuesta a interacción** (clic en “Abrir piso” → segundo cuadro pintado; incluye actualizar la interfaz y construir el interior). No son FPS sostenidos ni hay medición con GPU real.

| Escenario (pisos × esp. × líneas) | Nivel | Líneas | Carga | Render medio / p95 | Draw calls | Triángulos | Clic→cuadro |
|---|---|---|---|---|---|---|---|
| 3 × 4 × 4 | edificio | 48 | 1,1 s | 2,6 / 5,4 ms | 834 | 80 904 | 109 ms |
| 3 × 4 × 4 | piso abierto | 48 | 1,1 s | 2,7 / 11,7 ms | 308 | 26 368 | — |
| 10 × 4 × 10 | edificio | 400 | 1,1 s | 7,1 / 24,5 ms | 2 710 | 262 120 | 142 ms |
| 10 × 4 × 10 | piso abierto | 400 | 1,1 s | 3,1 / 4,6 ms | 392 | 27 376 | — |
| 10 × 6 × 8 | edificio | 480 | 1,1 s | 3,4 / 5,0 ms | 461 | 5 412 | 107 ms |
| 10 × 6 × 8 | piso abierto | 480 | 1,1 s | 2,4 / 4,4 ms | 500 | 37 872 | — |
| 25 × 6 × 10 | edificio | 1 500 | 1,1 s | 5,7 / 21,6 ms | 1 147 | 13 464 | 106 ms |
| 25 × 6 × 10 | piso abierto | 1 500 | 1,1 s | 2,6 / 4,1 ms | 542 | 38 376 | — |
| 40 × 6 × 10 | edificio | 2 400 | 1,1 s | 7,2 / 24,1 ms | 1 478 | 17 328 | 111 ms |
| 40 × 6 × 10 | piso abierto | 2 400 | 1,1 s | 3,1 / 6,5 ms | 542 | 38 376 | — |
| 1 piso con 60 puestos (45 ocupados) | piso abierto | — | — | 2,7 / 2,9 ms | 440 | — | — |

El costo crece con el número de pisos y con cuántos usan el módulo del modelo (≈ 270 draw calls por piso). No se midieron GPU real, móviles reales ni más de 40 pisos.

## Alcance honesto
- **Implementado y verificado:** todo lo descrito en “Oficinas compartidas”, más lo de etapas previas (asistente de espacios, generador, selección sincronizada, análisis, recorridos, copias, deshacer).
- **No implementado:** consumo normalizado por m² a partir de la planta esquemática (por diseño no se usa), puertas en pisos con el módulo del modelo, rutas de cámara con evasión de geometría (las paradas usan encuadres fijos seguros), y puestos que generen equipos automáticamente (por diseño).
- **Ocupados:** se declaran como un número; la posición de las siluetas ocupadas en 3D es ilustrativa (los primeros puestos), no una asignación por persona.
- **Accesibilidad no verificada:** lector de pantalla (NVDA/JAWS/VoiceOver): no hay uno disponible ni forma de manejarlo aquí. Se verificó en Chrome: teclado (Enter, ← →, Esc, Tab), foco estable sin movimientos automáticos, `aria-disabled` en lugar de perder el foco, y ausencia de scroll horizontal. El móvil se probó solo en emulación (500 px); no en dispositivos físicos.

## Capturas
- `tmp/final5/` (oficinas compartidas): `e1-no-caben`, `e1b-cubiculos-no-caben`, `e2-12-puestos-abiertos`, `e2b-4-cubiculos`, `e3-lote-revision`, `e4-puestos-con-computadores`, `e5-puertas-abiertas`, `e6-recorrido-tarjetas`, `e7-sesenta-puestos`, `e8-movil-editar-espacio`, `e9-movil-tarjetas`, `e10-sin-webgl-tarjetas`.
- `tmp/final4/`: `d1-puestos-puertas-abiertas`, `d2-panel-puestos-indicadores` (demostración).
- Etapas previas: `tmp/e2e4/`, `tmp/final3/`, `tmp/final2/`.
