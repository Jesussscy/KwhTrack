# Ahorro guiado empresarial

## Abrir la experiencia

Demostración: <http://127.0.0.1:3000/empresarial?ahorro=guiado-v2#demo&sec=simulador>.

Con cuenta: entra en `/empresarial` y selecciona **Simulador y planes**. El resumen también ofrece un presupuesto editable y **Probar mi ahorro**. Desde un equipo del visor se puede regresar al simulador con el piso y espacio seleccionados.

Solo se modificó la zona empresarial y el mapa de recursos del servidor. No se añadieron enlaces domésticos, dependencias ni migraciones. No se publicó ni se creó un commit.

## Qué puede hacer el usuario

- Ver consumo y costo del inventario, presupuesto y ahorro del escenario en tarjetas de colores.
- Introducir o deslizar un presupuesto, comparar la vista previa y guardarlo explícitamente. El borrador se conserva al cambiar equipos y se separa por edificio y contexto de cuenta/demostración.
- Registrar su tarifa con fuente y fecha. Sin tarifa no se inventan pesos.
- Reducir 30 minutos, una o dos horas por día de uso en cada grupo de aires. También admite una reducción personalizada y exclusiones explícitas.
- Comparar uso actual, escenario moderado y personalizado, con una misma base de inventario.
- Alternar gráficas de kWh y COP, con referencia del presupuesto en la vista de costo.
- Filtrar aires por piso o espacio, abrir su ubicación en el visor y volver al contexto seleccionado.
- Revisar la meta y su avance. Las metas que exceden el potencial calculable se explican sin forzar horarios.
- Trasladar una propuesta del pronóstico histórico a la vista guiada. La edición avanzada de otros equipos sigue disponible.
- Revisar los cambios exactos y confirmarlos antes de guardar horas en el inventario.

## Cálculos y protecciones

El consumo se calcula con la función compartida del navegador y servidor:

`W por unidad × cantidad × horas/día × días/mes × factor ÷ 1000`.

Cada escenario se recalcula desde el inventario de partida. No acumula ahorros sobre una simulación anterior. Incluye los servicios comunes en el total del edificio y los conserva sin reducción automática.

En el ejemplo de cuatro aires de 1.200 W, ocho horas diarias, 22 días y factor 1, pasar a seis horas reduce la estimación de **844,8 a 633,6 kWh**, una diferencia de **211,2 kWh por mes típico**. Son 44 horas de uso evitadas por aparato, o 176 horas-aparato para las cuatro unidades. No son dos horas en todo el mes.

La vista guiada limita las reducciones a la mitad de las horas declaradas. Redondea las horas hacia arriba a centésimas para no exagerar el recorte. Protege esenciales, pausados, datos incompletos, equipos mensuales, categorías críticas/continuas y exclusiones. No convierte BTU/h a consumo eléctrico ni promete ahorros por temperatura, mantenimiento o inverter.

El consumo desconocido permanece desconocido. La interfaz advierte sobre equipos y espacios pendientes; los datos parciales pueden cambiar la comparación.

## Horarios: duración y reloj

Las horas por día son **uso declarado**, no tiempo medido ni estado actual del aparato.

El usuario puede introducir un inicio para visualizar bloques de 24 horas, moverlo con un deslizador y confirmar la duración del borrador. Se muestran también cruces de medianoche. No se inventa un inicio cuando solo hay una duración.

**Los inicios y finales del reloj son borradores de la sesión; no se guardan como programación persistente.** Aplicar el plan guarda las horas diarias mediante la API existente. La interfaz y la revisión lo explican. No hay control físico, sensores, calendario semanal ni programación por dispositivo. Las unidades de un grupo comparten la duración declarada; usos distintos deben registrarse por separado.

## Guardado y conflictos

El presupuesto se guarda por edificio con la revisión capturada. El plan se confirma en un diálogo con cantidad, ubicación, horas anteriores y nuevas, días y ahorro calculado. Se usa el endpoint transaccional existente, con sesión, CSRF, origen y aislamiento por organización.

Una revisión antigua se rechaza y se carga el estado actual, sin sobrescribir una edición concurrente. Los escenarios obsoletos requieren reiniciarse. Tras aplicar un plan se elimina su borrador para evitar reaplicarlo implícitamente. No se amplió el alcance de deshacer.

## Verificación de esta entrega

| Comprobación | Resultado |
| --- | --- |
| `npm run check` | Correcto |
| `npm test` | 123 aprobadas, 6 omitidas por configuración MySQL en esa ejecución |
| `npm run test:mysql:org` | 35 aprobadas, ninguna omitida, MySQL real |
| `node --test test/enterprise-savings.test.js` | 9 pruebas del motor incluidas en la suite general |
| `npm run e2e:savings` | 35 comprobaciones en Chrome real sobre una demostración aislada |
| `node --env-file=.env tools/cdp-savings-account.mjs` | 11 comprobaciones con cuenta, MySQL real y WebGL deshabilitado |
| `node tools/cdp-overview.mjs` | 12 comprobaciones de regresión del resumen |
| `npm run e2e:prediction` | 22 comprobaciones de regresión del pronóstico |

La comprobación con cuenta crea una organización sintética y la elimina al terminar. Verifica presupuesto, aplicación exacta de horas, persistencia al recargar y conflicto de revisión ante una edición concurrente. No utiliza edificios de otras organizaciones.

Chrome verificó anchuras emuladas de 320, 390 y 500 px sin desbordamiento horizontal; teclado mediante controles nativos y retorno de foco tras cambios; y `prefers-reduced-motion`, que desactiva el flujo decorativo del aire y las transiciones. No se probó lector de pantalla ni teléfono físico. Los tiempos de reloj, los resultados energéticos y las tarifas de las capturas son ilustrativos.

## Evidencias

En `tmp/savings-experience/`:

- `01-summary.png`: resumen y acceso al simulador.
- `02-budget-and-chart.png`: presupuesto y gráfica de costo con referencia.
- `03-air-and-schedule.png`: equipos, reducción diaria y resultados.
- `04-comparison.png`: meta y comparación de escenarios.
- `05-plan-review.png`: confirmación de horas antes de guardar.
- `06-mobile.png` y `07-mobile-air.png`: móvil emulado.
- `08-schedule.png`: borrador del horario de 24 horas.
- `results.json`: resultados de las 35 comprobaciones.

En `tmp/savings-account/`: persistencia con cuenta sin WebGL y conflicto real, con su `results.json`.

Las pruebas funcionales no demuestran ahorro real ni precisión predictiva sobre la operación de una empresa. El pronóstico histórico conserva su método y sus límites documentados en `prediccion-y-ahorro.md`.
