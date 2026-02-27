-- Ejecuta en Supabase SQL Editor para guardar datos paso a paso del checkout
-- URL: https://supabase.com/dashboard/project/qozeqcfavcnfwkexxbjm/sql/new

-- Nuevas columnas para contacto y dirección
ALTER TABLE public.abandoned_checkouts ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.abandoned_checkouts ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE public.abandoned_checkouts ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.abandoned_checkouts ADD COLUMN IF NOT EXISTS street TEXT;
ALTER TABLE public.abandoned_checkouts ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.abandoned_checkouts ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE public.abandoned_checkouts ADD COLUMN IF NOT EXISTS country TEXT;

-- Permitir nuevos valores de source (checkout_step_1, checkout_step_2)
ALTER TABLE public.abandoned_checkouts DROP CONSTRAINT IF EXISTS abandoned_checkouts_source_check;
ALTER TABLE public.abandoned_checkouts ADD CONSTRAINT abandoned_checkouts_source_check 
  CHECK (source IN ('exit_intent', 'checkout_cancel', 'manual', 'checkout_step_1', 'checkout_step_2'));
