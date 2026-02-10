-- Script para importar productos desde los archivos SQL
-- Este script modifica los INSERT statements para usar la tabla ebaby_productos

-- Primero ejecutar la migración: 20250209000000_create_ebaby_productos.sql

-- NOTA: Este script necesita ser ejecutado después de procesar los archivos SQL originales
-- Los archivos products_rows (1).sql y products_rows (2).sql deben ser modificados
-- reemplazando "public"."products" por "public"."ebaby_productos"

-- Ejemplo de cómo modificar los INSERT:
-- Cambiar: INSERT INTO "public"."products" (...)
-- Por: INSERT INTO "public"."ebaby_productos" (...)

-- También necesitamos convertir algunos tipos de datos:
-- - price: convertir de texto a NUMERIC
-- - stock: convertir de texto a INTEGER  
-- - is_active: convertir de texto 'true'/'false' a BOOLEAN
-- - 'NULL' (string) a NULL (SQL)

-- Función auxiliar para limpiar y convertir datos
CREATE OR REPLACE FUNCTION clean_product_data()
RETURNS void AS $$
BEGIN
    -- Actualizar precios que sean strings 'NULL' a NULL
    UPDATE public.ebaby_productos 
    SET price = NULL 
    WHERE price::text = 'NULL' OR price IS NULL;
    
    -- Actualizar stock que sea string 'NULL' a 0
    UPDATE public.ebaby_productos 
    SET stock = 0 
    WHERE stock::text = 'NULL' OR stock IS NULL;
    
    -- Asegurar que is_active sea boolean
    UPDATE public.ebaby_productos 
    SET is_active = CASE 
        WHEN is_active::text = 'true' THEN true
        WHEN is_active::text = 'false' THEN false
        ELSE true
    END;
    
    -- Limpiar image_path que sea 'NULL' string
    UPDATE public.ebaby_productos 
    SET image_path = NULL 
    WHERE image_path = 'NULL';
    
    -- Limpiar brand que sea 'NULL' string
    UPDATE public.ebaby_productos 
    SET brand = NULL 
    WHERE brand = 'NULL';
    
    -- Limpiar source_url que sea 'NULL' string
    UPDATE public.ebaby_productos 
    SET source_url = NULL 
    WHERE source_url = 'NULL';
    
    -- Limpiar main_image_url que sea 'NULL' string
    UPDATE public.ebaby_productos 
    SET main_image_url = NULL 
    WHERE main_image_url = 'NULL';
END;
$$ LANGUAGE plpgsql;
