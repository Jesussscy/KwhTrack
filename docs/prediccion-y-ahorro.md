# Predicción y ahorro del edificio

## Acceso

En el menú empresarial: **Predicción y ahorro**. El resumen incluye también un botón de acceso para el edificio del alcance seleccionado.

Demostración con historial ilustrativo:

`http://127.0.0.1:3000/empresarial#demo&sec=prediccion&predictDemo=1`

Los ocho periodos ilustrativos se generan solo para enseñar el modelo: no sustituyen ni se guardan como facturas del edificio. Para usar registros propios, desactiva ese ejemplo o inicia sesión en la empresa correspondiente.

## Modelo temporal V2 — 17 de noviembre de 2026

El motor está en `frontend/enterprise-prediction.js`, sin proveedores externos ni dependencias nuevas. La selección del modelo se calcula con los registros que la sesión ya puede consultar.

### Datos admitidos

Cada periodo se normaliza a kWh/día. Se requieren al menos seis periodos del mismo origen, con fechas civiles válidas, duración de 7 a 93 días, consumo finito entre cero y 100.000.000 kWh, sin solapamientos ni fechas finales futuras. Son reglas de habilitación internas, no garantías estadísticas.

La ventana histórica es configurable en 12, 24, 36 o 48 periodos; por defecto se usan los últimos 24. Se muestran periodos incorporados, porcentaje de días cubiertos entre el primero y el último, huecos, antigüedad y valores atípicos. Los huecos no se rellenan y los atípicos no se eliminan.

Los avisos de atípicos usan la mediana diaria y un umbral máximo entre tres desviaciones absolutas medianas escaladas por 1,4826, el 60 % de la magnitud de la mediana y 0,01 kWh/día. Esta regla sirve para revisión, no demuestra errores ni anomalías operativas.

### Candidatos comparados

| Candidato | Implementación |
| --- | --- |
| Promedio reciente | Últimos tres periodos, ponderados por días; referencia simple |
| Último valor | Último consumo diario observado |
| Mediana reciente | Mediana de hasta cinco periodos |
| Suavizado exponencial | Hasta doce periodos, alfa fijo 0,35 |
| Tendencia lineal | Regresión ponderada por días de hasta doce periodos, con puntos medios temporales reales |
| Tendencia amortiguada | Variante propia sobre esa regresión; pendiente amortiguada con factor fijo 0,8 y distancia temporal real |
| Mismo mes del año anterior | Referencia anual, solo con al menos 27 meses completos y consecutivos dentro de la ventana |

El suavizado y la variante amortiguada usan parámetros fijos; no se optimizan mirando los periodos de prueba. La variante amortiguada no es un ajuste ETS completo. Ponderar por días es una decisión de diseño, sin estimación de varianzas ni afirmación de optimalidad.

### Selección y prueba temporal

Para cada corte temporal se entrena únicamente con registros anteriores y se pronostican hasta tres periodos siguientes. Todos los candidatos aptos comparten los cortes. Se muestran MAE diario, RMSE, sesgo y WAPE, con detalle por distancia. El sesgo es observado menos pronosticado; WAPE no se calcula cuando el consumo evaluado suma cero.

El criterio de selección es el MAE combinado, ponderado por duración, de esas evaluaciones de uno a tres pasos. Un periodo puede aparecer en varias ventanas: la cantidad de evaluaciones no equivale a observaciones independientes. Una alternativa sustituye al promedio reciente si reduce al menos un 10 % ese error y genera todos los meses futuros con valores finitos y no negativos. El usuario puede elegir explícitamente la referencia simple.

Sin referencia anual, los cortes comienzan tras tres registros iniciales. Cuando la referencia anual está habilitada, todos comienzan tras 24 para que la comparación sea equivalente. Los umbrales son decisiones de ingeniería; no son pruebas de significación.

El error usado para elegir entre candidatos no es una estimación imparcial del rendimiento futuro. Por eso se añadió un ensayo reservado cuando existen nueve o más periodos: los últimos tres se apartan, se elige el modelo usando solo los anteriores y se pronostican esos tres sin incorporarlos al ajuste. Se muestran modelo ensayado, límite de entrenamiento y error frente al promedio simple. El modelo final se vuelve a elegir y entrenar con todo el historial, por lo que puede diferir del ensayo reservado. Tres registros de prueba tampoco garantizan rendimiento operativo.

La validación temporal y los métodos de referencia siguen los principios descritos en [Forecasting: Principles and Practice, capítulo 5](https://otexts.com/fpp3/toolbox.html). Los conceptos de suavizado y amortiguación se explican en su [capítulo 8](https://otexts.com/fpp3/exponential-smoothing.html); las constantes y variantes anteriores son decisiones específicas de esta implementación.

### Calendario y banda orientativa

Se pronostican de uno a seis próximos meses completos, con sus días reales. El gráfico normaliza a kWh/día; las tarjetas permiten inspeccionar totales mensuales, costo con tarifa declarada, diferencia frente al presupuesto y ahorro acumulado del horizonte.

La banda usa el percentil 80 de errores absolutos retrospectivos. Si hay menos de cinco errores a una distancia concreta, combina los de los tres pasos evaluados. La distancia equivalente se estima con la separación mediana de los periodos históricos. Más allá de tres pasos, el radio se amplía por la raíz de la distancia dividida entre tres, y no disminuye entre meses en unidades diarias. El límite inferior se recorta en cero.

Es una regla heurística de variación: **no es un intervalo de confianza, no garantiza cobertura del 80 % y no existe validación directa a 4–6 pasos en esta evaluación**. Un error retrospectivo cero no significa que el consumo futuro sea cierto.

La etiqueta de calidad combina avisos de historial corto, pocos cortes, huecos, antigüedad, atípicos, descartes, extrapolación y error elevado. Es un diagnóstico operativo, no una probabilidad de acierto. Se advierte también cuando inventario y pronóstico normalizado a 30 días difieren más del 30 %, sin calibrar automáticamente una fuente con la otra.

Sin seis registros válidos, se conserva el escenario por inventario, identificado expresamente. No se inventa una tendencia desde ese total.

## Propuesta de ahorro

La meta se refiere al primer mes pronosticado normalizado a 30 días; sin modelo histórico usa el consumo conocido del inventario. El usuario configura meta, reducción máxima de horas por equipo, horizonte, origen, tarifa opcional y exclusiones.

El plan ordena oportunidades por ahorro posible y propone reducciones de horas manteniendo cantidades, potencia y días. Es una heurística transparente, no una prueba de óptimo global. Protege por defecto servidores, refrigeración, conectividad, esenciales, pausados, categorías desconocidas y servicios comunes. Los equipos con kWh mensuales conocidos o datos incompletos no se ajustan automáticamente.

Los horarios se redondean de forma conservadora a centésimas, sin exceder el límite de reducción. No se generan filas sin cambio. Se omiten ajustes residuales inferiores al mayor de 0,01 kWh o el 0,1 % de la meta; puede quedar una diferencia pequeña frente al objetivo. La interfaz muestra las horas con dos decimales y explica el redondeo.

El ahorro del inventario se traslada a los meses proporcionalmente a sus días, con referencia de 30 días, manteniendo el resto constante y sin producir consumos negativos. Esa transferencia es un supuesto de escenario: no aprende causalidad ni incorpora clima, ocupación futura, estacionalidad anual, generación solar o precios futuros. El impacto por piso es un escenario de inventario, no un modelo de mediciones independiente por planta.

La tarifa sirve para el escenario y no modifica el contrato del edificio. Un resultado no garantiza ahorro ni controla equipos físicos.

## Revisar y aplicar

El usuario puede descargar la propuesta JSON, llevarla al simulador o revisar la lista exacta de horarios antes de aplicarla. La propuesta JSON es un informe, no una copia importable del edificio.

Con cuenta, se utiliza la API transaccional existente y su revisión del edificio. El servidor rechaza esenciales, pausados, métodos incompatibles y datos incompletos. Un conflicto requiere revisar nuevamente. La demostración aplica una transacción equivalente solo a su copia local. Generar, entrenar y cancelar la revisión no escriben el inventario.

Tras aplicar, se conserva la comparación revisada y se desactiva volver a aplicar ese escenario en la vista actual. Una nueva propuesta requiere generar otro escenario. La confirmación sigue siendo necesaria; no existe ejecución programada ni conexión a sensores.

## Verificación de la V2

- `npm run check`: correcto.
- Suite general: 157 aprobadas y 6 integraciones omitidas por configuración de esa ejecución.
- Motor predictivo y planes: 20 pruebas aprobadas, incluidas 12 nuevas de V2.
- `npm run e2e:prediction-v2`: 21 comprobaciones en Chrome, con historiales cortos y largos, modo de referencia, selección mensual, exportación, ensayo reservado y anchos de 320, 390 y 500 px.
- Recorrido anterior de predicción: 22 comprobaciones aprobadas.
- Ahorro guiado: 35 comprobaciones aprobadas.
- Recorrido con cuenta y MySQL: 27 comprobaciones aprobadas. Incluye doce registros sintéticos persistidos por la API, entrenamiento desde la cuenta y aplicación del plan revisado. La organización de prueba se elimina al terminar.

Evidencias nuevas en `tmp/prediction-v2/`: portada, validación, meses, móvil, referencia anual, exportación JSON y `results.json`. Los recorridos usan datos sintéticos o ilustrativos; no son un estudio de precisión sobre consumos reales de operación.

No se probaron lector de pantalla, teléfono físico ni capacidad predictiva en datos empresariales independientes. No se modelan clima, ocupación, cambios futuros de inventario ni tarifas futuras. No se añadieron dependencias, migraciones, sensores ni control físico de equipos. No se publicó ni se hizo commit.
