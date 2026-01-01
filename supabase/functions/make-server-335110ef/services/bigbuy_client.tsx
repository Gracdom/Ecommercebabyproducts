type QueryValue = string | number | boolean | null | undefined;
type Query = Record<string, QueryValue>;

import { getServiceSupabase } from "../supabase.tsx";

class BigBuyHttpError extends Error {
  status: number;
  url: string;
  bodyText?: string;

  constructor(message: string, status: number, url: string, bodyText?: string) {
    super(message);
    this.name = "BigBuyHttpError";
    this.status = status;
    this.url = url;
    this.bodyText = bodyText;
  }
}

function safeJsonParse<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function buildBigBuyErrorMessage(status: number, bodyText: string): string {
  if (status === 429) {
    return "BigBuy está limitando las peticiones (429). Espera unos segundos y vuelve a intentarlo.";
  }
  const trimmed = (bodyText ?? "").trim();
  if (!trimmed) return `BigBuy request failed (${status})`;

  const outer = safeJsonParse<any>(trimmed);
  const code = outer?.code ? String(outer.code) : undefined;

  // BigBuy often returns { status, code, message } where `message` can be a JSON string.
  const rawMessage = outer?.message ?? outer?.error ?? outer?.info ?? undefined;

  let info: string | undefined;
  let skus: string[] | undefined;

  if (typeof rawMessage === "string") {
    const nested = safeJsonParse<any>(rawMessage);
    if (nested && typeof nested === "object") {
      if (typeof nested?.info === "string") info = nested.info;
      const nestedSkus = nested?.data?.skus;
      if (Array.isArray(nestedSkus)) {
        skus = nestedSkus.map((s: any) => String(s)).filter(Boolean);
      }
    }
    if (!info) info = rawMessage;
  } else if (rawMessage && typeof rawMessage === "object") {
    if (typeof (rawMessage as any)?.info === "string") info = (rawMessage as any).info;
    else info = JSON.stringify(rawMessage);
    const nestedSkus = (rawMessage as any)?.data?.skus;
    if (Array.isArray(nestedSkus)) {
      skus = nestedSkus.map((s: any) => String(s)).filter(Boolean);
    }
  }

  // Known common error: ER003 -> no stock
  if (code === "ER003" && skus && skus.length > 0) {
    return `Algunos productos están agotados en BigBuy (SKU: ${skus.join(", ")}). Elimina esos artículos del carrito o prueba más tarde.`;
  }

  const cleanInfo = typeof info === "string" ? info.replace(/\s+/g, " ").trim() : "";
  if (cleanInfo) {
    const truncated = cleanInfo.length > 500 ? `${cleanInfo.slice(0, 500)}…` : cleanInfo;
    return `BigBuy error (${status}${code ? ` ${code}` : ""}): ${truncated}`;
  }

  // Fallback: expose only the status and code.
  return `BigBuy request failed (${status}${code ? ` ${code}` : ""})`;
}

let cachedSettings:
  | { apiKey: string; baseUrl: string; syncSecret: string }
  | null
  | undefined = undefined;

async function getSettings(): Promise<{ apiKey: string; baseUrl: string; syncSecret: string }> {
  if (cachedSettings) return cachedSettings;

  // Prefer Edge env vars (recommended), but allow DB fallback for MCP-managed setup.
  const envApiKey = (Deno.env.get("BIGBUY_API_KEY") ?? "").trim();
  const envBaseUrl = (Deno.env.get("BIGBUY_BASE_URL") ?? "").trim();
  const envSyncSecret = (Deno.env.get("BIGBUY_SYNC_SECRET") ?? "").trim();

  if (envApiKey) {
    cachedSettings = {
      apiKey: envApiKey,
      baseUrl: (envBaseUrl || "https://api.sandbox.bigbuy.eu").replace(/\/+$/, ""),
      syncSecret: envSyncSecret || "",
    };
    return cachedSettings;
  }

  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("bigbuy_private_settings")
    .select("api_key, base_url, sync_secret")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw new Error(error.message);

  const apiKey = String((data as any)?.api_key ?? "").trim();
  const baseUrl = String((data as any)?.base_url ?? "https://api.sandbox.bigbuy.eu").trim().replace(/\/+$/, "");
  const syncSecret = String((data as any)?.sync_secret ?? "").trim();

  if (!apiKey) throw new Error("Missing BIGBUY api_key (set BIGBUY_API_KEY secret or bigbuy_private_settings)");
  cachedSettings = { apiKey, baseUrl, syncSecret };
  return cachedSettings;
}

async function getBaseUrl(): Promise<string> {
  const s = await getSettings();
  return s.baseUrl;
}

async function getApiKey(): Promise<string> {
  const s = await getSettings();
  return s.apiKey;
}

async function buildUrl(path: string, query?: Query): Promise<string> {
  const baseUrl = await getBaseUrl();
  const url = new URL(`${baseUrl}${path}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === "") continue;
      if (typeof v === "boolean") {
        url.searchParams.set(k, v ? "1" : "0");
      } else {
        url.searchParams.set(k, String(v));
      }
    }
  }
  return url.toString();
}

async function request<T>(opts: {
  method: "GET" | "POST";
  path: string;
  query?: Query;
  body?: unknown;
  timeoutMs?: number;
}): Promise<T> {
  const url = await buildUrl(opts.path, opts.query);
  const controller = new AbortController();
  const timeoutMs = opts.timeoutMs ?? 30_000;
  const t = setTimeout(() => controller.abort("timeout"), timeoutMs);

  try {
    const apiKey = await getApiKey();
    const res = await fetch(url, {
      method: opts.method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...(opts.body ? { "Content-Type": "application/json" } : {}),
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal,
    });

    const text = await res.text();
    if (!res.ok) {
      throw new BigBuyHttpError(buildBigBuyErrorMessage(res.status, text), res.status, url, text);
    }

    if (!text) return undefined as T;
    return JSON.parse(text) as T;
  } finally {
    clearTimeout(t);
  }
}

// -----------------------------
// Catalog
// -----------------------------

export function bigbuyGetTaxonomies(opts: { isoCode?: string; firstLevel?: number }) {
  return request<any[]>({
    method: "GET",
    path: "/rest/catalog/taxonomies.json",
    query: { isoCode: opts.isoCode ?? "es", firstLevel: opts.firstLevel },
  });
}

export function bigbuyGetProducts(opts: { parentTaxonomy?: number; page?: number; pageSize?: number }) {
  return request<any[]>({
    method: "GET",
    path: "/rest/catalog/products.json",
    query: {
      parentTaxonomy: opts.parentTaxonomy,
      page: opts.page,
      pageSize: opts.pageSize,
    },
  });
}

export function bigbuyGetProductsInformation(opts: {
  parentTaxonomy?: number;
  isoCode?: string;
  page?: number;
  pageSize?: number;
}) {
  return request<any[]>({
    method: "GET",
    path: "/rest/catalog/productsinformation.json",
    query: {
      isoCode: opts.isoCode ?? "es",
      page: opts.page,
      pageSize: opts.pageSize,
      parentTaxonomy: opts.parentTaxonomy,
    },
  });
}

export function bigbuyGetProductsImages(opts: { parentTaxonomy?: number; page?: number; pageSize?: number }) {
  return request<any[]>({
    method: "GET",
    path: "/rest/catalog/productsimages.json",
    query: {
      page: opts.page,
      pageSize: opts.pageSize,
      parentTaxonomy: opts.parentTaxonomy,
    },
  });
}

export function bigbuyGetProductsVariations(opts: { parentTaxonomy?: number; page?: number; pageSize?: number }) {
  return request<any[]>({
    method: "GET",
    path: "/rest/catalog/productsvariations.json",
    query: {
      page: opts.page,
      pageSize: opts.pageSize,
      parentTaxonomy: opts.parentTaxonomy,
    },
  });
}

export function bigbuyGetProductsVariationsStockByHandlingDays(opts: {
  parentTaxonomy?: number;
  page?: number;
  pageSize?: number;
}) {
  return request<any[]>({
    method: "GET",
    path: "/rest/catalog/productsvariationsstockbyhandlingdays.json",
    query: {
      page: opts.page,
      pageSize: opts.pageSize,
      parentTaxonomy: opts.parentTaxonomy,
    },
  });
}

export function bigbuyGetProductsStockByHandlingDays(opts: { parentTaxonomy?: number; page?: number; pageSize?: number }) {
  return request<any[]>({
    method: "GET",
    path: "/rest/catalog/productsstockbyhandlingdays.json",
    query: {
      page: opts.page,
      pageSize: opts.pageSize,
      parentTaxonomy: opts.parentTaxonomy,
    },
  });
}

export function bigbuyGetAttributeGroups(opts: { isoCode?: string; page?: number; pageSize?: number }) {
  return request<any[]>({
    method: "GET",
    path: "/rest/catalog/attributegroups.json",
    query: {
      isoCode: opts.isoCode ?? "es",
      page: opts.page,
      pageSize: opts.pageSize,
    },
  });
}

export function bigbuyGetAttributes(opts: { isoCode?: string; page?: number; pageSize?: number }) {
  return request<any[]>({
    method: "GET",
    path: "/rest/catalog/attributes.json",
    query: {
      isoCode: opts.isoCode ?? "es",
      page: opts.page,
      pageSize: opts.pageSize,
    },
  });
}

// -----------------------------
// Shipping + Orders
// -----------------------------

export function bigbuyShippingOrders(body: unknown) {
  return request<any>({
    method: "POST",
    path: "/rest/shipping/orders.json",
    body,
    timeoutMs: 45_000,
  });
}

export function bigbuyOrderCheckMultishipping(body: unknown) {
  return request<any>({
    method: "POST",
    path: "/rest/order/check/multishipping.json",
    body,
    timeoutMs: 45_000,
  });
}

export function bigbuyOrderCreateMultishipping(body: unknown) {
  return request<any>({
    method: "POST",
    path: "/rest/order/create/multishipping.json",
    body,
    timeoutMs: 45_000,
  });
}


