-- Reversión: elimina SOLO tablas empresariales. Destruye datos empresariales; haz copia antes.
DROP TABLE IF EXISTS consumption_records;DROP TABLE IF EXISTS equipment;DROP TABLE IF EXISTS spaces;DROP TABLE IF EXISTS floors;DROP TABLE IF EXISTS buildings;DROP TABLE IF EXISTS org_sessions;DROP TABLE IF EXISTS org_users;DROP TABLE IF EXISTS organizations;
