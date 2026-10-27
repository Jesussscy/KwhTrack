# Fuentes del catálogo de equipos

Consulta realizada el 26 de octubre de 2026. Este catálogo es una selección pequeña y ampliable; las referencias genéricas son escenarios de cálculo editables, no especificaciones de modelos.

| Referencia | Dato que se muestra | Fuente técnica | Evidencia de disponibilidad en Colombia | Alcance |
|---|---|---|---|---|
| Sony PlayStation 5 Digital, familia CFI-21 | 215,7 W, promedio de juego activo con tres juegos PS5 | [Sony PlayStation: energía y ecodiseño](https://www.playstation.com/en-gb/legal/ecodesign/) | [Tienda PC Tintas: CFI-2115 digital en Colombia](https://tienda.pctintas.com/categoria-producto/gaming/consolas-y-videojuegos/) | El dato energético es del fabricante para la familia CFI-21, no una lectura de cada unidad CFI-2115. El fabricante indica juegos de prueba y modo; el juego y la configuración cambian el consumo. |
| Sony PlayStation 5 con unidad de disco, familia CFI-21 | 214 W, promedio de juego activo con tres juegos PS5 | [Sony PlayStation: energía y ecodiseño](https://www.playstation.com/en-gb/legal/ecodesign/) | [Alkosto: PS5 estándar CFI-2115A01X](https://www.alkosto.com/consola-ps5-estandar-1tb-hw-2115-1-control-inalambrico/p/711719023937) | Medición de fabricante publicada para la familia; no atribuirla a reproducción de disco o a todos los juegos. |
| Ventilador Samurai Silence Force Plus 2 en 1 | Potencia nominal 80 W | [Ficha comercial colombiana de Electromuebles](https://electromuebles.com.co/producto/aire-y-climatizacion/ventiladores/ventilador-samurai-silence-force-plus-2-en-1-blanco/) | La ficha comercial colombiana identifica la referencia y su potencia | Potencia nominal publicada por comercio; no es consumo medido. El consumo promedio depende de velocidad y horas. Confirmar placa/manual de la unidad. |
| Categorías genéricas (ventilador, nevera, aire acondicionado, TV, lavadora, iluminación, ducha, router, portátil, microondas, arrocera y congelador) | Escenarios de potencia ilustrativos, todos editables | No se presenta una ficha de fabricante ni una fuente de modelo | Se ofrecen por tipo de producto, sin asociarlos con una marca/modelo | Útiles solo para explorar. Reemplazar la potencia con el valor de la placa o manual del equipo para mejorar la estimación. No inferir clase RETIQ. |

## Método y límites

- Con potencia: `kWh/mes = W / 1000 × cantidad × horas/día × días × factor de funcionamiento`.
- El catálogo usa 30 días para sus escenarios y parte de horas de ejemplo editables; la selección del producto abre una ficha antes de transferir los valores al formulario actual del hogar.
- El costo ilustrativo multiplica el kWh estimado por la tarifa configurada actualmente en kwhTrack. No es una factura, lectura del medidor ni cargo oficial; no se mezcla con lecturas y facturas registradas.
- No se asignan etiquetas ni clases de eficiencia. Los triángulos son controles informativos del catálogo, no distintivos RETIQ.
- El catálogo reutilizable está en `frontend/appliance-catalog.js`; no persiste datos privados ni ejecuta migraciones en hogares existentes.
