# Ampliación operativa empresarial

Fecha: 17 de noviembre de 2026. Trabajo local, sin publicación ni commit.

## Dónde revisar los cambios

- Inventario: `http://127.0.0.1:3000/empresarial?mejoras=operacion-v2#demo&sec=inventario`.
- Datos pendientes: `http://127.0.0.1:3000/empresarial?mejoras=operacion-v2#demo&sec=calidad`.

Estos enlaces conservan el ejemplo existente del navegador; no lo restablecen. Las capturas y pruebas usan perfiles aislados y datos ilustrativos.

## Cambios concretos de esta ampliación

| Área | Comportamiento nuevo o ampliado |
| --- | --- |
| Inventario | Tarjetas con ubicación, cantidad, potencia, horas declaradas, días, factor y consumo |
| Inventario | Alternativa de tabla con desplazamiento dentro de su contenedor |
| Gestión | Editar directamente sin abrir el visor 3D |
| Gestión | Añadir equipos eligiendo un espacio del edificio |
| Gestión | Duplicar con identidad nueva desde el inventario |
| Gestión | Mover a otro espacio mediante revisión explícita |
| Gestión | Pausar y reactivar, conservando datos declarados |
| Gestión | Quitar equipos con confirmación existente |
| Contexto | Formularios abiertos con la ubicación del equipo seleccionado |
| Estados | Indicadores de activo, incompleto, pausado y esencial |
| Búsqueda | Coincidencia sin depender de tildes o mayúsculas |
| Búsqueda | Incluye nombre, categoría, piso, espacio y tipo de espacio |
| Filtros | Separación entre activos, calculables, pendientes, pausados y esenciales |
| Filtros | Piso, categoría y método combinables |
| Orden | Nombre, mayor consumo o mayor cantidad |
| Volumen | Páginas de 12, 24 o 48 grupos |
| Volumen | Se ajusta la última página cuando cambia el resultado |
| Exportación | CSV de todos los resultados filtrados, no solo la página visible |
| Exportación | Protección de celdas que podrían interpretarse como fórmulas |
| Estado local | Filtros y presentación separados por edificio y contexto de demostración/cuenta |
| Calidad | Sección nueva «Completar datos» |
| Calidad | Lista de equipos activos incompletos con los campos pendientes |
| Calidad | Corrección directa del mismo equipo, sin crear otro |
| Calidad | Espacios sin inventario mostrados por separado |
| Calidad | Registrar equipo con el espacio pendiente preseleccionado |
| Calidad | Cobertura del inventario activo, incluyendo servicios comunes |
| Calidad | Pausados fuera del denominador de cobertura |
| Preparación | Accesos a tarifa, presupuesto e historial, con su propósito explicado |
| Formularios | Confirmación antes de descartar datos modificados mediante Cancelar o Escape |
| Formularios | «Seguir editando» conserva los valores y «Descartar» no guarda |
| Guardado | Etiqueta visible «Procesando…» mientras la operación está pendiente |
| Guardado | Aviso de cambios guardados cuando corresponde a una mutación confirmada |
| Avisos | Notificaciones visibles y cerrables, además del anuncio para tecnologías de asistencia |
| Navegación | Secciones incorporadas al historial del navegador |
| Navegación | Atrás y Adelante conservan los filtros del inventario |
| Lectura | Una sección nueva comienza arriba; al volver se restaura la posición guardada |
| Arranque | Pantalla de conexión en lugar de contenido vacío |
| Arranque | Se puede elegir la demostración mientras se comprueba la sesión |
| Arranque | Una respuesta tardía de sesión no sustituye la demostración elegida |
| Arranque | Error de sesión con opción explícita de volver a comprobar |
| Transporte | Función compartida para peticiones con sesión y CSRF |
| Transporte | Límite de espera de 20 segundos con cancelación de la petición |
| Transporte | Diferencia entre lectura fallida y escritura cuyo resultado puede ser incierto |
| Transporte | Conserva códigos de sesión y conflictos para su tratamiento |
| Transporte | No reintenta escrituras automáticamente |
| Sesión | Aviso visible si una operación devuelve sesión vencida |
| Salida | El navegador recibe una solicitud de protección si hay un formulario modificado o escritura pendiente |

La confirmación del navegador al cerrar o recargar depende de las reglas de activación del navegador. Se verificó el manejador de beforeunload durante una escritura; no se afirma controlar cierres forzados del proceso.

## Conservación de funciones existentes

No se cambiaron fórmulas energéticas, modelos predictivos, geometrías, esquemas de MySQL ni permisos de organización. Las acciones nuevas usan las APIs existentes, conservan CSRF y revisiones, y pasan por las mismas confirmaciones y transacciones.

El consumo desconocido permanece desconocido. Un equipo pausado no representa un aparato físicamente apagado. Los porcentajes de cobertura describen datos calculables, no eficiencia ni exactitud de mediciones. Tener seis registros introducidos no garantiza que sean válidos para entrenar el pronóstico.

No se añadieron dependencias. Los archivos domésticos que ya estaban modificados en el árbol de trabajo no fueron editados por esta ampliación. No se añadieron enlaces domésticos a empresarial.

## Código principal

- `frontend/enterprise-inventory.js`: selección, orden, páginas, calidad, exportación y vistas operativas.
- `frontend/enterprise-transport.js`: contrato de solicitudes, cancelación, límites de espera y errores.
- `frontend/enterprise-operations.css`: tarjetas, calidad, móvil y avisos.
- `frontend/empresarial.js`: integración, acciones, formularios, protección de borradores, historial y arranque.
- `frontend/empresarial.html`: carga de recursos, aviso visible y confirmación de descarte.
- `backend/server.js`: rutas de recursos nuevas.

Los campos de reloj del simulador continúan siendo borradores de sesión, como se explica en la entrega anterior. Esta ampliación no añade programación física de equipos.

## Pruebas ejecutadas

| Comprobación | Resultado |
| --- | --- |
| Comprobaciones de sintaxis `npm run check` | Correctas |
| Suite general `npm test` | 145 aprobadas, 6 omitidas por configuración de integración en esa ejecución |
| Integración empresarial con MySQL real | 35 aprobadas, 0 omitidas |
| Operaciones y arranque en Chrome | 34 comprobaciones aprobadas |
| Cuenta, transporte e inventario con MySQL y sin WebGL | 24 comprobaciones aprobadas |
| Formularios en Chrome | 25 aprobadas |
| Facturas en Chrome | 21 aprobadas |
| Pronóstico en Chrome | 22 aprobadas |
| Ahorro guiado en Chrome | 35 aprobadas |
| Resumen en Chrome | 12 aprobadas |

La suite general incluye diez pruebas nuevas de selección, estados, paginación, cobertura, CSV, transporte, sesión y tiempos límite. Los recorridos verifican edición, pausa, reactivación y corrección de equipos en MySQL real; cada organización sintética se elimina al terminar.

Las pruebas de navegación detectaron que el cliente CDP generaba clics no cancelables. Se corrigió ese cliente para respetar preventDefault, como un clic normal, y verificar Atrás/Adelante sin entradas artificiales duplicadas.

## Evidencias

- `tmp/operations/01-inventory.png`: inventario renovado.
- `tmp/operations/02-quality.png`: pendientes y cobertura.
- `tmp/operations/03-unsaved.png`: confirmación de descarte.
- `tmp/operations/04-mobile-quality.png`: móvil emulado.
- `tmp/operations/kwh-inventario-filtrado.csv`: exportación de prueba.
- `tmp/operations/results.json`: comprobaciones operativas y de arranque.
- `tmp/savings-account/results.json`: comprobaciones con cuenta y MySQL.

## Alcance y límites

El documento de mil líneas contiene instrucciones de implementación, conservación y verificación; no representa mil funciones nuevas ni se contabilizaron líneas de código como mejoras. La tabla anterior identifica los cambios concretos de esta ampliación para revisarlos en la aplicación.

Se mantienen pendientes verificaciones con lector de pantalla, teléfono físico y GPU real. No se realizó una certificación de seguridad ni una medición nueva del rendimiento del motor 3D. La revisión se concentró en operaciones, claridad de datos, navegación, formularios y recuperación de fallos.
