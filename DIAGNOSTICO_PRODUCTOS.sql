-- ============================================================
-- DIAGNÓSTICO: Verificar estado de productos en Supabase
-- ============================================================
-- Ejecuta estas queries una por una para diagnosticar el problema
-- ============================================================

-- 1. ¿Cuántos productos hay en total?
SELECT 
  COUNT(*) as total_productos,
  COUNT(*) FILTER (WHERE has_stock = true) as con_stock,
  COUNT(*) FILTER (WHERE deleted_at IS NULL) as activos,
  COUNT(*) FILTER (WHERE has_stock = true AND deleted_at IS NULL) as disponibles
FROM bigbuy_products;

-- 2. Ver los primeros 5 productos
SELECT 
  id, 
  sku, 
  has_stock, 
  deleted_at,
  sale_price,
  retail_price
FROM bigbuy_products 
WHERE deleted_at IS NULL
LIMIT 5;

-- 3. Verificar si existen las traducciones
SELECT COUNT(*) as total_traducciones
FROM bigbuy_product_translations
WHERE iso_code = 'es';

-- 4. Verificar si existe la columna ai_highlight_features
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bigbuy_product_translations' 
  AND column_name = 'ai_highlight_features';

-- 5. Verificar estado de RLS (Row Level Security)
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN (
  'bigbuy_products',
  'bigbuy_product_translations',
  'bigbuy_product_images',
  'bigbuy_variants'
)
ORDER BY tablename;

-- 6. Ver políticas de seguridad activas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename LIKE 'bigbuy_%'
ORDER BY tablename, policyname;

-- ============================================================
-- RESULTADOS ESPERADOS:
-- ============================================================
-- Query 1: Debería mostrar productos > 0
-- Query 4: Debería mostrar la columna ai_highlight_features (jsonb)
-- Query 5: Debería mostrar rls_enabled = false o true
-- ============================================================
