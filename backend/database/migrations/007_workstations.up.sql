-- Aditiva. Aplicar tras 002-006. Puestos de trabajo, ocupacion, disposicion (abierta o cubiculos) y superficie real declarada por espacio.
ALTER TABLE spaces ADD COLUMN workstations SMALLINT UNSIGNED NULL, ADD COLUMN occupied_ws SMALLINT UNSIGNED NULL, ADD COLUMN desk_mode ENUM('open','cubicle') NULL, ADD COLUMN area_m2 DOUBLE NULL;
