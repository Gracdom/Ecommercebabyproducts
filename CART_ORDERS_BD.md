# Carrito, Checkout y Compras en Base de Datos

## Resumen

Se ha implementado el guardado persistente del **carrito**, **checkout** y **compras** en Supabase.

## Tablas creadas

### 1. `cart_items`
- Guarda los ítems del carrito por usuario (autenticado) o por sesión anónima.
- Campos: `product_id`, `product_sku`, `product_name`, `product_price`, `product_image`, `quantity`, `variant_id`, `variant_sku`.
- Soporta `user_id` (logueado) o `session_id` (invitado).

### 2. `orders`
- Datos de pedidos completados.
- Incluye: datos de contacto, dirección de envío, método de pago, totales, IDs de BigBuy, etc.

### 3. `order_items`
- Líneas de cada pedido (snapshot de productos comprados).

## Cómo aplicar la migración

1. Abre el **SQL Editor** de Supabase: https://supabase.com/dashboard → tu proyecto → SQL Editor.
2. Copia el contenido de `supabase/migrations/20250210000000_cart_and_orders.sql`.
3. Pega y ejecuta el script.

## Flujo actual

### Carrito
- **Carga:** primero desde BD (por `user_id` o `session_id`), si está vacío se usa `localStorage` (migración).
- **Guardado:** cambios en el carrito se guardan en BD (debounced 500 ms) y en `localStorage`.
- **Login:** al iniciar sesión, el carrito de sesión se une al carrito del usuario.

### Checkout y compras
- Al finalizar el checkout con BigBuy, se guarda el pedido en `orders` y las líneas en `order_items`.
- Se vacía el carrito en BD tras completar el pedido.

## Archivos modificados/creados

- `supabase/migrations/20250210000000_cart_and_orders.sql` – migración SQL.
- `src/utils/ebaby/cart-db.ts` – funciones de carrito en BD.
- `src/utils/ebaby/orders-db.ts` – funciones de pedidos en BD.
- `src/App.tsx` – integración de carga/guardado de carrito y creación de pedidos.
