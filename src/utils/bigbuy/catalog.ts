import type { Product } from "@/types";
import { supabase } from "@/utils/supabase/client";

type DbTranslation = {
  iso_code: string;
  name: string;
  description: string | null;
  ai_description: string | null;
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

// Map BigBuy taxonomy names to frontend categories
function mapTaxonomyToCategory(taxonomyName?: string, productName?: string): string {
  if (!taxonomyName && !productName) return 'clothing';
  
  const name = (taxonomyName || productName || '').toLowerCase();
  
  // Map based on keywords
  if (name.includes('juguete') || name.includes('toy') || name.includes('juego')) {
    return 'toys';
  }
  if (name.includes('ropa') || name.includes('clothing') || name.includes('body') || name.includes('vestido')) {
    return 'clothing';
  }
  if (name.includes('manta') || name.includes('blanket') || name.includes('textil') || name.includes('sábana')) {
    return 'textiles';
  }
  if (name.includes('cuna') || name.includes('crib') || name.includes('cama')) {
    return 'furniture';
  }
  if (name.includes('carrito') || name.includes('stroller') || name.includes('coche')) {
    return 'transport';
  }
  if (name.includes('aliment') || name.includes('food') || name.includes('biberón')) {
    return 'feeding';
  }
  if (name.includes('higiene') || name.includes('hygiene') || name.includes('baño')) {
    return 'hygiene';
  }
  if (name.includes('regalo') || name.includes('gift') || name.includes('set')) {
    return 'gift-sets';
  }
  
  // Default category
  return 'clothing';
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
      bigbuy_product_translations ( iso_code, name, description, ai_description ),
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

      return {
        id: p.id,
        name,
        price: p.sale_price,
        originalPrice: p.retail_price ?? undefined,
        image: images[0] || "",
        category,
        // extras (used later by ProductPage)
        description: finalDescription,
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

