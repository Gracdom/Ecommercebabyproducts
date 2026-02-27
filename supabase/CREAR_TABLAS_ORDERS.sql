-- Ejecuta este SQL en Supabase Dashboard > SQL Editor > New query
-- URL: https://supabase.com/dashboard/project/qozeqcfavcnfwkexxbjm/sql/new
-- Solo si las tablas orders y order_items no existen

-- Orders: almacena pedidos y compras completadas
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

-- Order items: líneas de pedido (productos comprados)
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
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Políticas para orders
CREATE POLICY "Authenticated read own orders" ON public.orders
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Authenticated insert orders" ON public.orders
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Anon insert orders" ON public.orders
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon select orders" ON public.orders
  FOR SELECT TO anon USING (true);
CREATE POLICY "Service role full access orders" ON public.orders
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Políticas para order_items
CREATE POLICY "Authenticated insert order items" ON public.order_items
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Anon insert order items" ON public.order_items
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon select order items" ON public.order_items
  FOR SELECT TO anon USING (true);
CREATE POLICY "Authenticated read order items" ON public.order_items
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid())
  );
CREATE POLICY "Service role full access order_items" ON public.order_items
  FOR ALL TO service_role USING (true) WITH CHECK (true);
