-- Formulario predictor de género: datos + ecografía
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

-- Cualquiera puede enviar (anon insert)
CREATE POLICY "Allow anon insert gender submissions"
  ON public.gender_predictor_submissions FOR INSERT TO anon WITH CHECK (true);

-- Solo service_role puede leer (admin vía edge)
CREATE POLICY "Service role full access gender submissions"
  ON public.gender_predictor_submissions FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE public.gender_predictor_submissions IS 'Envíos del formulario predictor de género (semanas, contacto, ecografía)';

-- Storage bucket para ecografías (permite subida anónima y lectura pública)
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

CREATE POLICY "Allow anon upload ecografias"
  ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'ecografias');

CREATE POLICY "Allow public read ecografias"
  ON storage.objects FOR SELECT TO public USING (bucket_id = 'ecografias');
