-- Características destacadas generadas por IA (3 por producto, específicas del producto)
ALTER TABLE bigbuy_product_translations
ADD COLUMN IF NOT EXISTS ai_highlight_features JSONB;

COMMENT ON COLUMN bigbuy_product_translations.ai_highlight_features IS 'Array de 3 strings con características destacadas del producto generadas por IA (ej: ["Tejido suave", "Sin BPA", "Apto lavadora"])';
