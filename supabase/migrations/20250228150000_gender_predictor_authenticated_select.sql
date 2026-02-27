-- Permitir a usuarios autenticados leer predicciones (fallback cuando Edge devuelve 404)
DROP POLICY IF EXISTS "Allow authenticated select gender submissions" ON public.gender_predictor_submissions;
CREATE POLICY "Allow authenticated select gender submissions"
  ON public.gender_predictor_submissions
  FOR SELECT TO authenticated
  USING (true);
