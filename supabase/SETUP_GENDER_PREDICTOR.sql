-- =============================================================================
-- PREDICTOR DE GÉNERO: tabla + permisos
-- Ejecuta este script en el mismo proyecto Supabase donde está tu app y tu Edge Function.
-- Supabase Dashboard → SQL Editor → Pegar → Run
-- =============================================================================

-- 1) Tabla de envíos (ecografías + datos)
CREATE TABLE IF NOT EXISTS public.gender_predictor_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pregnancy_weeks INTEGER NOT NULL CHECK (pregnancy_weeks >= 6 AND pregnancy_weeks <= 20),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  ultrasound_type TEXT NOT NULL,
  ultrasound_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gender_predictor_submissions_created_at
  ON public.gender_predictor_submissions(created_at DESC);

ALTER TABLE public.gender_predictor_submissions ENABLE ROW LEVEL SECURITY;

-- 2) Solo el backend (service_role) escribe y lee; el panel admin usa el mismo backend
DROP POLICY IF EXISTS "Allow anon insert gender submissions" ON public.gender_predictor_submissions;
DROP POLICY IF EXISTS "Service role full access gender submissions" ON public.gender_predictor_submissions;

CREATE POLICY "Service role full access gender submissions"
  ON public.gender_predictor_submissions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.gender_predictor_submissions IS 'Envíos del predictor de género; la Edge Function (service_role) escribe aquí.';

-- 3) Bucket de Storage para ecografías (la Edge lo crea si no existe; esto es por si prefieres crearlo por SQL)
-- Si falla con "relation storage.buckets does not exist", crea el bucket desde Dashboard: Storage → New bucket → id: ecografias, Public: sí
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ecografias',
  'ecografias',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
