-- Reversión: elimina solo la columna layout_slot (la vista 3D vuelve a asignar por orden).
ALTER TABLE spaces DROP COLUMN layout_slot;
