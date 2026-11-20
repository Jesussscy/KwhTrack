# Correcciones técnicas empresariales — 17 de noviembre de 2026

## Defecto observado y causa comprobada

En Chrome, antes de la corrección, la casilla «Pausar» recibía **253,9 px de ancho y 40 px de alto** dentro del formulario. La regla general `input,select,textarea` aplicaba `width:100%` y `min-height:40px` también a los controles binarios. El diálogo tenía más contenido que altura disponible y su botón Guardar quedaba fuera de la zona visible.

Ahora los campos textuales, checkbox, radio y range tienen reglas separadas. Las casillas del formulario miden **18 × 18 px**, dentro de etiquetas seleccionables con texto y explicación. La cabecera y las acciones permanecen visibles; solo el cuerpo del diálogo se desplaza. El fondo queda bloqueado mientras el modal está abierto.

La corrección está en los estilos empresariales. No se modificaron estilos ni controles domésticos en esta etapa.

## Cambios implementados

### Diálogos

- Se reconstruye el formulario en cada apertura, eliminando listeners de formularios anteriores. Antes se añadían manejadores sobre el mismo nodo reutilizado.
- Se conserva la validación de dos pasos de facturas y sus controladores de cancelación.
- Un evento de cierre pendiente no cancela ni desbloquea un diálogo recién abierto.
- Se bloquean los controles durante una escritura y se impiden envíos duplicados.
- Escape y los botones de cerrar no ocultan una escritura pendiente. Una vez terminada, el cierre normal vuelve a estar disponible.
- La revisión del edificio y el contexto de demostración se capturan al abrir. Cambios de contexto bloquean el guardado antiguo.
- Ante un error se restauran los controles, se conservan valores y se enfoca el campo indicado o el mensaje general.
- Los errores se muestran dentro de la zona desplazable sin ocultar las acciones.

### Equipos y cálculos

- `frontend/enterprise-forms.js` centraliza la lectura y validación de equipos.
- Se verifican nombre, categoría, método, cantidad, potencia, horas, días, factor y consumo mensual.
- Cantidad y días requieren enteros. Los límites de potencia y consumo mensual coinciden con el servidor: hasta 1.000.000 en sus respectivas unidades.
- Los vacíos permitidos siguen siendo desconocidos. Horas, días y factor con valor cero permanecen en cero. El factor vacío usa uno, con explicación visible.
- Las entradas numéricas incompletas del navegador no se guardan como desconocidas silenciosamente.
- Cambiar el método deshabilita los campos incompatibles, que no se incluyen en FormData.
- La vista previa inicial explica qué datos faltan sin mostrar prematuramente un error de nombre.
- Se conservan los cálculos energéticos compartidos, las protecciones del simulador y el significado de «Pausar»: no controla aparatos.
- Los límites numéricos del sandbox se alinearon con los del formulario para equipos.

### Transporte, contexto y fechas

- Los errores de conexión durante escritura advierten que hay que consultar el estado actual antes de reintentar. No se hace un reintento automático.
- Las respuestas HTML, JSON inválido y objetos de éxito sin edificio válido se presentan como fallos comprensibles, sin anunciar guardados.
- Las mutaciones conservan el identificador y revisión del edificio solicitado; una respuesta tardía no elimina o recarga accidentalmente otro edificio activo.
- Solo se anuncia que se cargó la versión actual después de comprobar que esa consulta tuvo éxito.
- El servidor valida fechas civiles mediante comparación con su representación UTC. Rechaza fechas normalizadas por Date.parse, como 30 de febrero o 31 de abril, en registros, tarifas y lecturas.
- No se añadieron dependencias, migraciones ni cambios de permisos.

## Verificación

| Comprobación ejecutada | Resultado |
| --- | --- |
| `npm run check` | Sin errores |
| `npm test` | 135 aprobadas, 6 omitidas por configuración de integraciones en esa ejecución |
| `npm run test:mysql:org` | 35 aprobadas, ninguna omitida |
| `npm run test:mysql` | 14 aprobadas, ninguna omitida |
| Formularios en Chrome | 25 comprobaciones |
| Cuenta, conflictos y transporte en Chrome con MySQL | 18 comprobaciones |
| Facturas en Chrome | 21 comprobaciones |
| Pronóstico en Chrome | 22 comprobaciones |
| Simulador guiado en Chrome | 35 comprobaciones |
| Edificio y demostración 3D en Chrome | 22 comprobaciones |

Las nuevas pruebas puras cubren 10 casos de formularios y 2 casos de fechas; están incluidas en las 135 aprobadas. Las integraciones empresariales incluyen rechazo de fechas inexistentes sin crear registros.

El recorrido con cuenta usa una organización sintética y la elimina al terminar. Simula una escritura pendiente mediante una compuerta controlada, verifica un solo envío, comprueba Escape, completa el guardado real y después simula desconexión, HTML y JSON incompleto. Los fallos controlados no modifican MySQL.

Se revisaron las casillas con Espacio, la conservación del foco, los errores, los campos ocultos y anchos emulados de 320, 390 y 500 px. También se comprobaron persistencia al recargar y edición concurrente sin sobrescribir la revisión más reciente.

## Evidencias y revisión local

- `tmp/forms-reliability/01-controls-corrected.png`: controles, etiquetas y pie visible.
- `tmp/forms-reliability/02-validation.png`: error de nombre y foco asociado.
- `tmp/forms-reliability/03-mobile-controls.png`: formulario en móvil emulado.
- `tmp/forms-reliability/results.json`: comprobaciones de formularios.
- `tmp/savings-account/03-network-draft.png`: conservación del borrador ante desconexión.
- `tmp/savings-account/results.json`: pruebas con cuenta y transporte.

Abrir: `http://127.0.0.1:3000/empresarial#demo&sec=edificios&floor=1&space=1&level=space` y seleccionar **Agregar equipo**.

## Límites de esta revisión

No es una certificación integral de seguridad ni de accesibilidad. No se utilizó lector de pantalla, teléfono físico ni GPU real para medir rendimiento. No se volvió a medir la tabla histórica de rendimiento, puesto que no se modificaron geometrías ni el motor de render.

El alcance de esta etapa son los defectos observados de formularios, su ciclo de vida y las validaciones relacionadas, junto con regresiones funcionales del proyecto. El resto de características se conservó; no se afirma haber reimplementado cada punto del documento de mil líneas como una función nueva.

El servidor permanece en localhost con MySQL conectado. No se publicó ni se hizo commit.
