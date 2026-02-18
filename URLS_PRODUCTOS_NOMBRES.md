# URLs de Productos Basadas en Nombres

## Resumen
Se ha modificado el sistema de URLs de productos para que utilicen el nombre del producto en lugar de IDs o SKUs. Las URLs ahora son más amigables para SEO y más legibles para los usuarios.

## Cambios Realizados

### 1. Nueva Utilidad: `src/utils/slug.ts`
Se creó un nuevo archivo con funciones para convertir nombres de productos en slugs URL-friendly:

- **`createSlug(text: string)`**: Convierte cualquier texto en un slug
  - Convierte a minúsculas
  - Elimina acentos y caracteres especiales
  - Reemplaza espacios con guiones
  - Ejemplo: "Cuna de Bebé Premium" → "cuna-de-bebe-premium"

- **`createProductSlug(product)`**: Genera un slug único para un producto
  - Usa el nombre del producto
  - Si el nombre está vacío, usa `producto-{id}` como fallback

### 2. Modificaciones en `src/App.tsx`

#### Generación de URLs (línea 287)
**Antes:**
```typescript
const productSlug = product.sku || `product-${product.id}`;
```

**Ahora:**
```typescript
const productSlug = createProductSlug(product);
```

#### Búsqueda de Productos por URL (líneas 143-154)
**Antes:**
```typescript
const product = allProducts.find(p => 
  p.sku === productSlug || 
  p.id.toString() === productSlug ||
  `product-${p.id}` === productSlug
);
```

**Ahora:**
```typescript
const product = allProducts.find(p => {
  const nameSlug = createProductSlug(p);
  return nameSlug === productSlug || 
         p.sku === productSlug || 
         p.id.toString() === productSlug ||
         `product-${p.id}` === productSlug ||
         `producto-${p.id}` === productSlug;
});
```

## Ejemplos de URLs

### Antes:
- `#product/12345` (ID)
- `#product/BB-ABC123` (SKU)
- `#product/product-12345`

### Ahora:
- `#product/cuna-de-bebe-premium` (nombre del producto)
- `#product/mantita-muselina-organica`
- `#product/chupete-anatomico-silicona`

## Retrocompatibilidad

El sistema mantiene retrocompatibilidad con las URLs antiguas:
- URLs con IDs (`#product/12345`)
- URLs con SKUs (`#product/BB-ABC123`)
- URLs con formato antiguo (`#product/product-12345`)

Esto asegura que los enlaces antiguos sigan funcionando.

## Beneficios

1. **SEO Mejorado**: URLs más descriptivas ayudan a los motores de búsqueda
2. **Mejor UX**: Los usuarios pueden entender qué producto es solo viendo la URL
3. **Compartir Más Fácil**: URLs más legibles son más fáciles de compartir
4. **Mantenibilidad**: Código más limpio y organizado

## Notas Técnicas

- Los slugs se generan automáticamente a partir del nombre del producto
- Se eliminan caracteres especiales y acentos automáticamente
- Si dos productos tienen el mismo nombre exacto, la búsqueda encontrará el primero que coincida
- Los espacios se convierten en guiones (`-`)
- Los guiones múltiples se reducen a uno solo

## Pruebas Recomendadas

1. Hacer clic en diferentes productos y verificar que las URLs usen nombres
2. Copiar una URL y pegarla en una nueva pestaña para verificar que funcione
3. Verificar que URLs antiguas (con IDs) sigan funcionando
4. Probar con productos que tengan caracteres especiales o acentos en el nombre
