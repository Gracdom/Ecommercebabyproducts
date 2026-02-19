-- Cart and Orders tables for persisting cart, checkout and purchases

-- Cart items: supports both authenticated users and anonymous (session_id)
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  product_id TEXT NOT NULL,
  product_sku TEXT,
  product_name TEXT NOT NULL,
  product_price NUMERIC(10, 2) NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  variant_id TEXT,
  variant_sku TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT cart_user_or_session CHECK (
    (user_id IS NOT NULL AND session_id IS NULL) OR
    (user_id IS NULL AND session_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON public.cart_items(session_id);

-- Orders: stores checkout and purchase data
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  shipping_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  bigbuy_order_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
  shipping_service_name TEXT,
  shipping_service_delay TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_session_id ON public.orders(session_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Order items: snapshot of purchased products
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_sku TEXT,
  product_name TEXT NOT NULL,
  product_price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  product_image TEXT,
  variant_sku TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- RLS
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Cart: authenticated users by user_id; anon has full access (app filters by session_id)
CREATE POLICY "Authenticated users manage own cart" ON public.cart_items
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anon full access cart" ON public.cart_items
  FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access cart" ON public.cart_items
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Orders: authenticated read own; anon can insert and read (app filters by session_id/order_number)
CREATE POLICY "Authenticated read own orders" ON public.orders
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Authenticated insert orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Anon insert orders" ON public.orders FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon select orders" ON public.orders FOR SELECT TO anon USING (true);

CREATE POLICY "Service role full access orders" ON public.orders
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Order items: both can insert; select via policies above
CREATE POLICY "Authenticated insert order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anon insert order items" ON public.order_items FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon select order items" ON public.order_items FOR SELECT TO anon USING (true);

CREATE POLICY "Authenticated read order items" ON public.order_items
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
  );

CREATE POLICY "Service role full access order_items" ON public.order_items
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Function to generate order_number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
  SELECT 'EB-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 6));
$$ LANGUAGE sql;

COMMENT ON TABLE public.cart_items IS 'Carrito de compras - usuarios autenticados o sesión anónima';
COMMENT ON TABLE public.orders IS 'Pedidos y checkout completados';
COMMENT ON TABLE public.order_items IS 'Líneas de pedido - snapshot de productos comprados';
