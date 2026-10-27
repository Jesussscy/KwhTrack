# Revisión continua de kwhTrack

Se trabaja por ciclos. Una mejora se considera verificada cuando pasan las comprobaciones correspondientes y se revisa el flujo afectado. No se añaden tecnologías ni procesos ajenos al producto.

## Ciclo actual — 16 de octubre de 2026

- [x] Guardar el plan junto con los datos del hogar, compatible con copias antiguas.
- [x] Recuperar el plan al deshacer su aplicación.
- [x] Añadir el registro anual de facturas por fecha de cierre y exportación del año.
- [x] Distinguir meses sin datos y facturas de valor cero.
- [x] Incorporar movimiento sutil de paneles respetando movimiento reducido.
- [x] Iniciar la simulación con el horario actual, sin proponer automáticamente una reducción.
- [x] Mostrar las iniciales del nombre real configurado del hogar.
- [x] Avisar antes de descartar cambios al cerrar diálogos o navegar desde el menú.
- [x] Mostrar errores junto a fechas y lecturas, con foco y nombres accesibles estables.
- [x] Conservar la edición al usar Atrás/Adelante y mantener el recorrido del historial.
- [x] Pasar el foco al contenido principal al cambiar de sección.
- [x] Detectar cambios guardados en otra pestaña antes de escribir y ofrecer revisión/carga.
- [x] Bloquear el guardado normal sobre datos locales dañados.
- [x] Descargar el original sin modificar y archivarlo antes de restaurar una copia.
- [x] Verificar estos recorridos con un hogar sintético en un origen local separado.
- [x] Preparar MySQL aislado para kwhTrack, con una cuenta de aplicación de permisos limitados.
- [x] Implementar registro, inicio/cierre de sesión, scrypt, cookies HttpOnly, CSRF y límites de intentos en la API.
- [x] Implementar CRUD MySQL por hogar para equipos, lecturas y facturas.
- [x] Validar importaciones completas, importes, fechas y reglas de negocio en el servidor.
- [x] Guardar en transacciones y rechazar revisiones antiguas, incluso ante dos escrituras simultáneas.
- [x] Leer cada hogar desde una instantánea consistente para evitar mezclar versiones entre tablas.
- [x] Verificar aislamiento entre dos cuentas y conservación de datos/sesión al reiniciar servidor y pool.
- [x] Comprobar que los encabezados CSP permiten cargar y navegar la interfaz existente sin errores de consola.

## Próximos puntos de revisión

- Revisar navegación con teclado, foco tras guardar/cancelar y legibilidad de gráficos.
- Definir escritura coordinada para cambios estrictamente simultáneos entre pestañas; la comprobación actual detecta diferencias previas al guardado, pero no es una transacción distribuida.
- Reducir duplicación en las funciones de interfaz antes de seguir ampliando controles.
- Revisar cargas lentas y pérdida de conexión durante el guardado de copias.
- Comprobar navegación con teclado y respuesta visual de los avisos de sesión en pantallas pequeñas.
- Preparar una migración SQL no destructiva para instalaciones que hayan importado un esquema anterior.

La tarifa histórica sigue identificada como tal. No existe telemetría de Afinia ni se afirma que las estimaciones sean facturas reales. MySQL y las cuentas están conectados con la interfaz mediante guardado/carga manual con revisión y confirmación. El hogar local existente se conserva.

Comprobaciones de este ciclo: 38 pruebas unitarias y 11 escenarios de integración por HTTP contra MySQL real. Navegación del resumen y del presupuesto comprobada en navegador; sin errores/avisos de consola al cargar con CSP. Las cuentas de integración se eliminaron al terminar cada ejecución.

## Ciclo del 18 de octubre de 2026 — comparación de versiones

- [x] Incorporar Cuenta y copias a la documentación de funciones disponibles.
- [x] Detallar añadidos, modificados y eliminados para equipos, lecturas, facturas y plan.
- [x] Comparar configuración y valores anteriores/propuestos en la dirección de la sustitución.
- [x] Evitar cambios falsos por el orden de las listas y avisar si los datos coinciden.
- [x] Conservar las dos versiones al revisar/cancelar y mantener la confirmación explícita.
- [x] Verificar en navegador un equipo añadido y un horario modificado, tanto al guardar como al cargar; sin errores de consola en ese recorrido.

Comprobación actual: 42 pruebas unitarias aprobadas; integración MySQL aprobada con 12 escenarios (13 nodos de prueba contando el contenedor). La integración se ejecutó aparte con el entorno local; la suite sin entorno la omite. El laboratorio usa datos y cuentas sintéticos.

## Ciclo del 18 de octubre de 2026 — recuperación de sesión

- [x] Identificar sesión vencida, cambio de cuenta y verificación CSRF con códigos de API estables.
- [x] Ofrecer Volver a iniciar sesión o Actualizar sesión desde la revisión fallida.
- [x] Exigir una nueva revisión tras recuperar acceso; no repetir la escritura pendiente.
- [x] Conservar el hogar local y las copias remotas al recuperar el acceso.
- [x] Verificar en navegador vencimiento real de una sesión sintética y cambio de cuenta en otra pestaña.

Pruebas actuales: 45 unitarias y 13 escenarios HTTP/MySQL aprobados (14 nodos contando el contenedor). En navegador, recuperar sesión deja la copia remota sin equipos y el hogar local con su equipo; actualizar tras cambiar de cuenta muestra la identidad nueva y exige iniciar otra revisión. Sin avisos ni errores de consola en el recorrido comprobado.

## Ciclo del 19 de octubre de 2026 — respuestas interrumpidas

- [x] Mostrar un mensaje de recuperación si la conexión falla o la respuesta JSON queda incompleta.
- [x] Evitar mensajes técnicos de análisis JSON ante respuestas HTML o inválidas.
- [x] No reintentar automáticamente una escritura con resultado incierto.
- [x] Conservar los códigos de sesión/cuenta para dirigir a la recuperación correcta.
- [x] Verificar y retirar las dos cuentas sintéticas de recuperación: sus copias continuaban en revisión cero y sin equipos.

Pruebas actuales: 50 unitarias aprobadas y 13 escenarios HTTP/MySQL aprobados. Las respuestas interrumpidas se verifican con pruebas del cliente HTTP; el recorrido de sesión vencida y cuenta cambiada se comprobó en navegador en el ciclo anterior.

## Ciclo del 19 de octubre de 2026 — lectura de gráficos y presupuesto

- [x] Añadir una tabla completa de equipos, incluidos los pausados, con consumo, costo y participación.
- [x] Añadir tabla de la proyección mensual/anual y mantener separados los registros reales.
- [x] Ocultar barras decorativas del árbol accesible cuando existe su alternativa textual.
- [x] Hacer enfocable el área de desplazamiento y conservar el ancho de página en móvil.
- [x] Corregir altura visual y mensajes de inventario con consumo cero.
- [x] Añadir un estado breve al cambiar el año de facturas y conservar foco con teclado.
- [x] Actualizar la explicación de guardado en la guía para incluir Cuenta y copias.

Comprobaciones: 50 pruebas unitarias aprobadas; revisión de sintaxis; apertura con Enter y desplazamiento enfocable; totales con inventario incluido y pausado; 12 barras de altura 0% con consumo cero; selección de 2024 y 2025 (factura cero diferenciada de ausencia). Móvil a 375 px: página de 360 px, tabla de 460 px dentro de una región de 284 px; sin ensanchar la página. Sin errores/avisos de consola en el recorrido. Se usó el origen desechable 3198 y no se modificó el hogar de 3000.

## Ciclo del 19 de octubre de 2026 — edición de facturas

- [x] Identificar la factura original en el título y el contexto del formulario.
- [x] Mostrar duración, consumo promedio y total pagado por día sin confundirlo con precio por kWh.
- [x] Distinguir valores cero, campos incompletos y periodos inválidos.
- [x] Proteger la cancelación de ediciones de lectura/factura con cambios pendientes.
- [x] Devolver el foco a una fila visible al actualizar/cancelar una factura, con resaltado repetible y movimiento reducido.
- [x] Verificar en navegador Seguir editando, actualización y descarte sin alterar el registro guardado.

Pruebas: 54 unitarias aprobadas y sintaxis correcta. En el origen sintético 3198, una factura de 31 días con total 31.000 COP mostró 1.000 COP/día; cancelar y seguir editando conservó el valor; guardar actualizó la fila; descartar una segunda edición mantuvo 31.000 COP. El foco volvió a bill2025 y su botón quedó visible. Sin avisos/errores de consola en el recorrido.

## Ciclo del 19 de octubre de 2026 — revisión del plan de ahorro

- [x] Explicar motivos específicos de propuestas desactualizadas: cambio de datos, pausa, eliminación, método mensual o valores inválidos.
- [x] Añadir Volver a simular para propuestas compatibles y un enlace al inventario en los demás casos.
- [x] Identificar la actualización de una propuesta existente y evitar duplicarla por equipo.
- [x] Mostrar horario actual/propuesto y consumo anterior/propuesto en la revisión.
- [x] Ofrecer Deshacer al quitar cambios o vaciar el borrador y conservar el inventario.
- [x] Mejorar el foco del grupo del plan y los textos para resultados pendientes o sin variación.

Verificación: 56 pruebas unitarias aprobadas y comprobación de sintaxis. En el hogar sintético 3198 se guardó una propuesta de 3 h sobre 5 h, se cambió la potencia de 100 a 200 W y se verificó el bloqueo por desactualización. Volver a simular permitió renovar un único cambio; la revisión mostró 5 → 3 h y 30 → 18 kWh/mes. Quitar/Deshacer y Vaciar/Deshacer recuperaron el borrador durante el aviso temporal. Sin avisos/errores de consola en el recorrido.

## Ciclo del 19 de octubre de 2026 — eliminación y deshacer

- [x] Identificar el registro y sus cifras antes de confirmar una eliminación.
- [x] Proteger formularios pendientes al eliminar y al deshacer.
- [x] Mantener deshacer disponible sin vencimiento por segundos, hasta guardar, recargar o cerrar el aviso.
- [x] Retirar la recuperación anterior al guardar o adoptar otra versión local.
- [x] Restaurar el foco a la fila recuperada, o a una acción útil tras eliminar.
- [x] Añadir nombres accesibles específicos a las acciones de lectura/factura.
- [x] Permitir un puerto de laboratorio alternativo sin cambiar el origen predeterminado.

Comprobación actual: sintaxis correcta y 60 pruebas unitarias aprobadas en el árbol de trabajo actual; integración MySQL omitida en esta ejecución sin entorno. En navegador se comprobó: factura eliminada y recuperada después de esperar 16 segundos; borrador de lectura conservado con Seguir editando y descartado solo tras confirmación; un nuevo guardado retira Deshacer; equipo restaurado con foco en test-fan. Se observó el bloqueo de una escritura ante cambios externos en 3198 y se completó la comprobación del equipo en el origen independiente 3201. Móvil a 375 px: página y aviso de 360 px, sin desbordamiento. Sin errores/avisos de consola en el recorrido final.
