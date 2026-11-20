-- Reversión: elimina medidores, lecturas, servicios comunes, registro de deshacer y las columnas de distribución. Destruye esos datos.
DROP TABLE IF EXISTS undo_log;DROP TABLE IF EXISTS common_loads;DROP TABLE IF EXISTS meter_readings;DROP TABLE IF EXISTS meters;
ALTER TABLE spaces DROP COLUMN plan_x, DROP COLUMN plan_y, DROP COLUMN plan_w, DROP COLUMN plan_d;
