-- Enable RLS on BigBuy product tables
ALTER TABLE bigbuy_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bigbuy_product_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bigbuy_product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE bigbuy_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE bigbuy_variant_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bigbuy_taxonomies ENABLE ROW LEVEL SECURITY;

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
