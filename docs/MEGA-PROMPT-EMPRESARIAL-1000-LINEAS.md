## 01 · Encargo, visión y límites

- **Objetivo.**
  Rediseña KWH Empresarial como evolución del KWH doméstico amarillo.
  Criterio de aceptación: La identidad se reconoce al comparar ambas experiencias.

- **Entrega funcional.**
  Implementa los cambios solicitados; no te detengas en una propuesta visual.
  Criterio de aceptación: Los recorridos principales funcionan de principio a fin.

- **Ruta exclusiva.**
  Sirve la experiencia empresarial en /empresarial y conserva acceso directo.
  Criterio de aceptación: La dirección funciona también al recargar.

- **Acceso discreto.**
  No añadas enlaces empresariales en menús, pie, banners o botones domésticos.
  Criterio de aceptación: La navegación doméstica sigue sin accesos empresariales.

- **Protección.**
  Mantén autenticación y permisos empresariales aunque la ruta esté oculta.
  Criterio de aceptación: Conocer la URL no permite consultar datos privados.

- **Alcance actual.**
  Inspecciona código, datos y procesos antes de cambiar archivos.
  Criterio de aceptación: Las decisiones parten del repositorio actual.

- **Cambios existentes.**
  Conserva los cambios locales de otras tareas y trabaja sobre ellos con cuidado.
  Criterio de aceptación: No desaparece trabajo ajeno del diff.

- **Arquitectura.**
  Parte del frontend estático, Node, MySQL y three.js ya existentes.
  Criterio de aceptación: No introduzcas un framework sin necesidad demostrable.

- **Prioridad.**
  Resuelve primero identidad, interior visible y navegación entre pisos.
  Criterio de aceptación: La primera entrega permite reconocer y explorar la empresa.

- **Datos veraces.**
  Distingue inventario, estimaciones, mediciones y demostración.
  Criterio de aceptación: Cada indicador permite identificar su origen.

- **Trabajo autónomo.**
  Resuelve decisiones reversibles con criterio y documenta supuestos.
  Criterio de aceptación: No interrumpas por detalles que puedas resolver leyendo el código.

- **Publicación.**
  Prepara y ejecuta localmente; no publiques ni hagas push sin autorización.
  Criterio de aceptación: La revisión se realiza en localhost.

## 02 · Diagnóstico obligatorio de la versión actual

- **Paleta distinta.**
  Comprueba el amarillo #ffd535 doméstico frente al azul empresarial #0b3d91.
  Criterio de aceptación: Documenta la diferencia y corrige la identidad empresarial.

- **Tipografía.**
  Compara tamaño, familia, peso, interlineado y jerarquía actuales.
  Criterio de aceptación: La propuesta hereda el lenguaje tipográfico doméstico.

- **Estructura visual.**
  Compara sidebar, topbar, tarjetas y hero con el encabezado empresarial.
  Criterio de aceptación: Identifica las piezas reutilizables sin romper estilos.

- **Elegibilidad GLB.**
  Revisa glbEligible en empresarial.js y su límite de uno a cuatro espacios.
  Criterio de aceptación: El diseño nuevo no depende de ese límite silencioso.

- **Vista de edificio.**
  Comprueba cuándo se usa Canvas y cuándo el visor WebGL.
  Criterio de aceptación: Explica por qué hoy cambia la calidad al navegar.

- **Asignación por orden.**
  Revisa GLB_KEYS y el uso de índices de arrays.
  Criterio de aceptación: Propón identificadores persistentes en lugar de posición.

- **Geometría fija.**
  Identifica muebles y equipos ilustrativos del GLB actual.
  Criterio de aceptación: No los presentes como inventario real del usuario.

- **Animaciones.**
  Inspecciona acciones exportadas y tiempo real de los clips.
  Criterio de aceptación: No deduzcas un fallo concreto sin reproducirlo.

- **Encuadre.**
  Revisa cajas de cámara cuando cubierta y fachada se desplazan.
  Criterio de aceptación: Los componentes retirados no alejan la cámara del interior.

- **Estado de selección.**
  Revisa floorId, spaceId, equipId y nivel de navegación.
  Criterio de aceptación: No hay contradicción entre modelo, panel y breadcrumb.

- **Piso dos.**
  Reproduce un edificio con varios pisos y selecciona el segundo.
  Criterio de aceptación: La evidencia distingue datos existentes de geometría ausente.

- **Informe breve.**
  Resume causas confirmadas y dudas antes de modificar.
  Criterio de aceptación: No conviertas las observaciones del usuario en diagnósticos inventados.

## 03 · Identidad amarilla y sistema visual

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

## 04 · Navegación y composición empresarial

- **Sidebar.**
  Crea una barra lateral empresarial con el estilo doméstico.
  Criterio de aceptación: Permite navegar sin depender de un panel lateral cambiante.

- **Resumen.**
  Incluye una sección Resumen con indicadores y accesos frecuentes.
  Criterio de aceptación: El usuario entiende el estado de su organización al entrar.

- **Edificios.**
  Incluye Edificios y vista 3D con estructura persistente.
  Criterio de aceptación: El edificio activo siempre está identificado.

- **Inventario.**
  Incluye Equipos y espacios con búsqueda y filtros.
  Criterio de aceptación: Se localiza un equipo sin abrir cada piso.

- **Facturas.**
  Incluye Lecturas y facturas como sección empresarial.
  Criterio de aceptación: Se accede al historial sin perder el edificio seleccionado.

- **Simulador.**
  Incluye Simulador y planes con lenguaje empresarial.
  Criterio de aceptación: El usuario diferencia escenarios de cambios aplicados.

- **Presupuesto.**
  Incluye Presupuesto mensual y anual por alcance.
  Criterio de aceptación: Se conoce a qué edificio o conjunto se refiere.

- **Fuentes.**
  Incluye Tarifas y fuentes adaptadas al servicio empresarial.
  Criterio de aceptación: No se aplican reglas domésticas automáticamente.

- **Cuenta.**
  Incluye Organización, cuenta y copias con permisos claros.
  Criterio de aceptación: Las acciones disponibles corresponden al usuario autenticado.

- **Breadcrumb.**
  Muestra Empresa > Edificio > Piso > Espacio > Equipo.
  Criterio de aceptación: Cada nivel permite regresar sin perder datos guardados.

- **Contexto.**
  Mantén selectores de empresa, edificio y periodo donde corresponda.
  Criterio de aceptación: Un cambio de filtro actualiza todas las cifras relacionadas.

- **Móvil.**
  Convierte la navegación lateral en un control accesible compacto.
  Criterio de aceptación: No se ocultan las funciones esenciales en pantallas pequeñas.

## 05 · Panel de organización y edificios

- **Hero.**
  Usa un hero amarillo con un mensaje útil y acción concreta.
  Criterio de aceptación: No muestra ahorro ficticio ni textos genéricos de relleno.

- **Indicadores.**
  Presenta kWh estimados, costo estimado, cobertura y presupuesto.
  Criterio de aceptación: Cada tarjeta incluye alcance y periodo.

- **Edificios disponibles.**
  Lista edificios con pisos, espacios y estado de configuración.
  Criterio de aceptación: Se puede continuar exactamente donde faltan datos.

- **Desglose.**
  Incluye una gráfica por edificio con tabla equivalente.
  Criterio de aceptación: Los valores de ambas representaciones coinciden.

- **Ranking.**
  Muestra principales equipos o categorías por consumo estimado.
  Criterio de aceptación: No se atribuye consumo inexistente a espacios sin datos.

- **Alertas útiles.**
  Señala datos incompletos y variaciones con explicación.
  Criterio de aceptación: La alerta ofrece una acción que resuelve el problema.

- **Última factura.**
  Muestra la última factura registrada separada de la estimación.
  Criterio de aceptación: No se suman valores incompatibles en el indicador principal.

- **Estado vacío.**
  Explica cómo crear el primer edificio y sus espacios.
  Criterio de aceptación: No se presenta un dashboard lleno de ceros engañosos.

- **Demostración.**
  Ofrece un escenario identificado como ejemplo.
  Criterio de aceptación: Nunca se mezcla con los totales reales de una organización.

- **Vista rápida.**
  Permite abrir edificio, inventario o presupuesto desde sus tarjetas.
  Criterio de aceptación: Los accesos conservan el contexto correspondiente.

- **Comparación.**
  Permite comparar edificios con periodos y métricas equivalentes.
  Criterio de aceptación: Se explican las diferencias de cobertura entre ellos.

- **Coherencia.**
  Reutiliza un modelo de agregación común para panel y detalle.
  Criterio de aceptación: Un cambio de equipo no deja tarjetas desactualizadas.

## 06 · Registro de edificios y pisos reales del sistema

- **Alta guiada.**
  Divide la creación en edificio, pisos, espacios y equipos.
  Criterio de aceptación: El usuario puede guardar progreso sin completar todo.

- **Número de pisos.**
  Solicita cantidad y nombres editables por piso.
  Criterio de aceptación: Crear tres pisos produce tres entidades distintas.

- **Orden de pisos.**
  Guarda un orden o índice vertical persistente.
  Criterio de aceptación: Renombrar un piso no altera su posición física.

- **Planta baja.**
  Permite nombres como Planta baja, Piso 1 o Mezanine.
  Criterio de aceptación: No deduzcas alturas exclusivamente del texto del nombre.

- **Piso dos.**
  Seleccionar Piso 2 abre sus espacios e inventario propios.
  Criterio de aceptación: La escena deja claro que se está en el segundo piso.

- **Pisos distintos.**
  Permite diferente cantidad y uso de espacios en cada piso.
  Criterio de aceptación: La distribución de un piso no copia datos de otro.

- **Editar estructura.**
  Permite agregar, renombrar y reorganizar pisos.
  Criterio de aceptación: Se conserva la asociación entre espacios y equipos.

- **Duplicar piso.**
  Ofrece duplicación explícita de estructura y opción de inventario.
  Criterio de aceptación: Genera identificadores nuevos y evita copiar mediciones silenciosamente.

- **Eliminar piso.**
  Explica cuántos espacios y equipos dependen del piso.
  Criterio de aceptación: La confirmación y las transacciones evitan borrados parciales.

- **Altura visual.**
  Usa altura de módulo configurable o una referencia ilustrativa.
  Criterio de aceptación: No se presenta como levantamiento arquitectónico real.

- **Límites.**
  Define límites de creación compatibles con backend y rendimiento.
  Criterio de aceptación: La interfaz avisa antes de superar una capacidad soportada.

- **Consistencia.**
  Valida que cada piso pertenece al edificio autenticado.
  Criterio de aceptación: Modificar un identificador no permite cruzar organizaciones.

## 07 · Espacios, distribución y cuatro secciones

- **Cuatro espacios.**
  Resuelve bien el caso de un piso con cuatro zonas.
  Criterio de aceptación: Se distinguen cuatro áreas y sus nombres sin ambigüedad.

- **Tipos.**
  Admite oficina, cubículo, sala, habitación, recepción y tipo personalizado.
  Criterio de aceptación: El nombre del espacio no determina automáticamente sus equipos.

- **Cantidades variables.**
  Soporta uno, dos, cuatro, seis y más espacios según límites declarados.
  Criterio de aceptación: No degrada a una vista plana sin explicar el motivo.

- **Distribución inicial.**
  Genera una distribución esquemática equilibrada por espacio.
  Criterio de aceptación: Todos tienen superficie seleccionable y etiqueta.

- **Datos de disposición.**
  Guarda identificador, posición y tamaño visual cuando sea necesario.
  Criterio de aceptación: Recargar conserva la asignación de cada espacio.

- **Editar distribución.**
  Permite ajustes sencillos de posición o una plantilla de distribución.
  Criterio de aceptación: No exige usar Blender para cada nueva empresa.

- **Entradas.**
  Representa aberturas o circulación que permitan entender el piso.
  Criterio de aceptación: Las paredes no impiden ver el contenido al explorar.

- **Cambiar cantidad.**
  Actualiza geometría al crear o eliminar espacios.
  Criterio de aceptación: No quedan cuartos visuales sin entidad asociada.

- **Sin asignar.**
  Identifica espacios todavía vacíos de inventario.
  Criterio de aceptación: No se dibujan computadores como si estuvieran registrados.

- **Orden independiente.**
  Separa orden de lista e identificador geométrico.
  Criterio de aceptación: Ordenar alfabéticamente no mueve equipos a otro cuarto.

- **Nombres largos.**
  Resuelve etiquetas extensas sin tapar todo el modelo.
  Criterio de aceptación: Permite consultar el nombre completo por selección.

- **Selección sincronizada.**
  Conecta tarjeta, árbol, panel y cuarto 3D.
  Criterio de aceptación: Seleccionar cualquiera resalta la misma entidad.

## 08 · Inventario empresarial y formularios

- **Registro rápido.**
  Permite agregar equipos desde el espacio activo.
  Criterio de aceptación: El formulario indica edificio, piso y espacio de destino.

- **Cantidad.**
  Distingue cuatro unidades iguales de cuatro equipos diferentes.
  Criterio de aceptación: La decisión queda explícita antes de guardar.

- **Iluminación.**
  Incluye focos y luminarias como categoría configurable.
  Criterio de aceptación: Se registra cantidad y potencia por unidad.

- **Climatización.**
  Incluye aires acondicionados y ventilación con datos editables.
  Criterio de aceptación: No se infiere potencia a partir de apariencia o tamaño visual.

- **Informática.**
  Incluye computadores, monitores, impresoras y servidores.
  Criterio de aceptación: Permite excluir equipos críticos del ahorro automático.

- **Otros equipos.**
  Admite refrigeración, proyectores, cocina y categoría personalizada.
  Criterio de aceptación: El catálogo no limita el inventario a electrodomésticos de hogar.

- **Datos desconocidos.**
  Permite guardar borradores con potencia u horario desconocidos.
  Criterio de aceptación: El registro incompleto no aporta un consumo inventado.

- **Campos explicados.**
  Explica W, cantidad, h/día, días/mes y factor.
  Criterio de aceptación: Las ayudas usan ejemplos identificados como ilustrativos.

- **Consumo conocido.**
  Ofrece kWh mensuales conocidos por unidad como método alternativo.
  Criterio de aceptación: No aplica de nuevo potencia, horas ni factor a ese método.

- **Pausar.**
  Permite excluir temporalmente del cálculo conservando valores.
  Criterio de aceptación: Aclara que pausar no controla el aparato físico.

- **Duplicar.**
  Abre una copia editable con destino seleccionado.
  Criterio de aceptación: No guarda un duplicado accidental con un solo clic.

- **Mover.**
  Permite trasladar equipos entre espacios propios de la organización.
  Criterio de aceptación: La operación actualiza origen, destino y agregados juntos.

## 09 · Catálogo, búsqueda y mantenimiento del inventario

- **Reutilización.**
  Revisa appliance-catalog y appliance-finder del doméstico.
  Criterio de aceptación: Reutiliza datos y lógica útiles con interfaz empresarial.

- **Procedencia.**
  Muestra fuente y carácter genérico o comercial de cada referencia.
  Criterio de aceptación: No atribuye una ficha técnica a un listado sin potencia verificada.

- **Potencia sugerida.**
  Solicita revisar o confirmar valores antes de incorporarlos.
  Criterio de aceptación: La elección del catálogo no oculta supuestos técnicos.

- **Búsqueda global.**
  Busca por nombre, categoría, marca, edificio y espacio.
  Criterio de aceptación: Los resultados muestran claramente su ubicación.

- **Filtros.**
  Filtra por piso, categoría, método y estado de inclusión.
  Criterio de aceptación: Se pueden limpiar filtros y ver cuántos resultados hay.

- **Ordenación.**
  Ordena por consumo, costo, cantidad o nombre.
  Criterio de aceptación: Los desconocidos se distinguen de los ceros.

- **Edición agrupada.**
  Permite ajustar horarios de grupos seleccionados con revisión.
  Criterio de aceptación: No altera equipos excluidos de la selección.

- **Resumen de cambios.**
  Muestra cantidad de registros y efecto estimado antes de aplicar.
  Criterio de aceptación: El usuario reconoce el alcance completo.

- **Equipos esenciales.**
  Permite marcar equipos que no deben reducirse automáticamente.
  Criterio de aceptación: Las propuestas respetan esa marca.

- **Historial mínimo.**
  Guarda fecha y autor de cambios relevantes si el esquema lo permite.
  Criterio de aceptación: No inventa un historial previo inexistente.

- **Consistencia de cantidad.**
  Valida enteros y límites de unidades en cliente y servidor.
  Criterio de aceptación: No se aceptan cantidades negativas o fraccionarias.

- **Recuperación.**
  Ofrece deshacer donde sea viable con revisión de concurrencia.
  Criterio de aceptación: No restaura un estado antiguo encima de cambios de otro usuario.

## 10 · Edificio 3D completo y varios pisos

- **WebGL principal.**
  Usa three.js para edificio, piso y espacio cuando esté disponible.
  Criterio de aceptación: No alterna arbitrariamente entre dos estilos al cambiar de nivel.

- **Composición modular.**
  Instancia geometría de arquitectura para cada piso registrado.
  Criterio de aceptación: Un edificio de tres pisos muestra tres módulos identificables.

- **Contenido correcto.**
  Vincula cada módulo con su floorId estable.
  Criterio de aceptación: Seleccionar Piso 2 nunca muestra inventario del Piso 1.

- **Cubierta única.**
  Coloca la cubierta del edificio sobre el último piso visible.
  Criterio de aceptación: Duplicar módulos no deja techos flotando dentro del edificio.

- **Fachada.**
  Mantén una fachada legible que se pueda abrir o atenuar.
  Criterio de aceptación: El modo exterior no impide acceder al interior.

- **Selector vertical.**
  Incluye botones de piso junto al visor o en un panel fijo.
  Criterio de aceptación: Se cambia de piso sin localizar una cara pequeña con el ratón.

- **Piso seleccionado.**
  Destaca el módulo activo y muestra su nombre.
  Criterio de aceptación: El estado se comprende incluso sin color.

- **Vista aislada.**
  Permite aislar el piso activo ocultando los demás temporalmente.
  Criterio de aceptación: Una acción visible restaura el edificio completo.

- **Vista explotada.**
  Separa verticalmente pisos con transición moderada.
  Criterio de aceptación: La separación conserva nombres y selección.

- **Muchos pisos.**
  Aplica detalle progresivo y carga de interiores bajo demanda.
  Criterio de aceptación: No instancia muebles de cientos de pisos innecesariamente.

- **Cámara inicial.**
  Encuadra el edificio completo según sus dimensiones actuales.
  Criterio de aceptación: No recorta el segundo piso al crear uno nuevo.

- **Control manual.**
  Permite rotación, zoom, restablecer y vistas predefinidas.
  Criterio de aceptación: La cámara responde sin reiniciarse por cada actualización de datos.

## 11 · Interiores visibles y transición de apertura

- **Entrar al piso.**
  Al elegir Abrir piso retira techo y caras que obstruyen.
  Criterio de aceptación: Los cuartos se ven sin descubrir un gesto oculto.

- **Interior por defecto.**
  En la vista de piso prioriza el interior abierto.
  Criterio de aceptación: La fachada no ocupa casi toda la pantalla.

- **Recorte arquitectónico.**
  Usa ocultación, atenuación o corte de paredes adecuado.
  Criterio de aceptación: Los equipos importantes no quedan detrás de muros opacos.

- **Clips existentes.**
  Revisa Roof_Open y Facade_Open antes de reutilizarlos.
  Criterio de aceptación: La reproducción corresponde a los tiempos exportados.

- **Tiempo real.**
  Obtén duración y marcas de animación del activo o manifiesto.
  Criterio de aceptación: Evita depender de un FPS fijo no verificado.

- **Fotogramas iniciales.**
  Comprueba la conversión entre fotogramas de Blender y segundos glTF.
  Criterio de aceptación: La apertura llega a una posición final comprobable.

- **Elementos retirados.**
  Excluye techo y fachada apartados del cálculo de encuadre interior.
  Criterio de aceptación: El piso no se vuelve diminuto durante la apertura.

- **Animación visible.**
  Muestra una transición perceptible al entrar por primera vez.
  Criterio de aceptación: No salta antes de que el modelo termine de cargar.

- **Volver al edificio.**
  Restaura componentes y cámara con un recorrido coherente.
  Criterio de aceptación: No deja una cubierta en el piso equivocado.

- **Interrupciones.**
  Permite cambiar de piso mientras una transición está activa.
  Criterio de aceptación: Cancela o sustituye la animación sin estados intermedios rotos.

- **Movimiento reducido.**
  Aplica el estado final de inmediato si la preferencia está activa.
  Criterio de aceptación: La ausencia de movimiento se explica sin tratarla como fallo.

- **Errores.**
  Si falla un clip, abre el interior mediante un estado estático válido.
  Criterio de aceptación: No deja el piso cerrado e inaccesible.

## 12 · Cuartos 3D y representación real del inventario

- **Detalle de cuarto.**
  Seleccionar un espacio acerca la cámara y abre su inventario.
  Criterio de aceptación: La vista identifica el espacio y el piso activo.

- **Cuatro aires.**
  Si se registran cuatro aires iguales, representa cuatro unidades o un grupo rotulado.
  Criterio de aceptación: La cantidad visible corresponde al dato guardado.

- **Tres focos.**
  Si se registran tres luminarias, representa tres o un grupo con cantidad tres.
  Criterio de aceptación: No conserva las luminarias fijas del ejemplo como inventario real.

- **Instancias.**
  Usa instancias o geometría compartida para equipos repetidos.
  Criterio de aceptación: La representación escala sin duplicar materiales innecesariamente.

- **Ubicación inicial.**
  Distribuye equipos en posiciones válidas según categoría.
  Criterio de aceptación: Los aires no aparecen encima de una pantalla o dentro de una mesa.

- **Distribución editable.**
  Permite ajustar posición visual sin cambiar consumo.
  Criterio de aceptación: Mover un objeto no modifica potencia ni horario.

- **Equipos abundantes.**
  Agrupa cantidades grandes con indicador claro y detalle desplegable.
  Criterio de aceptación: No intenta dibujar miles de focos individuales.

- **Categoría genérica.**
  Proporciona un proxy reconocible cuando no hay un modelo específico.
  Criterio de aceptación: Siempre se muestra nombre y categoría reales del registro.

- **Selección de equipo.**
  Implementa selección por raycast y alternativa en lista.
  Criterio de aceptación: El panel abre exactamente el equipo seleccionado.

- **Eliminar equipo.**
  Retira su instancia o actualiza la cantidad del grupo.
  Criterio de aceptación: No quedan objetos fantasma tras guardar.

- **Decoración.**
  Distingue muebles decorativos de equipos contabilizados.
  Criterio de aceptación: Una silla no se incluye como consumo eléctrico.

- **Leyenda honesta.**
  Informa qué geometría es esquemática y qué datos provienen del inventario.
  Criterio de aceptación: La estética no sugiere sensores o precisión inexistentes.

## 13 · Materiales, etiquetas y consumo sobre el modelo

- **Identidad 3D.**
  Armoniza fondos y controles con el dashboard amarillo.
  Criterio de aceptación: El modelo mantiene contraste sin teñirlo todo de amarillo.

- **Color analítico.**
  Separa acabado arquitectónico de capa de consumo.
  Criterio de aceptación: Desactivar la capa restaura materiales originales.

- **Leyenda.**
  Define rangos, unidad, periodo y alcance de la escala.
  Criterio de aceptación: La misma cifra no cambia de significado silenciosamente.

- **Escala comparable.**
  Permite fijar escala al comparar pisos o edificios.
  Criterio de aceptación: Cambiar selección no exagera diferencias por autoscaling oculto.

- **Etiqueta de piso.**
  Muestra nombre y consumo del piso cuando sea legible.
  Criterio de aceptación: No tapa el interior con etiquetas redundantes.

- **Etiqueta de espacio.**
  Muestra nombre, kWh y estado de datos del espacio.
  Criterio de aceptación: Los textos coinciden con el panel numérico.

- **Datos incompletos.**
  Usa una señal de cobertura parcial además del valor conocido.
  Criterio de aceptación: Un total parcial no parece un total completo.

- **Sin datos.**
  Representa ausencia con texto y patrón o señal adicional.
  Criterio de aceptación: El gris no se confunde con consumo cero.

- **Cero válido.**
  Distingue un equipo excluido o un cero registrado de desconocido.
  Criterio de aceptación: Las agregaciones y etiquetas conservan esa diferencia.

- **Selección.**
  Usa contorno o estado visible que no destruya el mapa de consumo.
  Criterio de aceptación: El usuario identifica selección y categoría analítica a la vez.

- **Oclusión.**
  Oculta o recoloca etiquetas tapadas por geometría según la vista.
  Criterio de aceptación: No aparecen textos de habitaciones traseras sobre las delanteras.

- **Accesibilidad.**
  Replica los valores de la escena en una tabla o lista accesible.
  Criterio de aceptación: La interpretación completa no depende del color ni del canvas.

## 14 · Gráficas, paneles de piso y detalle de equipos

- **Resumen de piso.**
  Muestra espacios, equipos, unidades y consumo del piso.
  Criterio de aceptación: Se entiende qué contiene antes de entrar a cada cuarto.

- **Texto concreto.**
  Incluye resúmenes como 4 aires, 3 luminarias y 2 computadores.
  Criterio de aceptación: Calcula los conteos desde el inventario real.

- **Gráfica por espacio.**
  Añade barras con kWh de cada espacio del piso.
  Criterio de aceptación: Cada barra permite seleccionar su espacio.

- **Gráfica por categoría.**
  Agrupa climatización, iluminación, informática y otras categorías.
  Criterio de aceptación: El total coincide con el subtotal conocido.

- **Participación.**
  Muestra porcentaje solo con denominador válido y explícito.
  Criterio de aceptación: No calcula porcentajes sobre cero o datos incompatibles.

- **Detalle de equipo.**
  Expone cantidad, potencia, uso, factor y resultado.
  Criterio de aceptación: Se puede seguir la fórmula de inicio a fin.

- **Costo.**
  Calcula costo energético con tarifa aplicable y origen visible.
  Criterio de aceptación: Aclara que puede no incluir todos los cargos de factura.

- **Filtros.**
  Sincroniza filtros de gráficas, tablas y escena.
  Criterio de aceptación: No muestra un total global junto a un desglose filtrado sin aviso.

- **Tendencias.**
  Presenta historial solo cuando existen registros temporales.
  Criterio de aceptación: No inventa curvas diarias desde un total mensual.

- **Unidades.**
  Usa kWh, W, kW y moneda con precisión coherente.
  Criterio de aceptación: No llama consumo a potencia instalada.

- **Tablas equivalentes.**
  Ofrece tabla para cada gráfica principal.
  Criterio de aceptación: Exportación y visualización usan los mismos datos.

- **Pantalla pequeña.**
  Permite alternar visor y panel sin perder selección.
  Criterio de aceptación: El detalle no queda reducido a una columna ilegible.

## 15 · Cálculos, cobertura y datos temporales

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

## 16 · Funciones domésticas llevadas a empresas

- **Resumen doméstico.**
  Adapta el resumen a organización, edificio, piso y espacio.
  Criterio de aceptación: Conserva claridad y añade selección de alcance.

- **Lecturas.**
  Permite registrar lecturas de medidores identificados.
  Criterio de aceptación: No mezcla lecturas de medidores distintos al calcular intervalos.

- **Facturas.**
  Asocia facturas a edificio o contrato con periodos y edición.
  Criterio de aceptación: Valida solapamientos dentro del mismo alcance.

- **Comparar facturas.**
  Incluye kWh, kWh/día, importe y diferencias comparables.
  Criterio de aceptación: Un periodo anterior de cero no genera porcentajes inválidos.

- **Presupuesto mensual.**
  Permite establecer presupuesto por edificio y consolidarlo.
  Criterio de aceptación: El consolidado diferencia límites asignados y gasto estimado.

- **Presupuesto anual.**
  Adapta registro por año y meses con datos.
  Criterio de aceptación: Los meses sin factura se muestran sin datos.

- **Simulador individual.**
  Permite cambiar horas y días de un equipo empresarial.
  Criterio de aceptación: Muestra efecto en espacio, piso y edificio.

- **Plan conjunto.**
  Permite reunir propuestas de varios equipos y revisarlas.
  Criterio de aceptación: Aplicar requiere confirmación del conjunto exacto.

- **Meta de reducción.**
  Reutiliza la lógica doméstica de metas con límites explícitos.
  Criterio de aceptación: No promete una meta imposible con las restricciones dadas.

- **Exclusiones.**
  Protege equipos esenciales y métodos no ajustables por horario.
  Criterio de aceptación: No propone apagar servidores solo por ser grandes consumidores.

- **Tarifas y fuentes.**
  Adapta consulta de fuentes a contratos empresariales.
  Criterio de aceptación: No aplica subsidios o estratos residenciales por defecto.

- **Copias y CSV.**
  Ofrece informes y copias empresariales con formatos diferenciados.
  Criterio de aceptación: No confunde un CSV de informe con un respaldo restaurable.

## 17 · Simulación, ahorro y escenarios empresariales

- **Escenario aislado.**
  Mantén borradores separados del inventario guardado.
  Criterio de aceptación: Explorar un horario no cambia datos reales automáticamente.

- **Varios espacios.**
  Permite simular cambios en varios espacios del edificio.
  Criterio de aceptación: Los subtotales muestran dónde se produce el efecto.

- **Horarios operativos.**
  Admite perfiles de oficina y turnos cuando sean necesarios.
  Criterio de aceptación: No obliga a todas las empresas a usar un horario residencial.

- **Días efectivos.**
  Explica cómo el escenario traduce días de operación a consumo.
  Criterio de aceptación: No multiplica otra vez por días en un valor mensual conocido.

- **Climatización.**
  Permite simular horas sin fingir un cálculo térmico avanzado.
  Criterio de aceptación: El ahorro depende de variables registradas y supuestos visibles.

- **Iluminación.**
  Permite comparar potencia y horario de una sustitución propuesta.
  Criterio de aceptación: Diferencia ahorro energético de inversión y retorno económico.

- **Antes y después.**
  Muestra kWh y costo antes, después y diferencia.
  Criterio de aceptación: Usa la misma tarifa salvo cambio explícito de escenario.

- **Límites de ahorro.**
  Muestra si la meta no es alcanzable con equipos ajustables.
  Criterio de aceptación: No reduce potencias o horarios por debajo de límites válidos.

- **Plan desactualizado.**
  Detecta equipos editados o eliminados desde su creación.
  Criterio de aceptación: Bloquea aplicar hasta revisar los cambios afectados.

- **Aplicación segura.**
  Envía revisión actual y opera en transacción.
  Criterio de aceptación: Un conflicto no aplica la mitad del plan.

- **Deshacer.**
  Ofrece reversión compatible con concurrencia y permisos.
  Criterio de aceptación: No revierte cambios posteriores de otros usuarios.

- **Demostración editable.**
  Permite experimentar en sandbox local identificado y reiniciable.
  Criterio de aceptación: Nunca persiste el sandbox en una cuenta real sin importación explícita.

## 18 · Datos, seguridad y persistencia empresarial

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

## 19 · Rendimiento, accesibilidad y robustez del visor

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

## 20 · Validación, prioridades y entrega final

- **Etapa inicial.**
  Entrega identidad amarilla y navegación coherente con datos existentes.
  Criterio de aceptación: La primera revisión reconoce el doméstico adaptado a empresas.

- **Etapa 3D.**
  Entrega edificio con varios pisos e interiores abiertos.
  Criterio de aceptación: Piso 2 es visible, seleccionable y distinto del Piso 1.

- **Etapa inventario.**
  Vincula cantidades, selección y representación de equipos.
  Criterio de aceptación: Cambiar cuatro aires a tres actualiza escena, panel y totales.

- **Etapa funciones.**
  Completa facturas, presupuesto, simulador, planes y copias adaptadas.
  Criterio de aceptación: No deja botones de funciones futuras sin comportamiento claro.

- **Caso demostrativo.**
  Prepara un edificio de tres pisos con distribuciones diferentes.
  Criterio de aceptación: Incluye un piso con cuatro espacios y otro con seis.

- **Caso concreto.**
  Incluye un espacio con cuatro aires y tres luminarias editables.
  Criterio de aceptación: Los conteos y cálculos coinciden en todos los paneles.

- **Pruebas necesarias.**
  Ejecuta checks y pruebas pertinentes a cambios y riesgos reales.
  Criterio de aceptación: Informa comandos y resultados sin afirmar ejecuciones inexistentes.

- **MySQL real.**
  Verifica aislamiento entre dos organizaciones y conflictos de revisión.
  Criterio de aceptación: No declara validación completa usando solo mocks.

- **Revisión visual.**
  Revisa dashboard, edificio, piso abierto, cuarto y móvil en navegador.
  Criterio de aceptación: Adjunta capturas y corrige solapamientos antes de entregar.

- **Sin regresiones.**
  Comprueba funciones domésticas afectadas y ausencia de enlaces empresariales.
  Criterio de aceptación: La experiencia doméstica conserva su comportamiento esperado.

- **Entrega honesta.**
  Resume cambios, funcionamiento, límites y pendientes concretos.
  Criterio de aceptación: Distingue lo implementado de lo planeado y de lo no probado.

- **Arranque final.**
  Deja el servidor local corriendo y entrega /empresarial accesible.
  Criterio de aceptación: El usuario puede abrir y revisar la experiencia entregada.

