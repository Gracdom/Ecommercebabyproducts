/**
 * Generador de características principales (3 por producto) desde la BASE DE DATOS.
 * Lee nombre y descripción de cada producto en Supabase, genera 3 características con OpenAI
 * y guarda el resultado en ai_highlight_features. No usa la API/edge function.
 *
 * Requisitos:
 *   - Migración aplicada: columna ai_highlight_features en bigbuy_product_translations
 *   - Variables de entorno:
 *       SUPABASE_URL (opcional, tiene default)
 *       SUPABASE_SERVICE_ROLE_KEY o SUPABASE_KEY  → para leer y escribir en la BD
 *       OPENAI_API_KEY                            → para generar el texto con IA
 *
 * Uso:
 *   node generate_highlight_features.js
 *   node generate_highlight_features.js --limit=50
 *   node generate_highlight_features.js --force
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qozeqcfavcnfwkexxbjm.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

if (!SUPABASE_KEY) {
  console.error('❌ Falta SUPABASE_SERVICE_ROLE_KEY o SUPABASE_KEY');
  process.exit(1);
}
if (!OPENAI_API_KEY) {
  console.error('❌ Falta OPENAI_API_KEY');
  process.exit(1);
}

const args = process.argv.slice(2);
const forceRegenerate = args.includes('--force');
const limitArg = args.find(a => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 500;

// ——— Supabase: leer productos desde la BD ———
async function fetchProductsFromDb(offset, batchSize, onlyWithoutFeatures) {
  let url = `${SUPABASE_URL}/rest/v1/bigbuy_products?select=id,bigbuy_product_translations(iso_code,name,description,ai_description,ai_highlight_features)&has_stock=eq.true&deleted_at=is.null&order=id.asc&offset=${offset}&limit=${batchSize}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Supabase GET: ${res.status} ${t}`);
  }
  const rows = await res.json();
  const out = [];
  for (const row of rows) {
    const trans = row.bigbuy_product_translations;
    const list = Array.isArray(trans) ? trans : (trans ? [trans] : []);
    const es = list.find(t => t && t.iso_code === 'es');
    if (!es) continue;
    if (onlyWithoutFeatures && es.ai_highlight_features != null && Array.isArray(es.ai_highlight_features) && es.ai_highlight_features.length >= 3) continue;
    const desc = es.ai_description || es.description || '';
    out.push({
      productId: row.id,
      name: es.name || '',
      originalDescription: desc,
    });
  }
  return { products: out, fetched: rows.length };
}

// ——— OpenAI: generar 3 características por producto ———
async function generateFeaturesWithOpenAI(productName, description) {
  const systemPrompt = `Eres un experto en e-commerce de productos para bebés. Genera exactamente 3 características destacadas para la ficha de un producto.
Reglas:
- Devuelve SOLO un JSON válido con un array de exactamente 3 strings. Ejemplo: ["Característica 1", "Característica 2", "Característica 3"]
- Cada característica debe ser ESPECÍFICA de este producto (materiales, diseño, seguridad, uso, composición, certificaciones).
- NO uses nada sobre envío, disponibilidad ni frases genéricas.
- Máximo 6-8 palabras por característica. Español de España.`;

  const userPrompt = `Producto: ${productName}\n\nDescripción:\n${description || 'No hay descripción'}\n\nDevuelve únicamente el JSON con el array de 3 características (sin markdown):`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: 200,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const content = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
  const cleaned = content.replace(/^```\w*\n?|\n?```$/g, '').trim();
  let arr;
  try {
    const parsed = JSON.parse(cleaned);
    arr = Array.isArray(parsed) ? parsed : (parsed && parsed.features) || [];
  } catch {
    arr = [];
  }
  const features = arr.filter(x => typeof x === 'string').map(s => s.trim()).filter(Boolean).slice(0, 3);
  if (features.length < 3) throw new Error('OpenAI no devolvió 3 características');
  return features;
}

// ——— Supabase: guardar ai_highlight_features en la BD ———
async function saveFeaturesToDb(productId, features) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/bigbuy_product_translations?product_id=eq.${productId}&iso_code=eq.es`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ ai_highlight_features: features }),
  });
  if (!res.ok) throw new Error(`Supabase PATCH: ${res.status} ${await res.text()}`);
}

// ——— Main ———
async function main() {
  console.log('🚀 Generador de características principales (desde la base de datos)');
  console.log('   Leyendo nombre y descripción de Supabase → OpenAI → guardar en BD\n');
  if (forceRegenerate) console.log('   Modo: regenerar todos');
  console.log(`   Límite: ${limit} productos\n`);

  let totalProcessed = 0;
  let totalGenerated = 0;
  let totalFailed = 0;
  const batchSize = 20;

  for (let offset = 0; offset < limit; offset += batchSize) {
    if (totalGenerated >= limit) break;
    const { products: toProcess, fetched } = await fetchProductsFromDb(offset, batchSize, !forceRegenerate);
    if (fetched === 0) break;
    if (toProcess.length === 0) continue;

    for (let i = 0; i < toProcess.length; i++) {
      if (totalGenerated >= limit) break;
      const p = toProcess[i];
      totalProcessed++;
      try {
        await new Promise(r => setTimeout(r, i * 400));
        const features = await generateFeaturesWithOpenAI(p.name, p.originalDescription);
        await saveFeaturesToDb(p.productId, features);
        totalGenerated++;
        console.log(`   ✓ ${p.productId}  ${(p.name || '').slice(0, 50)}...`);
      } catch (err) {
        totalFailed++;
        console.error(`   ✗ ${p.productId}  ${err.message}`);
      }
    }

    if (toProcess.length < batchSize) break;
  }

  console.log('\n✅ Fin');
  console.log(`   Procesados: ${totalProcessed}  |  Generados: ${totalGenerated}  |  Fallos: ${totalFailed}`);
}

main().catch(err => {
  console.error('❌', err.message);
  process.exit(1);
});
