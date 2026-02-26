-- Permitir a anon insertar en gender_predictor_submissions (fallback cuando Edge devuelve 404)
DROP POLICY IF EXISTS "Allow anon insert gender submissions" ON public.gender_predictor_submissions;
CREATE POLICY "Allow anon insert gender submissions"
  ON public.gender_predictor_submissions
  FOR INSERT TO anon
  WITH CHECK (true);
