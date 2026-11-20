-- Configuración energética por edificio. No modifica datos domésticos.
ALTER TABLE buildings ADD COLUMN energy_config JSON NULL;

ALTER TABLE equipment ADD COLUMN product_reference JSON NULL;
