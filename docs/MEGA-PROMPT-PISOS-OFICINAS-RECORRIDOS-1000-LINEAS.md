## 01 · Encargo y experiencia que quiero construir

- **Visión.**
  Mejora KWH Empresarial para configurar pisos por cantidad y tipo de espacios.
  Criterio de aceptación: La persona describe su empresa sin diseñar un plano desde cero.

- **Caso principal.**
  Permite indicar cuatro oficinas y un lobby en el Piso 3.
  Criterio de aceptación: Genera cinco espacios distintos dentro del tercer piso.

- **Interacción.**
  Permite seleccionar espacios en la escena, lista y miniatura de planta.
  Criterio de aceptación: Todas las representaciones mantienen la misma selección.

- **Recorrido.**
  Ofrece un recorrido automático por oficinas y zonas del piso.
  Criterio de aceptación: La persona controla inicio, pausa, avance y salida.

- **Análisis.**
  Explica qué espacio consume más y qué equipos contribuyen al resultado.
  Criterio de aceptación: La explicación se calcula con datos del inventario.

- **Identidad.**
  Conserva el diseño amarillo y el lenguaje visual del doméstico.
  Criterio de aceptación: No aparece una nueva interfaz empresarial azul.

- **Acceso.**
  Mantén /empresarial fuera de toda navegación doméstica.
  Criterio de aceptación: La ruta sigue siendo accesible escribiendo su dirección.

- **Trabajo solicitado.**
  Implementa un flujo completo sobre el proyecto existente.
  Criterio de aceptación: No entregues únicamente un render o una maqueta estática.

- **Orden espacial.**
  Propón una distribución razonable aunque el usuario no tenga un plano.
  Criterio de aceptación: El orden inicial no bloquea el registro de la empresa.

- **Honestidad.**
  Presenta el plano como distribución esquemática configurable.
  Criterio de aceptación: No lo describas como réplica exacta del edificio.

- **Compatibilidad.**
  Preserva inventarios, medidores y distribuciones existentes.
  Criterio de aceptación: No regeneres edificios guardados sin revisión del usuario.

- **Prioridad.**
  Corrige la transición entre pisos antes de añadir recorridos complejos.
  Criterio de aceptación: La nueva automatización parte de una navegación estable.

## 02 · Diagnóstico actual y reproducción de animaciones

- **Fuente actual.**
  Revisa empresarial.js, enterprise-glb.src.js y enterprise-layout.js.
  Criterio de aceptación: No diagnostiques usando una versión anterior del visor.

- **Evolución existente.**
  Reconoce la composición modular y los pisos ya presentes en el código.
  Criterio de aceptación: No reconstruyas funciones que ya estén implementadas correctamente.

- **Fallo reportado.**
  Reproduce cambios entre Piso 1 y Piso 2 en ambos sentidos.
  Criterio de aceptación: Describe el fallo observado y las condiciones de reproducción.

- **Secuencia rápida.**
  Alterna Piso 1, Piso 2 y Piso 3 antes de terminar las transiciones.
  Criterio de aceptación: La vista termina siempre en la última selección.

- **Offset vertical.**
  Comprueba coordenadas locales y posición global de cada piso.
  Criterio de aceptación: La cámara y sus equipos usan la altura correcta.

- **Estado visual.**
  Revisa selección, aislamiento, apertura y separación de pisos.
  Criterio de aceptación: No se hereda una apertura incompatible del piso anterior.

- **Clones.**
  Inspecciona materiales, transformaciones y acciones de módulos clonados.
  Criterio de aceptación: Cambiar un piso no modifica accidentalmente otro.

- **Actualizaciones.**
  Comprueba si refrescar cálculos reconstruye el visor o reinicia la cámara.
  Criterio de aceptación: Una edición numérica no dispara viajes de cámara no solicitados.

- **Geometría activa.**
  Verifica qué módulo usa cada piso con o sin distribución guardada.
  Criterio de aceptación: La escena real y la alternativa se identifican correctamente.

- **Animación existente.**
  Identifica si se usan clips GLB, interpolaciones propias o ambos.
  Criterio de aceptación: No supongas que todo el movimiento viene de Blender.

- **Evidencia.**
  Guarda capturas o una grabación de los pasos reproducibles.
  Criterio de aceptación: No declares un error corregido sin repetir su secuencia.

- **Regresión.**
  Incluye una comprobación dirigida al defecto realmente encontrado.
  Criterio de aceptación: La comprobación falla con el defecto y pasa con la corrección.

## 03 · Asistente para definir qué contiene un piso

- **Punto de entrada.**
  Añade Configurar espacios al crear o abrir un piso.
  Criterio de aceptación: Se encuentra sin explorar menús técnicos.

- **Paso inicial.**
  Pregunta qué tipos de espacios tiene ese piso.
  Criterio de aceptación: Ofrece oficinas, gerencia, reunión, lobby y tipos personalizados.

- **Cantidades.**
  Solicita una cantidad por tipo seleccionado.
  Criterio de aceptación: Cuatro oficinas significan cuatro entidades de oficina.

- **Lobby opcional.**
  Permite añadir lobby o recepción con un interruptor claro.
  Criterio de aceptación: No crea un lobby si la persona lo desactiva.

- **Circulación.**
  Distingue el lobby registrado de un corredor visual de circulación.
  Criterio de aceptación: No cuenta un corredor decorativo como una oficina adicional.

- **Resumen previo.**
  Muestra cuatro oficinas y un lobby, cinco espacios en total.
  Criterio de aceptación: La suma de categorías coincide con los espacios a crear.

- **Nombres.**
  Genera Oficina 1, Oficina 2 y nombres equivalentes editables.
  Criterio de aceptación: Cambiar un nombre no cambia su identidad ni categoría.

- **Dimensiones opcionales.**
  Permite indicar ancho y fondo si se conocen.
  Criterio de aceptación: La persona puede continuar con una referencia ilustrativa explícita.

- **Tamaño relativo.**
  Ofrece compacto, estándar y amplio por tipo de espacio.
  Criterio de aceptación: La elección modifica el reparto visual y no el consumo.

- **Inventario posterior.**
  Permite generar espacios primero y añadir equipos después.
  Criterio de aceptación: Los nuevos espacios aparecen sin datos de consumo.

- **Vista previa.**
  Muestra la planta propuesta antes de guardar.
  Criterio de aceptación: No escribe cambios permanentes con solo cambiar un selector.

- **Confirmación.**
  Guarda en conjunto la estructura y su distribución aceptada.
  Criterio de aceptación: Un error no deja la mitad de oficinas creadas.

## 04 · Tipos de espacio y plantillas empresariales

- **Oficina individual.**
  Ofrece una plantilla de espacio para trabajo individual.
  Criterio de aceptación: Su mobiliario es decorativo hasta registrar equipos eléctricos.

- **Oficina compartida.**
  Permite indicar puestos de trabajo como dato opcional.
  Criterio de aceptación: No transforma puestos en computadores sin confirmación.

- **Gerencia.**
  Admite sala de gerencia como nombre y tipo de uso.
  Criterio de aceptación: No le atribuye mayor consumo por su etiqueta.

- **Sala de reuniones.**
  Ofrece espacio con mesa y distribución visual adecuada.
  Criterio de aceptación: Los equipos opcionales se añaden explícitamente al inventario.

- **Lobby.**
  Representa recepción y espera con una zona reconocible.
  Criterio de aceptación: Se puede seleccionar como cualquier otro espacio.

- **Cubículos.**
  Permite una distribución abierta con subdivisiones visuales.
  Criterio de aceptación: Aclara si los cubículos son espacios independientes o mobiliario.

- **Zona técnica.**
  Incluye sala de servidores o equipos técnicos como tipo configurable.
  Criterio de aceptación: No cambia automáticamente la condición esencial de sus aparatos.

- **Otros usos.**
  Permite cocina, descanso, archivo o nombre libre.
  Criterio de aceptación: El usuario no queda limitado a empresas de oficinas.

- **Plantilla vacía.**
  Ofrece generación sin mobiliario ilustrativo.
  Criterio de aceptación: Los datos siguen siendo editables aunque no haya decoración.

- **Plantilla de ejemplo.**
  Ofrece un ejemplo completo identificado como demostración.
  Criterio de aceptación: No mezcla sus equipos con el inventario real.

- **Reutilización.**
  Permite aplicar una configuración de tipos a otro piso.
  Criterio de aceptación: Previsualiza cantidades y genera identificadores nuevos.

- **Separación de conceptos.**
  Mantén independientes tipo, nombre, posición e inventario.
  Criterio de aceptación: Renombrar Gerencia como Oficina no reemplaza sus equipos.

## 05 · Generación automática de planta

- **Entrada del generador.**
  Recibe perímetro útil, tipos, cantidades y restricciones.
  Criterio de aceptación: Usa una estructura de datos validada y reproducible.

- **Salida del generador.**
  Devuelve regiones, aberturas y circulación cuando corresponda.
  Criterio de aceptación: Cada espacio generado tiene identidad y geometría válidas.

- **Caso cuatro oficinas.**
  Divide el piso en cuatro oficinas y un lobby opcional.
  Criterio de aceptación: Las cinco regiones caben dentro del perímetro.

- **Caso dos oficinas.**
  Genera dos oficinas con proporciones legibles.
  Criterio de aceptación: No conserva cuatro cuartos vacíos del activo original.

- **Caso seis oficinas.**
  Distribuye seis oficinas sin volver al modelo fijo de cuatro salas.
  Criterio de aceptación: El visor mantiene selección y etiquetas correctas.

- **Áreas relativas.**
  Reparte superficie según tamaños relativos elegidos.
  Criterio de aceptación: Las oficinas amplias obtienen más superficie disponible.

- **Acceso visual.**
  Reserva circulación sencilla cuando la plantilla la requiera.
  Criterio de aceptación: No dibuja habitaciones totalmente aisladas sin entrada.

- **Solapamientos.**
  Comprueba intersecciones entre regiones y límites del piso.
  Criterio de aceptación: Rechaza una propuesta inválida antes de guardarla.

- **Espacio insuficiente.**
  Explica cuándo cantidades y tamaños no caben.
  Criterio de aceptación: Ofrece reducir tamaño o cantidad sin deformar silenciosamente.

- **Propuesta determinista.**
  Mantén resultado estable con los mismos parámetros y versión.
  Criterio de aceptación: Recargar no redistribuye aleatoriamente las oficinas.

- **Variantes.**
  Ofrece unas pocas distribuciones alternativas opcionales.
  Criterio de aceptación: Elegir una variante cambia solo el borrador visual.

- **Límite de precisión.**
  Documenta que el resultado organiza datos y no certifica arquitectura.
  Criterio de aceptación: No implica accesibilidad física o evacuación reglamentaria.

## 06 · Regleta, miniatura de planta y selección rápida

- **Regleta de pisos.**
  Coloca un selector visible con Piso 1, Piso 2 y Piso 3.
  Criterio de aceptación: Se cambia de nivel con un clic o teclado.

- **Regleta de espacios.**
  Muestra fichas del piso activo con nombre y tipo.
  Criterio de aceptación: No mezcla oficinas de otros pisos.

- **Miniatura de planta.**
  Añade un plano pequeño con recuadros seleccionables.
  Criterio de aceptación: Permite reconocer dónde está la oficina elegida.

- **Correspondencia.**
  Usa el mismo identificador en plano, regleta, modelo y panel.
  Criterio de aceptación: Seleccionar Oficina 3 destaca una única entidad.

- **Ubicación activa.**
  Muestra Estás en Piso 3 > Oficina 2.
  Criterio de aceptación: El contexto permanece visible durante el recorrido.

- **Contenido breve.**
  Incluye equipos y unidades en el resumen de cada ficha.
  Criterio de aceptación: No obliga a abrir un formulario para conocer su contenido.

- **Consumo breve.**
  Muestra kWh del espacio con estado de cobertura.
  Criterio de aceptación: Sin datos aparece explícito y no como cero.

- **Muchos espacios.**
  Permite buscar y desplazar la regleta sin comprimirla indefinidamente.
  Criterio de aceptación: Un nombre sigue siendo legible con doce oficinas.

- **Selección accesible.**
  Usa botones HTML con nombre y estado seleccionado.
  Criterio de aceptación: La función no depende de acertar un píxel del modelo.

- **Leyenda espacial.**
  Distingue lobby, oficinas y circulación sin depender solo del color.
  Criterio de aceptación: Las etiquetas explican el tipo de área.

- **Volver al conjunto.**
  Incluye Ver todo el piso junto al detalle.
  Criterio de aceptación: La cámara recupera una vista útil sin perder el piso activo.

- **Datos cambiantes.**
  Actualiza regleta y miniatura al crear o borrar espacios.
  Criterio de aceptación: No conserva botones que apuntan a entidades eliminadas.

## 07 · Interior 3D adaptable a la planta generada

- **Arquitectura dinámica.**
  Construye suelo y límites desde las regiones guardadas.
  Criterio de aceptación: La geometría corresponde a la propuesta aceptada.

- **Activos Blender.**
  Reutiliza modelos de mobiliario y equipos donde aporten calidad.
  Criterio de aceptación: No impongas las cuatro habitaciones fijas del GLB.

- **Jerarquía.**
  Organiza edificio, piso, espacio y equipo con identificadores únicos.
  Criterio de aceptación: El raycast resuelve correctamente cada nivel.

- **Paredes de corte.**
  Retira o reduce paredes que oculten el interior activo.
  Criterio de aceptación: Las oficinas se ven al entrar al piso.

- **Cubierta.**
  Abre u oculta cubierta de forma coherente por nivel.
  Criterio de aceptación: El techo del piso superior no tapa el detalle seleccionado.

- **Puertas.**
  Representa accesos según la distribución elegida.
  Criterio de aceptación: No coloca puertas detrás de grandes equipos por defecto.

- **Mobiliario relativo.**
  Distribuye mesas y sillas según tamaño de la región.
  Criterio de aceptación: No sobresalen de una oficina pequeña.

- **Geometría compartida.**
  Reutiliza mallas para equipos repetidos.
  Criterio de aceptación: La escena no duplica archivos pesados por oficina.

- **Calidad visual.**
  Mantén materiales cuidados, bordes suaves e iluminación legible.
  Criterio de aceptación: No convierte la edición de planta en bloques sin terminar.

- **Enfoque.**
  Calcula cámara usando la región visible del espacio activo.
  Criterio de aceptación: No incluye cubiertas apartadas en el encuadre interior.

- **Cambios guardados.**
  Reconstruye solo lo necesario después de editar distribución.
  Criterio de aceptación: No pierde controles ni selecciona otro piso.

- **Alternativa.**
  Ofrece planta 2D completa si WebGL falla.
  Criterio de aceptación: La persona conserva consulta y edición de sus datos.

## 08 · Inventario por oficina y cantidades visibles

- **Inventario propio.**
  Cada oficina conserva su lista independiente de equipos.
  Criterio de aceptación: Agregar un aire no lo añade a todas las oficinas.

- **Cuatro aires.**
  Permite registrar cuatro unidades iguales con potencia por unidad.
  Criterio de aceptación: La cantidad total y el consumo coinciden.

- **Tres luminarias.**
  Permite registrar tres focos con uso y factor propios.
  Criterio de aceptación: La iluminación aparece como categoría reconocible.

- **Unidades distintas.**
  Ofrece registros separados si los aires tienen potencia u horario diferentes.
  Criterio de aceptación: No fuerza valores comunes a unidades diferentes.

- **Equipos conocidos.**
  Muestra computadores, proyectores, impresoras y refrigeración con proxies.
  Criterio de aceptación: Cada proxy está vinculado a su registro real.

- **Datos incompletos.**
  Permite completar potencia u horario posteriormente.
  Criterio de aceptación: El panel marca la estimación como parcial.

- **Cantidad geométrica.**
  Representa pocas unidades individualmente y grandes cantidades por grupos.
  Criterio de aceptación: El agrupamiento muestra un contador claro.

- **Posición inicial.**
  Coloca luminarias, aires y equipos en lugares razonables.
  Criterio de aceptación: No superpone climatización y pantalla de reuniones.

- **Selección de aparato.**
  Al seleccionar un equipo muestra unidades, uso y aporte.
  Criterio de aceptación: La selección también está disponible desde una lista.

- **Cambiar inventario.**
  Actualiza visualización, conteos y cálculos al guardar.
  Criterio de aceptación: No conserva instancias sobrantes tras reducir cantidad.

- **Decoración separada.**
  No contabiliza mesas, sillas ni plantas como equipos eléctricos.
  Criterio de aceptación: Los objetos decorativos no alteran el consumo.

- **Resumen humano.**
  Muestra frases como 2 aires, 6 luminarias y 4 computadores.
  Criterio de aceptación: Los conteos derivan de cantidades y no del número de mallas.

## 09 · Recorrido automático del piso

- **Inicio explícito.**
  Añade Recorrer este piso como acción visible.
  Criterio de aceptación: No mueve la cámara automáticamente mientras se edita.

- **Ruta inicial.**
  Construye paradas sobre los espacios existentes del piso.
  Criterio de aceptación: No incluye oficinas inexistentes del ejemplo GLB.

- **Orden flexible.**
  Permite orden espacial o lista de espacios seleccionados.
  Criterio de aceptación: El usuario no necesita establecer un orden para empezar.

- **Primera parada.**
  Muestra el piso completo antes de acercarse a una oficina.
  Criterio de aceptación: La persona entiende la ubicación del recorrido.

- **Parada de oficina.**
  Enfoca la oficina y muestra nombre, equipos y consumo.
  Criterio de aceptación: La información corresponde a la parada actual.

- **Lobby.**
  Incluye o excluye lobby según preferencia del recorrido.
  Criterio de aceptación: La elección no elimina el espacio del edificio.

- **Duración.**
  Permite una velocidad de recorrido razonable y configurable.
  Criterio de aceptación: El texto se puede leer antes de cambiar de parada.

- **Pausa.**
  Mantiene posición y panel al pausar.
  Criterio de aceptación: Reanudar continúa desde esa parada.

- **Anterior y siguiente.**
  Ofrece controles para cambiar de parada manualmente.
  Criterio de aceptación: Los botones funcionan también con teclado.

- **Finalización.**
  Termina con una vista del piso y un resumen del recorrido.
  Criterio de aceptación: No reinicia en bucle sin autorización.

- **Salir.**
  Incluye Salir del recorrido siempre visible.
  Criterio de aceptación: Restaura un estado estable y conserva el espacio seleccionado.

- **Sin movimiento.**
  Ofrece recorrido por tarjetas o cambios instantáneos con movimiento reducido.
  Criterio de aceptación: Todas las paradas siguen disponibles.

## 10 · Recorrido por oficina y presentación de su contenido

- **Explorar oficina.**
  Ofrece un recorrido corto del espacio seleccionado.
  Criterio de aceptación: No obliga a recorrer todo el edificio.

- **Vista inicial.**
  Presenta un ángulo amplio con límites y entrada del espacio.
  Criterio de aceptación: La persona reconoce la oficina antes de ver equipos.

- **Puntos de interés.**
  Crea paradas por categorías o grupos relevantes de equipos.
  Criterio de aceptación: No realiza una parada por cada foco si son cientos.

- **Climatización.**
  Enfoca el grupo de aires y expone cantidad y aporte estimado.
  Criterio de aceptación: No afirma que estén encendidos en tiempo real.

- **Iluminación.**
  Muestra luminarias y parámetros de uso registrados.
  Criterio de aceptación: Aclara si faltan potencia u horas.

- **Informática.**
  Presenta equipos informáticos con resumen por categoría.
  Criterio de aceptación: Los equipos pausados se distinguen de los activos.

- **Panel persistente.**
  Mantiene los detalles legibles mientras la cámara se mueve.
  Criterio de aceptación: No desaparecen antes de poder consultarlos.

- **Modos.**
  Ofrece vista de maqueta y detalle cercano como opciones.
  Criterio de aceptación: No obliga a una cámara inmersiva que atraviese paredes.

- **Trayectoria.**
  Usa puntos de cámara seguros que eviten cruzar geometría.
  Criterio de aceptación: Si no hay trayectoria válida, cambia mediante transición corta.

- **Interacción manual.**
  Permite tocar un equipo para consultar su ficha.
  Criterio de aceptación: La acción pausa o termina el recorrido de forma explícita.

- **Retorno.**
  Incluye volver a la planta y volver al edificio.
  Criterio de aceptación: Ambas acciones conservan el piso correcto.

- **Datos ausentes.**
  Recorre el espacio aunque no tenga consumo calculable.
  Criterio de aceptación: Explica qué falta sin inventar cifras.

## 11 · Control de animaciones y navegación entre pisos

- **Estado único.**
  Centraliza nivel, piso, espacio, equipo y modo de recorrido.
  Criterio de aceptación: Panel y visor no mantienen selecciones incompatibles.

- **Transición cancelable.**
  Cancela la animación anterior al solicitar otro destino.
  Criterio de aceptación: No se ejecutan dos viajes de cámara simultáneos.

- **Última acción.**
  Da prioridad a la última selección del usuario.
  Criterio de aceptación: Cambiar rápido termina en el piso solicitado al final.

- **Piso independiente.**
  Guarda apertura y transformaciones por módulo cuando corresponda.
  Criterio de aceptación: Abrir Piso 2 no desplaza la fachada del Piso 1.

- **Coordenadas.**
  Distingue posición local del cuarto y altura global del piso.
  Criterio de aceptación: El enfoque del tercer piso no apunta a la planta baja.

- **Restauración.**
  Reinicia elementos retirados al salir de una vista interior.
  Criterio de aceptación: No aparecen techos y paredes flotantes en el siguiente piso.

- **Carga asíncrona.**
  Ignora resultados de carga que ya no correspondan al destino activo.
  Criterio de aceptación: Una carga lenta no devuelve al piso anterior.

- **Edición durante viaje.**
  Pausa el recorrido al abrir un formulario.
  Criterio de aceptación: La cámara no se desplaza mientras se completan datos.

- **Borrado de parada.**
  Gestiona espacios eliminados durante un recorrido.
  Criterio de aceptación: Recalcula paradas o termina con un mensaje comprensible.

- **Actualización de cálculo.**
  Refresca valores sin reiniciar la trayectoria activa.
  Criterio de aceptación: Un cambio de etiqueta no salta la cámara al exterior.

- **Recursos.**
  Limpia listeners, temporizadores, mezcladores y bucles al salir.
  Criterio de aceptación: Los recorridos no se siguen ejecutando ocultos.

- **Verificación.**
  Prueba exterior, Piso 1, Piso 2, oficina, recorrido y regreso.
  Criterio de aceptación: No quedan estados visuales inconsistentes tras repetir la secuencia.

## 12 · Qué consume más y por qué

- **Pregunta principal.**
  Incluye Qué consume más en este piso como vista visible.
  Criterio de aceptación: La respuesta identifica espacios y categorías con sus cifras.

- **Ejemplo gerencia.**
  Si Gerencia tiene dos aires, calcula su aporte desde potencia y uso.
  Criterio de aceptación: No concluye que gana solo por el nombre o cantidad.

- **Ranking de espacios.**
  Ordena los espacios por kWh estimados conocidos.
  Criterio de aceptación: Advierte si la cobertura incompleta altera la comparación.

- **Ranking de categorías.**
  Desglosa climatización, iluminación e informática.
  Criterio de aceptación: Las categorías suman el total conocido sin duplicados.

- **Explicación concreta.**
  Explica la contribución de los principales equipos del espacio.
  Criterio de aceptación: Se puede abrir el cálculo que respalda la frase.

- **Participación.**
  Muestra porcentaje con denominador y alcance explícitos.
  Criterio de aceptación: No calcula porcentajes cuando el total es desconocido o cero.

- **Comparación justa.**
  Usa el mismo periodo y método al comparar oficinas.
  Criterio de aceptación: Distingue mediciones de estimaciones por inventario.

- **Cantidad y uso.**
  Explica que potencia, horas, días y factor afectan el resultado.
  Criterio de aceptación: No usa cantidad de aparatos como único criterio.

- **Etiquetas parciales.**
  Si falta información, escribe mayor consumo conocido o equivalente.
  Criterio de aceptación: No presenta un ranking incompleto como conclusión definitiva.

- **Localizar.**
  Permite ir desde una barra del ranking al cuarto correspondiente.
  Criterio de aceptación: La cámara y el panel seleccionan el mismo espacio.

- **Detalle compartido.**
  Muestra servicios comunes aparte cuando estén registrados.
  Criterio de aceptación: No atribuye todo el lobby a una oficina vecina.

- **Trazabilidad.**
  Vincula cada explicación con registros y supuestos actuales.
  Criterio de aceptación: No genera narraciones de ahorro o causalidad sin datos.

## 13 · Gráficas y recorrido del consumo

- **Barras por oficina.**
  Añade una gráfica del piso con nombre y kWh por espacio.
  Criterio de aceptación: Incluye una tabla equivalente accesible.

- **Desglose interior.**
  Al elegir una oficina muestra su reparto por categoría.
  Criterio de aceptación: La suma coincide con su subtotal conocido.

- **Conteos.**
  Muestra espacios, líneas de inventario y unidades como métricas distintas.
  Criterio de aceptación: Cuatro aires en una línea cuentan cuatro unidades.

- **Recorrido analítico.**
  Ofrece recorrer mayores consumidores como modo opcional.
  Criterio de aceptación: Ordena según la métrica seleccionada y datos válidos.

- **Paradas explicativas.**
  En cada parada muestra por qué destaca ese espacio.
  Criterio de aceptación: La explicación incluye equipos y parámetros relevantes.

- **Normalización.**
  Ofrece por m² o por puesto solo si existen datos adecuados.
  Criterio de aceptación: No inventa superficie real a partir de una maqueta ilustrativa.

- **Costo.**
  Permite alternar kWh y costo con tarifa configurada.
  Criterio de aceptación: Sin tarifa no muestra costo cero.

- **Periodo.**
  Mantiene visible el periodo o escenario de cálculo.
  Criterio de aceptación: No etiqueta el inventario mensual como lectura instantánea.

- **Cobertura.**
  Muestra número de equipos completos e incompletos.
  Criterio de aceptación: La vista ayuda a decidir qué datos conviene completar.

- **Selección cruzada.**
  Sincroniza gráfica, miniatura, lista y modelo.
  Criterio de aceptación: No requiere buscar de nuevo el espacio en otra sección.

- **Escala visual.**
  Permite comparar con una escala fija cuando corresponda.
  Criterio de aceptación: La leyenda informa cuándo la escala es relativa al piso.

- **Acción posterior.**
  Permite abrir el simulador con el equipo o espacio seleccionado.
  Criterio de aceptación: El escenario no cambia inventario al iniciar.

## 14 · Persistencia, edición y regeneración segura

- **Borrador.**
  Mantén la propuesta de distribución separada de lo guardado.
  Criterio de aceptación: Cancelar conserva el piso original.

- **Regenerar.**
  Permite generar otra distribución sin borrar inventario.
  Criterio de aceptación: Presenta qué espacios se conservan o cambian.

- **Más oficinas.**
  Al pasar de cuatro a cinco, crea solo lo necesario.
  Criterio de aceptación: No recrea las cuatro entidades existentes sin motivo.

- **Menos oficinas.**
  Al reducir cantidad pregunta qué hacer con espacios y dependencias sobrantes.
  Criterio de aceptación: No elimina equipos o lecturas silenciosamente.

- **Mapeo explícito.**
  Mantén identidad de oficina aunque cambie orden o posición.
  Criterio de aceptación: Las mediciones siguen perteneciendo a su entidad original.

- **Aplicar plantilla.**
  Distingue estructura vacía de copia con inventario.
  Criterio de aceptación: No copia mediciones históricas al duplicar un piso.

- **Vista previa de impacto.**
  Muestra altas, movimientos y eliminaciones antes de confirmar.
  Criterio de aceptación: El alcance de la operación es revisable.

- **Transacción.**
  Guarda espacios y layout de forma atómica.
  Criterio de aceptación: Un error revierte toda la operación.

- **Concurrencia.**
  Incluye revisión del edificio al aplicar una propuesta.
  Criterio de aceptación: Un conflicto obliga a revisar antes de sobrescribir.

- **Deshacer.**
  Integra la generación y cambios de distribución con el sistema existente.
  Criterio de aceptación: La reversión respeta cambios posteriores y dependencias.

- **Copias.**
  Incluye parámetros y resultado del generador en el formato versionado.
  Criterio de aceptación: Importar conserva la planta sin reutilizar identificadores como permisos.

- **Recuperación.**
  Restaura configuración, distribución y selección válida tras recargar.
  Criterio de aceptación: No reactiva automáticamente un recorrido que el usuario no pidió.

## 15 · Modelo de datos y conexión con la implementación

- **Estado existente.**
  Inspecciona las entidades actuales antes de añadir columnas.
  Criterio de aceptación: Reutiliza relaciones y controles ya implementados.

- **Configuración del generador.**
  Guarda versión, tipos, cantidades y parámetros necesarios.
  Criterio de aceptación: Permite explicar cómo se obtuvo la distribución.

- **Resultado persistente.**
  Guarda posiciones y dimensiones aceptadas por espacio.
  Criterio de aceptación: Una nueva versión del algoritmo no cambia plantas antiguas.

- **Identificadores.**
  Usa claves de empresa, edificio, piso, espacio y equipo.
  Criterio de aceptación: No vincula elementos por nombre o índice del array.

- **Recorrido derivado.**
  Calcula paradas desde entidades actuales y guarda preferencias si hace falta.
  Criterio de aceptación: No persiste referencias inválidas a objetos temporales de three.js.

- **Tipos editables.**
  Valida nombres personalizados y enumera categorías conocidas.
  Criterio de aceptación: El servidor rechaza textos y tamaños fuera de límites.

- **Dimensiones.**
  Distingue medidas declaradas de dimensiones ilustrativas.
  Criterio de aceptación: La interfaz y las exportaciones conservan esa procedencia.

- **API de propuesta.**
  Si añades endpoint de generación, define contrato y validación.
  Criterio de aceptación: Una propuesta no escribe datos hasta confirmación.

- **Operación de aplicar.**
  Valida relaciones y layout en el servidor.
  Criterio de aceptación: No confía en la validez de la previsualización del navegador.

- **Migraciones.**
  Añade migraciones incrementales solo si el esquema lo necesita.
  Criterio de aceptación: No borra tablas para introducir el asistente.

- **Fuente empaquetada.**
  Modifica fuente del visor y regenera el bundle con el script existente.
  Criterio de aceptación: No edita únicamente el JavaScript minificado.

- **Sin dependencias remotas.**
  Mantén recursos compatibles con CSP y servidor local.
  Criterio de aceptación: El asistente y los recorridos funcionan sin CDN.

## 16 · Casos de aceptación y entrega de esta etapa

- **Caso uno.**
  Crea Piso 1 con dos oficinas y sin lobby.
  Criterio de aceptación: La planta, regleta, modelo y panel muestran dos oficinas.

- **Caso dos.**
  Crea Piso 2 con tres oficinas y una recepción.
  Criterio de aceptación: Cada espacio se puede seleccionar de forma independiente.

- **Caso tres.**
  Crea Piso 3 con cuatro oficinas y un lobby.
  Criterio de aceptación: El resultado tiene cinco espacios y distribución válida.

- **Caso seis.**
  Prueba un piso con seis oficinas.
  Criterio de aceptación: No se limita a las cuatro habitaciones del activo Blender.

- **Caso gerencia.**
  Registra dos aires con potencia y uso conocidos en Gerencia.
  Criterio de aceptación: Su contribución aparece en gráfica y explicación calculada.

- **Caso desconocido.**
  Deja un espacio con potencia desconocida.
  Criterio de aceptación: Muestra cobertura parcial y no inventa su posición en el ranking.

- **Caso recorrido.**
  Inicia, pausa, retrocede, avanza y sale del recorrido.
  Criterio de aceptación: No pierde el contexto ni bloquea controles manuales.

- **Caso animación.**
  Alterna rápidamente pisos y entra a una oficina durante la transición.
  Criterio de aceptación: El destino final y sus datos son correctos.

- **Caso persistencia.**
  Guarda, recarga y vuelve a entrar al Piso 3.
  Criterio de aceptación: Conserva distribución, inventario y asociaciones.

- **Caso accesible.**
  Repite configuración y selección usando teclado y movimiento reducido.
  Criterio de aceptación: La experiencia completa funciona sin arrastre ni animaciones.

- **Evidencia final.**
  Entrega capturas y comprobaciones de estos casos con resultados reales.
  Criterio de aceptación: No declara aprobación si una prueba se omite o no se ejecutó.

- **Arranque.**
  Deja /empresarial disponible localmente y documenta límites restantes.
  Criterio de aceptación: No publiques, no hagas push y conserva la navegación doméstica.

## 17 · Identidad amarilla y sistema visual

- **Amarillo principal.**
  Usa #ffd535 como acento principal y valida sus variantes domésticas.
  Criterio de aceptación: Botones primarios y destacados conservan identidad KWH.

- **Fondo.**
  Parte de #f7f8f4 y superficies blancas del área doméstica.
  Criterio de aceptación: El espacio empresarial se siente parte del mismo producto.

- **Texto.**
  Reutiliza tinta #20251e y grises compatibles de la interfaz actual.
  Criterio de aceptación: La lectura es clara sobre fondos claros y amarillos.

- **Fuente.**
  Usa la familia Segoe UI y system-ui existente o su definición efectiva.
  Criterio de aceptación: No aparece una tipografía empresarial ajena sin justificación.

- **Escala.**
  Adapta tamaños domésticos a tablas y paneles empresariales.
  Criterio de aceptación: La densidad crece sin volver diminutos los textos.

- **Tarjetas.**
  Hereda bordes suaves, radios y espaciado del dashboard doméstico.
  Criterio de aceptación: Las tarjetas parecen componentes de la misma familia.

- **Acciones.**
  Usa amarillo para acciones principales con texto de buen contraste.
  Criterio de aceptación: No conviertas todos los elementos en focos de atención.

- **Menú activo.**
  Reproduce el fondo amarillo suave y señal de sección activa.
  Criterio de aceptación: El usuario identifica dónde está sin depender solo del color.

- **Iconos.**
  Mantén un sistema consistente de iconos con etiquetas.
  Criterio de aceptación: No mezcles emojis decorativos con controles profesionales.

- **Tokens.**
  Extrae o comparte tokens sin filtrar reglas globales a la app doméstica.
  Criterio de aceptación: El cambio empresarial no modifica la presentación doméstica.

- **Tema automático.**
  Evita que el modo oscuro actual vuelva azul la identidad por defecto.
  Criterio de aceptación: Cualquier tema adicional conserva los acentos amarillos.

- **Comparación visual.**
  Captura ambas experiencias a igual ancho antes y después.
  Criterio de aceptación: Se verifica parentesco visual y ausencia de regresiones.

## 18 · Cálculos, cobertura y datos temporales

- **Fórmula base.**
  Conserva W × cantidad × horas × días × factor / 1000.
  Criterio de aceptación: Cliente y servidor producen el mismo resultado.

- **Métodos excluyentes.**
  Separa potencia/uso de kWh conocidos por unidad.
  Criterio de aceptación: No suma ambos métodos para el mismo equipo.

- **Desconocidos.**
  Excluye valores desconocidos sin convertirlos en ceros medidos.
  Criterio de aceptación: Muestra cuántos equipos afectan la cobertura.

- **Agregación.**
  Suma equipo, espacio, piso, edificio y organización sin duplicados.
  Criterio de aceptación: Cada registro contribuye una sola vez a cada nivel.

- **Mediciones jerárquicas.**
  No suma un medidor general y sus submedidores como consumos independientes.
  Criterio de aceptación: Representa relaciones y posibles solapamientos.

- **Consumo común.**
  Admite servicios compartidos del edificio con alcance explícito.
  Criterio de aceptación: No distribuye ascensores o pasillos arbitrariamente.

- **Periodo comparable.**
  Normaliza comparaciones por duración cuando proceda.
  Criterio de aceptación: No compara dos facturas de diferente duración como si fueran iguales.

- **Redondeo.**
  Calcula con precisión interna y redondea al presentar.
  Criterio de aceptación: Las diferencias de presentación se explican si son relevantes.

- **Tarifa.**
  Guarda fuente, unidad, fecha y alcance del precio.
  Criterio de aceptación: No usa una referencia histórica como tarifa vigente verificada.

- **Proyección simple.**
  Explica datos, método, horizonte y límites de extrapolación.
  Criterio de aceptación: No afirma predicción avanzada por tener dos registros.

- **Incertidumbre.**
  Muestra información insuficiente cuando el historial no sostiene el método.
  Criterio de aceptación: No inventa bandas de confianza estadísticas.

- **Consistencia temporal.**
  Versiona o conserva supuestos relevantes cuando cambien.
  Criterio de aceptación: Una factura histórica no se recalcula silenciosamente con tarifa actual.

## 19 · Datos, seguridad y persistencia empresarial

- **Modelo actual.**
  Revisa tablas y migración 002 antes de ampliar.
  Criterio de aceptación: No recrea tablas existentes para solucionar errores.

- **Migraciones.**
  Añade migraciones compatibles para layout, presupuesto o escenarios.
  Criterio de aceptación: Documenta aplicación, copia y efectos de reversión.

- **Organización.**
  Verifica pertenencia en cada lectura y escritura del servidor.
  Criterio de aceptación: No confía en organization_id enviado por el navegador.

- **Roles.**
  Conserva dueño y permisos existentes; define capacidades explícitas.
  Criterio de aceptación: No añade invitaciones o roles decorativos sin flujo completo.

- **Sesiones.**
  Mantén cookies, scrypt, CSRF y validación de origen actuales.
  Criterio de aceptación: El rediseño visual no debilita la autenticación.

- **Revisiones.**
  Usa control de revisión en edición, movimiento y planes.
  Criterio de aceptación: Los conflictos 409 ofrecen recargar o revisar diferencias.

- **Transacciones.**
  Agrupa cambios relacionados de estructura e inventario.
  Criterio de aceptación: Un fallo no deja objetos huérfanos.

- **Validación.**
  Valida cantidades, potencia, periodos, nombres y relaciones en servidor.
  Criterio de aceptación: El frontend no es la única barrera contra datos inválidos.

- **Layouts seguros.**
  Valida posiciones y dimensiones finitas dentro de límites razonables.
  Criterio de aceptación: No acepta NaN, Infinity o escalas que bloqueen el visor.

- **Copias por empresa.**
  Incluye esquema, versión y relaciones empresariales en backups.
  Criterio de aceptación: No mezcla hogares, sesiones ni secretos en el archivo.

- **Restauración.**
  Valida y presenta resumen antes de sustituir datos.
  Criterio de aceptación: No permite importar identificadores de otra organización como permisos.

- **Estado de guardado.**
  Muestra guardando, guardado, conflicto o error con precisión.
  Criterio de aceptación: No anuncia persistencia cuando falla MySQL o almacenamiento local.

## 20 · Rendimiento, accesibilidad y robustez del visor

- **Carga local.**
  Empaqueta three.js y recursos desde el propio servidor.
  Criterio de aceptación: Respeta la CSP sin CDN ni scripts remotos improvisados.

- **Ciclo de vida.**
  Destruye visor, controles, geometrías y materiales cuando corresponda.
  Criterio de aceptación: Navegar repetidamente no acumula contextos WebGL.

- **Render a demanda.**
  Anima solo mientras haya cambios o interacción activa.
  Criterio de aceptación: No mantiene un bucle permanente innecesario.

- **Detalle progresivo.**
  Carga interiores y equipos del piso activo bajo demanda.
  Criterio de aceptación: El edificio completo sigue siendo ligero.

- **Instanciación.**
  Comparte mallas y materiales de equipos repetidos.
  Criterio de aceptación: No duplica memoria por cada luminaria.

- **Teclado.**
  Permite elegir piso, espacio y equipo mediante controles HTML.
  Criterio de aceptación: La navegación no depende de alcanzar geometría diminuta.

- **Rueda.**
  Aclara el gesto de zoom y no atrapa el scroll normal de página.
  Criterio de aceptación: La interacción coincide con la ayuda visible.

- **Foco.**
  Conserva foco al actualizar paneles y diálogos.
  Criterio de aceptación: El usuario de teclado no vuelve al inicio sin motivo.

- **Movimiento reducido.**
  Respeta la preferencia también cuando cambia durante la sesión.
  Criterio de aceptación: Todas las funciones siguen disponibles sin transición.

- **Sin WebGL.**
  Ofrece vista alternativa con datos y explicación del fallo.
  Criterio de aceptación: No llama 3D al reemplazo plano ni oculta el error.

- **Carga fallida.**
  Incluye reintentar y diagnóstico accesible sin datos sensibles.
  Criterio de aceptación: No obliga a recargar toda la aplicación para recuperarse.

- **Pruebas de escala.**
  Mide escenarios de varios pisos y muchos equipos representativos.
  Criterio de aceptación: Informa dispositivo, datos y resultados en vez de prometer FPS universales.

