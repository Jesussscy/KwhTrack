# Energía empresarial: solar, pasillos, catálogo y observación

Implementación local del 17 de noviembre de 2026. Acceso exclusivo desde `/empresarial`; no se añadieron enlaces desde la navegación doméstica. No se publicó ni se hizo commit.

## Cómo usarlo

1. Abre `http://127.0.0.1:3000/empresarial`. Para explorar sin cuenta: `http://127.0.0.1:3000/empresarial#demo&sec=solar`.
2. En **Paneles solares**, elige la ciudad y prueba cantidad y potencia por panel. El consumo se toma del resumen. La superficie, coordenadas y demás supuestos técnicos ahora son ajustes opcionales; consulta `empresarial-ux-solar-3d.md` para el rediseño más reciente.
3. Elige demanda por inventario, un consumo mensual declarado o el pronóstico del historial. Este último necesita al menos seis periodos válidos del mismo origen; utiliza el modelo predictivo existente, con horizonte de seis meses. No inventa los otros seis meses del año.
4. Declara un horario de actividad y carga fuera de horario, o introduce 24 pesos horarios con su fuente. El reparto se identifica como hipótesis; no equivale a tener mediciones horarias.
5. Pulsa **Consultar PVGIS y guardar**. Se obtiene una curva real del servicio externo y se guarda el escenario. La primera consulta necesita conexión a Internet; si falla, no se inventa un resultado.
6. Compara actual, horarios, solar y combinación. La gráfica, tabla accesible y CSV muestran demanda, generación, uso solar directo, compra a la red y excedentes.
7. Abre **Edificios y 3D**. El techo muestra la cantidad configurada de paneles y su potencia; pulsa su etiqueta para volver al escenario.
8. En **Pasillos y sensores**, registra uno o varios grupos de luces por piso. Cada grupo conserva cantidad, potencia y horario propios. Si no conoces la potencia, queda incompleto.
9. Para ver las luces en 3D, configura el piso con un corredor generado mediante **Configurar espacios**. La geometría del GLB original es fija; registrar una zona no inventa espacio disponible en esa planta.
10. Al agregar un equipo, abre **Buscar un producto o marca del catálogo**. Busca, selecciona y revisa la referencia técnica antes de introducir o adoptar una potencia.

## Qué calcula

- La demanda y la producción son magnitudes distintas. La instalación solar no reduce por sí misma la energía que utilizan los equipos.
- En cada hora representativa: uso solar directo = mínimo(demanda, producción); compra a la red = máximo(demanda − producción, 0); excedente = máximo(producción − demanda, 0).
- El escenario combinado recalcula los balances después de ajustar el uso; no suma dos ahorros que se solapan.
- La reducción de horario solo afecta la parte de inventario completa y ajustable. Protege equipos esenciales y categorías o nombres críticos como servidores, refrigeración, seguridad, bombas y ascensores. No modifica el inventario ni acciona dispositivos.
- La referencia de dimensionamiento estima cuántos paneles generarían el equivalente al 50 % de la demanda del periodo. No promete compensar el 50 % de la factura. Se muestra también el límite preliminar por área declarada.
- La tarifa procede del edificio. Sin tarifa no se inventan pesos. Los excedentes valen cero hasta que el usuario declare su compensación. El costo excluye cargos fijos, impuestos y otros conceptos de la factura.
- Los pasillos tienen identificadores y grupos de equipos propios. Se incorporan una vez al piso, al total empresarial, al resumen y a la base del modelo predictivo. El plan predictivo conserva sus horarios para revisión manual desde su sección.

## Fuente solar y límites

Se usa PVGIS 5.3 `seriescalc`, base ERA5, año histórico 2023, con referencia de 1 kWp. El backend consulta un dominio fijo, verifica los 8.760 registros y los convierte de W a kWh por intervalo de una hora. Agrega días medios por mes y hora local. Configurar paneles o Wp distintos reutiliza la curva específica; cambiar ubicación, inclinación, orientación, pérdidas o desfase horario requiere otra consulta.

Se respeta el orden de los meses futuros y su duración al utilizar el pronóstico. La producción de referencia corresponde al mismo mes del año histórico, no al clima futuro. La incertidumbre de la demanda sigue afectando el escenario solar.

El autoconsumo es aproximado: los días medios suavizan variaciones diarias. No es una simulación de cada día futuro, ni una medición, ni un estudio de ingeniería. No modela baterías, sombras detalladas, capacidad estructural, protecciones eléctricas, autorización de conexión ni retorno de inversión. La colocación 3D es esquemática; la comprobación de área usa las dimensiones reales declaradas, no las del dibujo.

Fuente oficial: [API de PVGIS](https://joint-research-centre.ec.europa.eu/photovoltaic-geographical-information-system-pvgis/using-pvgis-5/api-non-interactive-service_en).

## Catálogo: qué API existe

`GET /api/org/products?q=HP` es una API propia de búsqueda sobre el catálogo local ya existente. Devuelve `provider: catalogo-local` y `live: false`. No se descubrió ni se configuró una API autorizada de Homecenter; no se presenta el listado como inventario comercial actualizado.

Una referencia sin potencia técnica queda sin potencia. Las referencias con valores permiten revisar fuente, modelo y condición antes de adoptarlos explícitamente. No se traslada automáticamente la potencia máxima de un adaptador como consumo medio de un computador. Marca, modelo, enlaces y nota de confirmación se guardan, duplican, exportan, importan y restauran con deshacer.

## Sensores y reglas

Hay lecturas de potencia, energía acumulada, ocupación, temperatura y humedad, con zona, fuente, origen y fecha. Los datos manuales se presentan como declarados. Un enchufe que mida cero W no demuestra ausencia de personas.

Las reglas son exclusivamente de observación. Exigen una secuencia reciente de ausencia sin huecos mayores que la vigencia permitida. Una lectura aislada antigua no demuestra quince minutos de ausencia. Se bloquean ante datos vencidos, equipo esencial o prioridad manual. La interfaz vuelve a evaluar la vigencia cada diez segundos mientras está visible y detiene ese temporizador al salir de la sección.

La propuesta identifica que no se envió ninguna orden. No hay llamadas para apagar luces, cortar compresores o cambiar consignas. Una consigna de 20 °C no se establece como requisito universal de protección del condensador.

### Conector opcional de lectura de Home Assistant

Está implementado, pero no se ha conectado ni probado con hardware real. La prueba automatizada comprueba el contrato de lectura con respuestas controladas y verifica que solo se usen peticiones GET.

El administrador puede configurar estas variables en `backend/.env`, usando los identificadores reales de su instalación. No se solicitan ni se imprimen tokens en la interfaz:

```dotenv
KWH_HA_BUILDING_ID=<id del edificio empresarial>
KWH_HA_URL=http://<servidor local de Home Assistant>:8123
KWH_HA_TOKEN=<token privado de Home Assistant>
KWH_HA_ENTITIES=[{"entity":"sensor.pasillo_power","type":"power","zone":"Pasillo Piso 1"},{"entity":"binary_sensor.pasillo_occupancy","type":"occupancy","zone":"Pasillo Piso 1"}]
```

Tipos admitidos: `power`, `energy`, `occupancy`, `temperature`, `humidity`. Se normalizan W/kW y Wh/kWh; temperatura requiere °C y humedad %. Estados desconocidos o no disponibles no se convierten en cero. Las marcas temporales vienen del proveedor y pueden hacer que una lectura se considere vencida.

El conector solo está habilitado para el edificio indicado. La sesión debe pertenecer a su organización, y la sincronización exige CSRF y revisión actual. El servidor consulta únicamente las entidades configuradas, conserva el token y no acepta una URL enviada desde el navegador. Las lecturas recibidas por integración no se pueden fabricar mediante el formulario manual.

Documentación: [REST API de Home Assistant](https://contributors.home-assistant.io/core/internals/rest-api/). La compatibilidad de cargas depende del enchufe concreto: [guía del fabricante TP-Link](https://www.tp-link.com/us/support/faq/4324/).

## Persistencia y operación

- Migración aditiva **008**: `buildings.energy_config` y `equipment.product_reference`. Se aplicó en la base persistente después de un respaldo con `local-db.mjs backup`.
- Se mantienen aislamiento por organización, comprobación de origen, CSRF y bloqueo por revisión; un conflicto no sobrescribe cambios ajenos.
- Los ajustes energéticos tienen deshacer en la cuenta empresarial, sujeto a la revisión del edificio. Duplicar un piso duplica también su inventario de circulación si se pidió copiar inventario, con identificadores nuevos.
- Copia **versión 5**, compatible con versiones 1 a 4. Conserva escenarios y grupos de pasillos, y remapea pisos. No importa observaciones ni reglas de dispositivos: deben volver a vincularse. Las curvas importadas se identifican como fuente declarada en una copia.
- Los formularios energéticos protegen cambios sin guardar y bloquean controles durante solicitudes. La demostración guarda únicamente en el navegador.
- Se corrigió un bloqueo real entre registros concurrentes: la limpieza de sesiones vencidas ahora se realiza en autocommit antes de crear la sesión, sin conservar bloqueos de rango dentro de la transacción de alta.

## Evidencia

Los resultados y capturas se guardan en `tmp/energy-expansion/` y `tmp/energy-account/`. Los scripts son `backend/tools/cdp-energy.mjs` y `backend/tools/cdp-energy-account.mjs`; usan Chrome real, cuenta efímera cuando procede y limpieza limitada a la organización creada por la prueba.

Comandos desde `backend/`:

```powershell
npm run build:glb
npm run check
node --test
npm run test:mysql:org
npm run test:mysql
npm run e2e:energy
npm run e2e:energy-account
```

Verificación: balances energéticos, ausencia de doble conteo, demanda nocturna, cero paneles, área insuficiente, invalidación de curvas, orden de meses y año bisiesto, catálogo sin potencia inventada, protección de reglas, contrato del puente de sensores, persistencia, fuentes de producto, importación, organizaciones, CSRF y conflictos. Los recorridos visuales incluyen la consulta real a PVGIS, paneles configurados, luminarias del inventario, pronóstico de seis meses, recarga, grupos distintos, deshacer, móvil emulado de 390 px y funcionamiento sin WebGL.

Pendientes físicos: lector de pantalla real, teléfono físico, GPU real, hardware domótico y validación técnica de una instalación fotovoltaica real. No se implementaron baterías ni control físico de dispositivos.

Resultado final: `npm run check` y compilación del visor correctos; 169 pruebas generales aprobadas y 7 de integración omitidas por no cargar `.env` en esa ejecución. Las ejecuciones separadas con MySQL aprobaron 43 pruebas empresariales y 14 domésticas, sin omisiones. Chrome: 20 comprobaciones de demostración y 13 con cuenta real, todas aprobadas. La batería conjunta incluye dos registros simultáneos para cubrir el bloqueo corregido.
