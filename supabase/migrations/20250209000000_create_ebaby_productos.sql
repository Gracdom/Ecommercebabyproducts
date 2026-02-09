-- Crear tabla ebaby_productos
CREATE TABLE IF NOT EXISTS public.ebaby_productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2),
    category TEXT,
    image_path TEXT,
    stock INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    sizes TEXT[] DEFAULT ARRAY[]::TEXT[],
    colors TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    brand TEXT,
    source_url TEXT,
    main_image_url TEXT,
    additional_images TEXT[] DEFAULT ARRAY[]::TEXT[],
    features TEXT,
    sub_category TEXT
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_ebaby_productos_category ON public.ebaby_productos(category);
CREATE INDEX IF NOT EXISTS idx_ebaby_productos_is_active ON public.ebaby_productos(is_active);
CREATE INDEX IF NOT EXISTS idx_ebaby_productos_stock ON public.ebaby_productos(stock);
CREATE INDEX IF NOT EXISTS idx_ebaby_productos_name ON public.ebaby_productos USING gin(to_tsvector('spanish', name));
CREATE INDEX IF NOT EXISTS idx_ebaby_productos_sub_category ON public.ebaby_productos(sub_category);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.ebaby_productos ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura pública
CREATE POLICY "Permitir lectura pública de productos" ON public.ebaby_productos
    FOR SELECT
    USING (true);

-- Comentarios en la tabla
COMMENT ON TABLE public.ebaby_productos IS 'Tabla de productos para e-baby';
COMMENT ON COLUMN public.ebaby_productos.id IS 'Identificador único del producto (UUID)';
COMMENT ON COLUMN public.ebaby_productos.name IS 'Nombre del producto';
COMMENT ON COLUMN public.ebaby_productos.description IS 'Descripción del producto';
COMMENT ON COLUMN public.ebaby_productos.price IS 'Precio del producto en céntimos';
COMMENT ON COLUMN public.ebaby_productos.category IS 'Categoría principal del producto';
COMMENT ON COLUMN public.ebaby_productos.stock IS 'Cantidad disponible en stock';
COMMENT ON COLUMN public.ebaby_productos.is_active IS 'Indica si el producto está activo';
COMMENT ON COLUMN public.ebaby_productos.source_url IS 'URL de origen del producto (ej: bigbuy:S71002408)';
COMMENT ON COLUMN public.ebaby_productos.main_image_url IS 'URL de la imagen principal del producto';
COMMENT ON COLUMN public.ebaby_productos.sub_category IS 'Subcategoría del producto';
