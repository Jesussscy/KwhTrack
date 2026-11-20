-- Aditiva. Aplicar tras 002-005. Guarda los parametros del generador de planta por piso y si las medidas de un espacio fueron declaradas por el usuario.
ALTER TABLE floors ADD COLUMN layout_config JSON NULL;
ALTER TABLE spaces ADD COLUMN dims_declared BOOLEAN NOT NULL DEFAULT FALSE;
