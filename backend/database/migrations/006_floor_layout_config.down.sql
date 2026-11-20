-- Reversion: elimina solo estas dos columnas (la distribucion guardada en plan_x..plan_d se conserva).
ALTER TABLE spaces DROP COLUMN dims_declared;
ALTER TABLE floors DROP COLUMN layout_config;
