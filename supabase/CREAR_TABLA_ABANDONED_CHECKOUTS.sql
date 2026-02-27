-- Ejecuta este SQL en Supabase Dashboard > SQL Editor > New query
-- URL: https://supabase.com/dashboard/project/qozeqcfavcnfwkexxbjm/sql/new

-- Carritos / checkouts abandonados (quien no completó la compra)
CREATE TABLE IF NOT EXISTS public.abandoned_checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  cart_items JSONB NOT NULL DEFAULT '[]',
  cart_total NUMERIC(10, 2) DEFAULT 0,
  source TEXT DEFAULT 'exit_intent' CHECK (source IN ('exit_intent', 'checkout_cancel', 'manual')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_abandoned_checkouts_created_at ON public.abandoned_checkouts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_abandoned_checkouts_email ON public.abandoned_checkouts(email);
CREATE INDEX IF NOT EXISTS idx_abandoned_checkouts_session_id ON public.abandoned_checkouts(session_id);

ALTER TABLE public.abandoned_checkouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access abandoned_checkouts"
  ON public.abandoned_checkouts FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Anon insert abandoned_checkouts"
  ON public.abandoned_checkouts FOR INSERT TO anon WITH CHECK (true);

COMMENT ON TABLE public.abandoned_checkouts IS 'Registros de carrito/checkout abandonado (no completaron la compra)';
