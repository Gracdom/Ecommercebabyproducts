-- ============================================================
-- SOLUCIÓN: Añadir columna ai_highlight_features que falta
-- ============================================================
-- Este script añade la columna que está causando el error
-- ============================================================

-- Añadir la columna si no existe
ALTER TABLE bigbuy_product_translations
ADD COLUMN IF NOT EXISTS ai_highlight_features JSONB;

-- Añadir comentario descriptivo
COMMENT ON COLUMN bigbuy_product_translations.ai_highlight_features 
IS 'Array de 3 strings con características destacadas del producto generadas por IA';

-- Verificar que se creó correctamente
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'bigbuy_product_translations' 
  AND column_name = 'ai_highlight_features';

-- ============================================================
-- Deberías ver:
-- column_name: ai_highlight_features
-- data_type: jsonb
-- is_nullable: YES
-- ============================================================
