/**
 * Script para generar todas las descripciones AI de productos actuales
 * Ejecutar: node generate_all_ai_descriptions.js
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qozeqcfavcnfwkexxbjm.supabase.co';
const FUNCTION_NAME = process.env.FUNCTION_NAME || 'make-server-335110ef';
const SYNC_SECRET = process.env.BIGBUY_SYNC_SECRET || '';

if (!SYNC_SECRET) {
  console.error('❌ Error: BIGBUY_SYNC_SECRET no está configurado en las variables de entorno');
  process.exit(1);
}

async function generateAllDescriptions() {
  const url = `${SUPABASE_URL}/functions/v1/${FUNCTION_NAME}/bigbuy/ai/descriptions/generate`;
  
  console.log('🚀 Iniciando generación de descripciones AI para todos los productos...');
  console.log('⏳ Esto puede tardar varios minutos...\n');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bigbuy-sync-secret': SYNC_SECRET,
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    console.log('✅ Proceso completado!');
    console.log(`📊 Resultados:`);
    console.log(`   - Total procesados: ${data.total || 0}`);
    console.log(`   - Descripciones generadas: ${data.generated || 0}`);
    console.log(`   - Fallos: ${data.failed || 0}`);
    if (data.message) {
      console.log(`   - Mensaje: ${data.message}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

generateAllDescriptions();

