# kwhTrack

[Código en GitHub](https://github.com/shift-jesus/KwhTrack) · [Fuentes y alcance de la guía de Cartagena](docs/fuentes-cartagena.md) · [Mejoras del proyecto](IMPROVEMENTS.md)

Aplicación local en HTML5, CSS3 y JavaScript puro, con servidor Node.js y API persistente MySQL. La interfaz conserva un espacio de trabajo en el navegador y permite guardar o cargar una copia del hogar en una cuenta MySQL, con revisión y confirmación explícitas.

## Plan por meta, equipos y tarifas

En Presupuesto anual puedes elegir una reducción de 0 a 50 % y obtener horarios propuestos por equipo. El cálculo empieza por los equipos ajustables de mayor consumo, mantiene los días y limita la reducción de horas al 35 % por defecto (configurable a 20 o 50 %). Los pasos son de 0,1 horas; por ese redondeo el ahorro puede superar ligeramente la meta. Puedes excluir equipos y se muestra cuánto falta cuando la meta no es alcanzable. Neveras, conectividad, categoría Otro, equipos pausados y consumos mensuales conocidos no reciben propuestas automáticas. La categoría no detecta equipos esenciales: deben excluirse manualmente.

La propuesta muestra costo actual, costo con el plan, límite mensual y ahorro acumulado a 12 meses con precio y hábitos constantes. No presenta una serie mensual medida. Revisar guarda el borrador; aplicar requiere confirmar los horarios y permite deshacer con el mecanismo existente.

Equipos eléctricos incorpora consolas, routers, cocina eléctrica, pequeños aparatos y herramientas, con ejemplos editables compatibles con las copias y la API. Tarifas y fuentes incluye conceptos visuales, un ejemplo interactivo y una consulta educativa por estrato. El estrato no modifica la tarifa ni liquida subsidios: se conserva el cálculo con el precio configurado y se enlazan fuentes de Afinia y Superservicios. La tarifa vigente de Afinia no pudo verificarse directamente; el valor inicial sigue identificado como referencia histórica.

## Ejecutar

Requiere Node.js 22.9 o posterior. Desde esta carpeta:

```powershell
cd backend
npm install
npm start
```

Abre http://127.0.0.1:3000. El servidor escucha únicamente en el equipo local. El frontend puede previsualizarse sin configurar MySQL.

## Carpetas

- `frontend/`: interfaz responsive, estilos, animaciones y flujos interactivos.
- `backend/`: servidor HTTP nativo de Node, cálculo validado, adaptador MySQL, pruebas y esquema SQL.
- `docs/`: procedencia, periodos y límites de las fuentes de la guía de estratos.

## Guía interactiva por estrato

En **Tarifas y fuentes**, selecciona el estrato de tu vivienda y cambia entre **Energía**, **Agua y alcantarillado**, **Aseo**, **Predial** y **Mi estrato**. Cada tema explica qué revisar y enlaza sus fuentes. Se distinguen los topes legales nacionales de los porcentajes locales que requieren verificación. La tabla de Veolia de enero de 2024 puede explorarse por estrato y condición del inmueble y siempre se identifica como histórica. El predial no se liquida con solo el estrato.

Los datos de la guía son educativos: no modifican la tarifa de energía ni el estrato oficial, no aplican subsidios automáticamente y no se suman al inventario. Consulta el [registro de fuentes](docs/fuentes-cartagena.md) para conocer qué pudo verificarse y qué requiere consultar el documento vigente.

## Funciones disponibles

Resumen calculado, CRUD de electrodomésticos, CRUD de lecturas, registro y eliminación de facturas, simulador con aplicación explícita del cambio, presupuesto, configuración del hogar y consulta de fuentes. El trabajo cotidiano se guarda en este navegador mediante localStorage. Cuenta y copias permite registrar/iniciar/cerrar sesión y trasladar una copia completa a MySQL o desde MySQL. La portada comienza con un inventario ilustrativo identificado como ejemplo; se puede vaciar desde Electrodomésticos.

Las vistas de consumo calculan el inventario; las lecturas y facturas se presentan por separado. No hay telemetría ni conexión automática con Afinia. El precio inicial de 1033.32 COP/kWh es una referencia histórica de septiembre de 2026 reportada por fuente secundaria, no tarifa vigente verificada. Puede sustituirse por el precio de la factura.

## Mejoras de experiencia

- Presupuesto mensual y anual vinculados, proyección a 12 meses y meta ajustable de reducción.
- Guía interactiva del factor de funcionamiento: 0 = consumo nulo en el modelo, 0,5 = 50 %, 1 = 100 % de la potencia durante el tiempo indicado.
- Explicaciones por tipo de aparato, ejemplos editables y desglose de la fórmula por equipo.
- Búsqueda y ordenación del inventario por nombre o consumo.
- Descarga de resumen CSV con tarifa, supuestos, estimación mensual y proyección anual.
- Animaciones de entrada, gráficos, diálogos y respuestas visuales que respetan movimiento reducido.

Las proyecciones anuales repiten el mes del inventario 12 veces con precio constante. Las cifras orientativas por aparato son ejemplos ilustrativos, no valores medidos ni referencias universales. Los registros existentes del navegador se conservan.

### Mejora de los procesos existentes

- Duplicar un equipo abre una copia editable antes de guardar; cada tarjeta permite ir a su simulación.
- El simulador muestra el costo resultante de todo el hogar y la distancia al presupuesto; al aplicar un hábito se actualiza también el presupuesto visible.
- La eliminación de un registro y la aplicación de un hábito se pueden deshacer hasta el siguiente guardado, recarga o cierre del aviso. Deshacer restaura el estado anterior completo de ese navegador.
- Las facturas se pueden editar y los formularios de edición se pueden cancelar. No se permiten nuevos periodos superpuestos; periodos adyacentes sí.
- Las lecturas muestran consumo, duración y promedio del último intervalo, sin crear mediciones diarias ficticias.
- Las últimas dos facturas se comparan por kWh/día cuando sus intervalos son válidos y no se superponen. Un consumo anterior cero no genera un porcentaje.
- El gráfico circular agrupa categorías y conserva el total cuando hay más de cinco categorías.
- Si falla el almacenamiento local, el cambio no se anuncia como guardado y se restaura el estado anterior en memoria.

### Consumo conocido, equipos pausados y copias del hogar

- El formulario permite elegir potencia/horas o kWh mensuales por unidad. Los métodos son excluyentes. Los kWh conocidos se multiplican únicamente por la cantidad, sin volver a aplicar horas ni factor.
- Un equipo pausado conserva sus valores y aporta cero al inventario calculado. Se puede incluir otra vez; esto no controla el aparato físico. El simulador de horarios solo ofrece equipos incluidos calculados por potencia.
- En Resumen y Presupuesto se puede descargar una copia JSON de equipos, configuración, lecturas, facturas y plan de ahorro. El CSV sigue siendo un informe; no se utiliza para restaurar.
- Restaurar valida el archivo y muestra un resumen antes de sustituir los datos. Se aceptan copias versión 1 de hasta 1 MB, con un máximo de 1.000 registros por entidad. Se rechazan campos numéricos incoherentes, identificadores repetidos, lecturas decrecientes y facturas superpuestas. Los campos desconocidos se descartan.
- La restauración puede deshacerse hasta el siguiente guardado, recarga o cierre del aviso. Las copias se descargan en el dispositivo; no se suben a un servicio externo.

## Plan de ahorro con varios equipos

En Simulador se pueden ajustar horas diarias y días mensuales. “Añadir este cambio a mi plan” incorpora un borrador por equipo: añadirlo otra vez reemplaza su propuesta anterior. El plan calcula el costo conjunto sustituyendo el consumo de cada equipo, conserva los demás e indica el margen frente al presupuesto. La aplicación requiere revisar un resumen y permite deshacer el cambio conjunto.

Si un equipo cambia, se pausa o se elimina después de preparar su propuesta, el plan lo marca para revisión y bloquea la aplicación. El precio y presupuesto se recalculan con la configuración actual. Los equipos con kWh mensuales conocidos se mantienen en el total pero no se modifican con horarios. El borrador se guarda junto al hogar en este navegador, se conserva al recargar/cerrar y forma parte de las copias del hogar. Deshacer la aplicación restaura también el plan previo. Las copias anteriores sin plan siguen siendo compatibles.

## API disponible

- `GET /api/health`: estado y alcance de esta fase.
- `POST /api/calculate`: recibe `{ "device": { "watts": 1000, "quantity": 1, "hours": 2, "days": 30, "factor": 1 }, "rate": 1000 }`; devuelve `{ "kwh": 60, "cost": 60000 }`.
- `GET /api/database-status`: comprueba conexión configurada; devuelve 503 si MySQL no está disponible.
- `GET /api/session`: consulta la sesión; devuelve usuario público y token CSRF cuando está autenticada.
- `POST /api/auth/register`: `{name,email,password}`. Contraseña entre 12 y 128 caracteres. Crea un hogar vacío y una sesión.
- `POST /api/auth/login`: `{email,password}`. Devuelve la sesión con cookie HttpOnly.
- `POST /api/auth/logout`: revoca la sesión actual.
- `GET /api/home` y `PUT /api/home`: consultar o sustituir el hogar completo. El guardado recibe `{revision,data}` con el formato de hogar de las copias JSON.
- `GET /api/summary`: cálculo del inventario activo en el servidor; devuelve estimación mensual y anual.
- `GET/POST /api/devices`, `/api/readings`, `/api/bills`: listar y crear registros del hogar autenticado.
- `GET/PATCH/DELETE /api/devices/:id`, `/api/readings/:id`, `/api/bills/:id`: consultar, editar y eliminar un registro propio.

Las escrituras autenticadas requieren la cookie de sesión, `Origin` idéntico al servidor y `X-CSRF-Token` recibido al autenticar o consultar sesión. Enviar JSON. POST de entidades recibe `{revision,device}`, `{revision,reading}` o `{revision,bill}`; PATCH usa el mismo formato con los campos que cambian; DELETE recibe `{revision}`. Las respuestas de escritura devuelven el hogar completo y su nueva revisión. Una revisión desactualizada devuelve 409 sin sobrescribir. El registro público siempre crea el rol `user`.

## Preparar MySQL

1. Instala y ejecuta MySQL Server y abre MySQL Workbench.
2. Ejecuta `backend/database/schema.sql` desde Workbench.
3. Crea un usuario MySQL dedicado con permisos limitados a la base `kwhtrack`.
4. Copia `backend/.env.example` a `backend/.env` e introduce sus credenciales. No subas `.env` al repositorio.
5. Reinicia el servidor y consulta `/api/database-status`.

En este equipo se verificó MySQL 8.4.11 en `127.0.0.1:3316`, con una carpeta de datos exclusiva en `%LOCALAPPDATA%\kwhTrackRuntime\mysql-data`. El servidor y las credenciales están configurados mediante `backend/.env`, excluido del repositorio. La cuenta de aplicación tiene SELECT, INSERT, UPDATE y DELETE sobre `kwhtrack.*`; las contraseñas de cuenta se derivan con scrypt y las sesiones se guardan mediante el hash de su token.

Para volver a arrancar esa instancia portable sin modificar bases de otros proyectos, desde `backend` ejecuta `node tools/provision-local-mysql.mjs "RUTA_A_MYSQL_PORTABLE"` indicando la carpeta que contiene `bin/mysqld.exe`. El script comprueba que el puerto pertenece a la carpeta de datos de kwhTrack y conserva un `.env` existente. La configuración administrativa privada queda fuera del proyecto. No subas esos archivos ni la carpeta de datos.

El esquema SQL crea instalaciones nuevas; `CREATE TABLE IF NOT EXISTS` no migra tablas de una versión anterior. Si ya importaste otro esquema, conserva una copia y prepara una migración antes de usar esta API. No borres tablas para actualizar.

Las pantallas de cuenta están conectadas con la API. Iniciar o cerrar sesión conserva el hogar local; el guardado en cuenta y la carga desde cuenta se hacen manualmente tras revisar las dos versiones. No hay sincronización automática. El servidor continúa limitado al equipo local; este trabajo no constituye una publicación multiusuario en Internet.

## Verificación

```powershell
cd backend
npm run check
npm test
npm run test:mysql
```

`npm test` ejecuta las pruebas unitarias y omite la integración cuando no hay variables MySQL. `npm run test:mysql` carga `.env` y verifica por HTTP contra MySQL real: cuentas, CSRF, aislamiento entre usuarios, CRUD, validaciones, conflictos simultáneos y persistencia tras reiniciar el servidor y el pool. Crea cuentas sintéticas con correos únicos `@kwhtrack.test` y elimina únicamente esas cuentas y sus datos al terminar.

Los datos ilustrativos no son evidencia de consumo real. Las estimaciones no calculan automáticamente subsidios, contribuciones u otros cargos de la factura.

## Facturas por año y revisión continua

Presupuesto incluye un registro anual por año de cierre, con totales de facturas, consumo, meses registrados y CSV del año. Los periodos que cruzan meses se asignan completos al mes de su fecha final; no se distribuyen ni se proyectan. Los meses sin factura aparecen sin datos, no como gasto cero. La meta comparativa es el presupuesto mensual actual y el total registrado puede incluir cargos adicionales a energía.

Las animaciones de aparición de paneles respetan movimiento reducido y no ocultan campos accesibles. El objetivo de mejora continua se desarrolla en ciclos con pruebas y revisión de los procesos existentes.

## Formularios y cambios pendientes

Los formularios avisan al cerrar el diálogo con la cruz o Escape, al navegar mediante enlaces internos y al usar Atrás/Adelante cuando hay cambios sin guardar. También se protege la sustitución de una lectura/factura en edición por otra del historial. La confirmación permite continuar editando o descartar el formulario, conservando los datos previamente guardados y el recorrido del historial. Se solicita al navegador su aviso nativo al cerrar o recargar con ediciones pendientes; su presentación depende del navegador. Al cambiar de sección se pasa el foco al contenido principal.

Los errores de fecha duplicada, lectura decreciente, periodo invertido o facturas superpuestas se muestran junto al campo y reciben foco. Se mantiene un nombre accesible estable y se enlaza el mensaje mediante `aria-describedby`.

## Recuperación local y otras pestañas

Se valida el hogar guardado antes de cargarlo. Si el contenido es ilegible o incoherente, se conserva el original, se muestra una vista temporal identificada y se bloquean los guardados normales. Se puede descargar el contenido original como texto y restaurar una copia válida. Antes de sustituirlo se archiva el original en una clave de recuperación; si ese archivo no se puede guardar, se rechaza la sustitución. Las recuperaciones sucesivas conservan también los originales anteriores. Al recuperar datos dañados no se ofrece deshacer hacia el ejemplo temporal. El original más reciente sigue descargable desde Presupuesto.

Antes de escribir se compara la versión local con la que esta vista leyó. Si otra pestaña la cambió, se bloquea el guardado y se ofrece revisar y cargar la versión guardada. No se mezclan ni se reemplazan versiones automáticamente. Esta comparación es una protección previa al guardado; no es una transacción atómica entre pestañas ni sustituye la futura persistencia con API/MySQL.

Para repetir las pruebas de recuperación sin tocar el origen principal, inicia la aplicación en 3000 y ejecuta `node backend/tools/preview-lab.mjs` desde la raíz. El laboratorio de datos desechables queda en `http://127.0.0.1:3198/__qa/storage` y no forma parte del servidor normal. Permite preparar un hogar sintético o contenido dañado, descargar una copia y probar el flujo usando el navegador. El puerto 3198 mantiene su almacenamiento separado de 3000.

## Cuenta y copias

Abre Cuenta y copias desde el menú. Crea una cuenta o inicia sesión; el hogar local sigue intacto. Guardar copia en mi cuenta muestra qué versión sustituirá a la otra, compara presupuesto, precio, consumo y número de registros, y detalla registros añadidos, modificados y eliminados. Los valores anteriores y propuestos siguen la dirección elegida: guardar en cuenta o cargar en este navegador.

El detalle incluye configuración, electrodomésticos, lecturas, facturas y plan de ahorro. Se puede desplegar con teclado y descargar cualquiera de las versiones en JSON antes de confirmar. El orden de las listas no se trata como un cambio de contenido. Si coinciden todos los datos se informa de ello. La carga local ofrece Deshacer; un conflicto remoto exige consultar y confirmar de nuevo, sin repetir automáticamente la escritura.

Para pruebas aisladas de cuentas usa, desde backend, `node --env-file=.env tools/account-lab.mjs` y abre `http://127.0.0.1:3199/__qa/storage`. Este laboratorio usa un almacenamiento y una cookie distintos a 3000; comparte la base MySQL, por lo que se deben usar únicamente cuentas sintéticas identificadas como pruebas.

## Recuperar la sesión sin repetir operaciones

Si la sesión vence al revisar/confirmar una copia, el diálogo ofrece Volver a iniciar sesión y conserva el hogar local. Tras entrar se consultan de nuevo las versiones; el guardado pendiente no se repite. Si otra pestaña inicia sesión con otra cuenta o cambia la verificación de sesión, se ofrece Actualizar sesión. La pantalla muestra la identidad actual y exige iniciar otra revisión antes de guardar o cargar. Un conflicto de versión conserva su recorrido independiente de Revisar versión actual.

La API identifica estos casos mediante `SESSION_REQUIRED` (401), `ACCOUNT_CHANGED` (409) y `CSRF_MISMATCH` (403). Los conflictos de revisión no se tratan como un cambio de cuenta. Estas respuestas no incluyen tokens ni datos de otro hogar.

Si la respuesta llega incompleta, es HTML o se pierde la conexión, la interfaz no confirma el guardado y pide consultar la versión de la cuenta antes de repetirlo. No reintenta escrituras automáticamente: una solicitud puede haber llegado al servidor aunque el navegador no haya recibido su respuesta. El hogar local permanece disponible.

## Gráficos y cifras accesibles

Mi resumen ofrece Ver cifras de todos los equipos, una tabla del inventario completo con estado, consumo estimado, costo de energía y participación. Incluye registros que no caben en las barras y distingue equipos pausados. Si el consumo total es cero, la participación se muestra como Sin consumo total.

Presupuesto anual ofrece Ver la proyección en cifras: doce meses y el total anual con consumo, costo estimado, meta y margen. Mantiene el mismo mes y precio de referencia, separado de las facturas reales. Las barras de valor cero tienen altura cero. Un inventario sin consumo invita a revisar sus equipos antes de proponer una reducción.

Las tablas se abren con teclado, tienen encabezados y una región enfocable para desplazarse en pantalla pequeña. Las barras son decorativas para las tecnologías de asistencia cuando tienen esta alternativa textual. Al elegir un año de facturas se actualiza un aviso breve con año, número de facturas, meses con registros y total, sin mover el foco del selector. Esta comprobación usó teclado y árbol de accesibilidad; no sustituye una prueba hablada con un lector de pantalla específico.

## Editar facturas con contexto

Al editar una factura, el título y un aviso identifican el periodo original. La vista previa muestra su duración, consumo promedio diario y total pagado por día del periodo. No representa mediciones de cada día ni convierte el total en una tarifa de energía; puede incluir otros cargos. Fechas incompletas o inválidas no producen promedios y los ceros se distinguen de campos vacíos.

Cancelar la edición de lectura o factura con cambios pendientes pide confirmar el descarte. Seguir editando conserva el formulario. Al actualizar o cancelar una factura, el foco vuelve a la acción de edición de su fila, que queda visible y se resalta brevemente, respetando movimiento reducido. Los cambios se guardan con el botón del formulario.

## Revisar y recuperar propuestas del plan

El plan identifica si una propuesta quedó desactualizada porque el equipo cambió, está pausado, fue eliminado o pasó a consumo mensual conocido. Cuando sigue siendo compatible con horarios, Volver a simular carga sus valores actuales; ajustar y pulsar Actualizar este cambio renueva esa propuesta sin duplicarla. Los demás casos remiten al inventario y no incluyen/apagan equipos automáticamente.

La confirmación muestra horario actual, horario propuesto y consumo antes/después de cada equipo. El resultado conjunto queda pendiente mientras haya propuestas desactualizadas. Quitar cambios o vaciar el borrador conserva el inventario y ofrece Deshacer en un aviso disponible hasta guardar otro cambio, recargar o cerrarlo; el grupo del plan recibe foco al quitar o vaciar. Guardar una propuesta no la aplica al inventario.

## Eliminación identificada y recuperación

La confirmación identifica el equipo por nombre, cantidad y categoría, la lectura por fecha y valor acumulado, o la factura por periodo, consumo e importe. Los registros se eliminan del hogar local; las copias de la cuenta se conservan. El aviso explica efectos sobre los intervalos de lecturas o sobre propuestas del plan.

Si hay formularios con cambios pendientes, primero se ofrece seguir editando o descartarlos. Deshacer también protege esos formularios antes de restaurar el estado anterior completo del hogar. Al eliminar se enfoca otra acción del historial o el contenido principal; al deshacer se busca la fila restaurada en la sección original.

Deshacer queda disponible en un aviso al inicio del contenido hasta el siguiente guardado correcto, recarga, carga explícita de otra versión local o cierre del aviso. Su copia se mantiene en memoria durante esa sesión. El mensaje breve también ofrece Deshacer ahora, pero su desaparición no retira el aviso persistente. Una escritura rechazada por conflicto no se anuncia como eliminada.

El laboratorio puede usar otro origen con `KWH_QA_PORT`: en PowerShell, establece `$env:KWH_QA_PORT='3201'` y ejecuta `node tools/preview-lab.mjs` desde backend. El puerto predeterminado sigue siendo 3198. Cada puerto separa el almacenamiento del navegador para evitar que pruebas paralelas interfieran entre sí.
