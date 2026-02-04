# 🚀 Guía de Despliegue en Netlify

## ❌ Problema: Los productos no aparecen en Netlify

Si desplegaste en Netlify y los productos no aparecen, es porque las tablas de Supabase tienen RLS (Row Level Security) activado pero sin políticas que permitan lectura pública.

## ✅ Solución: Aplicar migración SQL en Supabase

### Paso 1: Acceder al SQL Editor de Supabase

1. Ve a [app.supabase.com](https://app.supabase.com)
2. Selecciona tu proyecto: **qozeqcfavcnfwkexxbjm**
3. En el menú lateral, haz clic en **"SQL Editor"**

### Paso 2: Ejecutar la migración

1. Haz clic en **"+ New query"**
2. Copia y pega el contenido del archivo:
   ```
   src/supabase/migrations/20250205000000_enable_public_read_products.sql
   ```
3. Haz clic en **"Run"** (o presiona Ctrl+Enter)
4. Verifica que aparezca el mensaje: **"Success. No rows returned"**

### Paso 3: Verificar las políticas

1. Ve a **"Authentication"** → **"Policies"** en el menú lateral
2. Deberías ver las nuevas políticas creadas para:
   - `bigbuy_products`
   - `bigbuy_product_translations`
   - `bigbuy_product_images`
   - `bigbuy_variants`
   - `bigbuy_variant_attributes`
   - `bigbuy_taxonomies`

### Paso 4: Verificar que hay productos en la base de datos

1. Ve a **"Table Editor"** en el menú lateral
2. Selecciona la tabla **`bigbuy_products`**
3. Verifica que hay productos con:
   - `has_stock = true`
   - `deleted_at = null`

**Si NO hay productos**, necesitas sincronizarlos primero desde BigBuy.

### Paso 5: Verificar el sitio en Netlify

1. Ve a tu sitio en Netlify
2. Abre la consola del navegador (F12)
3. Recarga la página (Ctrl+R)
4. Verifica que no haya errores en la consola
5. Los productos deberían aparecer ahora ✅

---

## 🔧 Verificación rápida con SQL

Puedes verificar cuántos productos tienes con esta query en el SQL Editor:

```sql
SELECT 
  COUNT(*) as total_productos,
  COUNT(*) FILTER (WHERE has_stock = true) as con_stock,
  COUNT(*) FILTER (WHERE deleted_at IS NULL) as activos
FROM bigbuy_products;
```

---

## 📝 Notas importantes

- **RLS activado**: Las tablas ahora tienen políticas de seguridad que permiten:
  - ✅ Lectura pública (usuarios anónimos y autenticados)
  - ❌ Escritura solo para `service_role` y administradores

- **Seguridad**: Esta configuración es segura porque:
  - Los productos son datos públicos (catálogo)
  - Solo administradores pueden modificar productos
  - Las operaciones de escritura requieren autenticación y rol de admin

---

## 🆘 Si siguen sin aparecer los productos

1. **Verifica la consola del navegador** (F12) en Netlify
2. **Revisa los logs de Netlify**:
   - Ve a tu sitio en Netlify
   - Click en "Deploys"
   - Click en el último deploy
   - Revisa los logs de construcción

3. **Sincroniza productos desde BigBuy**:
   - Accede al panel de administración: `/admin` (necesitas ser admin)
   - Click en "Sincronizar productos"

4. **Verifica las credenciales de Supabase**:
   - Las credenciales están en `src/utils/supabase/info.tsx`
   - Son las mismas para local y producción (están en el código)

---

## 🎉 Una vez funcionando

Cada nuevo `git push` a `main` activará un redespliegue automático en Netlify.

No necesitas volver a configurar nada. ✅
