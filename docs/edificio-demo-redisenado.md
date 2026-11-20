# Edificio y demostración: revisión visual

## Abrir

Abre `http://127.0.0.1:3000/empresarial#demo&sec=edificios`. Si tenías la versión anterior abierta, recarga la página para cargar los nuevos scripts y estilos.

La demostración ahora permite añadir pisos, configurar oficinas y lobby, editar distribución e inventario, duplicar/reordenar pisos y reiniciar el ejemplo. Sus cambios se guardan en `kwh-enterprise-visual-sandbox-v1`, únicamente en ese navegador. No utiliza la sesión empresarial para escribir en MySQL. La navegación del ejemplo se limita a resumen, edificio e inventario; las funciones de cuenta siguen en la experiencia autenticada.

## Problemas corregidos

- El GLB permanecía con cubierta y fachada visibles incluso al alcanzar apertura 1. Ahora se aplica visibilidad explícita a ambas rutas, GLB y procedural.
- El activo Blender tiene el suelo en cero; el módulo procedural usa un origen vertical centrado. Se normalizó el GLB para evitar cubiertas altas y módulos desalineados. También se corrigió la altura del mobiliario reutilizado en plantas generadas.
- El foco global con outline y box-shadow se aplicaba a grupos SVG. Se reemplazó por un contorno de foco dentro de la geometría, con grosor independiente del zoom.
- Selección, cámara y capas se separan en controles por contexto. Se añadieron vistas isométrica, superior y frontal, ampliación con Escape y conservación de foco al actualizar controles.
- Las fachadas exteriores usan una envolvente común para que los pisos generados y el activo original formen un solo edificio. La apertura retira esa envolvente.
- Las etiquetas son seleccionables, tienen evitación básica de solapamientos y conectores cuando se desplazan. Si no hay espacio, se conserva acceso mediante la lista y la planta.

## Consumo y efectos

El gráfico cambia entre pisos, espacios y equipos; sus barras permiten seleccionar o abrir el elemento. Incluye tabla equivalente. El mapa de consumo es opcional y tiene su propia leyenda; los acabados arquitectónicos son el modo inicial.

Las partículas ilustran **intensidad relativa de kWh de un mes típico**, no flujo eléctrico físico ni lecturas instantáneas. La escala se deriva del conjunto del edificio, con presupuesto máximo de 560 puntos y emisión acotada por elemento. Sin datos y cero válido no emiten partículas. Se pueden apagar; movimiento reducido y calidad básica las desactivan. La preferencia se guarda aparte de los datos.

Los interiores ocultos se omiten del render; el mobiliario dinámico se construye al entrar. Las sombras no se recalculan continuamente solo por animar partículas. Las animaciones se pausan al ocultar el documento o sacar el visor de pantalla.

## Comprobaciones reproducibles

Desde `backend/`:

```powershell
npm run build:glb
npm run check
npm test
node tools/cdp-visual-demo.mjs
node tools/cdp-visual-quality.mjs
node tools/cdp-transitions.mjs http://127.0.0.1:3000 ../tmp/visual-transitions
```

- Build y comprobación de sintaxis aprobados.
- Suite general: 95 aprobadas, 6 omitidas por configuración de MySQL. Estas ejecuciones no validan integración autenticada con base real.
- El recorrido CDP visual comprueba interiores GLB y procedural, foco SVG, cambios rápidos, partículas, vista superior, alta de piso con cuatro oficinas y lobby, inventario calculado, ausencia de escrituras HTTP desde el sandbox, recarga, movimiento reducido, calidad básica, vista ampliada, móvil emulado, restauración y errores de página.
- La prueba dirigida de transiciones compara estado final y cámara con resultados esperados independientes. Se acotó su selector al control de pisos para que no cuente los CTA y el árbol alternativo como pisos adicionales.
- Calidad: escenas de 3 y 12 pisos con 4 espacios y una línea de equipos por espacio, en Chrome headless con render por software. Se registra ventana de observación, muestras, media/p95 de render, llamadas y triángulos. No son FPS sostenidos ni mediciones de latencia de interacción.
- Se comprueba el respaldo sin WebGL forzando `--disable-3d-apis`.

Evidencias: `tmp/visual-demo/results.json`, capturas de esa carpeta, `tmp/visual-quality/quality.json`, `tmp/visual-quality/fallback.png` y `tmp/visual-transitions/transiciones.json`. La captura anterior está en `tmp/visual-before/interior-before.png`.

## Límites de esta entrega

La arquitectura y posiciones de equipo siguen siendo esquemáticas. No hay planos certificados, telemetría, sensores ni simulación térmica. El sandbox no sustituye una cuenta ni permite operaciones administrativas completas. Sus copias locales no son las copias empresariales de MySQL.

La evitación de etiquetas es geométrica y básica; no es un sistema completo de oclusión por rayos. No se verificó un teléfono físico, GPU real o lector de pantalla. Las evidencias de las transiciones son estados finales y comprobaciones automatizadas, no una grabación continua de vídeo. La batería visual de esta etapa no ha vuelto a ejecutar los flujos autenticados completos contra MySQL.
