import { getServiceSupabase } from "../supabase.tsx";

/**
 * OpenAI API client for generating product descriptions
 */

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    total_tokens: number;
  };
}

let cachedApiKey: string | null = null;

async function getOpenAIKey(): Promise<string> {
  if (cachedApiKey) return cachedApiKey;

  // Prefer env var, fallback to DB
  const envKey = (Deno.env.get("OPENAI_API_KEY") ?? "").trim();
  if (envKey) {
    cachedApiKey = envKey;
    return envKey;
  }

  // Try to get from Supabase settings table
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("bigbuy_private_settings")
    .select("openai_api_key")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching OpenAI API key:", error);
    throw new Error("Missing OPENAI_API_KEY (set OPENAI_API_KEY secret or in bigbuy_private_settings)");
  }

  const key = String((data as any)?.openai_api_key ?? "").trim();
  if (!key) {
    throw new Error("Missing OPENAI_API_KEY (set OPENAI_API_KEY secret or in bigbuy_private_settings)");
  }

  cachedApiKey = key;
  return key;
}

/**
 * Generate an improved product description using OpenAI
 */
export async function generateProductDescription(
  productName: string,
  originalDescription: string,
  category?: string,
  price?: number
): Promise<string> {
  const apiKey = await getOpenAIKey();

  const systemPrompt = `Eres un experto en copywriting para e-commerce de productos para bebés. 
Tu tarea es crear descripciones de productos atractivas, profesionales y optimizadas para ventas.

IMPORTANTE: Todas las descripciones deben seguir el MISMO estilo y estructura para mantener consistencia en toda la tienda.

Estructura estándar que DEBES seguir:
1. Introducción cálida (1-2 frases) que conecte emocionalmente con los padres
2. Características principales del producto (3-4 puntos clave)
3. Beneficios para el bebé y la familia (2-3 beneficios)
4. Cierre con llamada a la acción sutil

Reglas de estilo CONSISTENTES:
- Longitud: 180-220 palabras exactamente
- Tono: Cálido, profesional, confiable, cercano pero no excesivamente emocional
- Lenguaje: Español de España, claro y directo
- Formato: Párrafos cortos (2-3 frases máximo por párrafo)
- Vocabulario: Evitar términos técnicos complejos, usar lenguaje accesible
- Enfoque: Siempre destacar calidad, seguridad y bienestar del bebé
- Evitar: Exageraciones, lenguaje demasiado comercial, promesas irreales
- Incluir: Información práctica sobre uso, cuidados o características técnicas relevantes

Ejemplo de tono a seguir:
"Este producto está diseñado pensando en el bienestar y comodidad de tu bebé. Con materiales cuidadosamente seleccionados y un diseño que prioriza la seguridad, se convierte en un elemento esencial para el día a día. [Características específicas]. [Beneficios]. Ideal para [situación de uso], este producto se adapta a las necesidades de tu familia, ofreciendo calidad y tranquilidad en cada uso."`;

  const userPrompt = `Crea una descripción mejorada para este producto de e-commerce siguiendo EXACTAMENTE la estructura y estilo definidos:

Nombre del producto: ${productName}
${category ? `Categoría: ${category}` : ""}
${price ? `Precio: €${price.toFixed(2)}` : ""}

Descripción original de BigBuy:
${originalDescription || "No hay descripción disponible"}

IMPORTANTE:
- Sigue la estructura estándar: introducción emocional → características → beneficios → cierre
- Usa exactamente 180-220 palabras
- Mantén el mismo tono cálido y profesional que en otros productos de la tienda
- Incluye información específica del producto pero con el estilo consistente
- Si la descripción original tiene información técnica útil, incorpórala de forma natural
- Asegúrate de que la descripción sea única pero mantenga la consistencia de estilo con otros productos

Genera la descripción ahora:`;

  const messages: OpenAIMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Using mini for cost efficiency
        messages,
        temperature: 0.6, // Lower temperature for more consistency
        max_tokens: 400, // Enough for 180-220 words
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as OpenAIResponse;
    const description = data.choices?.[0]?.message?.content?.trim();

    if (!description) {
      throw new Error("No description generated from OpenAI");
    }

    return description;
  } catch (error) {
    console.error("Error generating AI description:", error);
    throw error;
  }
}

/**
 * Batch generate descriptions for multiple products
 */
export async function batchGenerateDescriptions(
  products: Array<{
    productId: number;
    name: string;
    originalDescription: string;
    category?: string;
    price?: number;
  }>
): Promise<Map<number, string>> {
  const results = new Map<number, string>();
  
  // Process in smaller batches to avoid rate limits
  // Reduced batch size for better reliability
  const batchSize = 3;
  
  console.log(`Processing ${products.length} products in batches of ${batchSize}`);
  
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(products.length / batchSize);
    
    console.log(`Processing batch ${batchNum}/${totalBatches} (${batch.length} products)`);
    
    const batchResults = await Promise.allSettled(
      batch.map(async (product, idx) => {
        try {
          // Stagger requests slightly within batch
          await new Promise(resolve => setTimeout(resolve, idx * 300));
          
          const description = await generateProductDescription(
            product.name,
            product.originalDescription,
            product.category,
            product.price
          );
          
          console.log(`✓ Generated description for product ${product.productId}: ${product.name.substring(0, 50)}...`);
          return { productId: product.productId, description };
        } catch (error) {
          console.error(`✗ Failed to generate description for product ${product.productId} (${product.name}):`, error);
          return { productId: product.productId, description: null };
        }
      })
    );
    
    // Collect results
    for (const result of batchResults) {
      if (result.status === "fulfilled" && result.value.description) {
        results.set(result.value.productId, result.value.description);
      }
    }
    
    // Delay between batches to respect rate limits
    if (i + batchSize < products.length) {
      console.log(`Waiting 2 seconds before next batch...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log(`Completed: ${results.size}/${products.length} descriptions generated successfully`);
  return results;
}

/**
 * Genera exactamente 3 características destacadas específicas del producto (para ficha de producto).
 * No incluir nada de envío, disponibilidad ni frases genéricas; solo atributos concretos del producto.
 */
export async function generateProductHighlightFeatures(
  productName: string,
  originalDescription: string,
  category?: string
): Promise<string[]> {
  const apiKey = await getOpenAIKey();

  const systemPrompt = `Eres un experto en e-commerce de productos para bebés. Tu tarea es generar exactamente 3 características destacadas para la ficha de un producto.

Reglas:
- Devuelve SOLO un JSON válido con un array de exactamente 3 strings. Ejemplo: ["Característica 1", "Característica 2", "Característica 3"]
- Cada característica debe ser ESPECÍFICA de este producto (materiales, diseño, seguridad, uso, composición, certificaciones, etc.).
- NO uses nada sobre envío, disponibilidad, plazos de entrega ni ofertas genéricas.
- NO uses frases genéricas como "Calidad premium", "Materiales seguros" sin concretar (mejor "Algodón 100% orgánico", "Sin BPA").
- Máximo 6-8 palabras por característica. Español de España.
- Basa las características en el nombre y la descripción del producto.`;

  const userPrompt = `Producto: ${productName}
${category ? `Categoría: ${category}` : ""}

Descripción del producto:
${originalDescription || "No hay descripción"}

Devuelve únicamente el JSON con el array de 3 características (sin markdown, sin explicaciones):`;

  const messages: OpenAIMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.4,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as OpenAIResponse;
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("No content from OpenAI for highlight features");

    const cleaned = content.replace(/^```\w*\n?|\n?```$/g, "").trim();
    const parsed = JSON.parse(cleaned) as unknown;
    const arr = Array.isArray(parsed) ? parsed : (parsed && typeof (parsed as any).features === "object" ? (parsed as any).features : []);
    const features = arr
      .filter((x): x is string => typeof x === "string")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);
    if (features.length < 3) throw new Error("OpenAI did not return 3 highlight features");
    return features;
  } catch (error) {
    console.error("Error generating highlight features:", error);
    throw error;
  }
}

/**
 * Genera características destacadas para varios productos (mismo formato que batch descriptions).
 */
export async function batchGenerateHighlightFeatures(
  products: Array<{
    productId: number;
    name: string;
    originalDescription: string;
    category?: string;
  }>
): Promise<Map<number, string[]>> {
  const results = new Map<number, string[]>();
  const batchSize = 3;

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(async (product, idx) => {
        await new Promise((r) => setTimeout(r, idx * 300));
        const features = await generateProductHighlightFeatures(
          product.name,
          product.originalDescription,
          product.category
        );
        return { productId: product.productId, features };
      })
    );
    for (const result of batchResults) {
      if (result.status === "fulfilled" && result.value.features?.length === 3) {
        results.set(result.value.productId, result.value.features);
      }
    }
    if (i + batchSize < products.length) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  return results;
}
