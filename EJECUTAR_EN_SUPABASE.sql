-- ============================================================
-- EJECUTAR ESTE SCRIPT COMPLETO EN SUPABASE SQL EDITOR
-- ============================================================
-- Copia y pega todo este archivo en el SQL Editor de Supabase
-- y haz clic en "Run" para ejecutar todas las migraciones
-- ============================================================

-- PASO 1: Añadir columna ai_highlight_features
-- (Migración: 20250204000000_add_ai_highlight_features.sql)
ALTER TABLE bigbuy_product_translations
ADD COLUMN IF NOT EXISTS ai_highlight_features JSONB;

COMMENT ON COLUMN bigbuy_product_translations.ai_highlight_features IS 'Array de 3 strings con características destacadas del producto generadas por IA (ej: ["Tejido suave", "Sin BPA", "Apto lavadora"])';

-- PASO 2: Habilitar RLS y crear políticas de seguridad
-- (Migración: 20250205000000_enable_public_read_products.sql)

-- Enable RLS on BigBuy product tables
ALTER TABLE bigbuy_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bigbuy_product_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bigbuy_product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE bigbuy_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE bigbuy_variant_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bigbuy_taxonomies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (para evitar errores si se ejecuta dos veces)
DROP POLICY IF EXISTS "Allow public read products" ON bigbuy_products;
DROP POLICY IF EXISTS "Allow public read translations" ON bigbuy_product_translations;
DROP POLICY IF EXISTS "Allow public read images" ON bigbuy_product_images;
DROP POLICY IF EXISTS "Allow public read variants" ON bigbuy_variants;
DROP POLICY IF EXISTS "Allow public read variant attributes" ON bigbuy_variant_attributes;
DROP POLICY IF EXISTS "Allow public read taxonomies" ON bigbuy_taxonomies;
DROP POLICY IF EXISTS "Allow service role full access products" ON bigbuy_products;
DROP POLICY IF EXISTS "Allow service role full access translations" ON bigbuy_product_translations;
DROP POLICY IF EXISTS "Allow service role full access images" ON bigbuy_product_images;
DROP POLICY IF EXISTS "Allow service role full access variants" ON bigbuy_variants;
DROP POLICY IF EXISTS "Allow service role full access variant attributes" ON bigbuy_variant_attributes;
DROP POLICY IF EXISTS "Allow service role full access taxonomies" ON bigbuy_taxonomies;
DROP POLICY IF EXISTS "Allow admin full access products" ON bigbuy_products;

-- Allow public read access to products (for catalog display)
CREATE POLICY "Allow public read products" 
  ON bigbuy_products FOR SELECT 
  TO anon, authenticated 
  USING (deleted_at IS NULL);

-- Allow public read access to product translations
CREATE POLICY "Allow public read translations" 
  ON bigbuy_product_translations FOR SELECT 
  TO anon, authenticated 
  USING (TRUE);

-- Allow public read access to product images
CREATE POLICY "Allow public read images" 
  ON bigbuy_product_images FOR SELECT 
  TO anon, authenticated 
  USING (TRUE);

-- Allow public read access to variants
CREATE POLICY "Allow public read variants" 
  ON bigbuy_variants FOR SELECT 
  TO anon, authenticated 
  USING (TRUE);

-- Allow public read access to variant attributes
CREATE POLICY "Allow public read variant attributes" 
  ON bigbuy_variant_attributes FOR SELECT 
  TO anon, authenticated 
  USING (TRUE);

-- Allow public read access to taxonomies
CREATE POLICY "Allow public read taxonomies" 
  ON bigbuy_taxonomies FOR SELECT 
  TO anon, authenticated 
  USING (TRUE);

-- Keep write access restricted to service_role only
CREATE POLICY "Allow service role full access products" 
  ON bigbuy_products FOR ALL 
  TO service_role 
  USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Allow service role full access translations" 
  ON bigbuy_product_translations FOR ALL 
  TO service_role 
  USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Allow service role full access images" 
  ON bigbuy_product_images FOR ALL 
  TO service_role 
  USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Allow service role full access variants" 
  ON bigbuy_variants FOR ALL 
  TO service_role 
  USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Allow service role full access variant attributes" 
  ON bigbuy_variant_attributes FOR ALL 
  TO service_role 
  USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Allow service role full access taxonomies" 
  ON bigbuy_taxonomies FOR ALL 
  TO service_role 
  USING (TRUE) WITH CHECK (TRUE);

-- Allow authenticated admin users full access
CREATE POLICY "Allow admin full access products" 
  ON bigbuy_products FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
-- Deberías ver el mensaje "Success. No rows returned"
-- ============================================================
