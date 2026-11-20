-- Aditiva. Aplicar una vez tras 002 y 003. Presupuesto y tarifa por edificio; pausa y marca esencial por equipo.
ALTER TABLE buildings ADD COLUMN monthly_budget DOUBLE NULL, ADD COLUMN tariff_rate DOUBLE NULL, ADD COLUMN tariff_source VARCHAR(200) NULL, ADD COLUMN tariff_date DATE NULL;
ALTER TABLE equipment ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE, ADD COLUMN essential BOOLEAN NOT NULL DEFAULT FALSE;
