-- Add AI-generated description column to product translations
ALTER TABLE bigbuy_product_translations 
ADD COLUMN IF NOT EXISTS ai_description TEXT,
ADD COLUMN IF NOT EXISTS ai_description_updated_at TIMESTAMPTZ;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bigbuy_product_translations_ai_description 
ON bigbuy_product_translations(product_id, iso_code) 
WHERE ai_description IS NOT NULL;

-- Add comment
COMMENT ON COLUMN bigbuy_product_translations.ai_description IS 'AI-generated product description using OpenAI, optimized for e-commerce';
COMMENT ON COLUMN bigbuy_product_translations.ai_description_updated_at IS 'Timestamp when AI description was last generated';

