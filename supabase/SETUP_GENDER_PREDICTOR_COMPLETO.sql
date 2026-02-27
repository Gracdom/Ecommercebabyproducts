-- =============================================================================
-- PREDICTOR DE GÉNERO - SETUP COMPLETO
-- Ejecuta este script en Supabase Dashboard → SQL Editor → Pegar → Run
-- =============================================================================

-- 1) Crear tabla de envíos
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

-- 2) Políticas de la tabla
DROP POLICY IF EXISTS "Allow anon insert gender submissions" ON public.gender_predictor_submissions;
DROP POLICY IF EXISTS "Service role full access gender submissions" ON public.gender_predictor_submissions;
DROP POLICY IF EXISTS "Allow authenticated select gender submissions" ON public.gender_predictor_submissions;

CREATE POLICY "Allow anon insert gender submissions"
  ON public.gender_predictor_submissions FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Service role full access gender submissions"
  ON public.gender_predictor_submissions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated select gender submissions"
  ON public.gender_predictor_submissions
  FOR SELECT TO authenticated USING (true);

COMMENT ON TABLE public.gender_predictor_submissions IS 'Envíos del predictor de género (semanas, contacto, ecografía)';

-- 3) Bucket de Storage para ecografías
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ecografias',
  'ecografias',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 4) Políticas de Storage (subida anónima + lectura pública)
-- Eliminar TODAS las políticas que afecten a ecografias
DROP POLICY IF EXISTS "Allow anon upload ecografias" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload ecografias" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read ecografias" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- Subida: anon Y public (por si el cliente usa otro rol)
CREATE POLICY "Allow anon upload ecografias"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'ecografias');

CREATE POLICY "Allow public upload ecografias"
  ON storage.objects FOR INSERT TO public
  WITH CHECK (bucket_id = 'ecografias');

-- Lectura pública
CREATE POLICY "Allow public read ecografias"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'ecografias');
