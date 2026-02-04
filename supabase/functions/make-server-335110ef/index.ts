import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { requireSyncSecret } from "./middleware.tsx";
import * as kv from "./kv_store.tsx";
import {
  bigbuyGetAttributes,
  bigbuyGetAttributeGroups,
  bigbuyGetProducts,
  bigbuyGetProductsImages,
  bigbuyGetProductsInformation,
  bigbuyGetProductsStockByHandlingDays,
  bigbuyGetProductsVariations,
  bigbuyGetProductsVariationsStockByHandlingDays,
  bigbuyGetTaxonomies,
  bigbuyOrderCheckMultishipping,
  bigbuyOrderCreateMultishipping,
  bigbuyShippingOrders,
} from "./services/bigbuy_client.tsx";
import { getServiceSupabase } from "./supabase.tsx";
import {
  chunk,
  computeSalePriceEurX95,
  parseBigBuyDateTime,
  sumStockFromByHandlingDays,
} from "./utils.tsx";
import { generateProductDescription, batchGenerateDescriptions, batchGenerateHighlightFeatures } from "./services/openai_client.tsx";
const app = new Hono();

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const bytes = Array.from(new Uint8Array(digest));
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function normalizeIsoCountry(value: unknown): string {
  return String(value ?? "").trim().toUpperCase();
}

function normalizePostcode(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, "").trim();
}

function normalizeProducts(value: unknown): Array<{ reference: string; quantity: number }> {
  const arr = Array.isArray(value) ? value : [];
  return arr
    .map((p: any) => ({
      reference: String(p?.reference ?? "").trim(),
      quantity: Number(p?.quantity ?? 0),
    }))
    .filter((p) => Boolean(p.reference) && Number.isFinite(p.quantity) && p.quantity > 0)
    .sort((a, b) => a.reference.localeCompare(b.reference));
}

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "x-bigbuy-sync-secret"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-335110ef/health", (c) => {
  return c.json({ status: "ok" });
});

// -----------------------------
// BigBuy Admin (protected)
// -----------------------------

app.get("/make-server-335110ef/bigbuy/config", requireSyncSecret(), async (c) => {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("bigbuy_import_config")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ config: data ?? { id: 1, taxonomy_ids: [], product_limit: 100 } });
});

app.post("/make-server-335110ef/bigbuy/config", requireSyncSecret(), async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const taxonomyIds: number[] = Array.isArray(body?.taxonomyIds) ? body.taxonomyIds : [];
  const productLimit = Number.isFinite(body?.productLimit) ? Number(body.productLimit) : 100;

  const supabase = getServiceSupabase();
  const { error } = await supabase
    .from("bigbuy_import_config")
    .upsert({
      id: 1,
      taxonomy_ids: taxonomyIds,
      product_limit: productLimit,
      updated_at: new Date().toISOString(),
    });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({ ok: true });
});

app.get("/make-server-335110ef/bigbuy/taxonomies", requireSyncSecret(), async (c) => {
  const isoCode = c.req.query("isoCode") || "es";
  const firstLevel = c.req.query("firstLevel");
  const taxonomies = await bigbuyGetTaxonomies({
    isoCode,
    firstLevel: firstLevel ? 1 : undefined,
  });
  return c.json({ taxonomies });
});

// Sync BigBuy taxonomies into DB and backfill product taxonomy ids (category_id) for existing products.
// This fixes "Sin categoría" in the admin panel by ensuring:
// - `bigbuy_taxonomies` is populated (for name mapping)
// - `bigbuy_products.category_id` stores BigBuy `taxonomy` (not `category`)
app.post("/make-server-335110ef/bigbuy/fix/categories", requireSyncSecret(), async (c) => {
  const startedAt = Date.now();
  try {
    const supabase = getServiceSupabase();

    const { data: config, error: cfgErr } = await supabase
      .from("bigbuy_import_config")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (cfgErr) return c.json({ error: cfgErr.message }, 500);

    const taxonomyIds: number[] = Array.isArray(config?.taxonomy_ids)
      ? config.taxonomy_ids.map((t: any) => Number(t)).filter((n: number) => Number.isFinite(n))
      : [];
    if (!taxonomyIds.length) {
      return c.json({ error: "No taxonomyIds configured. Set config first." }, 400);
    }

    // 1) Sync taxonomies (store ALL taxonomies so we can map both `category` and `taxonomy` ids)
    let taxonomiesFetched = 0;
    let taxonomiesUpserted = 0;
    let taxonomiesUpsertErrors = 0;
    let taxonomiesFirstUpsertError: string | null = null;
    try {
      const taxonomies = await bigbuyGetTaxonomies({ isoCode: "es" });
      if (Array.isArray(taxonomies) && taxonomies.length > 0) {
        taxonomiesFetched = taxonomies.length;

        const nowIso = new Date().toISOString();
        const upserts: any[] = [];
        for (const tax of taxonomies) {
          const id = Number(tax?.id);
          if (!Number.isFinite(id)) continue;
          const name = String(tax?.name || "").trim();
          if (!name) continue;
          const parentNum = Number(tax?.parentTaxonomy);
          const parentId = Number.isFinite(parentNum) && parentNum !== 0 ? parentNum : null;
          const urlRaw = tax?.url;
          const url = typeof urlRaw === "string" && urlRaw.trim() ? urlRaw.trim() : null;
          upserts.push({
            id,
            name,
            parent_taxonomy_id: parentId,
            iso_code: "es",
            url,
            updated_at: nowIso,
          });
        }

        for (const batch of chunk(upserts, 500)) {
          const { error: taxError } = await supabase
            .from("bigbuy_taxonomies")
            .upsert(batch, { onConflict: "id" });
          if (taxError) {
            console.error("Error upserting taxonomies:", taxError);
            taxonomiesUpsertErrors += 1;
            if (!taxonomiesFirstUpsertError) taxonomiesFirstUpsertError = taxError.message;
          } else {
            taxonomiesUpserted += batch.length;
          }
        }
      } else {
        console.warn("No taxonomies received from BigBuy API");
      }
    } catch (e) {
      console.error("Error syncing taxonomies:", e);
    }

    // 2) Backfill bigbuy_products.category_id using BigBuy `taxonomy` field (only update existing products)
    //
    // IMPORTANT: Supabase/PostgREST applies a max-rows cap (often 1000). We must paginate here,
    // otherwise we'll miss many existing product IDs and the backfill will no-op.
    // NOTE: We cannot `upsert({ id, category_id })` because `bigbuy_products` has NOT NULL columns
    // (sku, active, sale_price, currency, created_at, updated_at). Postgres validates NOT NULL on INSERT
    // before conflict resolution. So we fetch the required columns and include them in the upsert payload.
    const existingById = new Map<number, any>();
    let existingProductsFetched = 0;
    const existingPageSize = 1000;
    let existingOffset = 0;
    while (true) {
      const { data: existingPage, error: existingErr } = await supabase
        .from("bigbuy_products")
        .select("id, sku, active, sale_price, currency, created_at, category_id")
        .is("deleted_at", null)
        .range(existingOffset, existingOffset + existingPageSize - 1);
      if (existingErr) return c.json({ error: existingErr.message }, 500);
      if (!existingPage || existingPage.length === 0) break;

      for (const row of existingPage) {
        const id = Number((row as any)?.id);
        if (!Number.isFinite(id)) continue;
        const sku = String((row as any)?.sku || "").trim();
        if (!sku) continue;
        existingById.set(id, {
          id,
          sku,
          active: Boolean((row as any)?.active),
          sale_price: (row as any)?.sale_price,
          currency: String((row as any)?.currency || "EUR"),
          created_at: (row as any)?.created_at,
          category_id: Number.isFinite(Number((row as any)?.category_id))
            ? Number((row as any)?.category_id)
            : null,
        });
      }

      existingProductsFetched += existingPage.length;
      if (existingPage.length < existingPageSize) break;
      existingOffset += existingPageSize;
    }

    let productsFetched = 0;
    let productsUpdated = 0;
    let productsUpdateErrors = 0;
    let productsFirstUpdateError: string | null = null;
    const pageSize = 100;
    for (const parentTaxonomy of taxonomyIds) {
      let page = 0;
      while (true) {
        const products = await bigbuyGetProducts({ parentTaxonomy, page, pageSize });
        if (!Array.isArray(products) || products.length === 0) break;
        productsFetched += products.length;

        const nowIso = new Date().toISOString();
        const updates = products
          .map((p: any) => {
            const id = Number(p?.id);
            if (!Number.isFinite(id)) return null;
            const existing = existingById.get(id);
            if (!existing) return null;
            const tax = Number(p?.taxonomy);
            const taxonomyId = Number.isFinite(tax)
              ? tax
              : (Number.isFinite(Number(parentTaxonomy)) ? Number(parentTaxonomy) : null);
            if (!taxonomyId) return null;
            if (Number(existing?.category_id) === Number(taxonomyId)) return null; // already correct
            return {
              id,
              sku: existing.sku,
              active: existing.active,
              sale_price: existing.sale_price,
              currency: existing.currency,
              created_at: existing.created_at,
              category_id: taxonomyId,
              updated_at: nowIso,
            };
          })
          .filter(Boolean);

        if (updates.length > 0) {
          const { error: upErr } = await supabase
            .from("bigbuy_products")
            .upsert(updates as any[], { onConflict: "id" });
          if (upErr) {
            console.error("Error backfilling product taxonomies:", upErr);
            productsUpdateErrors += 1;
            if (!productsFirstUpdateError) productsFirstUpdateError = upErr.message;
          } else {
            productsUpdated += updates.length;
          }
        }

        if (products.length < pageSize) break;
        page += 1;
      }
    }

    return c.json({
      ok: true,
      taxonomiesFetched,
      taxonomiesUpserted,
      taxonomiesUpsertErrors,
      taxonomiesFirstUpsertError,
      existingProductsFetched,
      productsFetched,
      productsUpdated,
      productsUpdateErrors,
      productsFirstUpdateError,
      ms: Date.now() - startedAt,
    });
  } catch (e: any) {
    console.error(e);
    return c.json({ error: e?.message || "Internal error" }, 500);
  }
});

// Debug helper (protected): test BigBuy catalog endpoints without running full sync
app.get("/make-server-335110ef/bigbuy/debug/products", requireSyncSecret(), async (c) => {
  try {
    const parentTaxonomyRaw = c.req.query("parentTaxonomy");
    const pageRaw = c.req.query("page");
    const pageSizeRaw = c.req.query("pageSize");

    const parentTaxonomyNum = parentTaxonomyRaw ? Number(parentTaxonomyRaw) : undefined;
    const pageNum = pageRaw ? Number(pageRaw) : undefined;
    const pageSizeNum = pageSizeRaw ? Number(pageSizeRaw) : 10;

    const products = await bigbuyGetProducts({
      parentTaxonomy: Number.isFinite(parentTaxonomyNum as any) ? (parentTaxonomyNum as number) : undefined,
      page: Number.isFinite(pageNum as any) ? (pageNum as number) : undefined,
      pageSize: Number.isFinite(pageSizeNum as any) ? (pageSizeNum as number) : 10,
    });

    return c.json({ productsCount: Array.isArray(products) ? products.length : 0, products });
  } catch (e: any) {
    console.error(e);
    return c.json(
      {
        error: e?.message || "Internal error",
        kind: e?.name,
        status: e?.status,
        url: e?.url,
        details: typeof e?.bodyText === "string" ? e.bodyText.slice(0, 1200) : undefined,
      },
      500,
    );
  }
});

// Debug helper (protected): check stock endpoints without writing to DB
app.get("/make-server-335110ef/bigbuy/debug/stock", requireSyncSecret(), async (c) => {
  try {
    const parentTaxonomyRaw = c.req.query("parentTaxonomy");
    const pageRaw = c.req.query("page");
    const pageSizeRaw = c.req.query("pageSize");

    const parentTaxonomyNum = parentTaxonomyRaw ? Number(parentTaxonomyRaw) : undefined;
    const pageNum = pageRaw ? Number(pageRaw) : 0;
    const pageSizeNum = pageSizeRaw ? Number(pageSizeRaw) : 1000;

    const parentTaxonomy = Number.isFinite(parentTaxonomyNum as any) ? (parentTaxonomyNum as number) : undefined;
    const page = Number.isFinite(pageNum as any) ? (pageNum as number) : 0;
    const pageSize = Number.isFinite(pageSizeNum as any) ? (pageSizeNum as number) : 1000;

    const [variationStocksRes, productStocksRes] = await Promise.allSettled([
      bigbuyGetProductsVariationsStockByHandlingDays({ parentTaxonomy, page, pageSize }),
      bigbuyGetProductsStockByHandlingDays({ parentTaxonomy, page, pageSize }),
    ]);

    const variationStocks = (variationStocksRes.status === "fulfilled" ? variationStocksRes.value : []) as any[];
    const productStocks = (productStocksRes.status === "fulfilled" ? productStocksRes.value : []) as any[];

    const variationWithStock = variationStocks.filter((r) => sumStockFromByHandlingDays(r) > 0);
    const productWithStock = productStocks.filter((r) => sumStockFromByHandlingDays(r) > 0);

    return c.json({
      parentTaxonomy,
      page,
      pageSize,
      variationStocksCount: variationStocks.length,
      variationStocksWithStock: variationWithStock.length,
      productStocksCount: productStocks.length,
      productStocksWithStock: productWithStock.length,
      variationStockSample: variationWithStock.slice(0, 20).map((r) => ({ sku: r?.sku, stock: sumStockFromByHandlingDays(r) })),
      productStockSample: productWithStock.slice(0, 20).map((r) => ({ sku: r?.sku, stock: sumStockFromByHandlingDays(r) })),
      errors: {
        variationStocks: variationStocksRes.status === "rejected" ? String(variationStocksRes.reason?.message ?? variationStocksRes.reason) : null,
        productStocks: productStocksRes.status === "rejected" ? String(productStocksRes.reason?.message ?? productStocksRes.reason) : null,
      },
    });
  } catch (e: any) {
    console.error(e);
    return c.json(
      {
        error: e?.message || "Internal error",
        kind: e?.name,
        status: e?.status,
        url: e?.url,
        details: typeof e?.bodyText === "string" ? e.bodyText.slice(0, 1200) : undefined,
      },
      500,
    );
  }
});

// Create admin user (one-time setup)
app.post("/make-server-335110ef/admin/create-user", requireSyncSecret(), async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: "Password must be at least 6 characters" }, 400);
    }

    const supabase = getServiceSupabase();

    // Create user using admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (authError) {
      return c.json({ error: authError.message }, 400);
    }

    if (!authData.user) {
      return c.json({ error: "Failed to create user" }, 500);
    }

    // Wait a moment for trigger to create profile
    await new Promise(resolve => setTimeout(resolve, 500));

    // Update profile to admin role
    const { error: profileError } = await supabase
      .from("user_profiles")
      .update({ role: "admin", email: authData.user.email })
      .eq("id", authData.user.id);

    if (profileError) {
      // If update fails, try insert
      await supabase
        .from("user_profiles")
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          role: "admin",
        });
    }

    return c.json({
      ok: true,
      message: "Admin user created successfully",
      userId: authData.user.id,
      email: authData.user.email,
    });
  } catch (e: any) {
    console.error("Error creating admin user:", e);
    return c.json({ error: e?.message || "Internal error" }, 500);
  }
});

// Generate AI descriptions for products (processes ALL products without AI descriptions in batches)
app.post("/make-server-335110ef/bigbuy/ai/descriptions/generate", requireSyncSecret(), async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const productIds = Array.isArray(body.productIds) ? body.productIds : [];
    const forceRegenerate = body.forceRegenerate === true;

    const supabase = getServiceSupabase();

    // Process all products in batches
    let offset = 0;
    const batchSize = 50;
    let totalGenerated = 0;
    let totalProcessed = 0;
    let totalFailed = 0;

    while (true) {
      // Build query to get products
      let query = supabase
        .from("bigbuy_products")
        .select(`
          id,
          sale_price,
          bigbuy_product_translations!inner (
            product_id,
            iso_code,
            name,
            description,
            ai_description
          )
        `)
        .eq("bigbuy_product_translations.iso_code", "es")
        .is("deleted_at", null)
        .eq("has_stock", true)
        .range(offset, offset + batchSize - 1);

      if (productIds.length > 0) {
        query = query.in("id", productIds);
      } else if (!forceRegenerate) {
        // Only generate for products without AI description
        query = query.is("bigbuy_product_translations.ai_description", null);
      }

      const { data: products, error } = await query;

      if (error) {
        console.error("Error fetching products:", error);
        break;
      }

      if (!products || products.length === 0) {
        break; // No more products to process
      }

      totalProcessed += products.length;

      // Prepare products for AI generation
      const productsToProcess = products.map((p: any) => {
        const translation = Array.isArray(p.bigbuy_product_translations)
          ? p.bigbuy_product_translations[0]
          : p.bigbuy_product_translations;
        return {
          productId: p.id,
          name: translation?.name || "",
          originalDescription: translation?.description || "",
          price: p.sale_price,
        };
      });

      // Generate descriptions and highlight features (IA específicas por producto)
      const generatedDescriptions = await batchGenerateDescriptions(productsToProcess);
      const generatedFeatures = await batchGenerateHighlightFeatures(
        productsToProcess.map(({ productId, name, originalDescription }) => ({
          productId,
          name,
          originalDescription,
        }))
      );

      // Update database
      let batchUpdated = 0;
      for (const [productId, description] of generatedDescriptions.entries()) {
        const features = generatedFeatures.get(productId);
        const { error: updateError } = await supabase
          .from("bigbuy_product_translations")
          .update({
            ai_description: description,
            ai_description_updated_at: new Date().toISOString(),
            ...(features && features.length === 3 ? { ai_highlight_features: features } : {}),
          })
          .eq("product_id", productId)
          .eq("iso_code", "es");

        if (!updateError) {
          batchUpdated++;
        } else {
          totalFailed++;
        }
      }

      totalGenerated += batchUpdated;
      console.log(`Batch ${Math.floor(offset / batchSize) + 1}: Generated ${batchUpdated}/${products.length} descriptions`);

      // If we got fewer products than batch size, we're done
      if (products.length < batchSize) {
        break;
      }

      offset += batchSize;
    }

    return c.json({
      ok: true,
      generated: totalGenerated,
      total: totalProcessed,
      failed: totalFailed,
      message: `Procesados ${totalProcessed} productos, ${totalGenerated} descripciones generadas exitosamente`,
    });
  } catch (e: any) {
    console.error("AI description generation error:", e);
    return c.json({ error: e?.message || "Internal error" }, 500);
  }
});

// Generate AI highlight features (3 per product) from name + description
app.post("/make-server-335110ef/bigbuy/ai/highlight-features/generate", requireSyncSecret(), async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const productIds = Array.isArray(body.productIds) ? body.productIds : [];
    const forceRegenerate = body.forceRegenerate === true;
    const limit = Number.isFinite(body.limit) && body.limit > 0 ? Math.min(body.limit, 200) : 200;

    const supabase = getServiceSupabase();

    let offset = 0;
    const batchSize = 10;
    let totalGenerated = 0;
    let totalProcessed = 0;
    let totalFailed = 0;

    while (true) {
      let query = supabase
        .from("bigbuy_products")
        .select(`
          id,
          bigbuy_product_translations!inner (
            product_id,
            iso_code,
            name,
            description,
            ai_description
          )
        `)
        .eq("bigbuy_product_translations.iso_code", "es")
        .is("deleted_at", null)
        .eq("has_stock", true)
        .range(offset, offset + batchSize - 1);

      if (productIds.length > 0) {
        query = query.in("id", productIds);
      } else if (!forceRegenerate) {
        query = query.is("bigbuy_product_translations.ai_highlight_features", null);
      }

      const { data: products, error } = await query;

      if (error) {
        console.error("Error fetching products for highlight features:", error);
        break;
      }

      if (!products || products.length === 0) break;

      totalProcessed += products.length;

      const productsToProcess = products.map((p: any) => {
        const t = Array.isArray(p.bigbuy_product_translations) ? p.bigbuy_product_translations[0] : p.bigbuy_product_translations;
        const desc = t?.description || "";
        const aiDesc = t?.ai_description || "";
        return {
          productId: p.id,
          name: t?.name || "",
          originalDescription: aiDesc || desc,
        };
      });

      const generatedFeatures = await batchGenerateHighlightFeatures(productsToProcess);

      for (const [productId, features] of generatedFeatures.entries()) {
        if (!features || features.length !== 3) continue;
        const { error: updateError } = await supabase
          .from("bigbuy_product_translations")
          .update({ ai_highlight_features: features })
          .eq("product_id", productId)
          .eq("iso_code", "es");
        if (!updateError) totalGenerated++; else totalFailed++;
      }

      if (totalProcessed >= limit || products.length < batchSize) break;
      offset += batchSize;
    }

    return c.json({
      ok: true,
      generated: totalGenerated,
      total: totalProcessed,
      failed: totalFailed,
      message: `Características principales generadas: ${totalGenerated}/${totalProcessed} productos`,
    });
  } catch (e: any) {
    console.error("AI highlight features generation error:", e);
    return c.json({ error: e?.message || "Internal error" }, 500);
  }
});

// Import catalog (~100 products) from configured taxonomies
app.post("/make-server-335110ef/bigbuy/sync", requireSyncSecret(), async (c) => {
  try {
    const startedAt = Date.now();
    const supabase = getServiceSupabase();

  const { data: config, error: cfgErr } = await supabase
    .from("bigbuy_import_config")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (cfgErr) return c.json({ error: cfgErr.message }, 500);

  const taxonomyIds: number[] = (config?.taxonomy_ids ?? []) as any;
  // NO LIMIT - import ALL products with stock
  const productLimit = 999999999; // Effectively unlimited

  if (!taxonomyIds.length) {
    return c.json({ error: "No taxonomyIds configured. Set config first." }, 400);
  }

  // Attribute dictionaries (ES) for variant selector.
  // NOTE: BigBuy sandbox can intermittently 500 on these endpoints, so we must degrade gracefully.
  let attributeGroups: any[] = [];
  let attributes: any[] = [];
  try {
    [attributeGroups, attributes] = await Promise.all([
      bigbuyGetAttributeGroups({ isoCode: "es", pageSize: 1000 }),
      bigbuyGetAttributes({ isoCode: "es", pageSize: 1000 }),
    ]);
  } catch (e) {
    console.error("BigBuy attribute dictionaries failed", e);
    attributeGroups = [];
    attributes = [];
  }

  const attrGroupNameById = new Map<number, string>();
  for (const g of attributeGroups ?? []) {
    const id = Number(g?.id);
    if (!Number.isFinite(id)) continue;
    const name = String(g?.name ?? "").trim();
    if (name) attrGroupNameById.set(id, name);
  }

  const attributeById = new Map<number, { name: string; attributeGroupId?: number }>();
  for (const a of attributes ?? []) {
    const id = Number(a?.id);
    if (!Number.isFinite(id)) continue;
    const name = String(a?.name ?? "").trim();
    const groupId = Number(a?.attributeGroup);
    attributeById.set(id, { name, attributeGroupId: Number.isFinite(groupId) ? groupId : undefined });
  }

  // BigBuy catalog endpoints are paginated and (per docs) default `page` is 0.
  // We must iterate pages until empty to avoid missing stock/products.
  async function fetchAllPages<T>(fetchPage: (page: number) => Promise<T[]>, pageSize: number): Promise<T[]> {
    const out: T[] = [];
    let page = 0;
    while (true) {
      let items: T[];
      try {
        items = await fetchPage(page);
      } catch (e) {
        if (page === 0) throw e;
        break;
      }
      if (!Array.isArray(items) || items.length === 0) break;
      out.push(...items);
      // Most BigBuy endpoints stop returning full pages on the last page.
      if (items.length < pageSize) break;
      page += 1;
    }
    return out;
  }

  let importedProducts = 0;
  let importedVariants = 0;
  let skippedNoStock = 0;

  for (const taxonomyId of taxonomyIds) {
    if (importedProducts >= productLimit) break;

    // Get all variations and stock data first (paginated)
    const variationsPageSize = 1000;
    let variations: any[] = [];
    let variationStocks: any[] = [];
    let productStocks: any[] = [];
    try {
      variations = (await fetchAllPages(
        (page) => bigbuyGetProductsVariations({ parentTaxonomy: taxonomyId, page, pageSize: variationsPageSize }),
        variationsPageSize,
      )) as any[];
    } catch (e) {
      console.error("BigBuy variations fetch failed", e);
      variations = [];
    }
    try {
      variationStocks = (await fetchAllPages(
        (page) => bigbuyGetProductsVariationsStockByHandlingDays({ parentTaxonomy: taxonomyId, page, pageSize: variationsPageSize }),
        variationsPageSize,
      )) as any[];
    } catch (e) {
      console.error("BigBuy variations stock fetch failed", e);
      variationStocks = [];
    }
    try {
      productStocks = (await fetchAllPages(
        (page) => bigbuyGetProductsStockByHandlingDays({ parentTaxonomy: taxonomyId, page, pageSize: variationsPageSize }),
        variationsPageSize,
      )) as any[];
    } catch (e) {
      console.error("BigBuy product stock fetch failed", e);
      productStocks = [];
    }

    // Build stock maps early
    const stockByVariantSku = new Map<string, number>();
    for (const s of variationStocks ?? []) {
      const sku = String(s?.sku ?? "").trim();
      if (!sku) continue;
      const total = sumStockFromByHandlingDays(s);
      stockByVariantSku.set(sku, total);
    }

    const stockByProductSku = new Map<string, number>();
    for (const s of productStocks ?? []) {
      const sku = String(s?.sku ?? "").trim();
      if (!sku) continue;
      const total = sumStockFromByHandlingDays(s);
      stockByProductSku.set(sku, total);
    }

    // Find product IDs that have stock
    const productIdsWithStock = new Set<number>();
    for (const v of variations ?? []) {
      const productId = Number(v?.product);
      const vSku = String(v?.sku ?? "").trim();
      if (!Number.isFinite(productId) || !vSku) continue;
      const stock = stockByVariantSku.get(vSku) ?? 0;
      if (stock > 0) productIdsWithStock.add(productId);
    }
    for (const s of productStocks ?? []) {
      const sku = String(s?.sku ?? "").trim();
      if (!sku) continue;
      const stock = stockByProductSku.get(sku) ?? 0;
      if (stock > 0) {
        // We need to find the product ID for this SKU - will do this when we get products
      }
    }

    // Build variations map early to check stock
    const variationsByProductId = new Map<number, any[]>();
    for (const v of variations ?? []) {
      const productId = Number(v?.product);
      if (!Number.isFinite(productId)) continue;
      const list = variationsByProductId.get(productId) ?? [];
      list.push(v);
      variationsByProductId.set(productId, list);
    }

    // Now fetch products in pages - fetch ALL pages first, then filter by stock
    const remaining = productLimit - importedProducts;
    const pageSize = 100;
    let page = 0;
    let allProducts: any[] = [];
    let allInfoEs: any[] = [];
    let allInfoEn: any[] = [];
    let allProductsImages: any[] = [];

    // Fetch ALL pages - NO LIMIT - continue until API returns no more products
    while (true) {
      const settled = await Promise.allSettled([
        bigbuyGetProducts({ parentTaxonomy: taxonomyId, page, pageSize }),
        bigbuyGetProductsInformation({ parentTaxonomy: taxonomyId, isoCode: "es", page, pageSize }),
        bigbuyGetProductsInformation({ parentTaxonomy: taxonomyId, isoCode: "en", page, pageSize }),
        bigbuyGetProductsImages({ parentTaxonomy: taxonomyId, page, pageSize }),
      ]);

      if (settled[0].status === "rejected") {
        if (page === 0) {
          const reason = settled[0].reason;
          if (reason?.status === 404 && reason?.bodyText?.includes("Taxonomy not parent")) {
            throw new Error(`Taxonomía ${taxonomyId} no es una taxonomía padre. Solo se pueden usar taxonomías de nivel 1 (parentTaxonomy: 0).`);
          }
          throw reason;
        }
        break; // No more pages
      }

      const pageProducts = (settled[0].status === "fulfilled" ? settled[0].value : []) as any[];
      if (pageProducts.length === 0) break; // No more products - stop here

      allProducts.push(...pageProducts);
      allInfoEs.push(...((settled[1].status === "fulfilled" ? settled[1].value : []) as any[]));
      allInfoEn.push(...((settled[2].status === "fulfilled" ? settled[2].value : []) as any[]));
      allProductsImages.push(...((settled[3].status === "fulfilled" ? settled[3].value : []) as any[]));

      page++;
      // Safety: log progress every 50 pages
      if (page % 50 === 0) {
        console.log(`Fetched ${page} pages, ${allProducts.length} products so far...`);
      }
    }

    const products = allProducts;
    const infoEs = allInfoEs;
    const infoEn = allInfoEn;
    const productsImages = allProductsImages;

    const productIdBySku = new Map<string, number>();
    for (const p of products ?? []) {
      const sku = String(p?.sku ?? "").trim();
      const id = Number(p?.id);
      if (sku && Number.isFinite(id)) productIdBySku.set(sku, id);
    }

    const infoEsBySku = new Map<string, any>();
    for (const i of infoEs ?? []) {
      const sku = String(i?.sku ?? "").trim();
      if (sku) infoEsBySku.set(sku, i);
    }
    const infoEnBySku = new Map<string, any>();
    for (const i of infoEn ?? []) {
      const sku = String(i?.sku ?? "").trim();
      if (sku) infoEnBySku.set(sku, i);
    }

    const imagesByProductId = new Map<number, string[]>();
    for (const p of productsImages ?? []) {
      const id = Number(p?.id);
      if (!Number.isFinite(id)) continue;
      const urls: string[] = [];
      const imgs = Array.isArray(p?.images) ? p.images : [];
      for (const img of imgs) {
        const u = String(img?.url ?? img?.link ?? "").trim();
        if (u) urls.push(u);
      }
      if (urls.length) imagesByProductId.set(id, urls);
    }

    const selectedProducts: any[] = [];
    // Process ALL products and filter by stock
    for (const p of products ?? []) {
      if (selectedProducts.length >= remaining) break;
      const id = Number(p?.id);
      const sku = String(p?.sku ?? "").trim();
      if (!Number.isFinite(id) || !sku) continue;

      const variants = variationsByProductId.get(id) ?? [];
      let totalStock = 0;
      if (variants.length) {
        // Sum stock from all variants
        for (const v of variants) {
          const vSku = String(v?.sku ?? "").trim();
          const variantStock = stockByVariantSku.get(vSku) ?? 0;
          totalStock += variantStock;
        }
        // Fallback to product-level stock if no variant stock found
        if (totalStock === 0 && stockByVariantSku.size === 0) {
          totalStock = stockByProductSku.get(sku) ?? 0;
        }
      } else {
        // No variants, use product-level stock
        totalStock = stockByProductSku.get(sku) ?? 0;
      }

      // Only include products with stock (if we have stock data)
      const hasStockData = stockByVariantSku.size > 0 || stockByProductSku.size > 0;
      if (hasStockData && totalStock <= 0) {
        skippedNoStock += 1;
        continue;
      }
      // If no stock data available, include the product (might be a data issue)
      selectedProducts.push(p);
    }

    // Build DB upserts
    const productUpserts: any[] = [];
    const translationUpserts: any[] = [];
    const imageUpserts: any[] = [];
    const variantUpserts: any[] = [];
    const variantAttrUpserts: any[] = [];

    const productIds: number[] = [];
    const variantIds: number[] = [];

    for (const p of selectedProducts) {
      const productId = Number(p?.id);
      const sku = String(p?.sku ?? "").trim();
      if (!Number.isFinite(productId) || !sku) continue;

      productIds.push(productId);

      const wholesale = Number(p?.wholesalePrice);
      const salePrice = computeSalePriceEurX95(wholesale);

      productUpserts.push({
        id: productId,
        sku,
        source_parent_taxonomy_id: taxonomyId,
        manufacturer_id: p?.manufacturer ?? null,
        // BigBuy provides both `category` and `taxonomy`. `taxonomy` is the category tree id we map to `bigbuy_taxonomies`.
        category_id: Number.isFinite(Number(p?.taxonomy)) ? Number(p.taxonomy) : null,
        active: (p?.active ?? 1) === 1,
        condition: p?.condition ?? null,
        logistic_class: p?.logisticClass ?? null,
        weight: p?.weight ?? null,
        height: p?.height ?? null,
        width: p?.width ?? null,
        depth: p?.depth ?? null,
        tax_rate: p?.taxRate ?? null,
        tax_id: p?.taxId ?? null,
        wholesale_price: Number.isFinite(Number(p?.wholesalePrice)) ? Number(p.wholesalePrice) : null,
        retail_price: Number.isFinite(Number(p?.retailPrice)) ? Number(p.retailPrice) : null,
        inshops_price: Number.isFinite(Number(p?.inShopsPrice)) ? Number(p.inShopsPrice) : null,
        sale_price: salePrice,
        currency: "EUR",
        has_attributes: Boolean(p?.attributes),
        date_add: parseBigBuyDateTime(p?.dateAdd),
        date_upd: parseBigBuyDateTime(p?.dateUpd),
        date_upd_description: parseBigBuyDateTime(p?.dateUpdDescription),
        date_upd_images: parseBigBuyDateTime(p?.dateUpdImages),
        date_upd_stock: parseBigBuyDateTime(p?.dateUpdStock),
        updated_at: new Date().toISOString(),
      });

      const es = infoEsBySku.get(sku);
      if (es?.name) {
        translationUpserts.push({
          product_id: productId,
          iso_code: "es",
          name: es.name,
          description: es.description ?? null,
          url: es.url ?? null,
          date_upd_description: parseBigBuyDateTime(es?.dateUpdDescription),
          updated_at: new Date().toISOString(),
        });
      }
      const en = infoEnBySku.get(sku);
      if (en?.name) {
        translationUpserts.push({
          product_id: productId,
          iso_code: "en",
          name: en.name,
          description: en.description ?? null,
          url: en.url ?? null,
          date_upd_description: parseBigBuyDateTime(en?.dateUpdDescription),
          updated_at: new Date().toISOString(),
        });
      }

      const urls = imagesByProductId.get(productId) ?? [];
      const uniqueUrls = Array.from(new Set(urls)).slice(0, 8);
      uniqueUrls.forEach((url: string, idx: number) => {
        imageUpserts.push({ product_id: productId, url, position: idx });
      });

      const variants = variationsByProductId.get(productId) ?? [];
      if (variants.length) {
        for (const v of variants) {
          const variantId = Number(v?.id);
          const vSku = String(v?.sku ?? "").trim();
          if (!Number.isFinite(variantId) || !vSku) continue;
          variantIds.push(variantId);

          const vWholesale = Number(v?.wholesalePrice);
          const vSalePrice = computeSalePriceEurX95(Number.isFinite(vWholesale) ? vWholesale : wholesale);
          const stock = stockByVariantSku.has(vSku)
            ? (stockByVariantSku.get(vSku) ?? 0)
            : stockByVariantSku.size === 0
              ? (stockByProductSku.get(sku) ?? 0)
              : 0;

          variantUpserts.push({
            id: variantId,
            product_id: productId,
            sku: vSku,
            ean13: v?.ean13 ?? null,
            wholesale_price: Number.isFinite(Number(v?.wholesalePrice)) ? Number(v.wholesalePrice) : null,
            retail_price: Number.isFinite(Number(v?.retailPrice)) ? Number(v.retailPrice) : null,
            inshops_price: Number.isFinite(Number(v?.inShopsPrice)) ? Number(v.inShopsPrice) : null,
            sale_price: vSalePrice,
            stock,
            stock_updated_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          const attrs = Array.isArray(v?.attributes) ? v.attributes : [];
          for (const a of attrs) {
            const attrId = Number(a?.id ?? a?.attribute ?? a?.attributeId ?? a);
            if (!Number.isFinite(attrId)) continue;
            const attr = attributeById.get(attrId);
            const groupId =
              Number.isFinite(Number(a?.attributeGroup))
                ? Number(a.attributeGroup)
                : attr?.attributeGroupId;
            const groupName =
              (groupId ? attrGroupNameById.get(groupId) : undefined) ??
              (Number.isFinite(groupId) ? `Group ${groupId}` : undefined) ??
              String(a?.groupName ?? a?.group ?? "").trim() ??
              "Attributes";

            const attrName =
              (attr?.name ?? "").trim() ||
              String(a?.name ?? "").trim() ||
              (Number.isFinite(attrId) ? String(attrId) : "");

            if (attrName) {
              variantAttrUpserts.push({
                variant_id: variantId,
                group_name: groupName,
                attribute_name: attrName,
              });
            }
          }
        }
      } else {
        // Non-variant product: store as a synthetic variant (-productId)
        const variantId = -productId;
        const stock = stockByProductSku.get(sku) ?? 0;
        variantIds.push(variantId);
        variantUpserts.push({
          id: variantId,
          product_id: productId,
          sku,
          ean13: p?.ean13 ?? null,
          wholesale_price: Number.isFinite(Number(p?.wholesalePrice)) ? Number(p.wholesalePrice) : null,
          retail_price: Number.isFinite(Number(p?.retailPrice)) ? Number(p.retailPrice) : null,
          inshops_price: Number.isFinite(Number(p?.inShopsPrice)) ? Number(p.inShopsPrice) : null,
          sale_price: salePrice,
          stock,
          stock_updated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }

    // Clean old images + variant attrs for these items
    if (productIds.length) {
      await supabase.from("bigbuy_product_images").delete().in("product_id", productIds);
    }
    if (variantIds.length) {
      await supabase.from("bigbuy_variant_attributes").delete().in("variant_id", variantIds);
    }

    for (const batch of chunk(productUpserts, 200)) {
      const { error } = await supabase.from("bigbuy_products").upsert(batch);
      if (error) return c.json({ error: error.message, where: "bigbuy_products" }, 500);
    }
    for (const batch of chunk(translationUpserts, 500)) {
      const { error } = await supabase
        .from("bigbuy_product_translations")
        .upsert(batch, { onConflict: "product_id,iso_code" as any });
      if (error) return c.json({ error: error.message, where: "bigbuy_product_translations" }, 500);
    }
    for (const batch of chunk(imageUpserts, 500)) {
      const { error } = await supabase.from("bigbuy_product_images").insert(batch);
      if (error) return c.json({ error: error.message, where: "bigbuy_product_images" }, 500);
    }
    for (const batch of chunk(variantUpserts, 500)) {
      const { error } = await supabase.from("bigbuy_variants").upsert(batch);
      if (error) return c.json({ error: error.message, where: "bigbuy_variants" }, 500);
    }
    for (const batch of chunk(variantAttrUpserts, 1000)) {
      const { error } = await supabase.from("bigbuy_variant_attributes").insert(batch);
      if (error) return c.json({ error: error.message, where: "bigbuy_variant_attributes" }, 500);
    }

    importedProducts += productIds.length;
    importedVariants += variantIds.length;
  }

    // After successful sync, generate AI descriptions for ALL products without descriptions
    // Process in batches to avoid timeouts
    try {
      console.log("Generating AI descriptions for products without descriptions...");
      let offset = 0;
      const batchSize = 50;
      let totalGenerated = 0;

      while (true) {
        const { data: productsWithoutAI, error: descError } = await supabase
          .from("bigbuy_products")
          .select(`
            id,
            sale_price,
            bigbuy_product_translations!inner (
              product_id,
              iso_code,
              name,
              description,
              ai_description
            )
          `)
          .eq("bigbuy_product_translations.iso_code", "es")
          .is("deleted_at", null)
          .eq("has_stock", true)
          .is("bigbuy_product_translations.ai_description", null)
          .range(offset, offset + batchSize - 1);

        if (descError) {
          console.error("Error fetching products for AI generation:", descError);
          break;
        }

        if (!productsWithoutAI || productsWithoutAI.length === 0) {
          break; // No more products to process
        }

        const productsToProcess = productsWithoutAI.map((p: any) => {
          const translation = Array.isArray(p.bigbuy_product_translations)
            ? p.bigbuy_product_translations[0]
            : p.bigbuy_product_translations;
          return {
            productId: p.id,
            name: translation?.name || "",
            originalDescription: translation?.description || "",
            price: p.sale_price,
          };
        });

        const generatedDescriptions = await batchGenerateDescriptions(productsToProcess);
        const generatedFeatures = await batchGenerateHighlightFeatures(
          productsToProcess.map(({ productId, name, originalDescription }) => ({
            productId,
            name,
            originalDescription,
          }))
        );

        // Update database
        for (const [productId, description] of generatedDescriptions.entries()) {
          const features = generatedFeatures.get(productId);
          await supabase
            .from("bigbuy_product_translations")
            .update({
              ai_description: description,
              ai_description_updated_at: new Date().toISOString(),
              ...(features && features.length === 3 ? { ai_highlight_features: features } : {}),
            })
            .eq("product_id", productId)
            .eq("iso_code", "es");
        }

        totalGenerated += generatedDescriptions.size;
        console.log(`Generated ${generatedDescriptions.size} AI descriptions (total: ${totalGenerated})`);

        // If we got fewer products than batch size, we're done
        if (productsWithoutAI.length < batchSize) {
          break;
        }

        offset += batchSize;
      }

      console.log(`AI description generation completed. Total generated: ${totalGenerated}`);
    } catch (aiError) {
      console.error("Error generating AI descriptions in cron:", aiError);
      // Don't fail the sync if AI generation fails
    }

    return c.json({
      ok: true,
      importedProducts,
      importedVariants,
      skippedNoStock,
      durationMs: Date.now() - startedAt,
    });
  } catch (e: any) {
    console.error(e);
    return c.json(
      {
        error: e?.message || "Internal error",
        kind: e?.name,
        status: e?.status,
        url: e?.url,
        details: typeof e?.bodyText === "string" ? e.bodyText.slice(0, 1200) : undefined,
      },
      500,
    );
  }
});

// Full sync: Import ALL products with stock (no limit)
app.post("/make-server-335110ef/bigbuy/sync/full", requireSyncSecret(), async (c) => {
  const startedAt = Date.now();
  const supabase = getServiceSupabase();

  // Create sync log entry
  const { data: logEntry, error: logErr } = await supabase
    .from("bigbuy_sync_logs")
    .insert({
      started_at: new Date().toISOString(),
      status: "running",
    })
    .select("id")
    .maybeSingle();

  if (logErr) {
    console.error("Failed to create sync log:", logErr);
  }

  const logId = logEntry?.id;

  try {
    const { data: config, error: cfgErr } = await supabase
      .from("bigbuy_import_config")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (cfgErr) throw new Error(cfgErr.message);

    const taxonomyIds: number[] = (config?.taxonomy_ids ?? []) as any;
    if (!taxonomyIds.length) {
      throw new Error("No taxonomyIds configured. Set config first.");
    }

    // Attribute dictionaries (ES) for variant selector
    let attributeGroups: any[] = [];
    let attributes: any[] = [];
    try {
      [attributeGroups, attributes] = await Promise.all([
        bigbuyGetAttributeGroups({ isoCode: "es", pageSize: 1000 }),
        bigbuyGetAttributes({ isoCode: "es", pageSize: 1000 }),
      ]);
    } catch (e) {
      console.error("BigBuy attribute dictionaries failed", e);
    }

    const attrGroupNameById = new Map<number, string>();
    for (const g of attributeGroups ?? []) {
      const id = Number(g?.id);
      if (!Number.isFinite(id)) continue;
      const name = String(g?.name ?? "").trim();
      if (name) attrGroupNameById.set(id, name);
    }

    const attributeById = new Map<number, { name: string; attributeGroupId?: number }>();
    for (const a of attributes ?? []) {
      const id = Number(a?.id);
      if (!Number.isFinite(id)) continue;
      const name = String(a?.name ?? "").trim();
      const groupId = Number(a?.attributeGroup);
      attributeById.set(id, { name, attributeGroupId: Number.isFinite(groupId) ? groupId : undefined });
    }

    // BigBuy catalog endpoints are paginated and (per docs) default `page` is 0.
    // We must iterate pages until empty to avoid missing stock/products.
    async function fetchAllPages<T>(fetchPage: (page: number) => Promise<T[]>, pageSize: number): Promise<T[]> {
      const out: T[] = [];
      let page = 0;
      while (true) {
        let items: T[];
        try {
          items = await fetchPage(page);
        } catch (e) {
          if (page === 0) throw e;
          break;
        }
        if (!Array.isArray(items) || items.length === 0) break;
        out.push(...items);
        if (items.length < pageSize) break;
        page += 1;
      }
      return out;
    }

    let importedProducts = 0;
    let importedVariants = 0;
    let updatedProducts = 0;
    let skippedNoStock = 0;

    // Track existing product IDs to detect updates
    const existingProductIds = new Set<number>();
    const { data: existingProducts } = await supabase
      .from("bigbuy_products")
      .select("id")
      .is("deleted_at", null);
    if (existingProducts) {
      for (const p of existingProducts) {
        existingProductIds.add(Number(p.id));
      }
    }

    for (const taxonomyId of taxonomyIds) {
      // Get all variations and stock data first (paginated)
      const variationsPageSize = 1000;
      let variations: any[] = [];
      let variationStocks: any[] = [];
      let productStocks: any[] = [];
      try {
        variations = (await fetchAllPages(
          (page) => bigbuyGetProductsVariations({ parentTaxonomy: taxonomyId, page, pageSize: variationsPageSize }),
          variationsPageSize,
        )) as any[];
      } catch (e) {
        console.error("BigBuy variations fetch failed", e);
        variations = [];
      }
      try {
        variationStocks = (await fetchAllPages(
          (page) => bigbuyGetProductsVariationsStockByHandlingDays({ parentTaxonomy: taxonomyId, page, pageSize: variationsPageSize }),
          variationsPageSize,
        )) as any[];
      } catch (e) {
        console.error("BigBuy variations stock fetch failed", e);
        variationStocks = [];
      }
      try {
        productStocks = (await fetchAllPages(
          (page) => bigbuyGetProductsStockByHandlingDays({ parentTaxonomy: taxonomyId, page, pageSize: variationsPageSize }),
          variationsPageSize,
        )) as any[];
      } catch (e) {
        console.error("BigBuy product stock fetch failed", e);
        productStocks = [];
      }

      // Build stock maps
      const stockByVariantSku = new Map<string, number>();
      for (const s of variationStocks ?? []) {
        const sku = String(s?.sku ?? "").trim();
        if (!sku) continue;
        const total = sumStockFromByHandlingDays(s);
        stockByVariantSku.set(sku, total);
      }

      const stockByProductSku = new Map<string, number>();
      for (const s of productStocks ?? []) {
        const sku = String(s?.sku ?? "").trim();
        if (!sku) continue;
        const total = sumStockFromByHandlingDays(s);
        stockByProductSku.set(sku, total);
      }

      const variationsByProductId = new Map<number, any[]>();
      for (const v of variations ?? []) {
        const productId = Number(v?.product);
        if (!Number.isFinite(productId)) continue;
        const list = variationsByProductId.get(productId) ?? [];
        list.push(v);
        variationsByProductId.set(productId, list);
      }

      // Fetch ALL products in pages (no limit)
      const pageSize = 100;
      let page = 0;
      let allProducts: any[] = [];
      let allInfoEs: any[] = [];
      let allInfoEn: any[] = [];
      let allProductsImages: any[] = [];

      while (true) {
        const settled = await Promise.allSettled([
          bigbuyGetProducts({ parentTaxonomy: taxonomyId, page, pageSize }),
          bigbuyGetProductsInformation({ parentTaxonomy: taxonomyId, isoCode: "es", page, pageSize }),
          bigbuyGetProductsInformation({ parentTaxonomy: taxonomyId, isoCode: "en", page, pageSize }),
          bigbuyGetProductsImages({ parentTaxonomy: taxonomyId, page, pageSize }),
        ]);

        if (settled[0].status === "rejected") {
          if (page === 0) {
            const reason = settled[0].reason;
            if (reason?.status === 404 && reason?.bodyText?.includes("Taxonomy not parent")) {
              throw new Error(`Taxonomía ${taxonomyId} no es una taxonomía padre. Solo se pueden usar taxonomías de nivel 1 (parentTaxonomy: 0).`);
            }
            throw reason;
          }
          break; // No more pages
        }

        const pageProducts = (settled[0].status === "fulfilled" ? settled[0].value : []) as any[];
        if (pageProducts.length === 0) break; // No more products

        allProducts.push(...pageProducts);
        allInfoEs.push(...((settled[1].status === "fulfilled" ? settled[1].value : []) as any[]));
        allInfoEn.push(...((settled[2].status === "fulfilled" ? settled[2].value : []) as any[]));
        allProductsImages.push(...((settled[3].status === "fulfilled" ? settled[3].value : []) as any[]));

        page++;
      }

      const products = allProducts;
      const infoEs = allInfoEs;
      const infoEn = allInfoEn;
      const productsImages = allProductsImages;

      const productIdBySku = new Map<string, number>();
      for (const p of products ?? []) {
        const sku = String(p?.sku ?? "").trim();
        const id = Number(p?.id);
        if (sku && Number.isFinite(id)) productIdBySku.set(sku, id);
      }

      const infoEsBySku = new Map<string, any>();
      for (const i of infoEs ?? []) {
        const sku = String(i?.sku ?? "").trim();
        if (sku) infoEsBySku.set(sku, i);
      }
      const infoEnBySku = new Map<string, any>();
      for (const i of infoEn ?? []) {
        const sku = String(i?.sku ?? "").trim();
        if (sku) infoEnBySku.set(sku, i);
      }

      const imagesByProductId = new Map<number, string[]>();
      for (const p of productsImages ?? []) {
        const id = Number(p?.id);
        if (!Number.isFinite(id)) continue;
        const urls: string[] = [];
        const imgs = Array.isArray(p?.images) ? p.images : [];
        for (const img of imgs) {
          const u = String(img?.url ?? img?.link ?? "").trim();
          if (u) urls.push(u);
        }
        if (urls.length) imagesByProductId.set(id, urls);
      }

      // Process ALL products (not just those with stock)
      const productUpserts: any[] = [];
      const translationUpserts: any[] = [];
      const imageUpserts: any[] = [];
      const variantUpserts: any[] = [];
      const variantAttrUpserts: any[] = [];

      const productIds: number[] = [];
      const variantIds: number[] = [];

      for (const p of products ?? []) {
        const productId = Number(p?.id);
        const sku = String(p?.sku ?? "").trim();
        if (!Number.isFinite(productId) || !sku) continue;

        const variants = variationsByProductId.get(productId) ?? [];
        let totalStock = 0;
        if (variants.length) {
          for (const v of variants) {
            const vSku = String(v?.sku ?? "").trim();
            totalStock += stockByVariantSku.get(vSku) ?? 0;
          }
          if (totalStock === 0 && stockByVariantSku.size === 0) {
            totalStock = stockByProductSku.get(sku) ?? 0;
          }
        } else {
          totalStock = stockByProductSku.get(sku) ?? 0;
        }

        const hasStock = totalStock > 0;
        const hasStockData = stockByVariantSku.size > 0 || stockByProductSku.size > 0;

        // Skip products without stock if we have stock data
        if (hasStockData && !hasStock) {
          skippedNoStock += 1;
          // Update existing products to mark them as out of stock
          if (existingProductIds.has(productId)) {
            await supabase
              .from("bigbuy_products")
              .update({ has_stock: false, updated_at: new Date().toISOString() })
              .eq("id", productId);
          }
          continue;
        }

        const isUpdate = existingProductIds.has(productId);
        if (isUpdate) updatedProducts++;
        else importedProducts++;

        productIds.push(productId);

        const wholesale = Number(p?.wholesalePrice);
        const salePrice = computeSalePriceEurX95(wholesale);

        productUpserts.push({
          id: productId,
          sku,
          source_parent_taxonomy_id: taxonomyId,
          manufacturer_id: p?.manufacturer ?? null,
          // BigBuy provides both `category` and `taxonomy`. `taxonomy` is the category tree id we map to `bigbuy_taxonomies`.
          category_id: Number.isFinite(Number(p?.taxonomy)) ? Number(p.taxonomy) : null,
          active: (p?.active ?? 1) === 1,
          condition: p?.condition ?? null,
          logistic_class: p?.logisticClass ?? null,
          weight: p?.weight ?? null,
          height: p?.height ?? null,
          width: p?.width ?? null,
          depth: p?.depth ?? null,
          tax_rate: p?.taxRate ?? null,
          tax_id: p?.taxId ?? null,
          wholesale_price: Number.isFinite(Number(p?.wholesalePrice)) ? Number(p.wholesalePrice) : null,
          retail_price: Number.isFinite(Number(p?.retailPrice)) ? Number(p.retailPrice) : null,
          inshops_price: Number.isFinite(Number(p?.inShopsPrice)) ? Number(p.inShopsPrice) : null,
          sale_price: salePrice,
          currency: "EUR",
          has_attributes: Boolean(p?.attributes),
          has_stock: hasStock,
          date_add: parseBigBuyDateTime(p?.dateAdd),
          date_upd: parseBigBuyDateTime(p?.dateUpd),
          date_upd_description: parseBigBuyDateTime(p?.dateUpdDescription),
          date_upd_images: parseBigBuyDateTime(p?.dateUpdImages),
          date_upd_stock: parseBigBuyDateTime(p?.dateUpdStock),
          updated_at: new Date().toISOString(),
        });

        const es = infoEsBySku.get(sku);
        if (es?.name) {
          translationUpserts.push({
            product_id: productId,
            iso_code: "es",
            name: es.name,
            description: es.description ?? null,
            url: es.url ?? null,
            date_upd_description: parseBigBuyDateTime(es?.dateUpdDescription),
            updated_at: new Date().toISOString(),
          });
        }
        const en = infoEnBySku.get(sku);
        if (en?.name) {
          translationUpserts.push({
            product_id: productId,
            iso_code: "en",
            name: en.name,
            description: en.description ?? null,
            url: en.url ?? null,
            date_upd_description: parseBigBuyDateTime(en?.dateUpdDescription),
            updated_at: new Date().toISOString(),
          });
        }

        const urls = imagesByProductId.get(productId) ?? [];
        const uniqueUrls = Array.from(new Set(urls)).slice(0, 8);
        uniqueUrls.forEach((url: string, idx: number) => {
          imageUpserts.push({ product_id: productId, url, position: idx });
        });

        const variantList = variationsByProductId.get(productId) ?? [];
        if (variantList.length) {
          for (const v of variantList) {
            const variantId = Number(v?.id);
            const vSku = String(v?.sku ?? "").trim();
            if (!Number.isFinite(variantId) || !vSku) continue;
            variantIds.push(variantId);

            const vWholesale = Number(v?.wholesalePrice);
            const vSalePrice = computeSalePriceEurX95(Number.isFinite(vWholesale) ? vWholesale : wholesale);
            const stock = stockByVariantSku.has(vSku)
              ? (stockByVariantSku.get(vSku) ?? 0)
              : stockByVariantSku.size === 0
                ? (stockByProductSku.get(sku) ?? 0)
                : 0;

            variantUpserts.push({
              id: variantId,
              product_id: productId,
              sku: vSku,
              ean13: v?.ean13 ?? null,
              wholesale_price: Number.isFinite(Number(v?.wholesalePrice)) ? Number(v.wholesalePrice) : null,
              retail_price: Number.isFinite(Number(v?.retailPrice)) ? Number(v.retailPrice) : null,
              inshops_price: Number.isFinite(Number(v?.inShopsPrice)) ? Number(v.inShopsPrice) : null,
              sale_price: vSalePrice,
              stock,
              stock_updated_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

            const attrs = Array.isArray(v?.attributes) ? v.attributes : [];
            for (const a of attrs) {
              const attrId = Number(a?.id ?? a?.attribute ?? a?.attributeId ?? a);
              if (!Number.isFinite(attrId)) continue;
              const attr = attributeById.get(attrId);
              const groupId =
                Number.isFinite(Number(a?.attributeGroup))
                  ? Number(a.attributeGroup)
                  : attr?.attributeGroupId;
              const groupName =
                (groupId ? attrGroupNameById.get(groupId) : undefined) ??
                (Number.isFinite(groupId) ? `Group ${groupId}` : undefined) ??
                String(a?.groupName ?? a?.group ?? "").trim() ??
                "Attributes";

              const attrName =
                (attr?.name ?? "").trim() ||
                String(a?.name ?? "").trim() ||
                (Number.isFinite(attrId) ? String(attrId) : "");

              if (attrName) {
                variantAttrUpserts.push({
                  variant_id: variantId,
                  group_name: groupName,
                  attribute_name: attrName,
                });
              }
            }
          }
        } else {
          // Non-variant product: store as a synthetic variant (-productId)
          const variantId = -productId;
          const stock = stockByProductSku.get(sku) ?? 0;
          variantIds.push(variantId);
          variantUpserts.push({
            id: variantId,
            product_id: productId,
            sku,
            ean13: p?.ean13 ?? null,
            wholesale_price: Number.isFinite(Number(p?.wholesalePrice)) ? Number(p.wholesalePrice) : null,
            retail_price: Number.isFinite(Number(p?.retailPrice)) ? Number(p.retailPrice) : null,
            inshops_price: Number.isFinite(Number(p?.inShopsPrice)) ? Number(p.inShopsPrice) : null,
            sale_price: salePrice,
            stock,
            stock_updated_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }

      // Clean old images + variant attrs for these items
      if (productIds.length) {
        await supabase.from("bigbuy_product_images").delete().in("product_id", productIds);
      }
      if (variantIds.length) {
        await supabase.from("bigbuy_variant_attributes").delete().in("variant_id", variantIds);
      }

      // Upsert in batches
      for (const batch of chunk(productUpserts, 200)) {
        const { error } = await supabase.from("bigbuy_products").upsert(batch);
        if (error) throw new Error(`bigbuy_products: ${error.message}`);
      }
      for (const batch of chunk(translationUpserts, 500)) {
        const { error } = await supabase
          .from("bigbuy_product_translations")
          .upsert(batch, { onConflict: "product_id,iso_code" as any });
        if (error) throw new Error(`bigbuy_product_translations: ${error.message}`);
      }
      for (const batch of chunk(imageUpserts, 500)) {
        const { error } = await supabase.from("bigbuy_product_images").insert(batch);
        if (error) throw new Error(`bigbuy_product_images: ${error.message}`);
      }
      for (const batch of chunk(variantUpserts, 500)) {
        const { error } = await supabase.from("bigbuy_variants").upsert(batch);
        if (error) throw new Error(`bigbuy_variants: ${error.message}`);
      }
      for (const batch of chunk(variantAttrUpserts, 1000)) {
        const { error } = await supabase.from("bigbuy_variant_attributes").insert(batch);
        if (error) throw new Error(`bigbuy_variant_attributes: ${error.message}`);
      }

      importedVariants += variantIds.length;
    }

    // Group similar products as variants (after all products are synced)
    // Products with same category, manufacturer, price, and no real variants should be grouped
    try {
      console.log("Grouping similar products as variants...");
      const { data: productsToGroup, error: groupError } = await supabase
        .from("bigbuy_products")
        .select(`
          id,
          sku,
          category_id,
          manufacturer_id,
          sale_price,
          deleted_at,
          has_stock
        `)
        .is("deleted_at", null)
        .eq("has_stock", true);
      
      if (!groupError && productsToGroup) {
        // Group products by category, manufacturer, price
        const groups = new Map<string, any[]>();
        for (const product of productsToGroup) {
          const key = `${product.category_id || 'null'}_${product.manufacturer_id || 'null'}_${product.sale_price || 'null'}`;
          if (!groups.has(key)) {
            groups.set(key, []);
          }
          groups.get(key)!.push(product);
        }
        
        let groupedCount = 0;
        // Process each group
        for (const [key, products] of groups.entries()) {
          if (products.length < 2) continue; // Need at least 2 products to group
          
          // Check if products already have real variants
          const productIds = products.map(p => p.id);
          const { data: existingVariants } = await supabase
            .from("bigbuy_variants")
            .select("product_id, id")
            .in("product_id", productIds)
            .gt("id", 0); // Only real variants
          
          const productsWithVariants = new Set(
            (existingVariants || []).map((v: any) => v.product_id)
          );
          
          // Filter out products that already have real variants
          const productsToGroupInBatch = products.filter(p => !productsWithVariants.has(p.id));
          
          if (productsToGroupInBatch.length < 2) continue;
          
          // Choose parent product (one with most stock or first one)
          const { data: stocks } = await supabase
            .from("bigbuy_variants")
            .select("product_id, stock")
            .in("product_id", productsToGroupInBatch.map(p => p.id))
            .lt("id", 0); // Synthetic variants
          
          const stockByProduct = new Map<number, number>();
          for (const s of stocks || []) {
            stockByProduct.set(s.product_id, (stockByProduct.get(s.product_id) || 0) + (s.stock || 0));
          }
          
          const parentProduct = productsToGroupInBatch.reduce((prev, curr) => {
            const prevStock = stockByProduct.get(prev.id) || 0;
            const currStock = stockByProduct.get(curr.id) || 0;
            return currStock > prevStock ? curr : prev;
          });
          
          const variantProducts = productsToGroupInBatch.filter(p => p.id !== parentProduct.id);
          
          // Convert variant products to variants of parent
          // Delete synthetic variants of variant products and create new variants pointing to parent
          for (const variantProduct of variantProducts) {
            // Get synthetic variant of variant product
            const { data: syntheticVariant } = await supabase
              .from("bigbuy_variants")
              .select("*")
              .eq("product_id", variantProduct.id)
              .eq("id", -variantProduct.id)
              .maybeSingle();
            
            if (syntheticVariant) {
              // Create new variant pointing to parent product
              const { error: createError } = await supabase
                .from("bigbuy_variants")
                .upsert({
                  id: variantProduct.id, // Use product ID as variant ID (positive)
                  product_id: parentProduct.id, // Point to parent
                  sku: syntheticVariant.sku,
                  stock: syntheticVariant.stock,
                  sale_price: syntheticVariant.sale_price,
                  wholesale_price: syntheticVariant.wholesale_price,
                  retail_price: syntheticVariant.retail_price,
                  inshops_price: syntheticVariant.inshops_price,
                  ean13: syntheticVariant.ean13,
                  stock_updated_at: syntheticVariant.stock_updated_at,
                  updated_at: new Date().toISOString(),
                });
              
              if (!createError) {
                // Delete synthetic variant
                await supabase
                  .from("bigbuy_variants")
                  .delete()
                  .eq("id", -variantProduct.id);
                
                // Mark variant product as deleted (soft delete) or update to point to parent
                // Actually, we'll keep the product but mark it as grouped
                groupedCount++;
              }
            }
          }
        }
        console.log(`Grouped ${groupedCount} products as variants`);
      }
    } catch (groupErr) {
      console.error("Error grouping products:", groupErr);
      // Don't fail the sync if grouping fails
    }

    const durationMs = Date.now() - startedAt;

    // Update sync log
    if (logId) {
      await supabase
        .from("bigbuy_sync_logs")
        .update({
          completed_at: new Date().toISOString(),
          status: "completed",
          imported_products: importedProducts,
          imported_variants: importedVariants,
          updated_products: updatedProducts,
          skipped_no_stock: skippedNoStock,
          duration_ms: durationMs,
        })
        .eq("id", logId);
    }

    // After successful sync, generate AI descriptions for ALL products without descriptions
    // Process in batches to avoid timeouts
    try {
      console.log("Generating AI descriptions for products without descriptions...");
      let offset = 0;
      const batchSize = 50;
      let totalGenerated = 0;

      while (true) {
        const { data: productsWithoutAI, error: descError } = await supabase
          .from("bigbuy_products")
          .select(`
            id,
            sale_price,
            bigbuy_product_translations!inner (
              product_id,
              iso_code,
              name,
              description,
              ai_description
            )
          `)
          .eq("bigbuy_product_translations.iso_code", "es")
          .is("deleted_at", null)
          .eq("has_stock", true)
          .is("bigbuy_product_translations.ai_description", null)
          .range(offset, offset + batchSize - 1);

        if (descError) {
          console.error("Error fetching products for AI generation:", descError);
          break;
        }

        if (!productsWithoutAI || productsWithoutAI.length === 0) {
          break; // No more products to process
        }

        const productsToProcess = productsWithoutAI.map((p: any) => {
          const translation = Array.isArray(p.bigbuy_product_translations)
            ? p.bigbuy_product_translations[0]
            : p.bigbuy_product_translations;
          return {
            productId: p.id,
            name: translation?.name || "",
            originalDescription: translation?.description || "",
            price: p.sale_price,
          };
        });

        const generatedDescriptions = await batchGenerateDescriptions(productsToProcess);
        const generatedFeatures = await batchGenerateHighlightFeatures(
          productsToProcess.map(({ productId, name, originalDescription }) => ({
            productId,
            name,
            originalDescription,
          }))
        );

        // Update database
        for (const [productId, description] of generatedDescriptions.entries()) {
          const features = generatedFeatures.get(productId);
          await supabase
            .from("bigbuy_product_translations")
            .update({
              ai_description: description,
              ai_description_updated_at: new Date().toISOString(),
              ...(features && features.length === 3 ? { ai_highlight_features: features } : {}),
            })
            .eq("product_id", productId)
            .eq("iso_code", "es");
        }

        totalGenerated += generatedDescriptions.size;
        console.log(`Generated ${generatedDescriptions.size} AI descriptions (total: ${totalGenerated})`);

        // If we got fewer products than batch size, we're done
        if (productsWithoutAI.length < batchSize) {
          break;
        }

        offset += batchSize;
      }

      console.log(`AI description generation completed. Total generated: ${totalGenerated}`);
    } catch (aiError) {
      console.error("Error generating AI descriptions in cron:", aiError);
      // Don't fail the sync if AI generation fails
    }

    return c.json({
      ok: true,
      importedProducts,
      importedVariants,
      updatedProducts,
      skippedNoStock,
      durationMs,
    });
  } catch (e: any) {
    const durationMs = Date.now() - startedAt;
    console.error("Full sync error:", e);

    // Update sync log with error
    if (logId) {
      await supabase
        .from("bigbuy_sync_logs")
        .update({
          completed_at: new Date().toISOString(),
          status: "failed",
          error_message: e?.message || "Unknown error",
          duration_ms: durationMs,
        })
        .eq("id", logId);
    }

    return c.json(
      {
        error: e?.message || "Internal error",
        kind: e?.name,
        status: e?.status,
        url: e?.url,
        details: typeof e?.bodyText === "string" ? e.bodyText.slice(0, 1200) : undefined,
      },
      500,
    );
  }
});

// Stock-only refresh
app.post("/make-server-335110ef/bigbuy/sync/stock", requireSyncSecret(), async (c) => {
  try {
    const startedAt = Date.now();
    const supabase = getServiceSupabase();

  const { data: config, error: cfgErr } = await supabase
    .from("bigbuy_import_config")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (cfgErr) return c.json({ error: cfgErr.message }, 500);

  const taxonomyIds: number[] = (config?.taxonomy_ids ?? []) as any;
  if (!taxonomyIds.length) return c.json({ error: "No taxonomyIds configured." }, 400);

  let updatedVariants = 0;

  for (const taxonomyId of taxonomyIds) {
    const [variationStocks, productStocks] = await Promise.all([
      bigbuyGetProductsVariationsStockByHandlingDays({ parentTaxonomy: taxonomyId, pageSize: 1000 }),
      bigbuyGetProductsStockByHandlingDays({ parentTaxonomy: taxonomyId, pageSize: 1000 }),
    ]);

    const updates: any[] = [];
    for (const s of variationStocks ?? []) {
      const sku = String(s?.sku ?? "").trim();
      if (!sku) continue;
      updates.push({
        sku,
        stock: sumStockFromByHandlingDays(s),
        stock_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    for (const s of productStocks ?? []) {
      const sku = String(s?.sku ?? "").trim();
      if (!sku) continue;
      updates.push({
        sku,
        stock: sumStockFromByHandlingDays(s),
        stock_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    for (const batch of chunk(updates, 500)) {
      const { error } = await supabase.from("bigbuy_variants").upsert(batch, { onConflict: "sku" as any });
      if (error) return c.json({ error: error.message, where: "bigbuy_variants" }, 500);
      updatedVariants += batch.length;
    }
  }

    return c.json({ ok: true, updatedVariants, durationMs: Date.now() - startedAt });
  } catch (e: any) {
    console.error(e);
    return c.json(
      {
        error: e?.message || "Internal error",
        kind: e?.name,
        status: e?.status,
        url: e?.url,
        details: typeof e?.bodyText === "string" ? e.bodyText.slice(0, 1200) : undefined,
      },
      500,
    );
  }
});

// -----------------------------
// Analytics Endpoints
// -----------------------------

// Track analytics event (public endpoint for frontend)
app.post("/make-server-335110ef/bigbuy/analytics/event", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const events = Array.isArray(body.events) ? body.events : [body];
    
    if (events.length === 0) {
      return c.json({ error: "No events provided" }, 400);
    }

    const supabase = getServiceSupabase();
    
    // Validate and prepare events
    const validEvents = events
      .filter((e: any) => {
        return (
          e.product_id &&
          Number.isFinite(Number(e.product_id)) &&
          e.event_type &&
          ['view', 'click', 'cart_add', 'purchase', 'bounce'].includes(e.event_type) &&
          e.session_id
        );
      })
      .map((e: any) => ({
        product_id: Number(e.product_id),
        event_type: e.event_type,
        session_id: String(e.session_id),
        user_agent: e.user_agent || null,
        referrer: e.referrer || null,
        time_on_page_ms: Number.isFinite(Number(e.time_on_page_ms)) ? Number(e.time_on_page_ms) : null,
      }));

    if (validEvents.length === 0) {
      return c.json({ error: "No valid events" }, 400);
    }

    // Insert events in batches
    const batchSize = 100;
    for (let i = 0; i < validEvents.length; i += batchSize) {
      const batch = validEvents.slice(i, i + batchSize);
      const { error } = await supabase.from("product_analytics_events").insert(batch);
      if (error) {
        console.error("Failed to insert analytics events:", error);
        return c.json({ error: error.message }, 500);
      }
    }

    // Trigger ML score update for affected products
    const productIds = [...new Set(validEvents.map((e: any) => e.product_id))];
    if (productIds.length > 0) {
      // Update ML scores asynchronously (don't wait)
      (async () => {
        const { error } = await supabase.rpc("update_all_ml_scores");
        if (error) console.error("Failed to update ML scores:", error);
      })().catch((err) => console.error("Failed to update ML scores:", err));
    }

    return c.json({ ok: true, inserted: validEvents.length });
  } catch (e: any) {
    console.error("Analytics event error:", e);
    return c.json({ error: e?.message || "Internal error" }, 500);
  }
});

// Alias route without function-name prefix (some deployments strip the function slug from pathname).
app.post("/bigbuy/analytics/event", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const events = Array.isArray(body.events) ? body.events : [body];

    if (events.length === 0) {
      return c.json({ error: "No events provided" }, 400);
    }

    const supabase = getServiceSupabase();

    // Validate and prepare events
    const validEvents = events
      .filter((e: any) => {
        return (
          e.product_id &&
          Number.isFinite(Number(e.product_id)) &&
          e.event_type &&
          ["view", "click", "cart_add", "purchase", "bounce"].includes(e.event_type) &&
          e.session_id
        );
      })
      .map((e: any) => ({
        product_id: Number(e.product_id),
        event_type: e.event_type,
        session_id: String(e.session_id),
        user_agent: e.user_agent || null,
        referrer: e.referrer || null,
        time_on_page_ms: Number.isFinite(Number(e.time_on_page_ms)) ? Number(e.time_on_page_ms) : null,
      }));

    if (validEvents.length === 0) {
      return c.json({ error: "No valid events" }, 400);
    }

    // Insert events in batches
    const batchSize = 100;
    for (let i = 0; i < validEvents.length; i += batchSize) {
      const batch = validEvents.slice(i, i + batchSize);
      const { error } = await supabase.from("product_analytics_events").insert(batch);
      if (error) {
        console.error("Failed to insert analytics events:", error);
        return c.json({ error: error.message }, 500);
      }
    }

    // Trigger ML score update for affected products
    const productIds = [...new Set(validEvents.map((e: any) => e.product_id))];
    if (productIds.length > 0) {
      // Update ML scores asynchronously (don't wait)
      (async () => {
        const { error } = await supabase.rpc("update_all_ml_scores");
        if (error) console.error("Failed to update ML scores:", error);
      })().catch((err) => console.error("Failed to update ML scores:", err));
    }

    return c.json({ ok: true, inserted: validEvents.length });
  } catch (e: any) {
    console.error("Analytics event error:", e);
    return c.json({ error: e?.message || "Internal error" }, 500);
  }
});

// Get analytics summary for products
app.get("/make-server-335110ef/bigbuy/analytics/summary", requireSyncSecret(), async (c) => {
  try {
    const supabase = getServiceSupabase();
    const productIds = c.req.query("productIds");
    const limit = Number(c.req.query("limit")) || 100;

    let query = supabase
      .from("product_analytics_summary")
      .select("*")
      .order("ml_score", { ascending: false });

    if (productIds) {
      const ids = String(productIds)
        .split(",")
        .map((id) => Number(id.trim()))
        .filter((id) => Number.isFinite(id));
      if (ids.length > 0) {
        query = query.in("product_id", ids);
      }
    }

    query = query.limit(limit);

    const { data, error } = await query;

    if (error) throw error;

    return c.json({ summaries: data || [] });
  } catch (e: any) {
    return c.json({ error: e?.message || "Internal error" }, 500);
  }
});

// -----------------------------
// Admin Product Management (protected)
// -----------------------------

// List products with filters
app.get("/make-server-335110ef/bigbuy/admin/products", requireSyncSecret(), async (c) => {
  try {
    const supabase = getServiceSupabase();
    const page = Number(c.req.query("page")) || 1;
    const pageSize = Math.min(Number(c.req.query("pageSize")) || 50, 200);
    const offset = (page - 1) * pageSize;

    const search = c.req.query("search")?.trim();
    const hasStock = c.req.query("hasStock");
    const deleted = c.req.query("deleted") === "true";
    const categoryId = c.req.query("categoryId");
    const sortBy = c.req.query("sortBy") || "ml_score"; // Default to ML score
    const sortOrder = c.req.query("sortOrder") === "asc" ? "asc" : "desc";

    // Load taxonomies from DB to map category IDs -> names (and parent names)
    let taxonomiesMap = new Map<number, { name: string; parentId?: number }>();
    try {
      const { data: taxonomies, error: taxError } = await supabase
        .from("bigbuy_taxonomies")
        .select("id, name, parent_taxonomy_id")
        .eq("iso_code", "es");

      if (taxError) {
        console.error("Error fetching taxonomies from database:", taxError);
      } else if (Array.isArray(taxonomies)) {
        for (const tax of taxonomies) {
          const id = Number((tax as any)?.id);
          const name = String((tax as any)?.name ?? "").trim();
          if (!Number.isFinite(id) || !name) continue;
          const parentIdRaw = Number((tax as any)?.parent_taxonomy_id);
          taxonomiesMap.set(id, {
            name,
            parentId: Number.isFinite(parentIdRaw) ? parentIdRaw : undefined,
          });
        }
      }
    } catch (e) {
      console.error("Error loading taxonomies from database:", e);
      // Continue without taxonomy mapping if it fails
    }

    // Build query with analytics join
    // Note: Using inner join syntax for images to ensure they're included
    let query = supabase
      .from("bigbuy_products")
      .select(
        `
        *,
        translations:bigbuy_product_translations!product_id(iso_code, name),
        variants:bigbuy_variants!product_id(id, sku, stock),
        images:bigbuy_product_images(url, position),
        analytics:product_analytics_summary!product_id(
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
        { count: "exact" }
      );

    // Apply sorting
    if (sortBy === "ml_score" || sortBy === "conversion_rate" || sortBy === "ctr") {
      // Sort by analytics field - need to join and order
      query = query.order("id", { ascending: false }); // Will sort in memory after fetch
    } else if (sortBy === "views" || sortBy === "clicks") {
      query = query.order("id", { ascending: false }); // Will sort in memory
    } else {
      query = query.order("id", { ascending: sortOrder === "asc" });
    }

    if (deleted) {
      query = query.not("deleted_at", "is", null);
    } else {
      query = query.is("deleted_at", null);
    }

    if (hasStock === "true") {
      query = query.eq("has_stock", true);
    } else if (hasStock === "false") {
      query = query.eq("has_stock", false);
    }

    if (categoryId) {
      const catId = Number(categoryId);
      if (Number.isFinite(catId)) {
        query = query.eq("category_id", catId);
      }
    }

    if (search) {
      query = query.or(`sku.ilike.%${search}%,id::text.ilike.%${search}%`);
    }

    // Fetch all data first (for sorting)
    const { data: allData, error: countError } = await query;
    if (countError) {
      console.error("Error fetching products:", countError);
      throw countError;
    }
    
    // Get product IDs to fetch images separately if needed
    const productIds = (allData || []).map((p: any) => p.id).filter(Boolean);
    
    // Fetch images separately if relation didn't work
    let imagesByProductId = new Map<number, string[]>();
    if (productIds.length > 0) {
      const { data: imagesData, error: imagesError } = await supabase
        .from("bigbuy_product_images")
        .select("product_id, url, position")
        .in("product_id", productIds)
        .order("position", { ascending: true });
      
      if (!imagesError && imagesData) {
        for (const img of imagesData) {
          if (!img.url) continue;
          const pid = img.product_id;
          if (!imagesByProductId.has(pid)) {
            imagesByProductId.set(pid, []);
          }
          imagesByProductId.get(pid)!.push(img.url);
        }
      }
    }

    // Format products first
    let formattedProducts = (allData || []).map((p: any) => {
      const esTranslation = p.translations?.find((t: any) => t.iso_code === "es");
      const allVariants = Array.isArray(p.variants) ? p.variants : [];
      // Filter out synthetic variants (negative IDs) - these are created for products without real variants
      // Only show real variants (positive IDs) or if there are multiple variants
      const realVariants = allVariants.filter((v: any) => v.id > 0);
      const hasRealVariants = realVariants.length > 1; // Only show if more than 1 real variant
      const variantsToShow = hasRealVariants ? realVariants : [];
      const totalStock = allVariants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
      const analytics = Array.isArray(p.analytics) ? p.analytics[0] : p.analytics || {};
      
      // Try to get images from relation first, fallback to separate query
      let imageUrls: string[] = [];
      
      // First try from relation
      if (p.images) {
        let images: any[] = [];
        if (Array.isArray(p.images)) {
          images = p.images;
        } else if (typeof p.images === 'object') {
          images = [p.images];
        }
        imageUrls = images
          .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
          .map((img: any) => img.url)
          .filter(Boolean);
      }
      
      // Fallback to separate query if relation didn't work
      if (imageUrls.length === 0 && imagesByProductId.has(p.id)) {
        imageUrls = imagesByProductId.get(p.id) || [];
      }

      // Category mapping (taxonomy names)
      const categoryInfo = p.category_id && taxonomiesMap.has(p.category_id)
        ? taxonomiesMap.get(p.category_id)!
        : null;
      const parentCategoryInfo = categoryInfo?.parentId && taxonomiesMap.has(categoryInfo.parentId)
        ? taxonomiesMap.get(categoryInfo.parentId)!
        : null;

      return {
        id: p.id,
        sku: p.sku,
        name: esTranslation?.name || p.sku,
        price: p.sale_price,
        stock: totalStock,
        hasStock: p.has_stock,
        deletedAt: p.deleted_at,
        updatedAt: p.updated_at,
        image: imageUrls[0] || null,
        images: imageUrls,
        categoryId: p.category_id,
        categoryName: categoryInfo?.name || null,
        parentCategoryId: categoryInfo?.parentId || null,
        parentCategoryName: parentCategoryInfo?.name || null,
        manufacturerId: p.manufacturer_id,
        variants: variantsToShow.map((v: any) => ({
          id: v.id,
          sku: v.sku,
          stock: v.stock || 0,
          price: v.sale_price || p.sale_price,
        })),
        analytics: {
          views: analytics.total_views || 0,
          clicks: analytics.total_clicks || 0,
          cartAdds: analytics.total_cart_adds || 0,
          purchases: analytics.total_purchases || 0,
          conversionRate: analytics.conversion_rate || 0,
          ctr: analytics.ctr || 0,
          mlScore: analytics.ml_score || 0,
          avgTimeOnPage: analytics.avg_time_on_page_ms || 0,
        },
      };
    });

    // Group similar products as variants (same category, manufacturer, price, and no real variants)
    // Products that could be grouped: same category_id, manufacturer_id, sale_price, and no real variants
    const groupedProducts = new Map<number, any>();
    const processedIds = new Set<number>();
    
    for (const product of formattedProducts) {
      if (processedIds.has(product.id)) continue;
      
      // Skip if product already has real variants
      if (product.variants && product.variants.length > 0) {
        groupedProducts.set(product.id, product);
        processedIds.add(product.id);
        continue;
      }
      
      // Find similar products (same category, manufacturer, price, no real variants)
      const similarProducts = formattedProducts.filter((p: any) => 
        !processedIds.has(p.id) &&
        p.id !== product.id &&
        p.categoryId === product.categoryId &&
        p.manufacturerId === product.manufacturerId &&
        p.price === product.price &&
        (!p.variants || p.variants.length === 0) &&
        p.deletedAt === product.deletedAt // Same deletion status
      );
      
      if (similarProducts.length >= 1) {
        // Group products: use first product as parent, others as variants
        const groupedVariants = [
          {
            id: product.id,
            sku: product.sku,
            stock: product.stock,
            price: product.price,
          },
          ...similarProducts.map((p: any) => ({
            id: p.id,
            sku: p.sku,
            stock: p.stock,
            price: p.price,
          }))
        ];
        
        // Use product with most stock or first one as parent
        const parentProduct = [product, ...similarProducts].reduce((prev, curr) => 
          curr.stock > prev.stock ? curr : prev
        );
        
        // Combine analytics (sum views, clicks, etc.)
        const combinedAnalytics = {
          views: [product, ...similarProducts].reduce((sum, p) => sum + (p.analytics?.views || 0), 0),
          clicks: [product, ...similarProducts].reduce((sum, p) => sum + (p.analytics?.clicks || 0), 0),
          cartAdds: [product, ...similarProducts].reduce((sum, p) => sum + (p.analytics?.cartAdds || 0), 0),
          purchases: [product, ...similarProducts].reduce((sum, p) => sum + (p.analytics?.purchases || 0), 0),
          conversionRate: 0, // Will be recalculated
          ctr: 0, // Will be recalculated
          mlScore: [product, ...similarProducts].reduce((sum, p) => sum + (p.analytics?.mlScore || 0), 0) / (similarProducts.length + 1),
          avgTimeOnPage: [product, ...similarProducts].reduce((sum, p) => sum + (p.analytics?.avgTimeOnPage || 0), 0) / (similarProducts.length + 1),
        };
        
        // Recalculate conversion rate and CTR
        if (combinedAnalytics.views > 0) {
          combinedAnalytics.ctr = (combinedAnalytics.clicks / combinedAnalytics.views) * 100;
        }
        if (combinedAnalytics.clicks > 0) {
          combinedAnalytics.conversionRate = (combinedAnalytics.purchases / combinedAnalytics.clicks) * 100;
        }
        
        groupedProducts.set(parentProduct.id, {
          ...parentProduct,
          stock: groupedVariants.reduce((sum, v) => sum + v.stock, 0),
          variants: groupedVariants,
          analytics: combinedAnalytics,
          _grouped: true, // Flag to indicate this is a grouped product
        });
        
        // Mark all as processed
        processedIds.add(product.id);
        similarProducts.forEach((p: any) => processedIds.add(p.id));
      } else {
        groupedProducts.set(product.id, product);
        processedIds.add(product.id);
      }
    }
    
    // Convert map back to array
    let products = Array.from(groupedProducts.values());

    // Apply sorting
    if (sortBy === "ml_score") {
      products.sort((a, b) => {
        const aScore = a.analytics.mlScore || 0;
        const bScore = b.analytics.mlScore || 0;
        return sortOrder === "asc" ? aScore - bScore : bScore - aScore;
      });
    } else if (sortBy === "conversion_rate") {
      products.sort((a, b) => {
        const aRate = a.analytics.conversionRate || 0;
        const bRate = b.analytics.conversionRate || 0;
        return sortOrder === "asc" ? aRate - bRate : bRate - aRate;
      });
    } else if (sortBy === "ctr") {
      products.sort((a, b) => {
        const aCtr = a.analytics.ctr || 0;
        const bCtr = b.analytics.ctr || 0;
        return sortOrder === "asc" ? aCtr - bCtr : bCtr - aCtr;
      });
    } else if (sortBy === "views") {
      products.sort((a, b) => {
        const aViews = a.analytics.views || 0;
        const bViews = b.analytics.views || 0;
        return sortOrder === "asc" ? aViews - bViews : bViews - aViews;
      });
    } else if (sortBy === "clicks") {
      products.sort((a, b) => {
        const aClicks = a.analytics.clicks || 0;
        const bClicks = b.analytics.clicks || 0;
        return sortOrder === "asc" ? aClicks - bClicks : bClicks - aClicks;
      });
    }

    // Apply pagination
    const total = products.length;
    const paginatedProducts = products.slice(offset, offset + pageSize);

    // Categories list for UI dropdown (based on current dataset)
    const categories = Array.from(
      new Map(
        products
          .filter((p: any) => p.categoryId && p.categoryName)
          .map((p: any) => [
            p.categoryId,
            {
              id: p.categoryId,
              name: p.categoryName,
              parentId: p.parentCategoryId || undefined,
              parentName: p.parentCategoryName || undefined,
            },
          ]),
      ).values(),
    ).sort((a: any, b: any) => {
      const aKey = `${a.parentName ?? ""} ${a.name}`.trim().toLowerCase();
      const bKey = `${b.parentName ?? ""} ${b.name}`.trim().toLowerCase();
      return aKey.localeCompare(bKey);
    });

    return c.json({
      products: paginatedProducts,
      categories,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (e: any) {
    return c.json({ error: e?.message || "Internal error" }, 500);
  }
});

// Delete products (soft delete)
app.post("/make-server-335110ef/bigbuy/admin/products/delete", requireSyncSecret(), async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const productIds: number[] = Array.isArray(body?.productIds) ? body.productIds : [];

    if (!productIds.length) {
      return c.json({ error: "No productIds provided" }, 400);
    }

    const supabase = getServiceSupabase();
    const { error } = await supabase
      .from("bigbuy_products")
      .update({ deleted_at: new Date().toISOString() })
      .in("id", productIds);

    if (error) throw error;

    return c.json({ ok: true, deletedCount: productIds.length });
  } catch (e: any) {
    return c.json({ error: e?.message || "Internal error" }, 500);
  }
});

// Restore products
app.post("/make-server-335110ef/bigbuy/admin/products/restore", requireSyncSecret(), async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const productIds: number[] = Array.isArray(body?.productIds) ? body.productIds : [];

    if (!productIds.length) {
      return c.json({ error: "No productIds provided" }, 400);
    }

    const supabase = getServiceSupabase();
    const { error } = await supabase
      .from("bigbuy_products")
      .update({ deleted_at: null })
      .in("id", productIds);

    if (error) throw error;

    return c.json({ ok: true, restoredCount: productIds.length });
  } catch (e: any) {
    return c.json({ error: e?.message || "Internal error" }, 500);
  }
});

// Get statistics
app.get("/make-server-335110ef/bigbuy/admin/stats", requireSyncSecret(), async (c) => {
  try {
    const supabase = getServiceSupabase();

    const [
      { count: totalProducts },
      { count: productsWithStock },
      { count: productsWithoutStock },
      { count: deletedProducts },
      { data: lastSync },
    ] = await Promise.all([
      supabase.from("bigbuy_products").select("*", { count: "exact", head: true }).is("deleted_at", null),
      supabase
        .from("bigbuy_products")
        .select("*", { count: "exact", head: true })
        .eq("has_stock", true)
        .is("deleted_at", null),
      supabase
        .from("bigbuy_products")
        .select("*", { count: "exact", head: true })
        .eq("has_stock", false)
        .is("deleted_at", null),
      supabase.from("bigbuy_products").select("*", { count: "exact", head: true }).not("deleted_at", "is", null),
      supabase
        .from("bigbuy_sync_logs")
        .select("*")
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    return c.json({
      totalProducts: totalProducts || 0,
      productsWithStock: productsWithStock || 0,
      productsWithoutStock: productsWithoutStock || 0,
      deletedProducts: deletedProducts || 0,
      lastSync: lastSync
        ? {
            completedAt: lastSync.completed_at,
            importedProducts: lastSync.imported_products,
            importedVariants: lastSync.imported_variants,
            updatedProducts: lastSync.updated_products,
            skippedNoStock: lastSync.skipped_no_stock,
            durationMs: lastSync.duration_ms,
          }
        : null,
    });
  } catch (e: any) {
    return c.json({ error: e?.message || "Internal error" }, 500);
  }
});

// Get sync logs
app.get("/make-server-335110ef/bigbuy/admin/sync-logs", requireSyncSecret(), async (c) => {
  try {
    const limit = Math.min(Number(c.req.query("limit")) || 50, 100);
    const supabase = getServiceSupabase();

    const { data, error } = await supabase
      .from("bigbuy_sync_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return c.json({ logs: data || [] });
  } catch (e: any) {
    return c.json({ error: e?.message || "Internal error" }, 500);
  }
});

// -----------------------------
// Checkout (public)
// -----------------------------

app.post("/make-server-335110ef/bigbuy/shipping/options", async (c) => {
  let cacheKey: string | null = null;
  try {
    const body = await c.req.json().catch(() => ({}));

    // Accept either BigBuy-native payload { order: {...} } or a simplified payload.
    const payload =
      body?.order
        ? body
        : {
            order: {
              delivery: body?.delivery ?? {
                isoCountry: body?.isoCountry,
                postcode: body?.postcode,
              },
              products: body?.products ?? body?.items ?? [],
            },
          };

    const isoCountry = normalizeIsoCountry(payload?.order?.delivery?.isoCountry);
    const postcode = normalizePostcode(payload?.order?.delivery?.postcode);
    const products = normalizeProducts(payload?.order?.products);

    if (isoCountry && postcode && products.length > 0) {
      const keyPayload = JSON.stringify({ isoCountry, postcode, products });
      const hash = await sha256Hex(keyPayload);
      cacheKey = `bb:shipping_options:${hash}`;

      const cached = await kv.get(cacheKey).catch(() => null);
      const now = Date.now();
      const expiresAt = Number(cached?.expiresAt ?? 0);
      if (cached?.data && Number.isFinite(expiresAt) && expiresAt > now) {
        return c.json(cached.data);
      }
    }

    let result: any;
    try {
      result = await bigbuyShippingOrders(payload);
    } catch (e: any) {
      // BigBuy can be very aggressive with rate limits; retry once after a short delay.
      if (Number(e?.status) === 429) {
        await new Promise((r) => setTimeout(r, 1200));
        result = await bigbuyShippingOrders(payload);
      } else {
        throw e;
      }
    }
    if (cacheKey) {
      // Cache for 10 minutes to reduce BigBuy rate limit issues.
      kv.set(cacheKey, { expiresAt: Date.now() + 10 * 60 * 1000, data: result }).catch(() => {});
    }
    return c.json(result);
  } catch (e: any) {
    console.error(e);
    const status = Number(e?.status) || 500;
    // If BigBuy rate-limits us and we have a cached value, serve it as a fallback.
    if (status === 429 && cacheKey) {
      try {
        const cached = await kv.get(cacheKey);
        if (cached?.data) return c.json(cached.data);
      } catch {
        // ignore
      }
    }
    return c.json(
      {
        error: e?.message || "Internal error",
        kind: e?.name,
        status: e?.status,
        url: e?.url,
        details: typeof e?.bodyText === "string" ? e.bodyText.slice(0, 1200) : undefined,
      },
      status,
    );
  }
});

// Alias route without function-name prefix (some deployments strip the function slug from pathname).
app.post("/bigbuy/shipping/options", async (c) => {
  let cacheKey: string | null = null;
  try {
    const body = await c.req.json().catch(() => ({}));

    // Accept either BigBuy-native payload { order: {...} } or a simplified payload.
    const payload =
      body?.order
        ? body
        : {
            order: {
              delivery: body?.delivery ?? {
                isoCountry: body?.isoCountry,
                postcode: body?.postcode,
              },
              products: body?.products ?? body?.items ?? [],
            },
          };

    const isoCountry = normalizeIsoCountry(payload?.order?.delivery?.isoCountry);
    const postcode = normalizePostcode(payload?.order?.delivery?.postcode);
    const products = normalizeProducts(payload?.order?.products);

    if (isoCountry && postcode && products.length > 0) {
      const keyPayload = JSON.stringify({ isoCountry, postcode, products });
      const hash = await sha256Hex(keyPayload);
      cacheKey = `bb:shipping_options:${hash}`;

      const cached = await kv.get(cacheKey).catch(() => null);
      const now = Date.now();
      const expiresAt = Number(cached?.expiresAt ?? 0);
      if (cached?.data && Number.isFinite(expiresAt) && expiresAt > now) {
        return c.json(cached.data);
      }
    }

    let result: any;
    try {
      result = await bigbuyShippingOrders(payload);
    } catch (e: any) {
      // BigBuy can be very aggressive with rate limits; retry once after a short delay.
      if (Number(e?.status) === 429) {
        await new Promise((r) => setTimeout(r, 1200));
        result = await bigbuyShippingOrders(payload);
      } else {
        throw e;
      }
    }
    if (cacheKey) {
      // Cache for 10 minutes to reduce BigBuy rate limit issues.
      kv.set(cacheKey, { expiresAt: Date.now() + 10 * 60 * 1000, data: result }).catch(() => {});
    }
    return c.json(result);
  } catch (e: any) {
    console.error(e);
    const status = Number(e?.status) || 500;
    // If BigBuy rate-limits us and we have a cached value, serve it as a fallback.
    if (status === 429 && cacheKey) {
      try {
        const cached = await kv.get(cacheKey);
        if (cached?.data) return c.json(cached.data);
      } catch {
        // ignore
      }
    }
    return c.json(
      {
        error: e?.message || "Internal error",
        kind: e?.name,
        status: e?.status,
        url: e?.url,
        details: typeof e?.bodyText === "string" ? e.bodyText.slice(0, 1200) : undefined,
      },
      status,
    );
  }
});

app.post("/make-server-335110ef/bigbuy/order/check", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));

    const payload =
      body?.order
        ? body
        : {
            order: {
              internalReference: body?.internalReference ?? `BO-${Date.now()}`,
              language: body?.language ?? "es",
              paymentMethod: body?.paymentMethod,
              carriers: body?.carriers ?? (body?.carrierName ? [{ name: body.carrierName }] : []),
              shippingAddress: body?.shippingAddress ?? {},
              products: body?.products ?? body?.items ?? [],
            },
          };

    const result = await bigbuyOrderCheckMultishipping(payload);
    return c.json(result);
  } catch (e: any) {
    console.error(e);
    const status = Number(e?.status) || 500;
    return c.json(
      {
        error: e?.message || "Internal error",
        kind: e?.name,
        status: e?.status,
        url: e?.url,
        details: typeof e?.bodyText === "string" ? e.bodyText.slice(0, 1200) : undefined,
      },
      status,
    );
  }
});

app.post("/make-server-335110ef/bigbuy/order/create", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const supabase = getServiceSupabase();

    const payload =
      body?.order
        ? body
        : {
            order: {
              internalReference: body?.internalReference ?? `BO-${Date.now()}`,
              language: body?.language ?? "es",
              paymentMethod: body?.paymentMethod,
              carriers: body?.carriers ?? (body?.carrierName ? [{ name: body.carrierName }] : []),
              shippingAddress: body?.shippingAddress ?? {},
              products: body?.products ?? body?.items ?? [],
            },
            meta: body?.meta,
          };

    const result = await bigbuyOrderCreateMultishipping(payload);

    // Persist order + items (best-effort; don't fail the user if DB write fails)
    try {
      const order = payload?.order;
      const shippingAddress = order?.shippingAddress ?? {};
      const orderItems = Array.isArray(order?.products) ? order.products : [];
      const subtotal = Number(payload?.meta?.subtotal ?? null);
      const total = Number(payload?.meta?.total ?? null);
      const shippingCost = Number(payload?.meta?.shippingCost ?? null);
      const selectedCarrier = payload?.meta?.selectedCarrier ?? null;
      const selectedServiceName = payload?.meta?.selectedServiceName ?? null;

      const { data: inserted, error: insErr } = await supabase
        .from("bigbuy_orders")
        .insert({
          email: shippingAddress?.email ?? "",
          first_name: shippingAddress?.firstName ?? "",
          last_name: shippingAddress?.lastName ?? "",
          phone: shippingAddress?.phone ?? null,
          country: shippingAddress?.country ?? "",
          postcode: shippingAddress?.postcode ?? "",
          town: shippingAddress?.town ?? "",
          address: shippingAddress?.address ?? "",
          selected_shipping_service_id: selectedCarrier,
          selected_shipping_service_name: selectedServiceName,
          shipping_cost: Number.isFinite(shippingCost) ? shippingCost : null,
          subtotal: Number.isFinite(subtotal) ? subtotal : null,
          total: Number.isFinite(total) ? total : null,
          payment_method: order?.paymentMethod ?? null,
          bigbuy_orders: result?.orders ?? null,
          bigbuy_errors: result?.errors ?? null,
          bigbuy_raw: result ?? null,
        })
        .select("id")
        .maybeSingle();
      if (insErr) throw insErr;

      if (inserted?.id && orderItems.length) {
        const itemsToInsert = orderItems.map((it: any) => ({
          order_id: inserted.id,
          variant_sku: it?.reference ?? "",
          quantity: Number(it?.quantity ?? 1),
        }));
        await supabase.from("bigbuy_order_items").insert(itemsToInsert);
      }
    } catch (_e) {
      // ignore
    }

    return c.json(result);
  } catch (e: any) {
    console.error(e);
    const status = Number(e?.status) || 500;
    return c.json(
      {
        error: e?.message || "Internal error",
        kind: e?.name,
        status: e?.status,
        url: e?.url,
        details: typeof e?.bodyText === "string" ? e.bodyText.slice(0, 1200) : undefined,
      },
      status,
    );
  }
});

Deno.serve(app.fetch);