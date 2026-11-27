-- Ejecutar una vez en la base de datos de producción
-- Las tablas customers y sale_payments se crean automáticamente al reiniciar el backend

ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id);
ALTER TABLE sales ADD COLUMN IF NOT EXISTS is_credit BOOLEAN NOT NULL DEFAULT FALSE;
