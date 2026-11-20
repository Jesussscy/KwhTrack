-- Añade un identificador persistente de sala del modelo 3D (0-3) a cada espacio. Aplicar UNA vez (ADD COLUMN no es idempotente).
-- Copia de seguridad recomendada antes. Los espacios existentes reciben su slot según su orden actual (los 4 primeros por piso).
ALTER TABLE spaces ADD COLUMN layout_slot TINYINT UNSIGNED NULL;
UPDATE spaces s JOIN (SELECT id,ROW_NUMBER() OVER (PARTITION BY floor_id ORDER BY position,id)-1 AS rn FROM spaces) r ON r.id=s.id SET s.layout_slot=IF(r.rn<4,r.rn,NULL);
