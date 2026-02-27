-- Asegurar que anon pueda subir al bucket ecografias
-- Soluciona: "new row violates row-level security policy" al subir ecografías

DROP POLICY IF EXISTS "Allow anon upload ecografias" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload ecografias" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read ecografias" ON storage.objects;

-- Anónimos pueden INSERTAR en ecografias (usuarios sin login en el formulario predictor)
CREATE POLICY "Allow anon upload ecografias"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'ecografias');

-- Cualquiera puede leer (bucket público)
CREATE POLICY "Allow public read ecografias"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'ecografias');
