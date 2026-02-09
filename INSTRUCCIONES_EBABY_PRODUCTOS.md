# Instrucciones para crear la tabla ebaby_productos

## Archivos creados

1. **Migración SQL**: `supabase/migrations/20250209000000_create_ebaby_productos.sql`
   - Crea la tabla `ebaby_productos` con todos los campos necesarios
   - Crea índices para mejorar el rendimiento
   - Configura políticas de seguridad (RLS)

2. **Script de limpieza**: `import_ebaby_productos.sql`
   - Función `clean_product_data()` para limpiar y convertir datos

3. **Datos procesados**: `import_ebaby_productos_data.sql`
   - Contiene todos los INSERT statements adaptados para la nueva tabla
   - Procesado desde los archivos originales `products_rows (1).sql` y `products_rows (2).sql`

## Pasos para aplicar

### Opción 1: Usando Supabase CLI

```bash
# Aplicar la migración
supabase migration up

# Luego ejecutar el archivo de datos (puede tardar varios minutos)
psql -h [TU_HOST] -U postgres -d postgres -f import_ebaby_productos_data.sql

# Ejecutar la función de limpieza
psql -h [TU_HOST] -U postgres -d postgres -c "SELECT clean_product_data();"
```

### Opción 2: Usando el Dashboard de Supabase

1. **Crear la tabla**:
   - Ve a SQL Editor en Supabase Dashboard
   - Ejecuta el contenido de `supabase/migrations/20250209000000_create_ebaby_productos.sql`

2. **Importar los datos**:
   - En SQL Editor, ejecuta el contenido de `import_ebaby_productos_data.sql`
   - ⚠️ **Nota**: Este archivo es muy grande, puede tardar varios minutos en ejecutarse

3. **Limpiar los datos**:
   - Ejecuta primero el contenido de `import_ebaby_productos.sql` (para crear la función)
   - Luego ejecuta: `SELECT clean_product_data();`

### Opción 3: Usando MCP Supabase (si está configurado)

```typescript
// Aplicar migración
await mcp_supabase_apply_migration({
  project_id: "tu-project-id",
  name: "create_ebaby_productos",
  query: "contenido del archivo de migración"
});

// Importar datos (ejecutar el archivo import_ebaby_productos_data.sql)
await mcp_supabase_execute_sql({
  project_id: "tu-project-id",
  query: "contenido del archivo de datos"
});
```

## Estructura de la tabla

La tabla `ebaby_productos` tiene los siguientes campos:

- `id` (UUID): Identificador único
- `name` (TEXT): Nombre del producto
- `description` (TEXT): Descripción
- `price` (NUMERIC): Precio en céntimos
- `category` (TEXT): Categoría principal
- `sub_category` (TEXT): Subcategoría
- `image_path` (TEXT): Ruta de imagen local (si aplica)
- `main_image_url` (TEXT): URL de imagen principal
- `additional_images` (TEXT[]): Array de URLs de imágenes adicionales
- `stock` (INTEGER): Cantidad en stock
- `is_active` (BOOLEAN): Si el producto está activo
- `sizes` (TEXT[]): Tallas disponibles
- `colors` (TEXT[]): Colores disponibles
- `brand` (TEXT): Marca del producto
- `source_url` (TEXT): URL de origen (ej: "bigbuy:S71002408")
- `features` (TEXT): Características del producto
- `created_at` (TIMESTAMPTZ): Fecha de creación
- `updated_at` (TIMESTAMPTZ): Fecha de actualización

## Verificar la importación

```sql
-- Contar productos importados
SELECT COUNT(*) FROM public.ebaby_productos;

-- Ver algunos productos
SELECT id, name, price, category, stock, is_active 
FROM public.ebaby_productos 
LIMIT 10;

-- Verificar categorías
SELECT category, COUNT(*) as cantidad 
FROM public.ebaby_productos 
GROUP BY category 
ORDER BY cantidad DESC;
```

## Notas importantes

- Los archivos SQL originales contenían datos con algunos valores como string 'NULL' que se convierten a NULL real
- El precio está almacenado en céntimos (ej: 3588 = 35.88€)
- La función `clean_product_data()` limpia y normaliza los datos después de la importación
- Se han creado índices para mejorar las consultas por categoría, nombre y stock
