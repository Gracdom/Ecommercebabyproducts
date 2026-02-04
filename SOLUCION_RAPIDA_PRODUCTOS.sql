-- ============================================================
-- SOLUCIÓN RÁPIDA: DESACTIVAR RLS TEMPORALMENTE
-- ============================================================
-- Este script desactiva RLS para que los productos se muestren
-- sin restricciones de seguridad
-- ============================================================

-- PASO 1: Desactivar RLS en todas las tablas de productos
ALTER TABLE bigbuy_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE bigbuy_product_translations DISABLE ROW LEVEL SECURITY;
ALTER TABLE bigbuy_product_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE bigbuy_variants DISABLE ROW LEVEL SECURITY;
ALTER TABLE bigbuy_variant_attributes DISABLE ROW LEVEL SECURITY;
ALTER TABLE bigbuy_taxonomies DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
-- Ejecuta esto en Supabase SQL Editor y los productos 
-- deberían aparecer inmediatamente
-- ============================================================
