# Rediseño de exploración solar y edificio 3D

Entrega local del 18 de noviembre de 2026. Se aplicó el prompt proporcionado sobre el proyecto existente, conservando la navegación doméstica independiente. No se publicó ni se hizo commit.

## Experiencia principal

- El consumo aparece como una tarjeta de solo lectura: procede de `EnterpriseCalc.overview`, la misma fuente del resumen. Incluye espacios, circulación y servicios comunes una sola vez; señala datos desconocidos y cobertura parcial.
- La primera pantalla pide ciudad, cantidad de paneles y potencia por panel. El techo 3D está en la propia pantalla solar y cambia al añadir o quitar unidades.
- Coordenadas, orientación, pérdidas, separación, hora UTC, superficie, perfiles horarios y bases alternativas están dentro de ajustes avanzados opcionales. La superficie puede quedar desconocida; se permite explorar sin afirmar que los paneles caben físicamente.
- La búsqueda local contiene 1.115 localidades colombianas con nombre y departamento. Tolera tildes y diferencia nombres repetidos. Las coordenadas representan una referencia aproximada, no la ubicación exacta del techo.
- La ubicación del dispositivo es opcional y solo se solicita al pulsar su botón. Fuera del ámbito colombiano del catálogo, se conserva la búsqueda por ciudad o la ubicación precisa avanzada.
- Una guía voluntaria de tres pasos ayuda a empezar y se puede cerrar. La configuración avanzada permanece cerrada inicialmente.

## Paneles y escenarios

- El contador y el deslizador actualizan los módulos en el techo sin reconstruir todo el edificio. Se reutiliza un grupo instanciado y se anima la incorporación o retirada, con duración acotada. Cantidades grandes y movimiento reducido utilizan el estado final directamente.
- Cambiar solo la cantidad o potencia reutiliza una curva solar compatible. Cambiar la ubicación u otras condiciones que afectan la curva invalida el resultado anterior.
- Las vistas **Sin esta propuesta solar** y **Mi propuesta** permiten comparar la cubierta sin alterar el escenario guardado.
- La referencia de dimensionamiento permite explorar metas del 25, 50, 75 y 100 % de generación equivalente y probar la cantidad preliminar en la maqueta. No equivale a garantizar ese porcentaje de reducción de factura.
- Guardar es una acción explícita. Un borrador puede pasar al visor del edificio y regresar conservando su cantidad; no necesita guardarse para verse en 3D.
- Al abrir **Ver paneles en el edificio 3D**, se activa el modo de techo, se limpia la selección de interior, se desactivan aislamiento y separación de pisos, se recupera la cubierta y se encuadra la instalación del mismo edificio.
- El panel lateral del techo permite añadir o quitar módulos directamente. La gráfica contextual compara demanda, generación y compra a la red, con el periodo correspondiente.

## Explorar el edificio

La barra temática ofrece **Edificio**, **Salas y oficinas**, **Paneles solares**, **Equipos** y **Pasillos**. **Sensores** aparece cuando hay lecturas o una integración de lectura configurada.

El filtro **Computadores** lista las unidades realmente registradas, sus pisos y oficinas. Elegir una coincidencia abre esa sala, destaca la categoría y muestra el detalle real del equipo. Los puestos declarados sin un computador registrado no se convierten en equipos ficticios.

La acción secundaria **Ordenar en esta sala** permite elegir una posición ilustrativa con un plano sencillo, botones de dirección o teclado. Tiene vista previa, cancelación, guardado y retorno a la colocación automática. Sus coordenadas están normalizadas y limitadas al espacio; no cambian cantidad, potencia, horario ni energía. La posición se conserva en duplicación, copias e importación y admite deshacer en la cuenta empresarial.

Los pasillos se pueden abrir desde su pestaña o etiqueta sin abandonar inmediatamente la exploración espacial. Los grupos de luces conservan su sección de edición. Las lecturas de sensores se identifican por fuente, antigüedad y origen manual o integración; no se inventa su posición física. Solo se encuadra automáticamente una sala o piso cuando el nombre declarado identifica un recurso único.

## Móvil y alternativas

En pantallas estrechas la maqueta se coloca junto al formulario, antes de las gráficas de resultados. El contador permanece próximo al techo durante el desplazamiento. Los modos del visor se distribuyen en filas y se conservan listas equivalentes.

Sin WebGL se ofrece una cubierta 2D con cantidad y controles funcionales. Las cantidades grandes se agrupan visualmente y se conserva el número real indicado. Con movimiento reducido no hay incorporación progresiva ni recorridos automáticos.

## Cambios técnicos

- `frontend/enterprise-solar-ux.js`: pantalla solar progresiva, consumo compartido, ciudades, borradores, guía, comparación y visor integrado.
- `frontend/enterprise-solar-ux.css`: estilos de la experiencia, barra temática, controles de cantidad y colocación de equipos.
- `frontend/enterprise-locations.js`: catálogo geográfico local con procedencia y atribución.
- `frontend/empresarial.js`: modos del visor, transporte de borradores, panel solar contextual, filtros, sensores y colocación opcional.
- `frontend/enterprise-glb.src.js`: encuadre de cubierta, actualización instanciada de paneles, animaciones, filtros y posiciones de equipos. Se regeneró `enterprise-glb.js`.
- `frontend/enterprise-energy.js`: área desconocida y metadatos de ubicación compatibles con los escenarios previos.
- `backend/database/migrations/009_enterprise_visual_placement.up.sql`: columna JSON nullable `equipment.visual_placement`; incluye reversión separada. Se aplicó en la base persistente después de crear un respaldo.
- La nueva operación de posición verifica sesión, organización, origen, CSRF, límites y revisión del edificio. No acepta el cambio como una operación sobre otro edificio u organización.
- El asistente de migraciones de bases `_test` ahora descubre las migraciones empresariales 002 a 009 en orden, incluyendo las nuevas columnas necesarias para los flujos actuales.

No fue necesaria una migración de framework ni una dependencia de geocodificación en vivo. No se modificaron los controles ni los enlaces domésticos en esta etapa.

## Verificación

- Compilación del visor y `npm run check`: correctos.
- Pruebas generales: **177 aprobadas, 7 omitidas** porque esa ejecución no carga MySQL. Las integraciones se ejecutaron separadamente con base real.
- MySQL empresarial: **44 aprobadas, 0 omitidas**. Incluye colocación visual, límites, aislamiento, deshacer y conservación de posiciones al exportar/importar.
- MySQL doméstico: **14 aprobadas, 0 omitidas**.
- Chrome, experiencia solar: **31 comprobaciones aprobadas**. `tmp/solar-ux/results.json`. Cubre curva real de PVGIS, ciudad, controles opcionales, cantidad/modelo, borrador sin guardar, techo desde interior, filtros, posición ilustrativa, guía, móvil de 390 px, movimiento reducido, alternativa sin WebGL y cubierta de pisos generados.
- Revisión móvil final: **2 comprobaciones aprobadas** en `tmp/solar-ux/mobile-results.json`: controles junto a la cubierta sin tapar la cabecera y aplicación directa de la meta de generación.
- Chrome con cuenta real: **14 comprobaciones aprobadas**. `tmp/energy-account/results.json`. Cubre pronóstico de seis meses, guardado, recarga, varios grupos de iluminación, observación de sensores, duplicación y deshacer.
- Transiciones entre pisos: **9 secuencias aprobadas** en `tmp/solar-ux/transitions/transiciones.json`, incluidas selecciones rápidas y ausencia de movimiento de cámara al refrescar la capa de consumo.

Capturas reales: `tmp/solar-ux/01-simple-solar.png`, `02-roof-link.png`, `03-computers.png`, `03b-placement.png`, `04-mobile.png`, `05-no-webgl.png` y `06-generated.png`.

Comandos desde `backend/`:

```powershell
npm run check
npm run build:glb
node --test
npm run test:mysql:org
npm run test:mysql
npm run e2e:solar-ux
npm run e2e:energy-account
```

## Fuentes y límites

El catálogo geográfico deriva del extracto de Colombia y de los nombres de divisiones administrativas de [GeoNames](https://www.geonames.org/). Se filtran capitales, cabeceras y localidades pobladas para una búsqueda local manejable. Fecha del extracto: 18 de noviembre de 2026. [Formato y licencia CC BY 4.0](https://download.geonames.org/export/dump/readme.txt). Se mantiene la atribución en la interfaz y en el recurso de datos.

La generación continúa utilizando la referencia histórica de [PVGIS](https://joint-research-centre.ec.europa.eu/photovoltaic-geographical-information-system-pvgis/using-pvgis-5/api-non-interactive-service_en); no es un pronóstico meteorológico ni medición del techo. La cobertura de equipos incompletos sigue siendo parcial. La distribución de paneles y equipos es esquemática y no certifica capacidad estructural, sombras, circulación física o instalación eléctrica.

No se conectó hardware ni se añadieron apagados físicos. Se verificaron teclado y emulación móvil, pero no lector de pantalla real, teléfono físico ni rendimiento en GPU real. Las posiciones manuales son ilustrativas; no son un editor CAD ni calculan colisiones físicas completas con muebles.
