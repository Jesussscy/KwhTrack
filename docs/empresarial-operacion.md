# KWH Empresarial: operación local

## Qué hay
- **Servidor web** (Node): `http://127.0.0.1:3000/empresarial` (doméstico en `/`).
- **MySQL persistente** (8.4.6 portable, solo `127.0.0.1:3316`): datos en `%LOCALAPPDATA%\kwhTrackRuntime\mysql-data`, base `kwhtrack`, usuario de aplicación `kwhtrack_app` (solo SELECT/INSERT/UPDATE/DELETE).
- Credenciales: `backend\.env` (ignorado por Git) y `%LOCALAPPDATA%\kwhTrackRuntime\mysql-admin.json` (administración). Ninguno se imprime ni se sirve. Copia privada del `.env` anterior: `%LOCALAPPDATA%\kwhTrackRuntime\backup\env-*.bak`.
- Los binarios de MySQL están en `Downloads\mysql-portable\mysql-8.4.6-winx64` (ZIP oficial); su ruta está en `kwhTrackRuntime\mysql-base.txt`.

## Arranque y apagado
| Acción | Doble clic | Terminal (`backend/`) |
|---|---|---|
| Iniciar (MySQL → migraciones → servidor) | `iniciar-kwh.cmd` | `npm run local:start` |
| Estado | — | `npm run local:status` |
| Apagar (servidor y MySQL, datos intactos) | `detener-kwh.cmd` | `npm run local:stop` |
`start` es idempotente: no duplica procesos y aplica solo migraciones pendientes (tabla `schema_migrations`). Los procesos quedan independientes de la ventana.

## Migraciones
Orden: `002_enterprise`, `003_space_layout_slot`, `004_enterprise_budget_equipment`, `005_layout_meters_undo`, `006_floor_layout_config`, `007_workstations` (cada una con `.down.sql`, que **destruye** esos datos). `npm run db:migrate` las aplica en la base `kwhtrack` (o `KWH_DB_NAME`). `tools/apply-org-migrations.mjs` sigue limitado a bases `*_test`.

## Respaldo y recuperación
- `npm run local:backup` → `%LOCALAPPDATA%\kwhTrackRuntime\backup\kwhtrack-<fecha>.sql` (mysqldump consistente; no incluye contraseñas en la línea de comandos).
- Recuperación **sin sobrescribir**: `node tools/local-db.mjs restore <archivo.sql> <base_nueva>` crea una base nueva (se niega si ya existe). Para usarla, apunta `DB_NAME` del `.env` a ella y concede permisos a `kwhtrack_app` (`GRANT SELECT,INSERT,UPDATE,DELETE ON <base>.* TO 'kwhtrack_app'@'127.0.0.1'`).
- Copia funcional por organización: Organización y cuenta → “Descargar copia (JSON)” / “Importar copia”. Importar solo crea edificios nuevos.
- Verificado: respaldo → restauración en base temporal (21 tablas, igual que la original) → base temporal eliminada.

## Servicios de pruebas
Los de verificación se **apagaron** al terminar (la última verificación también migró la base persistente a la 006, con respaldo previo): MySQL `127.0.0.1:3399` (datos en `tmp/mysql-test-data`, base `kwhtrack_test`) y servidor `:3401`. Para repetir las pruebas: arrancar `mysqld` con `--datadir=tmp\mysql-test-data --port=3399` y `DB_NAME=kwhtrack_test npm run db:org-test`. La base `kwhtrack_test` no contiene cuentas reales y no se copió a `kwhtrack`.
