-- ============================================
-- Script para Solucionar Problemas de RLS
-- (Row Level Security) en ebaby_productos
-- ============================================
-- 
-- Este script asegura que la tabla ebaby_productos
-- permita lectura pública para que la aplicación
-- pueda cargar productos sin autenticación.
--
-- INSTRUCCIONES:
-- 1. Abre Supabase Dashboard
-- 2. Ve a "SQL Editor"
-- 3. Copia y pega todo este contenido
-- 4. Presiona "Run" o "Ejecutar"
-- ============================================

-- Paso 1: Eliminar políticas existentes (por si hay conflictos)
DROP POLICY IF EXISTS "Permitir lectura pública de productos" ON ebaby_productos;
DROP POLICY IF EXISTS "Enable read access for all users" ON ebaby_productos;
DROP POLICY IF EXISTS "Public products are viewable by everyone" ON ebaby_productos;

-- Paso 2: Habilitar RLS en la tabla (si no está habilitado)
ALTER TABLE ebaby_productos ENABLE ROW LEVEL SECURITY;

-- Paso 3: Crear política para permitir lectura pública
CREATE POLICY "Permitir lectura pública de productos"
ON ebaby_productos
FOR SELECT
USING (true);

-- Paso 4: Verificar que la política se creó correctamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'ebaby_productos';

-- Paso 5: Probar que funciona
SELECT COUNT(*) as total_productos FROM ebaby_productos;

-- Si ves el número total de productos arriba, ¡la configuración es exitosa! ✅
-- 
-- NOTA IMPORTANTE:
-- Esta configuración permite que CUALQUIER persona pueda LEER productos
-- de tu catálogo, lo cual es normal para una tienda online.
-- Los productos NO pueden ser modificados sin autenticación.
--
-- Si necesitas políticas más restrictivas (por ejemplo, solo mostrar
-- productos activos), puedes modificar la línea USING (true) por:
--
-- USING (is_active = true)  -- Solo productos activos
-- USING (stock > 0)         -- Solo productos con stock
-- USING (is_active = true AND stock > 0)  -- Ambas condiciones
--
-- ============================================

-- OPCIONAL: Políticas adicionales para otras operaciones

-- Política para INSERT (solo usuarios autenticados pueden agregar productos)
-- Descomenta si necesitas que los usuarios autenticados puedan agregar productos
/*
CREATE POLICY "Usuarios autenticados pueden insertar productos"
ON ebaby_productos
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
*/

-- Política para UPDATE (solo usuarios autenticados pueden actualizar)
-- Descomenta si necesitas que los usuarios autenticados puedan actualizar productos
/*
CREATE POLICY "Usuarios autenticados pueden actualizar productos"
ON ebaby_productos
FOR UPDATE
USING (auth.role() = 'authenticated');
*/

-- Política para DELETE (solo administradores pueden eliminar)
-- Descomenta si necesitas que solo admins puedan eliminar productos
/*
CREATE POLICY "Solo administradores pueden eliminar productos"
ON ebaby_productos
FOR DELETE
USING (
    auth.role() = 'authenticated' 
    AND 
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND raw_user_meta_data->>'role' = 'admin'
    )
);
*/

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
