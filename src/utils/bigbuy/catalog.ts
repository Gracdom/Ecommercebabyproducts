import type { Product } from "@/types";
import { supabase } from "@/utils/supabase/client";

type DbTranslation = {
  iso_code: string;
  name: string;
  description: string | null;
  ai_description: string | null;
  ai_highlight_features?: string[] | null;
};

type DbImage = {
  url: string;
  position: number | null;
};

type DbVariantAttribute = {
  group_name: string;
  attribute_name: string;
};

type DbVariant = {
  id: number;
  sku: string;
  sale_price: number;
  stock: number | null;
  bigbuy_variant_attributes?: DbVariantAttribute[];
};

type DbAnalytics = {
  total_views: number;
  total_clicks: number;
  total_cart_adds: number;
  total_purchases: number;
  conversion_rate: number;
  ctr: number;
  ml_score: number;
  avg_time_on_page_ms: number;
};

type DbProduct = {
  id: number;
  sku: string;
  sale_price: number;
  retail_price: number | null;
  has_stock: boolean;
  deleted_at: string | null;
  bigbuy_product_translations?: DbTranslation[];
  bigbuy_product_images?: DbImage[];
  bigbuy_variants?: DbVariant[];
  product_analytics_summary?: DbAnalytics[];
};

function stripHtml(input: string): string {
  return input.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/** Genera descripción corta a partir de la larga (250-350 caracteres, corte en palabra). */
function getShortDescription(longDescription: string, minChars = 250, maxChars = 350): string {
  const text = longDescription.trim();
  if (!text) return "";
  if (text.length <= maxChars) return text;
  const slice = text.slice(0, maxChars);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace >= minChars ? lastSpace : maxChars;
  return slice.slice(0, cut).trim() + (cut < text.length ? "…" : "");
}

// Map BigBuy taxonomy names to frontend categories (Spanish)
function mapTaxonomyToCategory(taxonomyName?: string, productName?: string): string {
  if (!taxonomyName && !productName) return 'Ropa';
  
  const name = (taxonomyName || productName || '').toLowerCase();
  
  // Map based on keywords -> nombres en español
  if (name.includes('juguete') || name.includes('toy') || name.includes('juego')) {
    return 'Juguetes';
  }
  if (name.includes('ropa') || name.includes('clothing') || name.includes('body') || name.includes('vestido')) {
    return 'Ropa';
  }
  if (name.includes('manta') || name.includes('blanket') || name.includes('textil') || name.includes('sábana')) {
    return 'Textiles';
  }
  if (name.includes('cuna') || name.includes('crib') || name.includes('cama')) {
    return 'Mobiliario';
  }
  if (name.includes('carrito') || name.includes('stroller') || name.includes('coche')) {
    return 'Transporte';
  }
  if (name.includes('aliment') || name.includes('food') || name.includes('biberón')) {
    return 'Alimentación';
  }
  if (name.includes('higiene') || name.includes('hygiene') || name.includes('baño')) {
    return 'Higiene';
  }
  if (name.includes('regalo') || name.includes('gift') || name.includes('set')) {
    return 'Sets y regalos';
  }
  
  // Default category
  return 'Ropa';
}

export async function fetchCatalogProducts(options?: {
  limit?: number;
  offset?: number;
  minMlScore?: number;
}): Promise<Product[]> {
  let query = supabase
    .from("bigbuy_products")
    .select(
      `
      id,
      sku,
      sale_price,
      retail_price,
      has_stock,
      deleted_at,
      bigbuy_product_translations ( iso_code, name, description, ai_description, ai_highlight_features ),
      bigbuy_product_images ( url, position ),
      bigbuy_variants (
        id,
        sku,
        sale_price,
        stock,
        bigbuy_variant_attributes ( group_name, attribute_name )
      ),
      product_analytics_summary (
        total_views,
        total_clicks,
        total_cart_adds,
        total_purchases,
        conversion_rate,
        ctr,
        ml_score,
        avg_time_on_page_ms
      )
    `,
    )
    .eq("has_stock", true)
    .is("deleted_at", null);

  // Apply ML score filter if provided
  if (options?.minMlScore !== undefined) {
    // We'll filter after fetching since we need to join analytics
  }

  // Order by ML score (will be done after fetching)
  const { data, error } = await query;

  if (error) throw error;
  const rows = (data ?? []) as unknown as DbProduct[];

  let products = rows
    .map((p) => {
      const translations = p.bigbuy_product_translations ?? [];
      const es = translations.find((t) => t.iso_code === "es");
      const en = translations.find((t) => t.iso_code === "en");
      const name = es?.name || en?.name || p.sku;

      const descriptionRaw = es?.description || en?.description || "";
      const description = descriptionRaw ? stripHtml(descriptionRaw) : "";
      
      // Prefer AI-generated description if available, fallback to original
      const aiDescriptionRaw = es?.ai_description || en?.ai_description || null;
      const finalDescription = aiDescriptionRaw ? aiDescriptionRaw : description;

      const images = (p.bigbuy_product_images ?? [])
        .slice()
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((i) => i.url)
        .filter(Boolean);

      const variants = (p.bigbuy_variants ?? []).map((v) => ({
        id: v.id,
        sku: v.sku,
        price: v.sale_price,
        stock: v.stock ?? 0,
        attributes: v.bigbuy_variant_attributes ?? [],
      }));

      const inStock = variants.some((v) => (v.stock ?? 0) > 0);
      const analytics = Array.isArray(p.product_analytics_summary) 
        ? p.product_analytics_summary[0] 
        : p.product_analytics_summary || null;

      // Map category from product name/taxonomy
      const category = mapTaxonomyToCategory(undefined, name);

      // Descripción corta (250-350 caracteres) para la ficha, arriba de cantidad
      const shortDescription = getShortDescription(finalDescription);

      // 3 características principales (generadas por IA y guardadas en ai_highlight_features)
      const rawFeatures = es?.ai_highlight_features ?? en?.ai_highlight_features ?? null;
      const highlightFeatures = Array.isArray(rawFeatures)
        ? rawFeatures.filter((x): x is string => typeof x === "string").slice(0, 3)
        : undefined;

      return {
        id: p.id,
        name,
        price: p.sale_price,
        originalPrice: p.retail_price ?? undefined,
        image: images[0] || "",
        category,
        // extras (used later by ProductPage)
        description: finalDescription,
        shortDescription: shortDescription || undefined,
        highlightFeatures: highlightFeatures?.length ? highlightFeatures : undefined,
        images,
        sku: p.sku,
        variants,
        inStock,
        mlScore: analytics?.ml_score ?? 0,
        analytics: analytics ? {
          views: analytics.total_views ?? 0,
          clicks: analytics.total_clicks ?? 0,
          conversionRate: analytics.conversion_rate ?? 0,
          ctr: analytics.ctr ?? 0,
        } : undefined,
      } as Product & {
        description?: string;
        shortDescription?: string;
        images?: string[];
        sku?: string;
        variants?: Array<{
          id: number;
          sku: string;
          price: number;
          stock: number;
          attributes: DbVariantAttribute[];
        }>;
        inStock?: boolean;
        mlScore?: number;
        analytics?: {
          views: number;
          clicks: number;
          conversionRate: number;
          ctr: number;
        };
      };
    })
    .filter((p: any) => p.inStock !== false);

  // Filter by ML score if provided
  if (options?.minMlScore !== undefined) {
    products = products.filter((p: any) => (p.mlScore ?? 0) >= options.minMlScore!);
  }

  // Sort by ML score DESC
  products.sort((a: any, b: any) => (b.mlScore ?? 0) - (a.mlScore ?? 0));

  // Apply pagination
  if (options?.offset !== undefined) {
    products = products.slice(options.offset);
  }
  if (options?.limit !== undefined) {
    products = products.slice(0, options.limit);
  }

  return products;
}

export async function fetchFeaturedProducts(limit: number = 8, minMlScore: number = 50): Promise<Product[]> {
  return fetchCatalogProducts({
    limit,
    minMlScore,
  });
}

export interface CategoryInfo {
  id: number;
  name: string;
  parentId?: number | null;
  parentName?: string | null;
  productCount?: number;
}

/**
 * Fetch real categories from BigBuy products using taxonomies
 */
export async function fetchCategories(): Promise<CategoryInfo[]> {
  try {
    // Get unique category IDs from products
    const { data: products, error: productsError } = await supabase
      .from("bigbuy_products")
      .select("category_id")
      .eq("has_stock", true)
      .is("deleted_at", null)
      .not("category_id", "is", null);

    if (productsError) {
      console.error("Error fetching product categories:", productsError);
      return [];
    }

    // Count products per category
    const categoryCounts = new Map<number, number>();
    const categoryIds = new Set<number>();

    for (const p of products || []) {
      const catId = p.category_id;
      if (!catId) continue;
      categoryIds.add(catId);
      categoryCounts.set(catId, (categoryCounts.get(catId) || 0) + 1);
    }

    if (categoryIds.size === 0) {
      return [];
    }

    // Fetch taxonomy info for these categories
    const { data: taxonomies, error: taxError } = await supabase
      .from("bigbuy_taxonomies")
      .select("id, name, parent_taxonomy_id")
      .in("id", Array.from(categoryIds))
      .eq("iso_code", "es");

    if (taxError) {
      console.error("Error fetching taxonomies:", taxError);
      return [];
    }

    // Get parent taxonomy IDs
    const parentIds = new Set<number>();
    for (const tax of taxonomies || []) {
      if (tax.parent_taxonomy_id) {
        parentIds.add(tax.parent_taxonomy_id);
      }
    }

    // Fetch parent taxonomy names
    let parentMap = new Map<number, string>();
    if (parentIds.size > 0) {
      const { data: parentTaxonomies } = await supabase
        .from("bigbuy_taxonomies")
        .select("id, name")
        .in("id", Array.from(parentIds))
        .eq("iso_code", "es");

      for (const pt of parentTaxonomies || []) {
        parentMap.set(pt.id, pt.name);
      }
    }

    // Build category info
    const categories: CategoryInfo[] = [];
    for (const tax of taxonomies || []) {
      categories.push({
        id: tax.id,
        name: tax.name || "",
        parentId: tax.parent_taxonomy_id || null,
        parentName: tax.parent_taxonomy_id && parentMap.has(tax.parent_taxonomy_id)
          ? parentMap.get(tax.parent_taxonomy_id)!
          : null,
        productCount: categoryCounts.get(tax.id) || 0,
      });
    }

    return categories.filter(cat => cat.name);
  } catch (err) {
    console.error("Error in fetchCategories:", err);
    return [];
  }
}

