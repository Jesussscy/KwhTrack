## 01 · Encargo visual y alcance exclusivo

- **Objetivo.**
  Rediseña el apartado del edificio y la demostración de KWH Empresarial.
  Criterio de aceptación: El visor se comprende, se explora y presenta mejor que en las capturas.

- **Trabajo concreto.**
  Implementa una experiencia visual funcional sobre el proyecto actual.
  Criterio de aceptación: No entregues únicamente una propuesta o una imagen conceptual.

- **Alcance.**
  Centra los cambios en edificio, pisos, interiores y sus controles.
  Criterio de aceptación: No amplíes esta etapa a módulos de facturación o administración ajenos.

- **Referencia.**
  Usa las tres capturas del usuario como evidencia visual de partida.
  Criterio de aceptación: Documenta problemas visibles sin inventar comportamientos no observados.

- **Identidad.**
  Conserva la familia visual amarilla del KWH doméstico.
  Criterio de aceptación: El visor parece una parte cuidada del mismo producto.

- **Demostración.**
  Haz que el ejemplo permita entender y probar el edificio.
  Criterio de aceptación: No se limita a mostrar datos dentro de una maqueta difícil de explorar.

- **Calidad.**
  Prioriza proporciones, encuadre, materiales y jerarquía antes de efectos.
  Criterio de aceptación: La escena se entiende también con partículas desactivadas.

- **Funciones actuales.**
  Conserva los datos y funciones empresariales ya implementados.
  Criterio de aceptación: No rehagas módulos estables sin una necesidad demostrable.

- **Navegación doméstica.**
  Mantén la experiencia doméstica sin enlaces empresariales.
  Criterio de aceptación: La ruta empresarial conserva su acceso directo separado.

- **Datos persistentes.**
  No uses cuentas o edificios reales como banco de pruebas visuales.
  Criterio de aceptación: La demostración y los recorridos de prueba quedan aislados.

- **Publicación.**
  Trabaja y entrega localmente sin publicar ni hacer commit.
  Criterio de aceptación: El usuario revisa una versión ejecutable en localhost.

- **Resultado.**
  Entrega una experiencia de edificio coherente de exterior a equipo.
  Criterio de aceptación: Todos los niveles mantienen identidad y contexto.

## 02 · Lectura de las capturas y diagnóstico reproducible

- **Captura exterior.**
  Revisa los módulos separados y la lectura confusa de alturas.
  Criterio de aceptación: Identifica qué corresponde a modo separado y qué es un defecto.

- **Captura interior.**
  Reproduce el techo oscuro que ocupa casi toda la vista del piso.
  Criterio de aceptación: El defecto se comprueba tanto con módulo GLB como generado.

- **Etiquetas sobre techo.**
  Revisa nombres de habitaciones proyectados encima de la cubierta.
  Criterio de aceptación: Las etiquetas no sugieren que el cuarto está en el techo.

- **Miniatura obstruida.**
  Investiga el contorno negro y blanco que tapa Habitación 3C.
  Criterio de aceptación: No atribuyas una causa definitiva solo por la imagen.

- **Foco SVG.**
  Comprueba outline, box-shadow y estilos heredados de :focus-visible.
  Criterio de aceptación: Mantén foco accesible sin deformaciones por escala de SVG.

- **Recorte.**
  Reproduce cámaras que cortan el edificio o acercan demasiado la cubierta.
  Criterio de aceptación: Registra tamaño de viewport y acciones que provocan el problema.

- **Maqueta rígida.**
  Revisa fachadas, ventanas y volúmenes repetidos sin cohesión.
  Criterio de aceptación: Distingue decisiones de estilo de errores de ensamblaje.

- **Estructura densa.**
  Evalúa listas y fichas repetidas bajo el visor.
  Criterio de aceptación: Reduce duplicación sin eliminar navegación accesible.

- **Añadir piso.**
  Comprueba por qué no es evidente o posible en la demostración actual.
  Criterio de aceptación: Distingue restricción de solo lectura de fallo del botón.

- **Animaciones.**
  Revisa apertura GLB y apertura procedural como rutas separadas.
  Criterio de aceptación: No des por corregida una ruta porque la otra funcione.

- **Fuente.**
  Inspecciona empresarial.js, enterprise-glb.src.js, CSS y generador actual.
  Criterio de aceptación: No trabajes sobre diagnósticos antiguos ya superados.

- **Antes de cambiar.**
  Guarda capturas comparables del estado actual y pasos de reproducción.
  Criterio de aceptación: El resultado final puede contrastarse con evidencia real.

## 03 · Dirección artística del edificio

- **Estilo.**
  Construye una maqueta arquitectónica empresarial limpia y detallada.
  Criterio de aceptación: Evita bloques básicos sin terminar y decoración excesiva.

- **Paleta.**
  Combina blanco cálido, grafito, madera y acentos amarillos.
  Criterio de aceptación: El consumo usa una capa analítica diferenciada de los acabados.

- **Proporciones.**
  Ajusta altura de plantas, ventanas, losas y cubierta con coherencia.
  Criterio de aceptación: No aparecen plantas desproporcionadamente bajas o gruesas.

- **Silueta.**
  Da al edificio una forma reconocible y equilibrada.
  Criterio de aceptación: La vista general se entiende incluso a tamaño reducido.

- **Fachada.**
  Usa ritmo consistente de ventanas, marcos y accesos.
  Criterio de aceptación: No se mezclan elementos incompatibles de pisos clonados.

- **Base.**
  Añade una base discreta que ancle visualmente el edificio.
  Criterio de aceptación: No parece una pila de piezas suspendidas accidentalmente.

- **Cubierta.**
  Mantén una cubierta proporcionada y detalles solares discretos.
  Criterio de aceptación: No domina todas las vistas interiores.

- **Bordes.**
  Suaviza aristas y mejora normales donde aporte legibilidad.
  Criterio de aceptación: No uses geometría excesiva para detalles imperceptibles.

- **Detalle.**
  Incluye solo elementos que ayudan a reconocer arquitectura y uso.
  Criterio de aceptación: El mobiliario no se convierte en ruido visual.

- **Lenguaje común.**
  Iguala calidad entre plantas GLB y plantas generadas.
  Criterio de aceptación: Una distribución personalizada no parece una versión inferior.

- **Fondos.**
  Utiliza un fondo claro con profundidad suave y buen contraste.
  Criterio de aceptación: No compite con los indicadores y etiquetas.

- **Coherencia.**
  Presenta un edificio cerrado convincente y un corte interior claro.
  Criterio de aceptación: La misma arquitectura se reconoce al cambiar de modo.

## 04 · Composición de la pantalla y jerarquía

- **Visor protagonista.**
  Dedica espacio suficiente a la escena antes del detalle secundario.
  Criterio de aceptación: El edificio se lee sin quedar aplastado entre controles.

- **Barra superior.**
  Muestra edificio activo, nivel actual y modo de visualización.
  Criterio de aceptación: La persona sabe qué está viendo en todo momento.

- **Acción principal.**
  Destaca Ver interior cuando haya un piso seleccionado.
  Criterio de aceptación: No queda enterrada entre acciones administrativas.

- **Acciones secundarias.**
  Agrupa cámara, capas y opciones avanzadas en controles ordenados.
  Criterio de aceptación: No muestra una fila interminable de botones equivalentes.

- **Panel contextual.**
  Reserva un panel de selección con resumen y acciones pertinentes.
  Criterio de aceptación: No cambia de tamaño de forma brusca al seleccionar.

- **Estructura.**
  Transforma el árbol actual en una navegación compacta y plegable.
  Criterio de aceptación: Pisos, espacios y equipos tienen jerarquía legible.

- **Duplicación.**
  Evita repetir la misma lista completa en panel, árbol y tarjetas visibles.
  Criterio de aceptación: Conserva una alternativa accesible sin saturar la pantalla.

- **Indicadores breves.**
  Muestra consumo, cobertura y cantidad de espacios con buena jerarquía.
  Criterio de aceptación: Los números principales se distinguen de ayudas y notas.

- **Área de gráficos.**
  Integra un resumen analítico compacto junto al visor.
  Criterio de aceptación: La gráfica no obliga a perder la vista del edificio.

- **Pantalla completa.**
  Ofrece ampliar el visor con una salida visible.
  Criterio de aceptación: Conserva selección, controles y foco al entrar y salir.

- **Ayuda contextual.**
  Incluye una explicación inicial corta de los gestos principales.
  Criterio de aceptación: No usa instrucciones extensas como sustituto de controles claros.

- **Estados vacíos.**
  Explica qué añadir cuando falta un piso, espacio o inventario.
  Criterio de aceptación: Cada estado ofrece una acción relacionada.

## 05 · Cámara estable y control de interacción

- **Destino correcto.**
  Calcula encuadre según el edificio, piso o espacio seleccionado.
  Criterio de aceptación: La cámara apunta a la entidad activa y no al origen global.

- **Geometría visible.**
  Calcula límites usando solo componentes relevantes para esa vista.
  Criterio de aceptación: Techos retirados no alejan ni desvían la cámara.

- **Alturas.**
  Distingue coordenadas locales del espacio y elevación de su piso.
  Criterio de aceptación: El Piso 3 no se enfoca a la altura del Piso 1.

- **Cancelación.**
  Cancela la transición anterior al elegir otro destino.
  Criterio de aceptación: Solo una transición controla cámara y target a la vez.

- **Última selección.**
  Da prioridad al último clic durante cambios rápidos.
  Criterio de aceptación: El estado final coincide con la última entidad solicitada.

- **Rotación manual.**
  Permite explorar sin que refrescar datos restablezca la cámara.
  Criterio de aceptación: Una actualización de kWh no provoca un salto al exterior.

- **Límites.**
  Configura distancias y ángulos útiles para cada modo.
  Criterio de aceptación: No permite perder el edificio ni atravesar el suelo accidentalmente.

- **Encuadre adaptable.**
  Recalcula tras cambios de tamaño y paneles.
  Criterio de aceptación: El modelo no queda recortado al estrechar la ventana.

- **Restablecer.**
  Incluye Centrar vista con resultado predecible por contexto.
  Criterio de aceptación: En un cuarto vuelve al cuarto, no a otro piso.

- **Vistas rápidas.**
  Ofrece Isométrica, Superior y Frontal donde tengan sentido.
  Criterio de aceptación: Cada botón comunica su estado activo.

- **Rueda y gestos.**
  Define zoom y desplazamiento sin secuestrar el scroll normal.
  Criterio de aceptación: La ayuda coincide con el comportamiento real.

- **Estabilidad.**
  Prueba repetidas entradas, salidas y cambios de piso.
  Criterio de aceptación: No aparecen oscilaciones, giros repentinos ni cámara invertida.

## 06 · Modos exterior, separado, piso e interior

- **Exterior predeterminado.**
  Muestra el edificio ensamblado al entrar a la demostración.
  Criterio de aceptación: No presenta por defecto una separación que parezca un fallo.

- **Modo separado.**
  Ofrece Separar pisos como acción opcional claramente etiquetada.
  Criterio de aceptación: El usuario reconoce una vista analítica intencional.

- **Separación proporcionada.**
  Usa distancias que permitan leer plantas sin fragmentar el edificio.
  Criterio de aceptación: La escena no parece un conjunto de piezas desconectadas.

- **Referencias verticales.**
  Añade guías discretas si ayudan en modo separado.
  Criterio de aceptación: No se confunden con paredes o columnas reales.

- **Seleccionar piso.**
  Resalta el piso sin abrirlo necesariamente.
  Criterio de aceptación: Se distingue seleccionar de entrar a su interior.

- **Abrir piso.**
  Retira cubierta y obstáculos antes de dar por abierta la vista.
  Criterio de aceptación: El interior queda visible al terminar la transición.

- **Pisos superiores.**
  Oculta o aparta plantas superiores sin tapar la elegida.
  Criterio de aceptación: No deja suelos flotantes encima del cuarto activo.

- **Aislar.**
  Permite ver solo el piso actual con un botón claro.
  Criterio de aceptación: La acción Volver al edificio restaura todos los módulos.

- **Transparencia.**
  Usa atenuación solo cuando conserve profundidad y legibilidad.
  Criterio de aceptación: No superpone muchas fachadas transparentes difíciles de interpretar.

- **Cerrar interior.**
  Restituye fachada, cubierta y cámara de modo coherente.
  Criterio de aceptación: No quedan piezas en posiciones de apertura.

- **Estados compatibles.**
  Define combinaciones válidas de aislar, separar y abrir.
  Criterio de aceptación: Los controles impiden estados visuales contradictorios.

- **Sin animación.**
  Aplica los mismos estados finales con movimiento reducido.
  Criterio de aceptación: La funcionalidad no depende de ver la transición.

## 07 · Corrección de cubierta, fachadas y paredes interiores

- **Ambas rutas.**
  Corrige ocultación en GLB y geometría generada.
  Criterio de aceptación: La cubierta no tapa cuartos en ninguno de los dos casos.

- **Clips.**
  Revisa tiempos y transformaciones reales de Roof_Open y Facade_Open.
  Criterio de aceptación: No usa constantes de fotogramas sin verificar su conversión.

- **Clones independientes.**
  Separa mezcladores y estados de módulos repetidos.
  Criterio de aceptación: Abrir un piso no abre o cierra otro.

- **Visibilidad jerárquica.**
  Controla todos los descendientes de cubierta y fachada.
  Criterio de aceptación: Ocultar un grupo no deja mallas hijas visibles por error.

- **Plano de corte.**
  Ofrece una presentación de maqueta abierta cuando resulte más clara.
  Criterio de aceptación: Las paredes no bloquean el inventario interior.

- **Obstáculos cercanos.**
  Reduce o retira muros frente a la cámara según el modo.
  Criterio de aceptación: No vuelve invisibles todos los límites del espacio.

- **Continuidad.**
  Conserva referencias suficientes para reconocer qué cuarto se observa.
  Criterio de aceptación: Una vista abierta no convierte los muebles en objetos sin ubicación.

- **Cubierta solar.**
  Muestra paneles solares solo donde arquitectónicamente corresponda.
  Criterio de aceptación: No duplica techos solares entre cada planta.

- **Retirada limpia.**
  Evita que piezas apartadas crucen el área útil de la escena.
  Criterio de aceptación: No se ven techos gigantes encima de etiquetas interiores.

- **Selección.**
  Excluye piezas retiradas del raycast interactivo.
  Criterio de aceptación: Un clic no selecciona una fachada invisible.

- **Restauración.**
  Restablece materiales y visibilidad al cerrar el piso.
  Criterio de aceptación: No acumula opacidad reducida entre visitas.

- **Prueba dirigida.**
  Reproduce la segunda captura y verifica que todos los cuartos se ven.
  Criterio de aceptación: La corrección se demuestra con una captura del mismo contexto.

## 08 · Etiquetas profesionales y selección visual

- **Jerarquía.**
  Diferencia etiqueta de piso, espacio y equipo.
  Criterio de aceptación: No todas tienen el mismo tamaño y peso.

- **Densidad.**
  Muestra etiquetas relevantes al nivel de zoom y selección.
  Criterio de aceptación: No llena el edificio con nombres de todos los equipos.

- **Colisiones.**
  Evita superposición de etiquetas con un algoritmo sencillo y predecible.
  Criterio de aceptación: Al seleccionar una etiqueta no oculta a todas sus vecinas.

- **Anclaje.**
  Asocia cada etiqueta con una posición visible de su entidad.
  Criterio de aceptación: No proyecta nombres de habitaciones sobre el techo cerrado.

- **Líneas guía.**
  Usa conectores discretos cuando una etiqueta deba desplazarse.
  Criterio de aceptación: Se entiende a qué piso o cuarto pertenece.

- **Oclusión.**
  Oculta etiquetas detrás de geometría o cámbialas al panel.
  Criterio de aceptación: No aparentan flotar sobre un espacio distinto.

- **Selección.**
  Usa acento amarillo, contorno o elevación discreta.
  Criterio de aceptación: No aplica brillos que borren los materiales.

- **Nombre completo.**
  Permite consultar nombres largos sin recortes permanentes.
  Criterio de aceptación: La abreviatura no impide distinguir oficinas similares.

- **Datos.**
  Incluye kWh y estado cuando corresponda sin saturación.
  Criterio de aceptación: Cada valor muestra unidad y periodo.

- **Interacción.**
  Permite seleccionar desde etiqueta, lista o geometría.
  Criterio de aceptación: Todas las vías abren la misma entidad.

- **Tooltip.**
  Aporta información breve sin ocultar controles esenciales.
  Criterio de aceptación: Funciona también mediante foco y no solo hover.

- **Limpieza.**
  Elimina etiquetas de entidades borradas o pisos ocultos.
  Criterio de aceptación: No quedan rótulos fantasma después de editar.

## 09 · Miniatura de planta y eliminación del artefacto negro

- **Reproducción.**
  Reproduce la tercera captura con foco y selección en Habitación 3C.
  Criterio de aceptación: Identifica el elemento y estilo que generan el artefacto.

- **Escala SVG.**
  Comprueba unidades SVG frente a contornos CSS expresados en píxeles.
  Criterio de aceptación: Los indicadores de foco no crecen con una transformación inesperada.

- **Foco accesible.**
  Sustituye el efecto defectuoso por un indicador fino y visible.
  Criterio de aceptación: No elimina el foco de teclado para esconder el problema.

- **Reglas aisladas.**
  Limita estilos de miniatura para evitar efectos de reglas globales.
  Criterio de aceptación: Cambiar su foco no afecta botones del resto de la aplicación.

- **Contorno estable.**
  Usa vector-effect u otra técnica apropiada si se necesita.
  Criterio de aceptación: El grosor se mantiene razonable al escalar la miniatura.

- **Lectura.**
  Da aire entre bordes, nombres y regiones.
  Criterio de aceptación: La planta no parece una cuadrícula de bordes negros pesados.

- **Selección amarilla.**
  Resalta el espacio activo sin ocultar su nombre.
  Criterio de aceptación: Seleccionar Pasillo no tapa Gerencia.

- **Tipos de espacio.**
  Representa lobby, oficina y circulación con leyenda comprensible.
  Criterio de aceptación: El borde discontinuo tiene significado explicado.

- **Coherencia geométrica.**
  Usa la misma distribución que el modelo 3D.
  Criterio de aceptación: La miniatura no muestra otra disposición de cuartos.

- **Nombres largos.**
  Ajusta o divide rótulos según el tamaño disponible.
  Criterio de aceptación: No reduce el texto hasta hacerlo ilegible.

- **Ratón y teclado.**
  Permite recorrer cuartos mediante controles accesibles.
  Criterio de aceptación: Enter selecciona sin activar acciones inesperadas.

- **Regresión visual.**
  Comprueba capturas de foco, hover, selección y escala móvil.
  Criterio de aceptación: El artefacto negro no reaparece al navegar con Tab.

## 10 · Estructura de pisos y navegación intuitiva

- **Selector visible.**
  Mantén un selector compacto de plantas junto a la escena.
  Criterio de aceptación: Se puede ir a Piso 2 sin acertar su fachada.

- **Orden.**
  Distingue posición vertical de identificador interno.
  Criterio de aceptación: Reordenar no mezcla inventario ni nombres.

- **Estado activo.**
  Marca claramente el piso elegido y el que está abierto.
  Criterio de aceptación: No confunde selección exterior con interior activo.

- **Resumen de piso.**
  Muestra espacios, unidades y consumo conocido en una ficha breve.
  Criterio de aceptación: No exige desplegar todo el árbol para entender su contenido.

- **Árbol plegable.**
  Permite expandir solo el piso relevante.
  Criterio de aceptación: Evita una lista extensa que empuje el visor fuera de pantalla.

- **Búsqueda.**
  Busca piso o espacio cuando la estructura sea grande.
  Criterio de aceptación: Un resultado permite localizar y abrir su entidad.

- **Navegación anterior.**
  Conserva contexto al volver de equipo a cuarto y a piso.
  Criterio de aceptación: No regresa siempre al edificio completo.

- **Breadcrumb.**
  Muestra edificio, piso y espacio con acciones de retorno.
  Criterio de aceptación: Los nombres corresponden al estado real del visor.

- **Cambiar rápidamente.**
  Permite selección consecutiva sin bloquear controles durante segundos.
  Criterio de aceptación: La última elección gobierna el resultado final.

- **Piso vacío.**
  Muestra una planta vacía cuidada con Configurar espacios.
  Criterio de aceptación: No dibuja oficinas y consumo ficticios sin indicarlo.

- **Acciones administrativas.**
  Agrupa renombrar, duplicar y eliminar en un menú contextual claro.
  Criterio de aceptación: No compiten visualmente con Ver interior.

- **Tutorial breve.**
  Introduce seleccionar, abrir y volver en una guía descartable.
  Criterio de aceptación: No repite la guía en cada visita.

## 11 · Añadir pisos de forma clara en la demostración

- **Modo local editable.**
  Crea un sandbox de demostración que admita cambios visuales.
  Criterio de aceptación: No transforma la demostración en una cuenta autenticada falsa.

- **Identificación.**
  Muestra Demostración editable en este dispositivo.
  Criterio de aceptación: Explica dónde se guardan los cambios y cómo reiniciarlos.

- **Acción visible.**
  Incluye Añadir piso junto al selector de plantas.
  Criterio de aceptación: No obliga a buscar el botón en un panel escondido.

- **Formulario corto.**
  Solicita nombre y opción de configurar espacios.
  Criterio de aceptación: No exige datos eléctricos para crear un piso vacío.

- **Previsualización.**
  Muestra dónde se añadirá y cuántos pisos quedarán.
  Criterio de aceptación: El usuario entiende el cambio antes de confirmar.

- **Alta inmediata.**
  Al confirmar aparece el nuevo módulo y su botón de selección.
  Criterio de aceptación: La escena y la estructura se actualizan juntas.

- **Encuadre.**
  Ajusta la vista con una transición discreta al nuevo alto.
  Criterio de aceptación: No corta la cubierta ni aleja demasiado el edificio.

- **Configurar contenido.**
  Permite elegir oficinas, lobby y cantidades usando el asistente existente.
  Criterio de aceptación: El nuevo piso tiene entidades propias y seleccionables.

- **Duplicación.**
  Ofrece duplicar una planta como alternativa explícita.
  Criterio de aceptación: Usa identidades nuevas y no duplica mediciones reales.

- **Reiniciar.**
  Incluye Restaurar demostración con confirmación.
  Criterio de aceptación: No borra edificios persistentes ni configuración ajena.

- **Persistencia local.**
  Guarda sandbox en un espacio de almacenamiento separado y versionado.
  Criterio de aceptación: Nunca sobrescribe hogares ni datos de la organización.

- **Fallo de almacenamiento.**
  Si no puede guardar localmente, lo informa con precisión.
  Criterio de aceptación: No anuncia que un piso persistirá cuando solo está en memoria.

## 12 · Crear y modificar pisos con cuenta real

- **Misma interfaz.**
  Usa el mismo lenguaje de creación que en el sandbox.
  Criterio de aceptación: La diferencia de persistencia se explica sin duplicar la experiencia.

- **Autorización.**
  Respeta los permisos empresariales existentes del servidor.
  Criterio de aceptación: Un botón visible no concede permisos adicionales.

- **Guardado real.**
  Crea el piso mediante la API y revisión vigentes.
  Criterio de aceptación: No simula una escritura que no se ha confirmado.

- **Estado pendiente.**
  Muestra creación en curso y evita clics duplicados.
  Criterio de aceptación: Una acción no produce dos pisos accidentalmente.

- **Fallo de red.**
  Conserva el formulario y permite reintentar con seguridad.
  Criterio de aceptación: No añade un módulo fantasma al fallar la API.

- **Identidad estable.**
  Asocia malla, etiqueta y controles al identificador devuelto.
  Criterio de aceptación: No depende de índices que cambien al reordenar.

- **Concurrencia.**
  Maneja conflictos de revisión sin sobrescribir cambios ajenos.
  Criterio de aceptación: El usuario puede recargar y revisar el nuevo estado.

- **Continuar configuración.**
  Tras crear ofrece Configurar espacios o Ver piso vacío.
  Criterio de aceptación: No introduce equipos de demostración sin elección explícita.

- **Eliminar.**
  Retira módulo, etiquetas y selección tras confirmación válida.
  Criterio de aceptación: No deja la cámara siguiendo una entidad eliminada.

- **Deshacer existente.**
  Reutiliza la infraestructura de deshacer cuando aplique.
  Criterio de aceptación: No debilita su control de revisiones para facilitar la animación.

- **Separación de modos.**
  No permite que el sandbox escriba en endpoints de la cuenta.
  Criterio de aceptación: Un cambio de sesión no mezcla edificios de ejemplo y reales.

- **Recarga.**
  Comprueba que el piso guardado reaparece en su posición correcta.
  Criterio de aceptación: La visualización coincide con el servidor después de reiniciar.

## 13 · Gráficos integrados con el edificio

- **Barras por piso.**
  Muestra consumo conocido por planta en una gráfica compacta.
  Criterio de aceptación: Las barras y las etiquetas 3D usan los mismos datos.

- **Barras por espacio.**
  Al abrir un piso muestra reparto entre sus espacios.
  Criterio de aceptación: Seleccionar una barra enfoca el cuarto correspondiente.

- **Categorías.**
  Incluye climatización, iluminación e informática con leyenda.
  Criterio de aceptación: No mezcla categorías decorativas con equipos eléctricos.

- **Resumen seleccionado.**
  Presenta kWh, costo disponible y cobertura del elemento activo.
  Criterio de aceptación: Sin tarifa no dibuja costo cero.

- **Comparación.**
  Permite contrastar piso seleccionado con el conjunto cuando sea válido.
  Criterio de aceptación: Explica el denominador de los porcentajes.

- **Tendencia.**
  Dibuja evolución solo si hay registros temporales suficientes.
  Criterio de aceptación: No inventa una curva histórica desde el inventario mensual.

- **Calidad gráfica.**
  Usa tipografía legible, espacios adecuados y ejes con unidades.
  Criterio de aceptación: No se limita a barras sin escala ni contexto.

- **Animación de datos.**
  Anima cambios de manera breve cuando no haya movimiento reducido.
  Criterio de aceptación: No hace oscilar cifras que no han cambiado.

- **Vinculación.**
  Sincroniza hover y selección de gráfica con la escena.
  Criterio de aceptación: No modifica la selección permanente solo por mover el ratón.

- **Tabla equivalente.**
  Ofrece los mismos valores en una tabla accesible.
  Criterio de aceptación: El gráfico no es la única forma de consultar información.

- **Datos parciales.**
  Representa cobertura incompleta de forma visible.
  Criterio de aceptación: No compara totales parciales como si fueran completos.

- **Alcance.**
  Limita los gráficos a la experiencia del edificio de esta etapa.
  Criterio de aceptación: No rediseña todo el sistema de analítica sin necesidad.

## 14 · Partículas de consumo con significado definido

- **Función.**
  Añade partículas como capa opcional para intensidad relativa de consumo.
  Criterio de aceptación: La leyenda explica exactamente qué representan.

- **Origen de datos.**
  Calcula intensidad desde kWh estimados o registrados del alcance elegido.
  Criterio de aceptación: No afirma consumo instantáneo a partir de un dato mensual.

- **No telemetría ficticia.**
  Identifica la animación como representación ilustrativa.
  Criterio de aceptación: No la llama flujo eléctrico medido o sensores activos.

- **Emisores.**
  Ancla emisores a equipos, espacios o pisos según nivel de detalle.
  Criterio de aceptación: Las partículas no nacen aleatoriamente fuera del edificio.

- **Jerarquía.**
  Usa efectos por piso en exterior y por espacio en interior.
  Criterio de aceptación: No mezcla simultáneamente miles de efectos de todos los niveles.

- **Escala.**
  Define una función acotada de dato a densidad, tamaño y velocidad.
  Criterio de aceptación: Duplicar consumo no crea una explosión visual ilimitada.

- **Comparabilidad.**
  Mantén escala consistente al comparar plantas.
  Criterio de aceptación: La misma cifra no cambia de intensidad sin que la leyenda lo explique.

- **Consumo cero.**
  Muestra ausencia de emisión para cero válido.
  Criterio de aceptación: No usa el mismo tratamiento para datos desconocidos.

- **Sin datos.**
  Usa señal estática neutral y texto sin datos.
  Criterio de aceptación: No inventa partículas para rellenar una oficina vacía.

- **Pausados.**
  Excluye de emisión equipos pausados en el cálculo seleccionado.
  Criterio de aceptación: No aparenta actividad de un registro excluido.

- **Apagar efecto.**
  Incluye control Partículas activadas o desactivadas.
  Criterio de aceptación: El resto de funciones conserva toda su utilidad sin partículas.

- **Persistencia de preferencia.**
  Recuerda la preferencia visual local de forma independiente.
  Criterio de aceptación: No cambia datos de consumo al cambiar el efecto.

## 15 · Acabado visual de partículas y capas analíticas

- **Estética.**
  Usa puntos suaves, trazos cortos o pulsos discretos con intención.
  Criterio de aceptación: No convierte el edificio en confeti o fuegos artificiales.

- **Color.**
  Armoniza el efecto con amarillo KWH y una escala analítica accesible.
  Criterio de aceptación: Evita arcoíris sin significado.

- **Opacidad.**
  Mantén transparencia controlada y contraste suficiente.
  Criterio de aceptación: Las partículas no ocultan rótulos ni mobiliario.

- **Tamaño.**
  Ajusta tamaño aparente al zoom dentro de límites.
  Criterio de aceptación: Los puntos no se vuelven discos gigantes cerca de cámara.

- **Dirección.**
  Evita sugerir conexiones eléctricas físicas que no están modeladas.
  Criterio de aceptación: Las trayectorias se describen como ilustración analítica.

- **Capas.**
  Separa partículas, mapa de consumo y selección.
  Criterio de aceptación: Los controles indican qué capas están activas.

- **Brillo.**
  Usa emisión o bloom solo si mejora lectura y rendimiento.
  Criterio de aceptación: No quema las superficies amarillas o blancas.

- **Profundidad.**
  Gestiona oclusión para que el efecto no atraviese paredes opacas engañosamente.
  Criterio de aceptación: En modo abierto se entiende su origen espacial.

- **Selección.**
  Aumenta énfasis solo del elemento seleccionado de forma moderada.
  Criterio de aceptación: No cambia el valor analítico al seleccionarlo.

- **Escala relativa.**
  Explica si la intensidad está normalizada dentro del edificio.
  Criterio de aceptación: No implica unidades físicas para velocidad o cantidad de puntos.

- **Movimiento reducido.**
  Sustituye partículas animadas por un indicador estático.
  Criterio de aceptación: No ignora preferencias para mantener un efecto decorativo.

- **Sensibilidad.**
  Evita parpadeos, destellos y pulsos agresivos.
  Criterio de aceptación: Los efectos se pueden detener inmediatamente.

## 16 · Interiores, mobiliario y detalle de equipos

- **Legibilidad.**
  Asegura que los interiores se ven antes de añadir decoración.
  Criterio de aceptación: No requiere acercarse hasta atravesar paredes.

- **Mobiliario.**
  Usa activos Blender cuidados y proporciones coherentes.
  Criterio de aceptación: No parecen objetos deformados al caber en cada oficina.

- **Apoyos.**
  Coloca escritorios, sillas y equipos sobre superficies válidas.
  Criterio de aceptación: No deja asientos flotando ni computadores tirados por defecto.

- **Exceso de equipos.**
  Cuando no haya superficie válida, agrupa con indicador y advertencia.
  Criterio de aceptación: No apila aparatos en el suelo como solución silenciosa.

- **Inventario real.**
  Representa cantidad y categoría registradas sin añadir equipos ficticios.
  Criterio de aceptación: Una plantilla decorativa no se cuenta como consumo.

- **Tipos de cuarto.**
  Distingue gerencia, reunión, recepción y oficinas con pocos elementos útiles.
  Criterio de aceptación: La arquitectura no cambia por una etiqueta de consumo.

- **Cubículos.**
  Mantén separadores legibles sin tapar todos los puestos.
  Criterio de aceptación: La vista superior permite comprender su distribución.

- **Puertas.**
  Conserva animación cuando exista y define su presentación en otros módulos.
  Criterio de aceptación: No bloquea la consulta de una oficina sin puerta animada.

- **Selección de equipo.**
  Usa contorno y ficha breve para aparatos seleccionados.
  Criterio de aceptación: No sustituye todo el material por un color ilegible.

- **Vista de detalle.**
  Ofrece acercamiento controlado al equipo o grupo.
  Criterio de aceptación: No lleva la cámara dentro de la malla.

- **Calidad consistente.**
  Iguala materiales, luz y escala entre decoración y proxies dinámicos.
  Criterio de aceptación: Los equipos nuevos no parecen bloques ajenos al modelo.

- **Información.**
  Conecta detalle visual con nombre, cantidad y aporte calculado.
  Criterio de aceptación: La belleza de la escena no sustituye la explicación numérica.

## 17 · Iluminación, render y recursos para navegador

- **Iluminación.**
  Usa luz ambiental y direccional equilibradas para leer interiores.
  Criterio de aceptación: Las paredes no quedan negras y los suelos no se sobreexponen.

- **Sombras.**
  Añade sombras suaves donde aporten profundidad.
  Criterio de aceptación: No sacrifica rendimiento por sombras de cada partícula.

- **Contacto.**
  Usa sombras de contacto u opción ligera para anclar objetos.
  Criterio de aceptación: El mobiliario parece apoyado sobre el piso.

- **Color.**
  Configura espacio de color y gestión tonal de forma consistente.
  Criterio de aceptación: Materiales GLB y procedurales no cambian de tono arbitrariamente.

- **Transparencias.**
  Revisa orden de render de vidrio, etiquetas y efectos.
  Criterio de aceptación: No desaparecen ventanas o cuartos al rotar.

- **Antialiasing.**
  Suaviza bordes según capacidades reales del dispositivo.
  Criterio de aceptación: La maqueta no tiene dientes de sierra dominantes.

- **Texturas.**
  Optimiza tamaño y reutilización donde se usen.
  Criterio de aceptación: No descarga mapas grandes para superficies casi uniformes.

- **Activos locales.**
  Empaqueta recursos y bibliotecas compatibles con la CSP actual.
  Criterio de aceptación: No agrega dependencias de CDN para obtener efectos.

- **Calidad adaptable.**
  Ofrece niveles de calidad con valores predeterminados prudentes.
  Criterio de aceptación: Un dispositivo modesto puede desactivar sombras y partículas.

- **Resolución.**
  Limita pixel ratio según calidad y tamaño de pantalla.
  Criterio de aceptación: No consume memoria innecesaria en pantallas densas.

- **Recursos compartidos.**
  Comparte geometrías y materiales cuando sea seguro.
  Criterio de aceptación: Editar un material seleccionado no recolorea otros pisos accidentalmente.

- **Sin efectos obligatorios.**
  Conserva una presentación bonita en calidad básica.
  Criterio de aceptación: No depende de postprocesado pesado para ser comprensible.

## 18 · Accesibilidad, móvil y rendimiento de interacción

- **Teclado.**
  Permite elegir edificio, piso, cuarto y controles sin ratón.
  Criterio de aceptación: El foco siempre está visible y no tapa el plano.

- **Movimiento reducido.**
  Respeta la preferencia en cámara, transiciones y partículas.
  Criterio de aceptación: No quedan efectos animados de fondo al activarla.

- **Lectura alternativa.**
  Mantén listas y tablas equivalentes para los datos del canvas.
  Criterio de aceptación: La escena no es el único acceso al inventario.

- **Etiquetas accesibles.**
  Da nombres claros a iconos de cámara y capas.
  Criterio de aceptación: No depende de conocer símbolos sin texto de ayuda.

- **Contraste.**
  Verifica texto, selección y leyendas sobre amarillo y fondos claros.
  Criterio de aceptación: No confunde sin datos con cero por color únicamente.

- **Móvil.**
  Reorganiza visor, selector y panel en pantallas estrechas.
  Criterio de aceptación: No introduce scroll horizontal ni botones minúsculos.

- **Gestos.**
  Permite usar la página sin que el visor capture todo el movimiento táctil.
  Criterio de aceptación: Los controles explican cómo rotar y acercar.

- **Render a demanda.**
  Actualiza solo cuando hay interacción, transición o efecto activo.
  Criterio de aceptación: Con efectos apagados la escena en reposo no consume un bucle permanente.

- **Partículas eficientes.**
  Usa buffers o instancias con presupuestos máximos.
  Criterio de aceptación: No crea un objeto JavaScript por partícula en cada frame.

- **Pestaña oculta.**
  Pausa animaciones y efectos fuera de pantalla o con documento oculto.
  Criterio de aceptación: No sigue consumiendo recursos innecesariamente.

- **Liberación.**
  Limpia contextos, listeners, buffers y temporizadores al cerrar el visor.
  Criterio de aceptación: Cambiar repetidamente de edificio no acumula memoria.

- **Medición.**
  Mide carga, respuesta y render con y sin efectos en escenarios representativos.
  Criterio de aceptación: No presenta tiempo medio de render como FPS sostenidos.

## 19 · Recorridos visuales y presentación de la demostración

- **Inicio explícito.**
  Ofrece Recorrer edificio sin activarlo al entrar a la página.
  Criterio de aceptación: El usuario controla cuándo empieza a moverse la cámara.

- **Presentación inicial.**
  Empieza con una vista general corta y legible.
  Criterio de aceptación: No usa giros largos que retrasen el acceso al contenido.

- **Paradas.**
  Recorre pisos y espacios existentes con una secuencia comprensible.
  Criterio de aceptación: No repite la cubierta como centro de cada parada.

- **Panel de parada.**
  Muestra nombre, ubicación, inventario y consumo con tipografía clara.
  Criterio de aceptación: La información permanece visible el tiempo suficiente.

- **Control.**
  Mantén pausa, anterior, siguiente y salir a la vista.
  Criterio de aceptación: No es necesario esperar al final para recuperar control manual.

- **Interacción manual.**
  Pausa el recorrido al rotar o seleccionar otro espacio.
  Criterio de aceptación: No compiten el usuario y la trayectoria automática.

- **Explicación energética.**
  Permite un recorrido por mayores consumidores con datos válidos.
  Criterio de aceptación: La narrativa se apoya en el inventario y cobertura del ejemplo.

- **Partículas en recorrido.**
  Mantén intensidad estable por dato durante los cambios de cámara.
  Criterio de aceptación: El movimiento de cámara no altera el significado del efecto.

- **Cambiar estructura.**
  Gestiona pisos añadidos o eliminados durante el recorrido.
  Criterio de aceptación: Recalcula paradas o finaliza con una explicación sin bloquearse.

- **Versión sin movimiento.**
  Ofrece las mismas paradas mediante tarjetas o saltos instantáneos.
  Criterio de aceptación: No obliga a usar animaciones para conocer el edificio.

- **Salida coherente.**
  Termina en una vista estable del último contexto válido.
  Criterio de aceptación: No conserva temporizadores que reinicien el recorrido.

- **Demostración guiada.**
  Incluye un recorrido opcional corto que enseñe las mejoras visuales.
  Criterio de aceptación: No confunde ejemplos de consumo con datos de una empresa real.

## 20 · Verificación visual de la demostración y entrega

- **Caso exterior.**
  Revisa edificio ensamblado de tres pisos y modo separado opcional.
  Criterio de aceptación: La silueta es coherente y las plantas se distinguen.

- **Caso interior GLB.**
  Abre el piso de la segunda captura usando su mismo tipo de módulo.
  Criterio de aceptación: La cubierta ya no domina ni tapa los cuartos.

- **Caso interior generado.**
  Repite apertura y cierre en una planta de seis oficinas.
  Criterio de aceptación: La solución no funciona solo con el activo fijo.

- **Caso miniatura.**
  Selecciona con Tab Habitación 3C y Pasillo como en la tercera captura.
  Criterio de aceptación: No aparece el contorno negro desproporcionado.

- **Caso nuevo piso.**
  Añade Piso 4 desde la demostración editable.
  Criterio de aceptación: Se ve, se selecciona, se configura y se puede reiniciar el ejemplo.

- **Caso consumo.**
  Compara dos espacios con consumos conocidos distintos.
  Criterio de aceptación: Gráfica, color y partículas mantienen una relación explicada con los datos.

- **Caso desconocido.**
  Incluye un espacio sin datos y otro con cero válido.
  Criterio de aceptación: Ambos se distinguen sin inventar actividad.

- **Caso cámara.**
  Alterna rápido Piso 1, Piso 3, interior y exterior repetidas veces.
  Criterio de aceptación: El estado final coincide y la cámara no se pierde.

- **Caso reducido.**
  Repite navegación con movimiento reducido y partículas apagadas.
  Criterio de aceptación: Todos los datos y acciones siguen disponibles.

- **Caso móvil.**
  Comprueba visor, etiquetas, miniatura y alta de piso en varios anchos.
  Criterio de aceptación: No basta una captura del dashboard general.

- **Evidencia.**
  Entrega capturas comparables antes y después y una grabación corta si es posible.
  Criterio de aceptación: Distingue inspección estática de animación realmente observada.

- **Entrega local.**
  Deja /empresarial funcionando y resume cambios, pruebas y límites reales.
  Criterio de aceptación: No publiques ni hagas commit y conserva los datos existentes.

