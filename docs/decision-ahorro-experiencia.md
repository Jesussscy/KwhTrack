# Predicción, ahorro y circulación: experiencia guiada

Entrega local del 18 de noviembre de 2026. Sin publicación ni commit. No se modificaron los enlaces de la navegación doméstica.

## Lo que ve el usuario

- **Predicción y ahorro:** consumo conocido, costo con la tarifa del edificio, cobertura, siguiente paso, ranking y tres caminos: equipos, solar y luces automáticas. El detalle estadístico existente permanece en «Cómo se calcula».
- **Pendientes concretos:** equipo, ubicación y campos faltantes, con acceso a su formulario. Los grupos pausados y los kWh mensuales conocidos se distinguen de datos desconocidos. Se puede confirmar que un espacio vacío no tiene equipos propios; esa declaración no elimina cargas comunes.
- **Propuesta revisable:** quitar 30 minutos, una o dos horas a un grupo ajustable muestra antes y después. Cuatro aires de 1200 W, 8 horas y 22 días consumen 844,8 kWh/mes; con 6 horas, 633,6. La diferencia es 211,2 kWh/mes. Solo cambia el inventario al confirmar la revisión.
- **Cuatro escenarios:** actual, mejores horarios, solar, y horarios con solar. El combinado se vuelve a calcular por balance horario; no se suman dos ahorros que puedan superponerse. La demanda y la compra a la red se muestran por separado.
- **Solar:** la ciudad se explica como referencia de radiación y clima del panel. No mide temperatura interior ni pronostica el tiempo de mañana. Wp se diferencia de kWh. Con techo desconocido se permite explorar y se muestran los m² aproximados necesarios; con área declarada insuficiente se rechaza el escenario. Por encima de 30 paneles, se dibujan 30 símbolos con aviso de agrupación: no se encogen módulos para aparentar capacidad física.
- **Pasillos:** primero se explica qué consumen las luces, qué observa un sensor y qué podría hacer un controlador. El recorrido tiene iniciar, pausa, anterior, siguiente y reinicio, con ocupación, espera, estado de las luces, minutos encendidas y energía acumulada. Las luces y una figura de presencia se sincronizan con el visor 3D. Una planta 2D conserva la explicación sin WebGL.
- **Regla en palabras:** ausencia continua, minutos de espera, horas activas, carga esencial y control manual. Guardar una regla requiere una revisión explícita y solo habilita observación. Una lectura vencida no significa ausencia. No se envían órdenes físicas.
- **Dos demostraciones:** edificio completo con tres pisos, inventarios, corredores, tarifa ficticia, ocho periodos sintéticos y tres observaciones de ejemplo; y un caso separado con dos grupos incompletos y una sala sin inventario. Las copias locales anteriores se conservan y ofrecen abrir el nuevo ejemplo mediante confirmación.

## Consistencia de datos y persistencia

La demostración ya no añade un historial temporal únicamente en predicción. Resumen, registros, inventario y solar parten del mismo edificio. Los borradores solares y de horarios se separan por cuenta/demostración y por edificio; una modificación de tarifa o solar conserva una propuesta de horarios si el inventario no cambió. Un cambio real de inventario invalida propuestas antiguas.

Las declaraciones de espacios se guardan en el JSON energético existente, verificando pertenencia y que no contengan equipos. La copia v5 las remapea al importar. No se necesitó una migración nueva. El endpoint de demostración con cuenta crea un edificio independiente con los mismos datos completos; no sustituye edificios existentes.

## Verificación

Comandos desde `backend`:

```powershell
npm run check
npm run build:glb
node --test
npm run test:mysql:org
npm run test:mysql
npm run e2e:decision
node tools/cdp-solar-ux.mjs
node tools/cdp-transitions.mjs http://127.0.0.1:3000 ../tmp/decision-transitions
```

- General: **187 aprobadas, 7 omitidas**. Las omitidas requieren MySQL y se ejecutaron por separado.
- MySQL empresarial: **46 aprobadas, 0 omitidas**. Incluye las nuevas declaraciones vacías, referencias remapeadas al importar, propiedad, rechazo de declarar un espacio con equipos y creación del ejemplo completo sin cambiar otro edificio.
- MySQL doméstico: **14 aprobadas, 0 omitidas**.
- Chrome, recorrido nuevo: **25 comprobaciones**, incluyendo revisión y guardado de horarios, borrador compartido con solar, luces 3D/2D, reglas, movimiento reducido, móvil a 390 px y ausencia de WebGL. Usa una curva solar **sintética explícita de prueba**, para que la comprobación de la interfaz sea reproducible. No se presenta como consulta real del proveedor.
- Regresión solar en Chrome: **31 comprobaciones**, incluyendo consulta del perfil solar por la integración existente, cambios de ciudad, borradores, posición de equipos, techo generado y respaldo sin WebGL.
- Cambios entre pisos: **9 secuencias correctas** con la demostración actual, incluyendo selecciones rápidas y vista explotada.

Evidencia: `tmp/decision/resultado.json`, capturas `03` a `10`, `tmp/solar-ux/results.json`, `tmp/decision-transitions/transiciones.json` y los registros `tmp/decision-*.log`. La primera ejecución del script solar necesitó esperar la carga real de la nueva escena antes de consultar sus mallas; esa espera está corregida. El cierre del navegador de pruebas también tiene un plazo para no quedar esperando un canal CDP ya cerrado.

## Límites explícitos

- Mes típico del inventario y referencia solar histórica no son medición horaria ni promesa de ahorro. El perfil horario sigue siendo declarado o supuesto y no incluye baterías.
- La reducción de horarios es un borrador de la sesión hasta aplicarla al inventario. Guardar el escenario solar no guarda automáticamente cambios de equipos.
- Los periodos de la demostración son sintéticos; la validación estadística con ellos no demuestra precisión en empresas reales.
- El recorrido de dos horas es didáctico. Su energía se calcula por tiempo encendido, pero **no** se extrapola al mes. El ejemplo mensual de 28,8 → 20,16 kWh es una hipótesis separada de tres horas menos al día.
- La figura de presencia representa un evento del guion, no la posición de una persona real. Si hay grupos de luces con horarios distintos, el taller explica que usa una potencia equivalente para conservar la energía mensual.
- Sin sensores vinculados no hay telemetría real. No hay nuevas órdenes domóticas ni control físico de climatización.
- Móvil verificado en emulación; no se probó un teléfono físico ni un lector de pantalla. La cubierta es esquemática y no sustituye un diseño de instalación.

Servidor local: `http://127.0.0.1:3000/empresarial`. Base persistente en 3316. Para ver el ejemplo nuevo sin cargar una copia local anterior: `/empresarial#demo&fresh=1&sec=prediccion`.
