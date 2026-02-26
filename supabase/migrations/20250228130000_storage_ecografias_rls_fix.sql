-- Corregir RLS de Storage para que anon pueda subir al bucket ecografias
-- (soluciona: "new row violates row-level security policy")

-- Eliminar políticas anteriores si existen (evita duplicados o conflictos)
DROP POLICY IF EXISTS "Allow anon upload ecografias" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read ecografias" ON storage.objects;

-- Anónimos pueden INSERTAR (subir) en el bucket ecografias
CREATE POLICY "Allow anon upload ecografias"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'ecografias');

-- Cualquiera puede leer (SELECT) archivos del bucket ecografias (bucket público)
CREATE POLICY "Allow public read ecografias"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'ecografias');
