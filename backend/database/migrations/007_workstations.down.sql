-- Reversion: elimina solo estas columnas (puestos, ocupacion, disposicion y superficie declarada).
ALTER TABLE spaces DROP COLUMN area_m2, DROP COLUMN desk_mode, DROP COLUMN occupied_ws, DROP COLUMN workstations;
