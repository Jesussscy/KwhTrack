## 01. Encargo y resultado esperado

**Objetivo:** Actúa como especialista en UX, visualización
3D y desarrollo del proyecto local kwhTrack Empresas;
ejecuta este encargo cuando el usuario autorice su
implementación.

- **01.01. Rediseña la experiencia empresarial para una
  persona sin conocimientos eléctricos.**
  - Caso: Un dueño abre su edificio por primera vez.
  - Aceptación: Comprende qué consume y qué puede ahorrar
    sin completar una ficha técnica.

- **01.02. Conserva la ruta empresarial independiente.**
  - Caso: Una persona navega por la aplicación doméstica.
  - Aceptación: Ningún menú doméstico descubre o enlaza la
    zona empresarial.

- **01.03. Conecta resumen, escenario solar y maqueta con
  una misma selección.**
  - Caso: El usuario cambia el edificio activo.
  - Aceptación: Las tres superficies muestran el mismo
    edificio y su misma revisión.

- **01.04. Prioriza acciones visuales antes que
  formularios largos.**
  - Caso: El usuario desea probar ocho paneles.
  - Aceptación: Puede hacerlo desde una escena reconocible
    y un contador claro.

- **01.05. Separa simulación, guardado y control de
  dispositivos.**
  - Caso: El usuario modifica paneles virtuales.
  - Aceptación: Entiende que está explorando un escenario
    y no operando una instalación.

- **01.06. Respeta los datos y las funciones existentes.**
  - Caso: El edificio ya contiene pisos, equipos y
    registros.
  - Aceptación: El rediseño conserva sus identidades,
    valores e historial.

- **01.07. Usa español cotidiano de Colombia.**
  - Caso: Una etiqueta contiene un término técnico.
  - Aceptación: Presenta primero su significado práctico y
    deja el detalle disponible.

- **01.08. Entrega una mejora funcional y comprobable.**
  - Caso: Termina el trabajo autorizado.
  - Aceptación: El usuario puede recorrer la experiencia
    local y revisar evidencia real.

## 02. Diagnóstico inicial del proyecto

**Objetivo:** Inspecciona el código actual y reproduce los
fallos reportados antes de atribuirles una causa.

- **02.01. Lee la implementación solar existente.**
  - Caso: Abres frontend/enterprise-energy-ui.js.
  - Aceptación: Identificas qué entradas se muestran,
    cuáles se derivan y cuáles se guardan.

- **02.02. Revisa los callbacks del botón de
  visualización.**
  - Caso: Sigues energyCallbacks en
    frontend/empresarial.js.
  - Aceptación: Documentas qué estado de cámara y
    navegación se conserva al ir al edificio.

- **02.03. Inspecciona la creación de paneles en el
  visor.**
  - Caso: Lees addSolar y setData en
    enterprise-glb.src.js.
  - Aceptación: Ubicas las condiciones de cantidad, techo,
    piso superior y reconstrucción.

- **02.04. Reproduce el botón que aparentemente no muestra
  paneles.**
  - Caso: Hay una configuración solar guardada y se pulsa
    Ver paneles.
  - Aceptación: Registras la escena, cámara, selección y
    número realmente dibujado.

- **02.05. Comprueba el caso de escenario sin guardar.**
  - Caso: El usuario cambia de seis a doce paneles.
  - Aceptación: Identificas si el visor usa el borrador o
    la versión persistida.

- **02.06. Revisa los cálculos del resumen.**
  - Caso: Consultas EnterpriseCalc y el resumen del
    edificio.
  - Aceptación: Encuentras una fuente de consumo que
    incluye espacios, pasillos y servicios comunes.

- **02.07. Examina las pruebas existentes antes de
  modificarlas.**
  - Caso: Encuentras una aserción que falla.
  - Aceptación: Distingues una regresión real de un
    selector que cambió por el rediseño.

- **02.08. Registra los cambios locales ya existentes.**
  - Caso: El árbol de trabajo contiene archivos
    modificados.
  - Aceptación: Mantienes el trabajo ajeno y delimitas los
    archivos que vas a tocar.

## 03. Perfil del empresario y vocabulario

**Objetivo:** Diseña para tomar decisiones energéticas
sencillas, sin exigir formación técnica.

- **03.01. Sustituye latitud y longitud por ciudad en el
  flujo principal.**
  - Caso: La empresa está en Cartagena.
  - Aceptación: El usuario busca Cartagena y confirma el
    lugar por nombre.

- **03.02. Explica la potencia por panel en una frase
  breve.**
  - Caso: El usuario ve 550 Wp.
  - Aceptación: Lee que es la potencia nominal del panel
    bajo condiciones de referencia.

- **03.03. Llama cantidad a la selección de paneles.**
  - Caso: El usuario aumenta un contador.
  - Aceptación: Lee cuántos paneles está probando en el
    techo.

- **03.04. Explica el ahorro como menor compra de
  energía.**
  - Caso: El usuario ve un escenario solar.
  - Aceptación: Comprende qué parte seguirá tomando de la
    red.

- **03.05. Evita pedir un factor de separación en la vista
  básica.**
  - Caso: La persona no conoce la ingeniería del techo.
  - Aceptación: Puede continuar con una hipótesis
    explícita y revisar detalles después.

- **03.06. Nombra las áreas del edificio con palabras
  reconocibles.**
  - Caso: Hay oficinas, pasillos y una sala de reuniones.
  - Aceptación: Las pestañas y etiquetas utilizan esos
    nombres.

- **03.07. Usa preguntas que orienten la siguiente
  acción.**
  - Caso: La pantalla está lista para explorar.
  - Aceptación: Aparecen acciones como Ver techo, Buscar
    computadores y Probar más paneles.

- **03.08. Reduce abreviaturas en las tarjetas
  principales.**
  - Caso: El usuario lee una cifra mensual.
  - Aceptación: La unidad aparece explicada y el detalle
    técnico se abre voluntariamente.

## 04. Arquitectura de información y jerarquía

**Objetivo:** Mantén pocas acciones principales y
distribuye la complejidad de forma progresiva.

- **04.01. Organiza la experiencia alrededor del edificio
  seleccionado.**
  - Caso: El usuario entra al panel empresarial.
  - Aceptación: Identifica inmediatamente qué edificio
    está analizando.

- **04.02. Presenta resumen, edificio y ahorro como
  recorridos conectados.**
  - Caso: El usuario parte del resumen.
  - Aceptación: Puede llegar al techo solar sin
    reconstruir su contexto.

- **04.03. Limita la barra principal del visor a funciones
  reconocibles.**
  - Caso: El usuario explora la maqueta.
  - Aceptación: Ve categorías claras y no una colección
    interminable de iconos.

- **04.04. Agrupa opciones de cámara en un control
  secundario.**
  - Caso: La persona solo quiere encontrar un equipo.
  - Aceptación: Puede usar una vista automática sin
    aprender todas las cámaras.

- **04.05. Conserva una ruta visible de ubicación.**
  - Caso: El usuario selecciona Oficina 2 del Piso 3.
  - Aceptación: Lee Edificio, Piso 3 y Oficina 2 en una
    misma ruta coherente.

- **04.06. Presenta las herramientas avanzadas cerradas
  inicialmente.**
  - Caso: Se abre la sección solar.
  - Aceptación: Las variables técnicas no dominan el
    primer vistazo.

- **04.07. Evita crear pantallas nuevas para cada
  detalle.**
  - Caso: La persona revisa orientación y pérdidas.
  - Aceptación: Puede hacerlo dentro de un panel avanzado
    contextual.

- **04.08. Mantén visible cómo volver a la vista
  general.**
  - Caso: La persona está dentro de una sala.
  - Aceptación: Tiene una acción inequívoca para ver el
    piso o todo el edificio.

## 05. Identidad visual y color

**Objetivo:** Conserva la identidad amarilla de kwhTrack y
añade jerarquía visual útil.

- **05.01. Usa el amarillo como color de acción y
  selección.**
  - Caso: El usuario selecciona el techo.
  - Aceptación: Identifica la selección por borde, texto y
    color coordinados.

- **05.02. Reserva el verde para mejoras energéticas
  contextualizadas.**
  - Caso: Un escenario reduce compras a la red.
  - Aceptación: El verde acompaña una cifra y una
    explicación verificable.

- **05.03. Usa azul para representar energía comprada a la
  red.**
  - Caso: La gráfica compara fuentes energéticas.
  - Aceptación: La leyenda explica el significado sin
    depender solo del color.

- **05.04. Evita superficies blancas sin organización
  perceptible.**
  - Caso: El panel contiene formulario, maqueta y
    resultados.
  - Aceptación: Cada bloque tiene título, fondo o
    separación que aclara su función.

- **05.05. Mantén la tipografía y componentes
  coherentes.**
  - Caso: El usuario cambia entre resumen y solar.
  - Aceptación: Reconoce los botones, campos y tamaños de
    texto.

- **05.06. Diferencia selección de advertencia.**
  - Caso: Una sala está activa y otra tiene datos
    incompletos.
  - Aceptación: El usuario distingue ambos estados
    mediante icono y texto.

- **05.07. Aplica sombras y profundidad con moderación.**
  - Caso: Se muestran tarjetas sobre la escena.
  - Aceptación: Los controles permanecen legibles y no
    tapan el edificio.

- **05.08. Valida contraste en estados normales y
  activos.**
  - Caso: Un botón amarillo recibe foco.
  - Aceptación: El texto, borde y foco siguen siendo
    distinguibles.

## 06. Primer recorrido guiado

**Objetivo:** Explica el producto con acciones cortas
sobre el edificio real seleccionado.

- **06.01. Ofrece una introducción opcional de tres
  pasos.**
  - Caso: El empresario entra por primera vez.
  - Aceptación: Aprende a ver su consumo, probar paneles y
    comparar resultados.

- **06.02. Señala primero el consumo ya calculado.**
  - Caso: La introducción llega al resumen.
  - Aceptación: Destaca la cifra existente y su origen sin
    pedir reescribirla.

- **06.03. Guía hacia el techo en el segundo paso.**
  - Caso: La persona elige probar paneles.
  - Aceptación: El edificio gira suavemente para mostrar
    la cubierta.

- **06.04. Permite terminar la guía en cualquier
  momento.**
  - Caso: La persona ya entiende la interfaz.
  - Aceptación: Sale sin perder selección ni datos.

- **06.05. Recuerda que la guía fue cerrada.**
  - Caso: El usuario vuelve a entrar.
  - Aceptación: No recibe la misma explicación obligatoria
    en cada visita.

- **06.06. Permite volver a abrir la ayuda.**
  - Caso: Un empleado nuevo usa el mismo edificio.
  - Aceptación: Encuentra una ayuda breve sin reiniciar la
    configuración.

- **06.07. Diferencia ejemplo local de edificio de
  cuenta.**
  - Caso: La persona explora una demostración.
  - Aceptación: Ve que los datos y las acciones son
    ilustrativos.

- **06.08. Da una siguiente acción concreta cuando faltan
  equipos.**
  - Caso: El edificio está vacío.
  - Aceptación: Ofrece registrar equipos o explorar un
    ejemplo claramente separado.

## 07. Consumo automático tomado del resumen

**Objetivo:** Reutiliza el consumo del edificio y elimina
la duplicación de entradas en el flujo solar básico.

- **07.01. Toma por defecto la misma demanda que sustenta
  el resumen.**
  - Caso: El resumen muestra 2000 kWh al mes.
  - Aceptación: La simulación solar parte de esa base y
    cita el mismo periodo.

- **07.02. Incluye los servicios comunes una sola vez.**
  - Caso: Existe una carga común registrada.
  - Aceptación: La demanda solar incorpora su aporte sin
    sumarlo de nuevo como espacio.

- **07.03. Incluye los grupos de iluminación de
  pasillos.**
  - Caso: El piso tiene bombillos registrados en
    circulación.
  - Aceptación: El total usado por solar coincide con el
    edificio completo.

- **07.04. Excluye los equipos pausados conforme al
  cálculo existente.**
  - Caso: Un equipo está pausado en el inventario.
  - Aceptación: El resumen y el escenario solar aplican el
    mismo criterio.

- **07.05. Muestra la base de consumo en una tarjeta de
  solo lectura.**
  - Caso: La persona abre Paneles solares.
  - Aceptación: Ve Consumo actual del edificio sin un
    campo que deba completar.

- **07.06. Actualiza la base cuando cambia el
  inventario.**
  - Caso: Se modifican las horas de un aire acondicionado.
  - Aceptación: Se invalida el resultado antiguo y se
    ofrece recalcular con los datos actuales.

- **07.07. Permite abrir el desglose que explica la
  base.**
  - Caso: El usuario pregunta de dónde sale la cifra.
  - Aceptación: Encuentra pisos, espacios, pasillos y
    equipos que la componen.

- **07.08. Detecta cualquier discrepancia entre
  pantallas.**
  - Caso: El resumen y solar usan revisiones distintas.
  - Aceptación: La interfaz avisa y sincroniza antes de
    confirmar un escenario.

## 08. Origen de demanda y cobertura

**Objetivo:** Simplifica la presentación sin mezclar
inventario, facturas, mediciones y pronóstico.

- **08.01. Muestra de dónde proviene el consumo base.**
  - Caso: El edificio usa una estimación por equipos.
  - Aceptación: La tarjeta dice Estimado desde tus equipos
    y permite ver el cálculo.

- **08.02. Identifica el uso de un pronóstico histórico.**
  - Caso: Hay historial suficiente y se selecciona ese
    modo.
  - Aceptación: La interfaz explica que compara demanda
    futura estimada con generación solar de referencia.

- **08.03. Mantén un origen consistente dentro de cada
  comparación.**
  - Caso: Se comparan dos escenarios de paneles.
  - Aceptación: Ambos utilizan la misma base de demanda y
    el mismo periodo.

- **08.04. Señala datos incompletos con lenguaje
  sencillo.**
  - Caso: Hay equipos sin potencia conocida.
  - Aceptación: La persona sabe que la comparación cubre
    solo el consumo conocido.

- **08.05. Evita convertir habitaciones vacías en consumo
  cero confirmado.**
  - Caso: Una oficina no tiene inventario.
  - Aceptación: Se marca Sin equipos registrados y se
    explica la cobertura pendiente.

- **08.06. Reserva la demanda manual para una opción
  secundaria.**
  - Caso: La empresa necesita introducir una cifra
    externa.
  - Aceptación: Debe elegir Usar otro consumo y declarar
    su origen.

- **08.07. Mantén accesible la demanda automática
  original.**
  - Caso: El usuario prueba un consumo alternativo.
  - Aceptación: Puede volver al dato del edificio mediante
    una acción clara.

- **08.08. Conserva la comparación del periodo al cambiar
  de fuente.**
  - Caso: Se pasa de mes típico a seis meses previstos.
  - Aceptación: La interfaz actualiza títulos y unidades
    antes de mostrar totales.

## 09. Unidades y cifras comprensibles

**Objetivo:** Evita confundir potencia de equipos,
potencia solar y energía consumida.

- **09.01. Presenta el consumo mensual como kWh al mes.**
  - Caso: La persona habla de 2000 kilowatts de consumo.
  - Aceptación: La interfaz muestra 2000 kWh al mes con
    una explicación breve.

- **09.02. Usa W para potencia de un aparato.**
  - Caso: Se revisa un bombillo de 10 W.
  - Aceptación: El detalle no lo llama consumo mensual.

- **09.03. Usa Wp para potencia nominal de un panel.**
  - Caso: Se configura un módulo de 550 Wp.
  - Aceptación: La tarjeta diferencia esa potencia de lo
    que generará durante el mes.

- **09.04. Usa kWp para la instalación completa.**
  - Caso: Se prueban diez paneles de 550 Wp.
  - Aceptación: Se muestran 5,5 kWp como potencia nominal
    total.

- **09.05. Evita presentar una cifra anual con etiqueta
  mensual.**
  - Caso: Se abre la comparación de doce meses.
  - Aceptación: El total especifica kWh durante el año
    simulado.

- **09.06. Formatea números para lectura local.**
  - Caso: La pantalla muestra miles y decimales.
  - Aceptación: Utiliza separadores y cantidad de
    decimales coherentes con es-CO.

- **09.07. Conserva precisión interna sin saturar la
  interfaz.**
  - Caso: El cálculo genera muchos decimales.
  - Aceptación: La cifra visual se redondea y la
    exportación conserva precisión suficiente.

- **09.08. Incluye unidades en gráficas, tablas y
  archivos.**
  - Caso: Se descarga una comparación.
  - Aceptación: Los encabezados permiten interpretar cada
    columna sin recordar la pantalla.

## 10. Ubicación por ciudad

**Objetivo:** Reemplaza la obligación de escribir
coordenadas por una selección reconocible.

- **10.01. Reutiliza la ciudad ya declarada en el
  edificio.**
  - Caso: La ficha del edificio dice Cartagena.
  - Aceptación: La pantalla propone Cartagena sin pedir
    latitud y longitud.

- **10.02. Solicita confirmación si el nombre es
  ambiguo.**
  - Caso: Hay varias ciudades con el mismo nombre.
  - Aceptación: La lista incluye municipio, departamento y
    país.

- **10.03. Ofrece búsqueda por ciudad y municipio.**
  - Caso: El usuario escribe Barranquilla.
  - Aceptación: Obtiene una selección legible antes de
    consultar la generación solar.

- **10.04. Explica por qué hace falta la ubicación.**
  - Caso: La persona pregunta para qué sirve la ciudad.
  - Aceptación: Lee que la disponibilidad de sol cambia
    según el lugar.

- **10.05. Permite elegir una ciudad cercana de
  referencia.**
  - Caso: El municipio exacto no está disponible.
  - Aceptación: La interfaz explica que el cálculo será
    aproximado para esa ubicación.

- **10.06. Conserva las coordenadas resueltas
  internamente.**
  - Caso: El usuario confirma una ciudad.
  - Aceptación: El proveedor solar recibe valores válidos
    sin mostrarlos como requisito básico.

- **10.07. Permite revisar la ubicación desde ajustes
  avanzados.**
  - Caso: Un usuario técnico necesita precisión.
  - Aceptación: Puede introducir coordenadas
    voluntariamente y ver su procedencia.

- **10.08. No asumas Cartagena para todas las empresas.**
  - Caso: El edificio está en otra ciudad.
  - Aceptación: El sistema usa la ubicación confirmada del
    edificio.

## 11. Resolución de ubicación y privacidad

**Objetivo:** Implementa la selección de ciudad con
estados fiables y permisos claros.

- **11.01. Investiga el proveedor de búsqueda antes de
  integrarlo.**
  - Caso: Se elige una API de geocodificación.
  - Aceptación: Quedan documentados licencia, atribución,
    límites y necesidad de credenciales.

- **11.02. Evita inventar un servicio comercial
  inexistente.**
  - Caso: No hay una API disponible o autorizada.
  - Aceptación: Usa una lista local explícita o informa de
    la limitación.

- **11.03. Permite continuar con una ciudad guardada sin
  repetir búsquedas.**
  - Caso: La ubicación ya fue confirmada.
  - Aceptación: No solicita datos de localización en cada
    sesión.

- **11.04. Haz opcional el uso de la ubicación del
  dispositivo.**
  - Caso: El usuario ve una acción Usar mi ubicación.
  - Aceptación: Solo pide permiso cuando la persona la
    pulsa.

- **11.05. Permite rechazar el permiso de
  geolocalización.**
  - Caso: El navegador deniega acceso.
  - Aceptación: La búsqueda por ciudad sigue funcionando.

- **11.06. Protege contra resultados de búsqueda fuera de
  orden.**
  - Caso: El usuario escribe varias ciudades rápidamente.
  - Aceptación: Solo se muestra la respuesta
    correspondiente al texto más reciente.

- **11.07. Evita enviar nombres de equipos al proveedor
  geográfico.**
  - Caso: Se resuelve la ubicación del edificio.
  - Aceptación: La solicitud utiliza únicamente los datos
    necesarios para localizarlo.

- **11.08. Explica el impacto de una ubicación
  aproximada.**
  - Caso: Se usa el centro de una ciudad.
  - Aceptación: La estimación no se presenta como estudio
    exacto del techo.

## 12. Supuestos automáticos transparentes

**Objetivo:** Permite empezar con hipótesis razonables y
claramente identificadas.

- **12.01. Distingue una suposición de un dato
  confirmado.**
  - Caso: La separación entre paneles no fue declarada.
  - Aceptación: El detalle indica Valor de referencia del
    escenario.

- **12.02. Explica los supuestos en un resumen breve.**
  - Caso: La persona abre Cómo se calculó.
  - Aceptación: Ve ubicación, paneles, consumo base y
    variables estimadas.

- **12.03. Evita que un valor por defecto parezca una
  medición.**
  - Caso: La pérdida total usa una referencia inicial.
  - Aceptación: Se identifica como parámetro del modelo.

- **12.04. Permite restaurar la configuración sugerida.**
  - Caso: Un usuario modifica muchos datos técnicos.
  - Aceptación: Puede recuperar valores iniciales después
    de revisar qué cambiará.

- **12.05. Mantén un registro de procedencia por variable
  relevante.**
  - Caso: Hay datos de ciudad, ficha y declaración manual.
  - Aceptación: Cada valor conserva su origen al guardar y
    exportar.

- **12.06. No fuerces a conocer todas las variables para
  explorar.**
  - Caso: La empresa conoce cantidad y potencia de
    paneles.
  - Aceptación: Puede obtener un escenario preliminar con
    las limitaciones indicadas.

- **12.07. Aclara cuándo un dato impide calcular.**
  - Caso: Falta por completo una ubicación utilizable.
  - Aceptación: Solicita únicamente ese dato y conserva el
    resto.

- **12.08. Mantén las hipótesis coherentes entre los
  escenarios.**
  - Caso: Se comparan seis y doce paneles.
  - Aceptación: Comparten todos los demás parámetros salvo
    cambios explícitos.

## 13. Configuración solar básica

**Objetivo:** Reduce la primera pantalla a decisiones que
la persona pueda entender.

- **13.01. Muestra una ciudad confirmada en lugar de dos
  coordenadas.**
  - Caso: La persona abre su escenario.
  - Aceptación: Reconoce dónde se calcula la
    disponibilidad solar.

- **13.02. Presenta la cantidad de paneles con botones de
  menos y más.**
  - Caso: La persona prueba una instalación mayor.
  - Aceptación: Ve el contador y la maqueta cambiar
    juntos.

- **13.03. Mantén la potencia por panel en un campo
  comprensible.**
  - Caso: La persona conoce 550 Wp.
  - Aceptación: Puede escribirla y ver un ejemplo breve.

- **13.04. Ofrece escoger una referencia de panel si hay
  fichas verificadas.**
  - Caso: Existe un catálogo técnico disponible.
  - Aceptación: La elección carga solo los valores que
    realmente constan en la ficha.

- **13.05. Presenta la inclinación como una ayuda
  opcional.**
  - Caso: La persona desconoce el ángulo.
  - Aceptación: Puede mantener la referencia inicial sin
    bloquearse.

- **13.06. Muestra el consumo del resumen como
  información.**
  - Caso: El edificio ya tiene inventario.
  - Aceptación: La persona no debe copiar ninguna cifra de
    otra pantalla.

- **13.07. Coloca los resultados junto a la escena.**
  - Caso: Se añade un panel virtual.
  - Aceptación: La persona relaciona el cambio visual con
    la nueva estimación.

- **13.08. Mantén una única acción principal según el
  estado.**
  - Caso: Falta obtener la curva solar.
  - Aceptación: El botón explica que va a calcular y no
    finge haber consultado datos.

## 14. Configuración avanzada progresiva

**Objetivo:** Agrupa las variables técnicas en un espacio
opcional y cerrado por defecto.

- **14.01. Titula el bloque Ajustes avanzados
  opcionales.**
  - Caso: La persona ve la sección por primera vez.
  - Aceptación: Comprende que puede explorar sin abrirla.

- **14.02. Mueve orientación detallada al bloque
  avanzado.**
  - Caso: El usuario no conoce el azimut.
  - Aceptación: La pantalla básica no exige grados de
    orientación.

- **14.03. Mueve pérdidas totales al bloque avanzado.**
  - Caso: La persona no conoce las pérdidas de la
    instalación.
  - Aceptación: El parámetro tiene referencia y
    explicación técnica accesible.

- **14.04. Mueve separación y margen técnico al bloque
  avanzado.**
  - Caso: La persona no sabe interpretar un factor.
  - Aceptación: La configuración principal utiliza una
    explicación visual de espacio reservado.

- **14.05. Oculta el desfase UTC del recorrido habitual.**
  - Caso: La empresa está en Colombia.
  - Aceptación: El sistema resuelve la hora local sin
    solicitar una cifra técnica.

- **14.06. Mantén coordenadas dentro de ubicación
  avanzada.**
  - Caso: Un técnico quiere introducir el sitio exacto.
  - Aceptación: Puede hacerlo sin convertir esa opción en
    un requisito general.

- **14.07. Conserva cambios avanzados al cerrar el
  bloque.**
  - Caso: El usuario acaba de ajustar una variable.
  - Aceptación: Cerrar los detalles no borra ni guarda
    silenciosamente el cambio.

- **14.08. Resume la presencia de ajustes
  personalizados.**
  - Caso: Hay dos supuestos cambiados respecto a la
    referencia.
  - Aceptación: La pantalla muestra que existen ajustes
    personalizados y permite revisarlos.

## 15. Orientación, hora local y pérdidas

**Objetivo:** Explica estas variables con ayudas visuales
y evita entradas innecesarias.

- **15.01. Representa la orientación con una brújula
  sencilla.**
  - Caso: La persona abre orientación avanzada.
  - Aceptación: Ve norte, sur, este y oeste antes que una
    cifra angular.

- **15.02. Sincroniza la brújula con el parámetro
  técnico.**
  - Caso: El técnico selecciona este.
  - Aceptación: El valor guardado y enviado al proveedor
    coincide con la selección visual.

- **15.03. Usa la zona horaria de la ubicación
  confirmada.**
  - Caso: La ciudad está en Colombia.
  - Aceptación: La curva se presenta en hora local sin que
    el usuario escriba UTC.

- **15.04. Permite revisar el origen de la zona horaria.**
  - Caso: Se abre el detalle del cálculo.
  - Aceptación: Se indica cómo se determinó la hora local.

- **15.05. Explica pérdidas con ejemplos breves.**
  - Caso: Se abre la ayuda del parámetro.
  - Aceptación: Se mencionan efectos del sistema sin
    exigir que el empresario los cuantifique.

- **15.06. Valida cambios avanzados sin bloquear la
  pantalla completa.**
  - Caso: Se introduce una pérdida fuera de rango.
  - Aceptación: El error aparece junto al campo
    correspondiente.

- **15.07. Invalida la curva cuando cambia una variable
  que la afecta.**
  - Caso: Se cambia orientación o inclinación.
  - Aceptación: El resultado anterior se distingue del
    nuevo escenario pendiente.

- **15.08. Reutiliza una curva válida al cambiar solo
  cantidad de paneles.**
  - Caso: La ciudad y condiciones solares permanecen
    iguales.
  - Aceptación: El contador se actualiza sin consultar
    innecesariamente al proveedor.

## 16. Techo y superficie disponible

**Objetivo:** Permite explorar cuando no se conocen
medidas y limita las afirmaciones sobre capacidad real.

- **16.01. Pregunta si la persona conoce el área útil del
  techo.**
  - Caso: El usuario no tiene planos ni medidas.
  - Aceptación: Puede responder No la conozco.

- **16.02. Permite una exploración sin área real
  declarada.**
  - Caso: Se prueban varios paneles virtuales.
  - Aceptación: La interfaz aclara que la capacidad física
    del techo está sin verificar.

- **16.03. Evita usar los metros del dibujo como medidas
  reales.**
  - Caso: La maqueta es esquemática.
  - Aceptación: No certifica que un número de paneles cabe
    en el edificio verdadero.

- **16.04. Muestra una reserva visual de circulación sobre
  el techo.**
  - Caso: Hay un área útil declarada.
  - Aceptación: Se entiende que no toda la superficie se
    cubre con módulos.

- **16.05. Explica un límite de área en términos
  cotidianos.**
  - Caso: La cantidad probada supera el área declarada.
  - Aceptación: Indica cuántos paneles entran
    aproximadamente y qué dato puede revisar.

- **16.06. Mantén visibles los obstáculos conocidos.**
  - Caso: Hay un equipo o zona reservada en la cubierta.
  - Aceptación: Los paneles no se dibujan encima de esa
    reserva de forma engañosa.

- **16.07. Evita pedir factores abstractos al
  empresario.**
  - Caso: El usuario necesita reservar acceso.
  - Aceptación: Puede elegir una descripción clara y
    revisar el factor técnico aparte.

- **16.08. Etiqueta el resultado de capacidad como
  preliminar.**
  - Caso: El área y las dimensiones del panel fueron
    declaradas.
  - Aceptación: El cálculo no se presenta como aprobación
    estructural o eléctrica.

## 17. Referencias de paneles y potencia

**Objetivo:** Facilita la selección de paneles sin
inventar fichas, precios o disponibilidad.

- **17.01. Usa fichas verificables cuando existan.**
  - Caso: La persona selecciona un modelo concreto.
  - Aceptación: La potencia nominal y dimensiones citan la
    referencia correspondiente.

- **17.02. Permite un panel genérico con potencia
  declarada.**
  - Caso: El modelo comercial no aparece.
  - Aceptación: La persona puede registrar el dato de la
    placa o ficha que conoce.

- **17.03. Separa potencia nominal y energía prevista.**
  - Caso: Se selecciona un módulo de 550 Wp.
  - Aceptación: La tarjeta no promete 550 Wh en cada hora
    del día.

- **17.04. Conserva la variante técnica elegida.**
  - Caso: Hay modelos con nombres comerciales parecidos.
  - Aceptación: La selección mantiene su identificador y
    datos aplicables.

- **17.05. Evita mostrar precios como actuales sin una
  fuente vigente.**
  - Caso: El catálogo es una referencia local.
  - Aceptación: La interfaz no inventa una cotización ni
    disponibilidad en tienda.

- **17.06. Permite cambiar de modelo conservando la
  cantidad.**
  - Caso: El usuario prueba otra potencia.
  - Aceptación: Recalcula el escenario y explica qué
    característica cambió.

- **17.07. Muestra información suficiente sin abrir una
  ficha enorme.**
  - Caso: La persona compara dos módulos.
  - Aceptación: Ve nombre, potencia, dimensiones conocidas
    y acceso a la fuente.

- **17.08. Preserva la fuente al guardar y exportar.**
  - Caso: El escenario utiliza un modelo seleccionado.
  - Aceptación: La revisión posterior puede conocer de
    dónde salieron sus parámetros.

## 18. Cantidad de paneles y control directo

**Objetivo:** Haz que probar cantidades sea una
interacción visual simple y reversible.

- **18.01. Ofrece un contador grande de paneles.**
  - Caso: El usuario ve ocho módulos en el techo.
  - Aceptación: La cifra principal indica Ocho paneles en
    este escenario.

- **18.02. Permite añadir una unidad con un botón
  evidente.**
  - Caso: Se pulsa Añadir panel.
  - Aceptación: Se incorpora exactamente un módulo y
    aumenta el contador.

- **18.03. Permite quitar una unidad con una acción
  equivalente.**
  - Caso: Se pulsa Quitar panel.
  - Aceptación: Desaparece exactamente un módulo y
    disminuye el contador.

- **18.04. Admite escribir una cantidad directamente.**
  - Caso: La persona quiere pasar de cinco a veinte.
  - Aceptación: El campo y el modelo quedan sincronizados.

- **18.05. Admite un deslizador con pasos enteros y
  límites claros.**
  - Caso: La persona arrastra el control.
  - Aceptación: El resultado siempre contiene una cantidad
    válida de módulos.

- **18.06. Permite probar cero paneles.**
  - Caso: El usuario compara con el estado actual.
  - Aceptación: La cubierta queda sin módulos del
    escenario y los balances siguen siendo válidos.

- **18.07. Resuelve entradas rápidas con la última
  cantidad válida.**
  - Caso: La persona pulsa añadir varias veces.
  - Aceptación: El modelo termina con la cantidad final
    sin módulos duplicados.

- **18.08. Mantén la cámara estable al cambiar el
  contador.**
  - Caso: Se añade un módulo.
  - Aceptación: El edificio no salta de vista ni reinicia
    la exploración innecesariamente.

## 19. Recalculo y respuesta inmediata

**Objetivo:** Separa la respuesta visual local de las
consultas externas necesarias.

- **19.01. Actualiza la maqueta al cambiar la cantidad.**
  - Caso: La curva específica ya está disponible.
  - Aceptación: La persona ve el resultado sin una
    consulta nueva por cada clic.

- **19.02. Marca claramente una vista previa sin
  guardar.**
  - Caso: Se cambia de ocho a diez paneles.
  - Aceptación: El contador y los resultados indican que
    es un escenario de prueba.

- **19.03. Aplica una breve agrupación de cambios
  rápidos.**
  - Caso: Se arrastra un deslizador.
  - Aceptación: Evita reconstrucciones o cálculos
    innecesarios en cada evento bruto.

- **19.04. Reserva la consulta solar para cambios que la
  necesitan.**
  - Caso: Se cambia la ciudad.
  - Aceptación: Se explica que hace falta actualizar la
    referencia solar.

- **19.05. Mantén visible qué resultado está pendiente.**
  - Caso: La nueva curva todavía no llega.
  - Aceptación: No presenta el resultado anterior como si
    correspondiera a la ciudad nueva.

- **19.06. Permite continuar explorando con una referencia
  válida.**
  - Caso: Se consulta un detalle del modelo.
  - Aceptación: La interfaz conserva el escenario sin
    reiniciar todos los campos.

- **19.07. Evita mensajes repetidos por cada panel
  añadido.**
  - Caso: Se pulsan diez incrementos.
  - Aceptación: El lector y la pantalla reciben una
    actualización comprensible.

- **19.08. Informa cuando termina un cálculo relevante.**
  - Caso: La referencia externa se obtuvo correctamente.
  - Aceptación: El estado pasa de Calculando a Resultado
    actualizado.

## 20. Generación solar y proveedor

**Objetivo:** Conserva una simulación honesta y accesible
sobre datos de referencia verificables.

- **20.01. Mantén el proveedor solar detrás del
  servidor.**
  - Caso: La interfaz solicita una estimación.
  - Aceptación: No expone credenciales ni permite
    introducir una URL arbitraria.

- **20.02. Conserva fuente, periodo y fecha de consulta.**
  - Caso: La curva procede de un año histórico.
  - Aceptación: El detalle del escenario permite revisar
    esa información.

- **20.03. Explica el carácter histórico del recurso
  solar.**
  - Caso: El usuario pregunta por el próximo mes.
  - Aceptación: No confunde una referencia climática con
    un pronóstico meteorológico.

- **20.04. Comprueba la cobertura antes de calcular.**
  - Caso: El proveedor entrega una serie incompleta.
  - Aceptación: Rechaza el resultado o comunica su
    limitación de manera explícita.

- **20.05. Reutiliza respuestas válidas mediante una caché
  acotada.**
  - Caso: Se prueba la misma configuración solar.
  - Aceptación: Evita llamadas redundantes sin ocultar la
    procedencia del dato.

- **20.06. Presenta un error externo con una solución
  práctica.**
  - Caso: El proveedor no responde.
  - Aceptación: Ofrece reintentar conservando ciudad,
    cantidad y potencia.

- **20.07. No sustituye una consulta fallida por datos
  ficticios.**
  - Caso: Hay una interrupción de Internet.
  - Aceptación: La pantalla mantiene el estado pendiente y
    no inventa ahorros solares.

- **20.08. Mantén el escenario local editable mientras
  corresponde.**
  - Caso: La empresa revisa sus cantidades.
  - Aceptación: Diferencia qué cambios solo necesitan
    cálculo local y cuáles necesitan conexión.

## 21. Predicción del consumo conectada

**Objetivo:** Aprovecha el modelo existente sin pedir al
empresario reconstruir el historial.

- **21.01. Detecta el historial ya registrado en el
  edificio.**
  - Caso: Existen periodos válidos de consumo.
  - Aceptación: La opción de pronóstico explica su
    disponibilidad sin pedir volver a introducirlos.

- **21.02. Conserva el modelo predictivo y su
  validación.**
  - Caso: Se rediseña la presentación solar.
  - Aceptación: No reemplaza el modelo por una cifra
    arbitraria para facilitar una animación.

- **21.03. Explica cuándo se utiliza un mes típico.**
  - Caso: El historial resulta insuficiente.
  - Aceptación: El usuario conoce el alcance de la
    comparación por inventario.

- **21.04. Presenta el horizonte previsto con fechas
  legibles.**
  - Caso: Se calculan seis meses futuros.
  - Aceptación: Cada gráfica identifica sus meses y años
    correspondientes.

- **21.05. No complete un año futuro con meses
  inventados.**
  - Caso: Solo hay seis meses de pronóstico.
  - Aceptación: El total se etiqueta como periodo de seis
    meses.

- **21.06. Relaciona la incertidumbre con la decisión.**
  - Caso: El historial tiene cobertura limitada.
  - Aceptación: La recomendación solar conserva esa
    limitación sin fingir precisión.

- **21.07. Permite ver por qué la previsión cambió.**
  - Caso: Se actualiza el inventario o el historial.
  - Aceptación: El detalle identifica la nueva base y la
    revisión utilizada.

- **21.08. Conserva protección sobre equipos esenciales.**
  - Caso: Se combina el escenario con reducción de
    horarios.
  - Aceptación: El modelo no propone ahorros reduciendo
    cargas protegidas.

## 22. Balance energético comprensible

**Objetivo:** Explica qué consume el edificio, qué genera
el techo y qué aporta la red.

- **22.01. Separa demanda y generación en las tarjetas.**
  - Caso: Se añaden paneles.
  - Aceptación: La demanda de los equipos no desaparece
    por cambiar la cubierta.

- **22.02. Muestra cuánto se compra a la red.**
  - Caso: La producción solar cubre parte de la demanda.
  - Aceptación: La cifra corresponde al balance temporal
    del escenario.

- **22.03. Representa el uso directo de energía solar.**
  - Caso: Hay demanda durante horas de producción.
  - Aceptación: El usuario distingue la generación que
    utiliza en ese momento.

- **22.04. Identifica los excedentes por separado.**
  - Caso: La producción supera la demanda simultánea.
  - Aceptación: La interfaz no los cuenta como energía
    utilizada por la noche.

- **22.05. Evita simular almacenamiento inexistente.**
  - Caso: El edificio no tiene baterías configuradas.
  - Aceptación: La noche sigue requiriendo energía de la
    red.

- **22.06. Conserva las ecuaciones de balance por
  intervalo.**
  - Caso: Se reduce el horario y cambia la producción.
  - Aceptación: Las sumas de demanda, autoconsumo, red y
    excedente son consistentes.

- **22.07. Aclara la aproximación del perfil horario.**
  - Caso: Solo hay consumo mensual y horarios declarados.
  - Aceptación: No presenta el reparto como una medición
    horaria del edificio.

- **22.08. Ofrece una explicación de un día
  representativo.**
  - Caso: El usuario abre Cómo funciona durante el día.
  - Aceptación: Ve momentos con sol, uso directo,
    excedente y compra nocturna.

## 23. Costos y ahorro monetario

**Objetivo:** Presenta el efecto económico solo con
tarifas y condiciones que tengan respaldo.

- **23.01. Reutiliza la tarifa del edificio.**
  - Caso: Existe una tarifa empresarial guardada.
  - Aceptación: La comparación solar la utiliza sin pedir
    copiarla de nuevo.

- **23.02. Permite configurar la tarifa desde una acción
  contextual.**
  - Caso: El edificio todavía no tiene tarifa.
  - Aceptación: El usuario entiende por qué ve energía
    pero no pesos.

- **23.03. Separa energía variable y factura completa.**
  - Caso: Se muestra una estimación de costo.
  - Aceptación: Se explica que pueden existir otros
    cargos.

- **23.04. Mantén en cero la compensación no confirmada.**
  - Caso: No hay valor declarado para excedentes.
  - Aceptación: No promete ingresos por vender energía a
    la red.

- **23.05. Permite revisar una compensación declarada.**
  - Caso: La empresa tiene condiciones documentadas.
  - Aceptación: El detalle muestra valor, fuente y alcance
    aplicables.

- **23.06. Presenta ahorro monetario del mismo periodo
  comparado.**
  - Caso: La previsión cubre seis meses.
  - Aceptación: La diferencia en pesos se refiere a esos
    seis meses.

- **23.07. Evita afirmar retorno de inversión sin costos
  de instalación.**
  - Caso: No hay una cotización verificada.
  - Aceptación: La interfaz limita la conclusión a energía
    y costo operativo estimado.

- **23.08. Explica cuando faltan datos para una cifra
  económica.**
  - Caso: El usuario busca el ahorro en pesos.
  - Aceptación: Encuentra una acción para completar la
    tarifa y no un cero engañoso.

## 24. Recomendación de cantidad de paneles

**Objetivo:** Convierte el dimensionamiento preliminar en
una decisión explicable.

- **24.01. Permite indicar una meta sencilla de
  generación.**
  - Caso: El usuario quiere cubrir una parte de su
    energía.
  - Aceptación: Puede explorar una meta legible sin
    escribir fórmulas.

- **24.02. Calcula una cantidad preliminar desde la
  demanda automática.**
  - Caso: El edificio ya tiene consumo conocido.
  - Aceptación: La recomendación no pide de nuevo su
    consumo mensual.

- **24.03. Muestra la potencia del panel usada en la
  recomendación.**
  - Caso: Se propone una cantidad.
  - Aceptación: La persona entiende que otra potencia
    puede cambiar el resultado.

- **24.04. Explica la diferencia entre generación
  equivalente y ahorro real.**
  - Caso: La producción anual equivale a parte de la
    demanda.
  - Aceptación: No promete el mismo porcentaje de
    reducción de la factura.

- **24.05. Relaciona la recomendación con la capacidad
  declarada.**
  - Caso: El techo tiene área útil conocida.
  - Aceptación: Advierte si la cantidad preliminar supera
    el límite estimado.

- **24.06. Permite aplicar la cantidad recomendada a la
  vista previa.**
  - Caso: La persona pulsa Probar esta cantidad.
  - Aceptación: El contador y los paneles del techo
    cambian juntos.

- **24.07. Mantén utilizable la recomendación al probar
  cero paneles.**
  - Caso: Se vuelve al estado actual.
  - Aceptación: La referencia solar permite proponer una
    cantidad sin dividir por cero.

- **24.08. Explica los datos pendientes para una
  instalación real.**
  - Caso: La persona quiere convertir el escenario en un
    proyecto.
  - Aceptación: Ve qué medidas o revisión técnica necesita
    completar.

## 25. Escenario combinado de horarios y paneles

**Objetivo:** Permite explorar mejoras operativas con un
balance recalculado.

- **25.01. Mantén separados escenario actual y escenario
  propuesto.**
  - Caso: El usuario reduce el uso de aires.
  - Aceptación: Puede comparar antes y después sin editar
    el inventario de inmediato.

- **25.02. Protege equipos esenciales y cargas críticas.**
  - Caso: Hay servidores o refrigeración.
  - Aceptación: La propuesta conserva sus condiciones
    salvo revisión explícita permitida.

- **25.03. Explica la reducción de horario en horas
  comprensibles.**
  - Caso: La persona prueba dos horas menos al día.
  - Aceptación: Ve equipos, días y energía afectados.

- **25.04. Recalcula el autoconsumo después de cambiar
  horarios.**
  - Caso: La demanda diurna disminuye.
  - Aceptación: Los excedentes y la compra a la red se
    actualizan de forma coherente.

- **25.05. No sumes dos veces ahorros que se solapan.**
  - Caso: Se combina eficiencia con solar.
  - Aceptación: La diferencia sale del escenario combinado
    completo.

- **25.06. Permite desactivar la reducción para ver solo
  solar.**
  - Caso: El usuario quiere aislar el efecto de los
    paneles.
  - Aceptación: La comparación mantiene la misma base del
    edificio.

- **25.07. Identifica ajustes de circulación que requieren
  revisión manual.**
  - Caso: Hay grupos de luces en pasillos.
  - Aceptación: Se conserva su consumo base y se ofrece
    revisar sus horarios en el contexto adecuado.

- **25.08. Exige revisión antes de aplicar cambios
  persistentes al inventario.**
  - Caso: La persona decide adoptar horarios.
  - Aceptación: Se muestra la lista exacta de cambios y se
    respeta el flujo transaccional existente.

## 26. Visor 3D como centro de exploración

**Objetivo:** Integra las categorías del edificio en una
barra superior sencilla.

- **26.01. Añade una opción Edificio a la barra de
  exploración.**
  - Caso: El usuario quiere recuperar el contexto.
  - Aceptación: La escena muestra la maqueta completa con
    un encuadre seguro.

- **26.02. Añade una opción Salas y oficinas.**
  - Caso: La persona quiere ver interiores.
  - Aceptación: La escena y el panel priorizan los
    espacios del piso seleccionado.

- **26.03. Añade una opción Paneles solares.**
  - Caso: El usuario quiere revisar la cubierta.
  - Aceptación: La cámara abre una vista de techo con los
    paneles del escenario.

- **26.04. Añade una opción Equipos.**
  - Caso: La persona quiere localizar computadores o
    aires.
  - Aceptación: Aparecen filtros comprensibles por
    categoría.

- **26.05. Añade una opción Pasillos.**
  - Caso: El usuario revisa iluminación común del piso.
  - Aceptación: Se destacan las zonas de circulación y sus
    grupos registrados.

- **26.06. Mantén sensores como una capa opcional cuando
  existan.**
  - Caso: El edificio no tiene dispositivos vinculados.
  - Aceptación: La barra no aparenta una instalación
    domótica activa.

- **26.07. Resalta una única categoría activa de
  exploración.**
  - Caso: El usuario cambia de salas a paneles.
  - Aceptación: El estado visual, el título y la selección
    coinciden.

- **26.08. Evita confundir pestañas temáticas con
  cámaras.**
  - Caso: La persona elige Paneles solares.
  - Aceptación: Cambia el contenido prioritario y recibe
    automáticamente un buen encuadre.

## 27. Corrección del botón Ver paneles

**Objetivo:** El botón debe demostrar su resultado con una
escena inequívoca.

- **27.01. Abre el mismo edificio del escenario solar.**
  - Caso: Se pulsa Ver paneles en el edificio 3D.
  - Aceptación: No cambia silenciosamente a otra sede o al
    ejemplo local.

- **27.02. Activa el modo de techo al llegar.**
  - Caso: La navegación anterior estaba dentro de una
    oficina.
  - Aceptación: El usuario deja de ver un interior que
    oculta la instalación solar.

- **27.03. Encuadra la cubierta superior.**
  - Caso: El techo estaba fuera del campo de visión.
  - Aceptación: La cámara muestra la instalación con
    margen suficiente.

- **27.04. Restaura la visibilidad necesaria del techo.**
  - Caso: La cubierta estaba abierta u oculta.
  - Aceptación: Los paneles son visibles sin exigir buscar
    controles secundarios.

- **27.05. Conserva la cantidad de la vista previa de
  forma explícita.**
  - Caso: El usuario estaba probando doce paneles sin
    guardar.
  - Aceptación: La escena indica si muestra ese borrador o
    pide una elección clara antes de salir.

- **27.06. Presenta un contador junto al visor.**
  - Caso: Se muestran doce módulos.
  - Aceptación: La etiqueta dice Doce paneles y la
    potencia total correspondiente.

- **27.07. Explica por qué todavía no hay paneles.**
  - Caso: La cantidad es cero o no existe escenario.
  - Aceptación: La pantalla ofrece Probar paneles en lugar
    de una cubierta sin explicación.

- **27.08. Confirma el resultado con una prueba visual
  real.**
  - Caso: Se ejecuta el recorrido de aceptación.
  - Aceptación: Se verifica cantidad, visibilidad,
    edificio, modo de techo y encuadre final.

## 28. Animación de acumulación de paneles

**Objetivo:** Usa la animación para explicar cambios de
cantidad y conserva el control del usuario.

- **28.01. Anima la incorporación de nuevos módulos en el
  techo.**
  - Caso: La cantidad pasa de cuatro a ocho.
  - Aceptación: Se reconocen los cuatro módulos añadidos
    sin reiniciar todo el edificio.

- **28.02. Anima la retirada de módulos.**
  - Caso: La cantidad baja de ocho a seis.
  - Aceptación: Se retiran exactamente dos y el contador
    termina en seis.

- **28.03. Mantén un orden de colocación estable.**
  - Caso: La persona repite una cantidad anterior.
  - Aceptación: La distribución visual evita movimientos
    arbitrarios que confundan.

- **28.04. Acota la duración total de una incorporación
  grande.**
  - Caso: Se pasa de diez a cien paneles.
  - Aceptación: No obliga a esperar una animación larga
    por cada módulo.

- **28.05. Interrumpe transiciones obsoletas con el último
  estado elegido.**
  - Caso: Se pulsa añadir y quitar repetidamente.
  - Aceptación: El estado final representa la última
    cantidad válida.

- **28.06. Mantén visibles los resultados del escenario
  durante la animación.**
  - Caso: El techo recibe módulos.
  - Aceptación: El usuario relaciona cantidad, generación
    y compra a la red.

- **28.07. Permite interacción cuando termine una
  transición breve.**
  - Caso: La persona quiere abrir una ficha de panel.
  - Aceptación: La animación no captura permanentemente el
    puntero ni el teclado.

- **28.08. Respeta movimiento reducido.**
  - Caso: El sistema operativo solicita menos animaciones.
  - Aceptación: Los paneles pasan al estado final sin
    desplazamientos innecesarios.

## 29. Apariencia de paneles y cubierta

**Objetivo:** Mejora la calidad visual conservando una
escena legible y veraz.

- **29.01. Modela módulos reconocibles como paneles
  fotovoltaicos.**
  - Caso: La persona mira la cubierta.
  - Aceptación: Identifica superficie, marco y orientación
    visual general.

- **29.02. Usa materiales legibles con iluminación
  moderada.**
  - Caso: La cámara cambia de frontal a superior.
  - Aceptación: Los paneles no desaparecen por reflejos o
    colores excesivamente oscuros.

- **29.03. Conserva separación visual entre módulos.**
  - Caso: La cantidad es pequeña.
  - Aceptación: La persona puede distinguir y contar cada
    unidad.

- **29.04. Adapta el detalle a cantidades elevadas.**
  - Caso: La cubierta contiene muchos módulos.
  - Aceptación: La escena sigue siendo fluida sin inventar
    unidades adicionales.

- **29.05. Distingue instalaciones ilustrativas de
  elementos reales configurados.**
  - Caso: El GLB original contiene paneles decorativos.
  - Aceptación: La maqueta evita sumar esos adornos a la
    cantidad del escenario.

- **29.06. Mantén un acabado coherente con el edificio
  existente.**
  - Caso: Se rediseña el techo.
  - Aceptación: Los paneles no parecen pegados a una
    escena con escala incompatible.

- **29.07. Muestra orientación y cantidad con una etiqueta
  contextual.**
  - Caso: El modo de techo está activo.
  - Aceptación: La persona entiende la instalación sin
    abrir ajustes avanzados.

- **29.08. Ofrece una vista más cercana de un módulo
  cuando aporte información.**
  - Caso: El usuario selecciona una referencia.
  - Aceptación: Se muestran los datos conocidos sin
    simular una certificación técnica.

## 30. Distribución solar sobre el techo

**Objetivo:** Comunica capacidad preliminar y evita falsas
garantías de instalación física.

- **30.01. Coloca paneles exclusivamente sobre superficies
  de cubierta válidas.**
  - Caso: La escena contiene varios pisos.
  - Aceptación: Los módulos no aparecen flotando dentro de
    oficinas.

- **30.02. Mantén estable la cubierta elegida.**
  - Caso: El usuario añade un piso.
  - Aceptación: La instalación del escenario sigue una
    regla explícita sobre el nuevo techo superior.

- **30.03. Explica la regla al cambiar la estructura del
  edificio.**
  - Caso: Se duplica o elimina el piso superior.
  - Aceptación: El usuario sabe si la cubierta del
    escenario debe revisarse.

- **30.04. Respeta reservas de paso definidas para la
  visualización.**
  - Caso: Existe una franja de circulación conocida.
  - Aceptación: Los paneles no la ocupan silenciosamente.

- **30.05. Identifica la distribución como esquemática
  cuando corresponda.**
  - Caso: No hay medidas reales del techo.
  - Aceptación: La forma del dibujo no se confunde con un
    plano de montaje.

- **30.06. Evita estirar los módulos para hacerlos caber
  engañosamente.**
  - Caso: Se prueba una cantidad muy grande.
  - Aceptación: El visor comunica el límite o el carácter
    esquemático.

- **30.07. Muestra la incertidumbre de capacidad con
  lenguaje breve.**
  - Caso: La superficie no fue confirmada.
  - Aceptación: El usuario puede explorar y sabe que falta
    validar el espacio.

- **30.08. Permite revisar dimensiones conocidas desde el
  contexto.**
  - Caso: Hay una ficha técnica del panel.
  - Aceptación: El detalle conecta dimensiones y límite
    preliminar de unidades.

## 31. Cámara estable e intuitiva

**Objetivo:** Corrige saltos, encuadres perdidos y estados
heredados que ocultan lo importante.

- **31.01. Define un encuadre seguro para el edificio
  completo.**
  - Caso: Se abre la maqueta.
  - Aceptación: La estructura aparece centrada y dentro
    del visor.

- **31.02. Define un encuadre seguro para el techo.**
  - Caso: Se elige Paneles solares.
  - Aceptación: Se distinguen módulos y cubierta sin mirar
    a través de paredes.

- **31.03. Define un encuadre seguro para cada piso.**
  - Caso: La persona elige Piso 2.
  - Aceptación: El interior correspondiente queda visible
    y reconocible.

- **31.04. Acota acercamiento y alejamiento.**
  - Caso: La persona usa rueda o gestos.
  - Aceptación: No atraviesa superficies ni pierde el
    edificio indefinidamente.

- **31.05. Incluye una acción Centrar vista siempre
  accesible.**
  - Caso: La persona se desorienta al arrastrar.
  - Aceptación: Recupera el encuadre del modo activo con
    un clic.

- **31.06. Evita reconstruir la cámara al cambiar una
  cifra local.**
  - Caso: Se añade un panel.
  - Aceptación: La cámara no vuelve a un punto arbitrario.

- **31.07. Cancela movimientos anteriores al elegir otro
  destino.**
  - Caso: Se cambia de techo a Piso 3 rápidamente.
  - Aceptación: La última elección determina el encuadre
    final.

- **31.08. Separa movimiento del usuario y recorridos
  automáticos.**
  - Caso: La persona comienza a arrastrar.
  - Aceptación: El recorrido se pausa y no lucha contra su
    gesto.

## 32. Transición entre techo e interior

**Objetivo:** Explica visualmente la estructura sin tapar
los espacios ni perder los paneles.

- **32.01. Abre la cubierta al entrar a un interior.**
  - Caso: Se selecciona una oficina del último piso.
  - Aceptación: El techo deja de bloquear la observación
    de la sala.

- **32.02. Recupera la cubierta al volver a solar.**
  - Caso: El usuario abandona el interior.
  - Aceptación: Los paneles vuelven a ser visibles sobre
    el techo correcto.

- **32.03. Mantén un estado final determinista tras
  cambios rápidos.**
  - Caso: Se alterna solar, Piso 1 y Piso 2.
  - Aceptación: La escena termina mostrando el último modo
    elegido.

- **32.04. Evita fachadas levantadas que oculten el
  interior.**
  - Caso: El piso generado utiliza una apertura.
  - Aceptación: La fachada retirada no tapa salas ni
    etiquetas.

- **32.05. Sincroniza etiquetas durante los movimientos.**
  - Caso: La cámara encuadra una sala.
  - Aceptación: Los textos siguen anclados a sus objetos
    sin saltos lejanos.

- **32.06. Reduce el movimiento si la estructura es
  grande.**
  - Caso: Hay muchos pisos.
  - Aceptación: La transición conserva orientación y evita
    tiempos excesivos.

- **32.07. Mantén controles activos durante la
  transición.**
  - Caso: El usuario decide volver al edificio.
  - Aceptación: Puede cancelar el destino anterior de
    forma segura.

- **32.08. Verifica el GLB original y los pisos generados
  por separado.**
  - Caso: Existen ambos tipos de planta.
  - Aceptación: La solución funciona con sus mecanismos de
    apertura correspondientes.

## 33. Navegación por pisos

**Objetivo:** Haz explícito qué piso se está viendo y qué
contiene.

- **33.01. Presenta nombres completos y orden vertical
  claro.**
  - Caso: El usuario busca Piso 3.
  - Aceptación: Identifica el nivel sin interpretar
    abreviaturas confusas.

- **33.02. Destaca el piso activo en la regleta.**
  - Caso: Se entra al segundo nivel.
  - Aceptación: Regleta, ruta, panel e interior coinciden.

- **33.03. Muestra contenido resumido del piso.**
  - Caso: Hay oficinas, pasillo y equipos.
  - Aceptación: La persona ve cantidades y consumo de ese
    nivel.

- **33.04. Permite elegir un piso desde la maqueta y desde
  una lista.**
  - Caso: El usuario no quiere manipular el 3D.
  - Aceptación: Obtiene el mismo resultado con botones
    accesibles.

- **33.05. Resuelve nombres largos sin ocultar la
  selección.**
  - Caso: Un piso tiene una denominación extensa.
  - Aceptación: La interfaz conserva un nombre legible y
    una ayuda completa.

- **33.06. Mantén la selección al abrir un detalle
  secundario.**
  - Caso: La persona consulta la leyenda.
  - Aceptación: No cambia de piso sin haberlo elegido.

- **33.07. Define un destino seguro si se elimina el piso
  activo.**
  - Caso: La operación se confirma.
  - Aceptación: El visor vuelve al edificio o a otro nivel
    válido con una explicación.

- **33.08. Prueba secuencias rápidas entre varios pisos.**
  - Caso: Se pulsa Piso 1, Piso 3 y Piso 2.
  - Aceptación: El último estado visible corresponde a
    Piso 2.

## 34. Salas y oficinas como espacios reconocibles

**Objetivo:** Convierte la estructura del edificio en una
navegación entendible.

- **34.01. Permite abrir un espacio por su nombre.**
  - Caso: La empresa tiene Gerencia y Sala de reuniones.
  - Aceptación: La persona no necesita conocer
    identificadores internos.

- **34.02. Usa un resaltado claro de la sala activa.**
  - Caso: Se elige Oficina 2.
  - Aceptación: El suelo o contorno y el panel confirman
    la selección.

- **34.03. Muestra los equipos que explican el consumo del
  espacio.**
  - Caso: Gerencia tiene dos aires acondicionados.
  - Aceptación: La persona relaciona ese inventario con el
    total mostrado.

- **34.04. Evita que mobiliario decorativo cuente como
  consumo.**
  - Caso: Una sala contiene mesas ilustrativas.
  - Aceptación: La estimación usa únicamente inventario
    registrado.

- **34.05. Ofrece volver al piso sin perder el edificio.**
  - Caso: Se termina de revisar una sala.
  - Aceptación: La navegación recupera el contexto del
    nivel.

- **34.06. Mantén visibles las salas sin datos.**
  - Caso: No se registraron equipos en una oficina.
  - Aceptación: Se comunica el estado pendiente sin
    eliminar el espacio de la maqueta.

- **34.07. Separa ordenar espacios de registrar equipos.**
  - Caso: La persona cambia una distribución.
  - Aceptación: El sistema no inventa computadores o luces
    por añadir una habitación.

- **34.08. Permite un recorrido voluntario por salas.**
  - Caso: La persona pulsa Explorar oficinas.
  - Aceptación: El recorrido explica cada parada y se
    puede pausar o cerrar.

## 35. Localizar computadores y otras categorías

**Objetivo:** Responde a preguntas concretas mediante
filtros visuales simples.

- **35.01. Incluye un filtro Computadores.**
  - Caso: El usuario pregunta dónde están.
  - Aceptación: Destaca los registrados y muestra sus
    ubicaciones por piso y sala.

- **35.02. Incluye un filtro Aires acondicionados.**
  - Caso: La persona busca el equipo de mayor consumo.
  - Aceptación: Resalta sus unidades y mantiene accesible
    el desglose energético.

- **35.03. Incluye un filtro Iluminación.**
  - Caso: Hay luces en oficinas y pasillos.
  - Aceptación: El usuario puede distinguir ambos alcances
    sin duplicarlos.

- **35.04. Permite volver a Todos los equipos.**
  - Caso: Se desactiva un filtro.
  - Aceptación: La maqueta recupera sus elementos con una
    transición breve.

- **35.05. Muestra cuántas unidades coinciden.**
  - Caso: El filtro encuentra diez computadores.
  - Aceptación: La cifra concuerda con el inventario y sus
    cantidades.

- **35.06. Ofrece una lista equivalente al filtro
  visual.**
  - Caso: El 3D no está disponible.
  - Aceptación: La persona puede localizar los mismos
    equipos por ubicación.

- **35.07. No representa unidades desconocidas como
  aparatos confirmados.**
  - Caso: Solo hay puestos de trabajo declarados.
  - Aceptación: El filtro muestra únicamente computadores
    realmente registrados.

- **35.08. Permite ir de una coincidencia a su detalle.**
  - Caso: Se pulsa un computador.
  - Aceptación: Aparecen nombre, cantidad, ubicación y
    consumo conocido del grupo.

## 36. Ubicación de equipos en el modelo

**Objetivo:** Permite entender la distribución sin
convertir el producto en una herramienta CAD.

- **36.01. Usa una colocación automática inicial
  comprensible.**
  - Caso: Se añade un computador a una oficina.
  - Aceptación: Aparece en un lugar razonable del espacio
    correspondiente.

- **36.02. Permite ajustar una posición de forma
  opcional.**
  - Caso: La persona quiere ordenar un equipo.
  - Aceptación: Puede moverlo dentro de su sala sin editar
    coordenadas técnicas.

- **36.03. Mantén límites de la habitación al mover
  objetos.**
  - Caso: Se arrastra un equipo hacia una pared.
  - Aceptación: El modelo evita ubicarlo fuera del espacio
    permitido.

- **36.04. Permite restaurar la distribución automática.**
  - Caso: Los ajustes manuales quedaron desordenados.
  - Aceptación: La persona puede revisar y confirmar un
    restablecimiento del espacio.

- **36.05. Separa posición ilustrativa y consumo.**
  - Caso: Un equipo se mueve de una mesa a otra.
  - Aceptación: Su potencia y horario no cambian por ese
    movimiento visual.

- **36.06. Evita asignar equipos a otros pisos por
  arrastre accidental.**
  - Caso: El usuario manipula una vista cercana.
  - Aceptación: Un traslado de inventario requiere la
    operación existente apropiada.

- **36.07. Ofrece controles de teclado para ajustes
  simples.**
  - Caso: No se utiliza ratón.
  - Aceptación: Es posible mover o restablecer la posición
    con instrucciones breves.

- **36.08. Mantén el ajuste como una función secundaria.**
  - Caso: El empresario solo quiere calcular ahorro.
  - Aceptación: Nunca necesita ordenar muebles o equipos
    para obtener resultados.

## 37. Pasillos e iluminación integrada

**Objetivo:** Trata la circulación como una zona del
edificio y facilita revisar sus luces.

- **37.01. Incluye los pasillos en la exploración 3D.**
  - Caso: El piso tiene un corredor generado.
  - Aceptación: La persona puede localizarlo y ver sus
    grupos de iluminación.

- **37.02. Muestra cantidad y tipo de luminarias
  registradas.**
  - Caso: El pasillo contiene ocho bombillos.
  - Aceptación: La etiqueta y el panel muestran esas ocho
    unidades.

- **37.03. Permite abrir el inventario del pasillo desde
  la escena.**
  - Caso: Se pulsa su etiqueta.
  - Aceptación: Se accede al piso y grupo correctos sin
    buscar en otra lista.

- **37.04. Conserva varios grupos con horarios
  distintos.**
  - Caso: Existen luces diurnas y nocturnas.
  - Aceptación: Editar uno no sustituye el otro.

- **37.05. Suma cada grupo una sola vez.**
  - Caso: El resumen incorpora circulación.
  - Aceptación: La cifra del piso y la del edificio
    coinciden con el inventario real.

- **37.06. Diferencia luces decorativas y equipos
  registrados.**
  - Caso: La escena utiliza iluminación estética.
  - Aceptación: Los efectos visuales no crean consumo
    ficticio.

- **37.07. Muestra una alternativa si el corredor no
  existe en la geometría.**
  - Caso: La planta utiliza un GLB fijo.
  - Aceptación: Explica la limitación y permite revisar
    sus datos sin fingir una nueva distribución.

- **37.08. Relaciona circulación y seguridad operativa.**
  - Caso: Hay iluminación esencial.
  - Aceptación: Las propuestas de reducción respetan esa
    condición.

## 38. Sensores como información opcional

**Objetivo:** Añade contexto cuando haya datos sin abrumar
a quienes no tienen domótica.

- **38.01. Oculta el protagonismo de sensores cuando no
  hay integración.**
  - Caso: El edificio no tiene dispositivos vinculados.
  - Aceptación: La experiencia principal sigue centrada en
    consumo, espacios y solar.

- **38.02. Identifica claramente las lecturas manuales.**
  - Caso: Se introduce una temperatura.
  - Aceptación: La interfaz no la representa como una
    medición en vivo.

- **38.03. Ubica una lectura en su zona declarada.**
  - Caso: Hay un sensor en el pasillo del Piso 1.
  - Aceptación: La capa visual relaciona la lectura con
    esa ubicación.

- **38.04. Muestra antigüedad y fuente del dato.**
  - Caso: Se consulta una lectura.
  - Aceptación: La persona distingue un valor reciente de
    uno vencido.

- **38.05. No deduce ocupación a partir de potencia
  cero.**
  - Caso: Un enchufe no está consumiendo.
  - Aceptación: La interfaz no afirma que la sala está
    vacía.

- **38.06. Mantén las reglas en observación mientras no
  exista control autorizado.**
  - Caso: Se evalúa una posible acción.
  - Aceptación: El estado indica Propuesta sin ejecutar.

- **38.07. Permite apagar la capa de sensores.**
  - Caso: El usuario quiere ver el edificio limpio.
  - Aceptación: Los indicadores dejan de ocupar la maqueta
    sin borrar datos.

- **38.08. Preserva restricciones y compatibilidad de
  climatización.**
  - Caso: La regla se refiere a un aire acondicionado.
  - Aceptación: La interfaz no sugiere cortar el compresor
    con un enchufe genérico.

## 39. Selección contextual sincronizada

**Objetivo:** Mantén una única selección reconocible a
través de todas las superficies.

- **39.01. Sincroniza selección en maqueta, lista y
  panel.**
  - Caso: Se elige una oficina desde una tarjeta.
  - Aceptación: La misma oficina se destaca en el modelo.

- **39.02. Sincroniza la selección desde el modelo hacia
  la lista.**
  - Caso: Se pulsa un equipo visible.
  - Aceptación: La lista y el detalle muestran el objeto
    correspondiente.

- **39.03. Evita reutilizar una selección incompatible con
  otro modo.**
  - Caso: Se pasa de una oficina al techo.
  - Aceptación: No queda un panel lateral mostrando un
    equipo ajeno al contexto solar.

- **39.04. Conserva el contexto al volver del detalle.**
  - Caso: La persona abre una ficha técnica.
  - Aceptación: Puede regresar a la misma sala y filtro.

- **39.05. Da prioridad al objeto más específico
  elegible.**
  - Caso: Un equipo está delante de un suelo.
  - Aceptación: La interacción selecciona el objetivo
    previsto y no una capa decorativa.

- **39.06. Permite limpiar la selección explícitamente.**
  - Caso: La persona quiere una vista general.
  - Aceptación: Elimina el detalle activo sin alterar los
    datos del edificio.

- **39.07. Comunica la selección con texto además de
  color.**
  - Caso: Una sala cambia de estado.
  - Aceptación: El título o la ruta identifica qué se
    seleccionó.

- **39.08. Resuelve la desaparición de un objeto
  seleccionado.**
  - Caso: Se elimina un grupo de equipos.
  - Aceptación: La interfaz vuelve a una selección válida
    y explica el cambio.

## 40. Etiquetas, leyendas y densidad visual

**Objetivo:** Informa sin cubrir el edificio con textos y
cifras superpuestos.

- **40.01. Muestra etiquetas acordes al modo activo.**
  - Caso: Está seleccionado el techo solar.
  - Aceptación: Prioriza paneles, potencia y datos solares
    relevantes.

- **40.02. Reduce etiquetas de elementos no
  seleccionados.**
  - Caso: Se abre una oficina.
  - Aceptación: La información de otros pisos no tapa el
    interior.

- **40.03. Evita solapamientos de textos.**
  - Caso: Varias salas quedan cerca en pantalla.
  - Aceptación: Las etiquetas se recolocan o se agrupan
    con criterio legible.

- **40.04. Mantén los nombres completos disponibles.**
  - Caso: Una etiqueta debe abreviarse.
  - Aceptación: Se puede consultar el texto completo
    mediante foco o detalle accesible.

- **40.05. Diferencia consumo conocido, incompleto y
  ausente.**
  - Caso: Hay salas con distintos niveles de datos.
  - Aceptación: La leyenda explica los estados con
    palabras y patrones.

- **40.06. Evita cifras que parezcan instantáneas cuando
  son mensuales.**
  - Caso: Se activa un mapa de consumo.
  - Aceptación: Las etiquetas mantienen el periodo de kWh
    al mes.

- **40.07. Permite ocultar información secundaria.**
  - Caso: La persona quiere observar la arquitectura.
  - Aceptación: Puede limpiar etiquetas sin perder los
    controles esenciales.

- **40.08. Mantén una leyenda junto a la representación.**
  - Caso: La escena usa colores o partículas.
  - Aceptación: El usuario conoce qué significan y qué no
    representan.

## 41. Gráficas para comprender decisiones

**Objetivo:** Conecta cada gráfica con una pregunta
cotidiana del empresario.

- **41.01. Presenta una comparación de antes y después.**
  - Caso: La persona añade paneles.
  - Aceptación: Ve cómo cambia la compra a la red sin
    interpretar múltiples tablas.

- **41.02. Incluye una gráfica de demanda y generación por
  periodo.**
  - Caso: Se abre el resultado solar.
  - Aceptación: Las series tienen nombres completos y
    unidades visibles.

- **41.03. Ofrece un desglose de qué consume más.**
  - Caso: El usuario revisa el piso activo.
  - Aceptación: Comprende qué equipos explican la mayor
    parte del consumo conocido.

- **41.04. Relaciona selección 3D y desglose gráfico.**
  - Caso: Se elige Gerencia.
  - Aceptación: La gráfica puede mostrar sus equipos sin
    perder el edificio activo.

- **41.05. Evita gráficas decorativas sin datos.**
  - Caso: No hay consumo conocido.
  - Aceptación: Muestra un estado vacío con una siguiente
    acción.

- **41.06. Permite consultar valores exactos.**
  - Caso: La persona señala una barra o usa el teclado.
  - Aceptación: Accede a cifra, unidad, periodo y fuente.

- **41.07. Incluye una tabla equivalente para cada
  comparación relevante.**
  - Caso: La persona no puede interpretar el gráfico.
  - Aceptación: Obtiene la misma información con
    estructura accesible.

- **41.08. Mantén escalas comparables entre escenarios.**
  - Caso: Se alterna seis y doce paneles.
  - Aceptación: La gráfica no exagera cambios por
    modificar silenciosamente el eje.

## 42. Periodos y lectura temporal

**Objetivo:** Haz visible cuándo se consume y qué periodo
representan las estimaciones.

- **42.01. Nombra el periodo del consumo actual.**
  - Caso: El resumen usa un mes típico.
  - Aceptación: Solar conserva esa referencia en su
    tarjeta de base.

- **42.02. Muestra fechas del pronóstico cuando
  corresponda.**
  - Caso: Hay seis meses futuros.
  - Aceptación: Los nombres incluyen el año si el
    horizonte cruza enero.

- **42.03. Evita sumar periodos de distinta duración como
  si fueran iguales.**
  - Caso: Se comparan febrero y marzo.
  - Aceptación: El modelo utiliza sus duraciones y la
    interfaz explica el alcance.

- **42.04. Identifica un día medio como ejemplo
  representativo.**
  - Caso: Se abre una gráfica horaria.
  - Aceptación: No se presenta como lectura real de un día
    concreto.

- **42.05. Usa hora local en los ejes temporales.**
  - Caso: La ciudad confirmada está en Colombia.
  - Aceptación: La persona interpreta ocho de la mañana
    sin convertir UTC.

- **42.06. Permite cambiar entre resumen del periodo y
  detalle diario.**
  - Caso: El usuario busca por qué hay compra nocturna.
  - Aceptación: Comprende cómo se distribuyen demanda y
    producción.

- **42.07. Conserva el mismo periodo en cifras
  monetarias.**
  - Caso: Se inspecciona el ahorro.
  - Aceptación: El costo y la energía corresponden a las
    mismas fechas.

- **42.08. Explica cuándo un resultado usa historia y
  cuándo una hipótesis.**
  - Caso: La persona consulta la fuente temporal.
  - Aceptación: Encuentra una descripción breve de ambos
    componentes.

## 43. Comparación visual de escenarios

**Objetivo:** Permite ver consecuencias sin crear un
tablero abrumador.

- **43.01. Mantén un escenario actual fijo como
  referencia.**
  - Caso: El usuario explora nuevas cantidades.
  - Aceptación: Puede reconocer el punto de partida.

- **43.02. Permite comparar una propuesta con la
  referencia.**
  - Caso: Se prueban doce paneles.
  - Aceptación: Las tarjetas muestran diferencias
    absolutas y porcentajes válidos.

- **43.03. Añade una vista alternable de techo actual y
  propuesto.**
  - Caso: La persona pulsa Antes o Después.
  - Aceptación: La cubierta refleja la cantidad
    correspondiente.

- **43.04. Conserva la dirección de cámara al alternar
  propuestas.**
  - Caso: Se compara la misma cubierta.
  - Aceptación: El cambio visual se debe a los paneles y
    no a un giro arbitrario.

- **43.05. Muestra el efecto sobre la compra a la red.**
  - Caso: La generación aumenta.
  - Aceptación: La tarjeta distingue ahorro energético
    estimado y excedentes.

- **43.06. No calcule porcentajes sobre una base cero.**
  - Caso: El consumo de referencia es nulo.
  - Aceptación: La interfaz muestra un resultado
    interpretable sin infinito.

- **43.07. Permite volver a la propuesta anterior.**
  - Caso: La persona se pasó con el contador.
  - Aceptación: Recupera una cantidad previa sin perder el
    edificio.

- **43.08. Evita multiplicar propuestas simultáneas
  innecesariamente.**
  - Caso: El usuario solo necesita una decisión simple.
  - Aceptación: La pantalla principal presenta una
    comparación manejable.

## 44. Presupuesto y prioridades operativas

**Objetivo:** Conecta el ahorro con el límite económico
del edificio sin agregar preguntas técnicas.

- **44.01. Reutiliza el presupuesto guardado del
  edificio.**
  - Caso: Hay un límite mensual configurado.
  - Aceptación: La experiencia lo muestra sin volver a
    preguntarlo.

- **44.02. Explica visualmente si el escenario queda
  dentro del presupuesto.**
  - Caso: Existe una tarifa válida.
  - Aceptación: La persona entiende el margen con texto y
    color.

- **44.03. Mantén el presupuesto ajustable en su
  contexto.**
  - Caso: El usuario desea cambiar el límite.
  - Aceptación: Encuentra una acción clara y un guardado
    explícito.

- **44.04. Evita confundir presupuesto con consumo.**
  - Caso: La persona sube el límite económico.
  - Aceptación: La demanda física de los equipos no cambia
    por esa acción.

- **44.05. Conserva la tarifa y presupuesto como datos
  independientes.**
  - Caso: Se edita uno de ellos.
  - Aceptación: El otro no se borra ni se modifica
    silenciosamente.

- **44.06. Ofrece una explicación si no puede comparar
  costos.**
  - Caso: Falta tarifa.
  - Aceptación: El panel permite revisar energía mientras
    se completa el dato económico.

- **44.07. Relaciona el escenario con los principales
  consumidores.**
  - Caso: Los aires explican una parte alta del gasto.
  - Aceptación: Se ofrece revisar sus horarios desde la
    ubicación correcta.

- **44.08. No imponga recomendaciones irreales para
  alcanzar una meta.**
  - Caso: Los equipos ajustables no bastan.
  - Aceptación: La interfaz explica la limitación sin
    reducir cargas esenciales.

## 45. Acciones simuladas frente a acciones reales

**Objetivo:** Evita que una animación o botón sugiera un
control físico inexistente.

- **45.01. Titula las modificaciones de paneles como
  escenario.**
  - Caso: La persona aumenta la cantidad virtual.
  - Aceptación: No cree que el sistema haya instalado
    equipos reales.

- **45.02. Distingue guardar un plan de aplicarlo al
  inventario.**
  - Caso: Se modifica un horario.
  - Aceptación: La interfaz explica qué datos cambiarían
    al confirmar.

- **45.03. Mantén las reglas domóticas en observación
  según su integración.**
  - Caso: Se muestra una propuesta de apagado.
  - Aceptación: No afirma que el aparato ya se apagó.

- **45.04. No interpretes una animación de luz como
  telemetría.**
  - Caso: Un bombillo se ilumina en el modelo.
  - Aceptación: La leyenda aclara si es una ilustración
    del inventario.

- **45.05. Identifica cambios que afectan datos
  persistentes.**
  - Caso: Se elimina un grupo de luces.
  - Aceptación: La persona recibe una confirmación
    concreta y un estado posterior verificable.

- **45.06. Conserva controles manuales y protecciones
  existentes.**
  - Caso: Una zona tiene equipos esenciales.
  - Aceptación: El rediseño no elimina sus restricciones.

- **45.07. No garantice ahorro real por una simulación.**
  - Caso: Se presenta una reducción prevista.
  - Aceptación: El texto explica sus condiciones y
    carácter estimado.

- **45.08. Evita controles físicos nuevos ajenos al
  encargo.**
  - Caso: No se pidió conectar dispositivos reales.
  - Aceptación: El trabajo se centra en hacer comprensible
    la experiencia existente.

## 46. Estados vacíos, errores y carga

**Objetivo:** Convierte los problemas técnicos en
instrucciones útiles para continuar.

- **46.01. Explica un edificio sin inventario.**
  - Caso: La persona abre un edificio recién creado.
  - Aceptación: Encuentra una acción para registrar
    equipos o consultar un ejemplo.

- **46.02. Explica una cubierta sin escenario solar.**
  - Caso: Se pulsa Paneles solares en el visor.
  - Aceptación: Ofrece configurar cantidad y potencia en
    un panel contextual.

- **46.03. Presenta carga de modelo sin una pantalla
  vacía.**
  - Caso: El GLB tarda en abrir.
  - Aceptación: Mantiene navegación, mensaje de progreso y
    posibilidad de usar una alternativa.

- **46.04. Conserva datos escritos ante un error de
  cálculo.**
  - Caso: Falla la consulta solar.
  - Aceptación: Ciudad, cantidad y potencia permanecen
    intactas.

- **46.05. Presenta errores cerca de su causa.**
  - Caso: Una potencia contiene un valor inválido.
  - Aceptación: El campo se identifica con una explicación
    concreta.

- **46.06. Distingue falta de Internet de falta de
  datos.**
  - Caso: La curva no llega por red.
  - Aceptación: No acusa al usuario de haber configurado
    mal el edificio.

- **46.07. Evita silencios después de una acción.**
  - Caso: El usuario pulsa Ver paneles.
  - Aceptación: Hay transición visible, estado de carga o
    explicación de por qué no puede mostrarlos.

- **46.08. Permite reintentar sin duplicar operaciones.**
  - Caso: Se recupera la conexión.
  - Aceptación: La acción pendiente se repite de forma
    controlada y no crea grupos adicionales.

## 47. Vista previa y guardado

**Objetivo:** Permite explorar libremente y conserva una
diferencia clara entre probar y guardar.

- **47.01. Marca un cambio de cantidad como vista
  previa.**
  - Caso: El usuario añade dos paneles.
  - Aceptación: La interfaz señala que todavía no se
    guardó esa propuesta.

- **47.02. Mantén visible una acción Guardar escenario.**
  - Caso: Hay cambios válidos.
  - Aceptación: La persona sabe cómo conservarlos para
    otra sesión.

- **47.03. Permite descartar la prueba sin alterar lo
  guardado.**
  - Caso: El usuario prefiere volver atrás.
  - Aceptación: La escena recupera la configuración
    persistida.

- **47.04. Protege cambios al salir de la sección.**
  - Caso: Hay una ubicación o cantidad sin guardar.
  - Aceptación: Se ofrece seguir editando o descartar
    voluntariamente.

- **47.05. Reconoce cuando los valores vuelven al estado
  original.**
  - Caso: La persona cambia de ocho a diez y regresa a
    ocho.
  - Aceptación: No conserva una advertencia de cambios
    inexistentes.

- **47.06. Bloquea envíos duplicados durante un
  guardado.**
  - Caso: La persona pulsa dos veces.
  - Aceptación: Se registra una sola operación.

- **47.07. Confirma el guardado solamente con una
  respuesta válida.**
  - Caso: Hay un error de servidor.
  - Aceptación: No aparece un mensaje de éxito engañoso.

- **47.08. Restaura el escenario al recargar.**
  - Caso: La configuración se guardó correctamente.
  - Aceptación: Cantidad, potencia, ubicación y modo
    vuelven con sus datos correspondientes.

## 48. Concurrencia, cancelación y deshacer

**Objetivo:** Conserva la integridad del edificio frente a
solicitudes tardías y cambios paralelos.

- **48.01. Comprueba la revisión al guardar.**
  - Caso: Otra sesión modificó el edificio.
  - Aceptación: Se informa del conflicto sin sobrescribir
    datos ajenos.

- **48.02. Captura el edificio objetivo antes de una
  consulta asíncrona.**
  - Caso: El usuario cambia de sede durante una respuesta.
  - Aceptación: El resultado no se aplica al edificio
    equivocado.

- **48.03. Descarta respuestas de escenarios obsoletos.**
  - Caso: La ciudad cambia antes de terminar la consulta
    anterior.
  - Aceptación: Solo la configuración vigente puede
    actualizar el resultado visible.

- **48.04. Evita dejar controles permanentemente
  bloqueados.**
  - Caso: Una solicitud falla.
  - Aceptación: Se recuperan sus estados previos de
    habilitación.

- **48.05. Permite deshacer ajustes energéticos
  compatibles.**
  - Caso: Se guarda una propuesta equivocada.
  - Aceptación: Se restaura la versión anterior respetando
    revisión y organización.

- **48.06. Mantén un destino válido después de borrar un
  elemento.**
  - Caso: Se elimina el piso del techo activo.
  - Aceptación: La escena y el panel se recuperan sin
    referencias rotas.

- **48.07. Conserva el registro de la operación para
  revisión.**
  - Caso: Se modifica una configuración persistente.
  - Aceptación: Quedan identificados tipo de cambio y
    revisión correspondiente.

- **48.08. Comprueba alta simultánea y sesión en los
  flujos tocados.**
  - Caso: Dos personas crean cuentas.
  - Aceptación: Las correcciones visuales no reintroducen
    bloqueos ni errores de autenticación.

## 49. Móvil y gestos

**Objetivo:** Haz que la experiencia siga siendo sencilla
en pantallas estrechas.

- **49.01. Diseña el flujo principal para anchuras reales
  de teléfono.**
  - Caso: La ventana mide 390 px.
  - Aceptación: No aparecen formularios ni barras que
    desborden horizontalmente.

- **49.02. Permite usar el 3D sin impedir el
  desplazamiento de página.**
  - Caso: El usuario toca la maqueta.
  - Aceptación: Los gestos tienen un comportamiento
    previsible y se explica cómo activarlos.

- **49.03. Mantén botones de paneles fáciles de pulsar.**
  - Caso: Se añade o retira un módulo desde un teléfono.
  - Aceptación: Las acciones tienen tamaño y separación
    adecuados.

- **49.04. Adapta la barra temática del visor.**
  - Caso: No caben todas las categorías a la vez.
  - Aceptación: Se ofrece una navegación clara que
    conserva la categoría seleccionada.

- **49.05. Muestra el detalle sin tapar toda la escena
  permanentemente.**
  - Caso: Se selecciona un equipo.
  - Aceptación: El panel puede abrirse y cerrarse con
    facilidad.

- **49.06. Conserva el contador solar junto a sus
  controles.**
  - Caso: La persona ajusta la cantidad.
  - Aceptación: No necesita desplazarse continuamente
    entre extremos de la página.

- **49.07. Evita tablas como requisito para entender el
  resultado.**
  - Caso: La pantalla es estrecha.
  - Aceptación: Las tarjetas y la explicación transmiten
    la conclusión principal.

- **49.08. Verifica orientaciones y anchuras diferentes.**
  - Caso: Se pasa de vertical a horizontal.
  - Aceptación: El visor se reajusta y mantiene edificio,
    selección y escenario.

## 50. Accesibilidad por teclado y lectura

**Objetivo:** Asegura que la intuición visual tenga una
alternativa operable.

- **50.01. Implementa la barra temática con semántica
  apropiada.**
  - Caso: Se navega con teclado.
  - Aceptación: La selección activa y las acciones
    disponibles se anuncian correctamente.

- **50.02. Mantén un orden de foco coherente.**
  - Caso: La persona recorre resumen, controles y visor.
  - Aceptación: No salta a elementos ocultos o
    decorativos.

- **50.03. Ofrece botones equivalentes a gestos del 3D.**
  - Caso: No se usa ratón.
  - Aceptación: Es posible seleccionar piso, sala, techo y
    equipos.

- **50.04. Asocia cada control solar con una etiqueta
  clara.**
  - Caso: El lector anuncia el contador.
  - Aceptación: Se conoce su propósito, valor y límites.

- **50.05. Anuncia resultados relevantes con moderación.**
  - Caso: Termina un cálculo.
  - Aceptación: Se comunica el resultado sin leer toda la
    página repetidamente.

- **50.06. Conserva el foco tras cerrar un panel
  contextual.**
  - Caso: Se abre y cierra la ficha de una sala.
  - Aceptación: El foco vuelve al control que inició la
    acción.

- **50.07. Mantén información más allá del color.**
  - Caso: Hay estados de consumo y selección.
  - Aceptación: Texto, forma o patrón permiten
    distinguirlos.

- **50.08. Verifica con lector real cuando esté
  disponible.**
  - Caso: Se completa la revisión de accesibilidad.
  - Aceptación: Se informa qué se escuchó realmente y qué
    sigue pendiente.

## 51. Movimiento reducido y animaciones útiles

**Objetivo:** Utiliza movimiento para orientar y no para
exigir atención constante.

- **51.01. Respeta la preferencia de movimiento
  reducido.**
  - Caso: El sistema operativo la tiene activada.
  - Aceptación: Cámaras y paneles cambian sin trayectorias
    innecesarias.

- **51.02. Evita recorridos automáticos no solicitados.**
  - Caso: El usuario abre una oficina.
  - Aceptación: La cámara se encuadra y no inicia un paseo
    continuo.

- **51.03. Permite pausar cualquier recorrido
  voluntario.**
  - Caso: La persona quiere revisar una cifra.
  - Aceptación: El movimiento se detiene sin perder la
    parada seleccionada.

- **51.04. Reduce partículas en modos de lectura
  detallada.**
  - Caso: Se abre una ficha técnica.
  - Aceptación: Los efectos no compiten con el contenido
    importante.

- **51.05. No represente consumo instantáneo con
  partículas mensuales.**
  - Caso: El mapa usa kWh al mes.
  - Aceptación: La leyenda conserva el carácter
    ilustrativo del efecto.

- **51.06. Acota amplitud y duración de movimientos.**
  - Caso: Se cambia de piso.
  - Aceptación: La transición ayuda a reconocer el destino
    sin producir desorientación.

- **51.07. Mantén un estado final útil sin ninguna
  animación.**
  - Caso: El render se pausa o se reduce movimiento.
  - Aceptación: La escena sigue mostrando selección y
    resultados correctos.

- **51.08. Detén animaciones al salir de la sección.**
  - Caso: El usuario vuelve al resumen.
  - Aceptación: No quedan bucles visuales activos sin un
    visor visible.

## 52. Rendimiento y estabilidad del visor

**Objetivo:** Mejora la respuesta percibida con técnicas
verificadas y límites explícitos.

- **52.01. Evita reconstruir todo el edificio por cada
  panel añadido.**
  - Caso: Solo cambia una cantidad.
  - Aceptación: Actualiza el grupo solar o la instancia
    correspondiente.

- **52.02. Reutiliza geometrías y materiales cuando
  resulte apropiado.**
  - Caso: Hay muchos paneles similares.
  - Aceptación: El uso de recursos permanece acotado.

- **52.03. Libera recursos de escenas descartadas.**
  - Caso: Se cambia varias veces de edificio.
  - Aceptación: No crece indefinidamente el número de
    objetos GPU.

- **52.04. Carga interiores bajo demanda cuando sea
  posible.**
  - Caso: Solo se observa un piso.
  - Aceptación: No procesa mobiliario invisible de todos
    los niveles sin necesidad.

- **52.05. Mantén límites visuales explícitos para
  cantidades extremas.**
  - Caso: Hay un inventario grande.
  - Aceptación: La interfaz explica agrupaciones y
    conserva las cantidades reales.

- **52.06. Mide latencia de interacción y render con
  escenarios concretos.**
  - Caso: Se añaden paneles o se elige un piso.
  - Aceptación: La entrega informa datos observados y
    condiciones de la prueba.

- **52.07. No extrapoles rendimiento de software a todos
  los dispositivos.**
  - Caso: Las pruebas usan render por software.
  - Aceptación: El informe identifica esa limitación.

- **52.08. Permite una calidad visual más ligera.**
  - Caso: El dispositivo no mantiene una respuesta
    aceptable.
  - Aceptación: Se reducen efectos secundarios sin perder
    datos ni controles.

## 53. Estado compartido y arquitectura frontend

**Objetivo:** Implementa una sola verdad para edificio,
modo, selección y escenario.

- **53.01. Define un estado explícito de exploración.**
  - Caso: El usuario alterna techo y salas.
  - Aceptación: Modo, piso, espacio, equipo y cámara no
    quedan en combinaciones incompatibles.

- **53.02. Separa escenario guardado y borrador.**
  - Caso: La cantidad virtual cambia.
  - Aceptación: Cada representación sabe cuál está
    mostrando.

- **53.03. Reutiliza los cálculos puros existentes.**
  - Caso: El resumen calcula consumo.
  - Aceptación: Solar no mantiene una fórmula paralela que
    diverja.

- **53.04. Integra nuevos recursos en las rutas
  estáticas.**
  - Caso: Se crea un módulo frontend.
  - Aceptación: El servidor lo entrega con su tipo de
    contenido correcto.

- **53.05. Respeta la política de scripts propios.**
  - Caso: La web tiene CSP restrictiva.
  - Aceptación: El rediseño no depende de scripts remotos
    bloqueados.

- **53.06. Destruye listeners y temporizadores al
  desmontar.**
  - Caso: Se cambia de sección.
  - Aceptación: No se duplican acciones ni avisos al
    regresar.

- **53.07. Mantén funciones de datos separadas de
  representación.**
  - Caso: Se cambia una etiqueta.
  - Aceptación: No altera por accidente una ecuación
    energética.

- **53.08. Evita una migración de framework sin
  necesidad.**
  - Caso: El frontend actual es estático.
  - Aceptación: La mejora se integra con el proyecto y
    limita el alcance técnico.

## 54. Contratos del servidor y aislamiento

**Objetivo:** Conserva las garantías existentes al
simplificar la interfaz.

- **54.01. Mantén verificación de organización en cada
  recurso.**
  - Caso: Una sesión pide un edificio ajeno.
  - Aceptación: El servidor no entrega ni modifica ese
    edificio.

- **54.02. Valida datos en servidor además de la
  interfaz.**
  - Caso: Se envía una cantidad solar inválida
    manualmente.
  - Aceptación: La solicitud se rechaza con un mensaje
    consistente.

- **54.03. Conserva origen y CSRF en cambios
  persistentes.**
  - Caso: Se guarda un escenario.
  - Aceptación: La simplificación visual no reduce las
    comprobaciones existentes.

- **54.04. No acepte roles o propiedad del navegador.**
  - Caso: Se manipula una solicitud.
  - Aceptación: La organización sigue determinada por la
    sesión.

- **54.05. Mantén límites de tamaño y de solicitudes.**
  - Caso: Una consulta contiene datos extremos.
  - Aceptación: El servidor responde de forma controlada.

- **54.06. Conserva credenciales externas fuera del
  cliente.**
  - Caso: Se utiliza un proveedor con token.
  - Aceptación: El código servido no contiene secretos.

- **54.07. No acepte URLs arbitrarias para consultar
  proveedores.**
  - Caso: Un cliente intenta cambiar el dominio.
  - Aceptación: El servidor usa integraciones autorizadas
    y verificadas.

- **54.08. Preserva la separación entre cuenta y
  demostración local.**
  - Caso: El usuario explora el ejemplo.
  - Aceptación: Sus cambios ilustrativos no alteran
    edificios de organizaciones reales.

## 55. Compatibilidad, migraciones y copias

**Objetivo:** Conserva datos existentes y comunica cambios
de esquema de forma revisable.

- **55.01. Inspecciona si realmente hace falta cambiar el
  esquema.**
  - Caso: La mejora reorganiza campos existentes.
  - Aceptación: Evita migraciones innecesarias por cambios
    puramente visuales.

- **55.02. Usa migraciones aditivas cuando sean
  necesarias.**
  - Caso: Se añade procedencia de ubicación.
  - Aceptación: Documenta aplicación, reversión y respaldo
    requerido.

- **55.03. Mantén lectura de escenarios previos.**
  - Caso: Hay una configuración con coordenadas antiguas.
  - Aceptación: El sistema puede mostrar su ubicación y
    permitir confirmarla sin perderla.

- **55.04. No borre supuestos avanzados al ocultarlos.**
  - Caso: Se abre una configuración existente.
  - Aceptación: Sus valores siguen disponibles en el
    bloque avanzado.

- **55.05. Preserva identidades al reorganizar la
  escena.**
  - Caso: Se mejora la representación de equipos.
  - Aceptación: Los identificadores de inventario y
    registros no cambian por el dibujo.

- **55.06. Actualiza exportación e importación si cambian
  datos.**
  - Caso: Hay un nuevo origen de ubicación.
  - Aceptación: La copia conserva o comunica claramente
    ese campo.

- **55.07. Remapea referencias al importar edificios.**
  - Caso: La copia contiene pasillos y pisos.
  - Aceptación: Los vínculos apuntan a los recursos nuevos
    correspondientes.

- **55.08. Documenta lo que no viaja por razones de
  integración.**
  - Caso: Hay reglas asociadas a dispositivos.
  - Aceptación: La importación no aparenta haber conectado
    hardware en el edificio nuevo.

## 56. Pruebas de cálculo y coherencia

**Objetivo:** Verifica resultados relevantes con casos que
detecten errores reales.

- **56.01. Comprueba igualdad de consumo entre resumen y
  solar.**
  - Caso: El edificio tiene oficinas y pasillos.
  - Aceptación: La base automática coincide con el total
    elegido y su periodo.

- **56.02. Comprueba servicios comunes sin doble conteo.**
  - Caso: Se añade una carga compartida.
  - Aceptación: El total aumenta una sola vez.

- **56.03. Comprueba cero paneles.**
  - Caso: La cantidad se pone en cero.
  - Aceptación: No hay producción ni divisiones por cero y
    la compra refleja la demanda.

- **56.04. Comprueba demanda nocturna sin baterías.**
  - Caso: Los equipos consumen fuera del horario solar.
  - Aceptación: No se consume de noche un excedente
    ficticiamente almacenado.

- **56.05. Comprueba cambio de ciudad o condiciones
  solares.**
  - Caso: Se modifica una variable que afecta la curva.
  - Aceptación: El resultado previo se invalida hasta
    disponer de referencia válida.

- **56.06. Comprueba datos desconocidos.**
  - Caso: Falta potencia de un equipo.
  - Aceptación: El sistema conserva la falta de dato y
    marca cobertura incompleta.

- **56.07. Comprueba escenario combinado.**
  - Caso: Se reduce horario y se añaden paneles.
  - Aceptación: El balance recalculado evita sumar ahorros
    superpuestos.

- **56.08. Comprueba periodos y orden temporal.**
  - Caso: El pronóstico cruza de diciembre a enero.
  - Aceptación: Las etiquetas, duraciones y totales
    conservan el orden futuro correcto.

## 57. Pruebas visuales del flujo 3D

**Objetivo:** Reproduce las acciones reportadas por el
usuario y verifica su resultado observable.

- **57.01. Prueba el botón desde la sección solar.**
  - Caso: Hay una cantidad guardada de doce paneles.
  - Aceptación: Se abre el techo correcto y se ven doce
    módulos del escenario.

- **57.02. Prueba el botón con un borrador distinto.**
  - Caso: Se guardaron seis paneles y se están probando
    diez.
  - Aceptación: La interfaz explica y representa el estado
    elegido sin ambigüedad.

- **57.03. Prueba el acceso desde el interior de un
  piso.**
  - Caso: El techo estaba retirado para ver oficinas.
  - Aceptación: La opción solar recupera una vista de
    cubierta utilizable.

- **57.04. Prueba añadir y quitar rápidamente.**
  - Caso: Se alternan cantidades varias veces.
  - Aceptación: La cantidad dibujada termina coincidiendo
    con el último valor.

- **57.05. Prueba localizar computadores.**
  - Caso: Hay equipos en dos oficinas.
  - Aceptación: El filtro muestra ubicaciones y cantidades
    del inventario.

- **57.06. Prueba pasillos con varios grupos de
  iluminación.**
  - Caso: Se editan luces con horarios distintos.
  - Aceptación: La escena y los totales conservan ambos
    grupos.

- **57.07. Prueba cambios rápidos entre pisos y techo.**
  - Caso: Se seleccionan varios destinos sin esperar.
  - Aceptación: La última selección determina cámara,
    panel y etiquetas.

- **57.08. Prueba el respaldo sin WebGL.**
  - Caso: Se deshabilita el soporte 3D.
  - Aceptación: La persona sigue pudiendo revisar consumo,
    paneles y equipos mediante alternativas claras.

## 58. Recorridos de una persona sin conocimientos técnicos

**Objetivo:** Evalúa si los usuarios pueden completar
objetivos sin ayuda especializada.

- **58.01. Define un recorrido de tres decisiones
  solares.**
  - Caso: La persona conoce ciudad y tipo de panel.
  - Aceptación: Puede probar una cantidad y entender el
    resultado principal.

- **58.02. Evalúa si necesita copiar el consumo.**
  - Caso: La persona ya configuró el edificio.
  - Aceptación: Utiliza el resumen automáticamente sin
    repetir ese dato.

- **58.03. Evalúa si encuentra los ajustes opcionales.**
  - Caso: La persona quiere más precisión.
  - Aceptación: Descubre el bloque avanzado sin que sea
    obligatorio.

- **58.04. Evalúa si entiende el botón de techo.**
  - Caso: La persona quiere ver sus paneles.
  - Aceptación: Llega a una escena donde los reconoce y
    cuenta.

- **58.05. Evalúa si localiza equipos por categoría.**
  - Caso: La persona pregunta dónde están los
    computadores.
  - Aceptación: Puede responder usando el visor o la lista
    equivalente.

- **58.06. Evalúa si diferencia generación y ahorro.**
  - Caso: Se comparan varios tamaños de instalación.
  - Aceptación: No interpreta excedentes como consumo
    nocturno cubierto.

- **58.07. Evalúa si puede recuperarse de una selección
  equivocada.**
  - Caso: Se abre el piso incorrecto.
  - Aceptación: Puede volver o elegir otro nivel sin
    reiniciar todo.

- **58.08. Registra confusiones reales durante la
  revisión.**
  - Caso: Una persona no entiende una etiqueta.
  - Aceptación: Ajusta texto y jerarquía antes de añadir
    más controles.

## 59. Orden de implementación y alcance

**Objetivo:** Construye primero la experiencia principal y
valida por etapas concretas.

- **59.01. Empieza por reproducir los fallos de navegación
  solar.**
  - Caso: El botón no muestra lo esperado.
  - Aceptación: Existe un caso verificable antes de
    modificar visibilidad o cámara.

- **59.02. Unifica la base de consumo antes de rediseñar
  cifras.**
  - Caso: Resumen y solar calculan por caminos distintos.
  - Aceptación: Comparten una fuente consistente antes de
    presentar nuevas tarjetas.

- **59.03. Simplifica los campos principales después de
  definir sus supuestos.**
  - Caso: Hay entradas técnicas obligatorias.
  - Aceptación: El flujo básico conserva solo decisiones
    comprensibles.

- **59.04. Integra el techo y el contador antes de añadir
  efectos.**
  - Caso: El usuario prueba cantidades.
  - Aceptación: La cantidad correcta se ve incluso con
    todas las animaciones desactivadas.

- **59.05. Añade la barra temática y los filtros.**
  - Caso: Ya funcionan edificio, techo e interiores.
  - Aceptación: Las categorías orientan al usuario sin
    duplicar navegación.

- **59.06. Incorpora animaciones y pulido visual al final
  del flujo base.**
  - Caso: La selección y datos son correctos.
  - Aceptación: Los efectos mejoran comprensión y no
    disimulan errores funcionales.

- **59.07. Ejecuta pruebas proporcionadas al cambio.**
  - Caso: Se toca cámara, cálculo o persistencia.
  - Aceptación: Se verifican esos contratos y regresiones
    relacionadas sin baterías repetidas sin motivo.

- **59.08. Conserva tareas ajenas al encargo sin
  modificarlas.**
  - Caso: Existen cambios domésticos previos.
  - Aceptación: La entrega delimita lo nuevo y respeta el
    trabajo existente.

## 60. Entrega, evidencia y definición de terminado

**Objetivo:** Presenta una experiencia local verificable y
distingue claramente lo construido de lo pendiente.

- **60.01. Entrega el proyecto funcionando localmente
  cuando se autorice implementar.**
  - Caso: Finalizan las modificaciones.
  - Aceptación: La ruta empresarial responde y los flujos
    principales pueden revisarse.

- **60.02. Explica dónde encontrar las mejoras.**
  - Caso: El usuario abre la aplicación.
  - Aceptación: Sabe entrar al techo solar, buscar equipos
    y revisar ajustes opcionales.

- **60.03. Incluye capturas reales de los estados
  importantes.**
  - Caso: Se documenta la entrega.
  - Aceptación: Las imágenes
    corresponden a la ejecución y
    no a un montaje ficticio.

- **60.04. Resume pruebas con resultados observados.**
  - Caso: Termina la verificación.
  - Aceptación: Se indican aprobaciones, omisiones y
    límites sin inventar comprobaciones.

- **60.05. Documenta decisiones de UX y fuentes de
  datos.**
  - Caso: Otra persona revisa el trabajo.
  - Aceptación: Comprende ubicación automática, consumo
    del resumen y supuestos avanzados.

- **60.06. Declara limitaciones físicas y técnicas
  pertinentes.**
  - Caso: No hay medidas reales o hardware conectado.
  - Aceptación: El producto no promete una instalación
    certificada ni control que no existe.

- **60.07. Conserva publicación y commits según la
  autorización vigente.**
  - Caso: Solo se pidió una implementación local.
  - Aceptación: El resultado permanece revisable sin
    publicar cambios por iniciativa propia.

- **60.08. Cierra con un recorrido breve de aceptación.**
  - Caso: El usuario desea evaluar la mejora.
  - Aceptación: Puede abrir su edificio, probar paneles y
    encontrar sus equipos sin introducir datos técnicos
    obligatorios.

