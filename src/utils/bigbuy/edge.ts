import { supabaseAnonKey, supabaseUrl } from "@/utils/supabase/client";
import type { AdminProduct } from "@/types";

const FUNCTION_NAME = "make-server-335110ef";
const EDGE_BASE_URL = `${supabaseUrl}/functions/v1/${FUNCTION_NAME}`;

/** Función dedicada solo para Stripe (evita 404 de make-server) */
const STRIPE_FUNCTION_NAME = "stripe-checkout";
const STRIPE_EDGE_BASE_URL = `${supabaseUrl}/functions/v1/${STRIPE_FUNCTION_NAME}`;

type HttpMethod = "GET" | "POST";

async function edgeRequest<T>(
  path: string,
  opts?: {
    method?: HttpMethod;
    body?: unknown;
    headers?: Record<string, string>;
  },
): Promise<T> {
  const method = opts?.method ?? "GET";
  // Supabase solo invoca en la URL base: sin subpath. Path vacío = URL exacta; "?..." = query sin barra.
  const url =
    path === ""
      ? EDGE_BASE_URL
      : path.startsWith("?")
        ? `${EDGE_BASE_URL}${path}`
        : `${EDGE_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
      ...(opts?.body ? { "Content-Type": "application/json" } : {}),
      ...(opts?.headers ?? {}),
    },
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // ignore
  }

  if (!res.ok) {
    const msg = json?.error || json?.message || text || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return (json ?? (text as any)) as T;
}

// -----------------------------
// Admin (requires sync secret)
// -----------------------------

export function adminGetConfig(syncSecret: string) {
  return edgeRequest<{ config: any }>("/bigbuy/config", {
    method: "GET",
    headers: { "x-bigbuy-sync-secret": syncSecret },
  });
}

export function adminSetConfig(syncSecret: string, payload: { taxonomyIds: number[]; productLimit?: number }) {
  return edgeRequest<{ ok: boolean }>("/bigbuy/config", {
    method: "POST",
    headers: { "x-bigbuy-sync-secret": syncSecret },
    body: payload,
  });
}

export function adminGetTaxonomies(syncSecret: string, opts?: { isoCode?: string; firstLevel?: boolean }) {
  const iso = opts?.isoCode ?? "es";
  const first = opts?.firstLevel ? "&firstLevel=1" : "";
  return edgeRequest<{ taxonomies: any[] }>(`/bigbuy/taxonomies?isoCode=${encodeURIComponent(iso)}${first}`, {
    method: "GET",
    headers: { "x-bigbuy-sync-secret": syncSecret },
  });
}

export function adminSync(syncSecret: string) {
  return edgeRequest<{ ok: boolean; importedProducts: number; importedVariants: number; skippedNoStock: number }>(
    "/bigbuy/sync",
    {
      method: "POST",
      headers: { "x-bigbuy-sync-secret": syncSecret },
      body: {},
    },
  );
}

export function adminSyncStock(syncSecret: string) {
  return edgeRequest<{ ok: boolean; updatedVariants: number }>(`/bigbuy/sync/stock`, {
    method: "POST",
    headers: { "x-bigbuy-sync-secret": syncSecret },
    body: {},
  });
}

export function adminSyncFull(syncSecret: string) {
  return edgeRequest<{
    ok: boolean;
    importedProducts: number;
    importedVariants: number;
    updatedProducts: number;
    skippedNoStock: number;
    durationMs: number;
  }>("/bigbuy/sync/full", {
    method: "POST",
    headers: { "x-bigbuy-sync-secret": syncSecret },
    body: {},
  });
}

export function adminListProducts(
  syncSecret: string,
  filters?: {
    page?: number;
    pageSize?: number;
    search?: string;
    hasStock?: boolean;
    deleted?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    categoryId?: number;
  }
) {
  const params = new URLSearchParams();
  if (filters?.page) params.append("page", String(filters.page));
  if (filters?.pageSize) params.append("pageSize", String(filters.pageSize));
  if (filters?.search) params.append("search", filters.search);
  if (filters?.hasStock !== undefined) params.append("hasStock", String(filters.hasStock));
  if (filters?.deleted) params.append("deleted", "true");
  if (filters?.sortBy) params.append("sortBy", filters.sortBy);
  if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);
  if (filters?.categoryId) params.append("categoryId", String(filters.categoryId));

  const query = params.toString();
  return edgeRequest<{
    products: AdminProduct[];
    categories?: Array<{ id: number; name: string; parentId?: number; parentName?: string }>;
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }>(`/bigbuy/admin/products${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: { "x-bigbuy-sync-secret": syncSecret },
  });
}

export function adminDeleteProducts(syncSecret: string, productIds: number[]) {
  return edgeRequest<{ ok: boolean; deletedCount: number }>("/bigbuy/admin/products/delete", {
    method: "POST",
    headers: { "x-bigbuy-sync-secret": syncSecret },
    body: { productIds },
  });
}

export function adminRestoreProducts(syncSecret: string, productIds: number[]) {
  return edgeRequest<{ ok: boolean; restoredCount: number }>("/bigbuy/admin/products/restore", {
    method: "POST",
    headers: { "x-bigbuy-sync-secret": syncSecret },
    body: { productIds },
  });
}

export function adminGetStats(syncSecret: string) {
  return edgeRequest<{
    totalProducts: number;
    productsWithStock: number;
    productsWithoutStock: number;
    deletedProducts: number;
    lastSync: {
      completedAt: string;
      importedProducts: number;
      importedVariants: number;
      updatedProducts: number;
      skippedNoStock: number;
      durationMs: number;
    } | null;
  }>("/bigbuy/admin/stats", {
    method: "GET",
    headers: { "x-bigbuy-sync-secret": syncSecret },
  });
}

export function adminGetSyncLogs(syncSecret: string, limit: number = 50) {
  return edgeRequest<{
    logs: Array<{
      id: string;
      started_at: string;
      completed_at: string | null;
      status: "running" | "completed" | "failed";
      imported_products: number;
      imported_variants: number;
      updated_products: number;
      skipped_no_stock: number;
      deleted_products: number;
      restored_products: number;
      error_message: string | null;
      duration_ms: number | null;
      created_at: string;
    }>;
  }>(`/bigbuy/admin/sync-logs?limit=${limit}`, {
    method: "GET",
    headers: { "x-bigbuy-sync-secret": syncSecret },
  });
}

export function adminGetAnalyticsSummary(syncSecret: string, opts?: { productIds?: number[]; limit?: number }) {
  const params = new URLSearchParams();
  if (opts?.productIds && opts.productIds.length > 0) {
    params.append("productIds", opts.productIds.join(","));
  }
  if (opts?.limit) {
    params.append("limit", String(opts.limit));
  }
  return edgeRequest<{
    summaries: Array<{
      product_id: number;
      total_views: number;
      total_clicks: number;
      total_cart_adds: number;
      total_purchases: number;
      conversion_rate: number;
      ctr: number;
      ml_score: number;
      avg_time_on_page_ms: number;
    }>;
  }>(`/analytics/summary${params.toString() ? `?${params.toString()}` : ""}`, {
    method: "GET",
    headers: { "x-bigbuy-sync-secret": syncSecret },
  });
}

// -----------------------------
// Checkout (public)
// -----------------------------

export function getShippingOptions(input: {
  isoCountry: string;
  postcode: string;
  items: Array<{ reference: string; quantity: number }>;
}) {
  return edgeRequest<any>("/bigbuy/shipping/options", { method: "POST", body: input });
}

export function orderCheck(input: {
  internalReference?: string;
  language: string;
  paymentMethod: string;
  carrierName: string;
  shippingAddress: any;
  items: Array<{ reference: string; quantity: number }>;
}) {
  return edgeRequest<any>("/bigbuy/order/check", { method: "POST", body: input });
}

export function orderCreate(input: {
  internalReference?: string;
  language: string;
  paymentMethod: string;
  carrierName: string;
  shippingAddress: any;
  items: Array<{ reference: string; quantity: number }>;
  meta?: {
    subtotal?: number;
    shippingCost?: number;
    total?: number;
    selectedCarrier?: string;
    selectedServiceName?: string;
  };
}) {
  return edgeRequest<any>("/bigbuy/order/create", { method: "POST", body: input });
}

export function adminGetOrders(syncSecret: string, opts?: { limit?: number; offset?: number }) {
  const params = new URLSearchParams();
  if (opts?.limit) params.append("limit", String(opts.limit));
  if (opts?.offset) params.append("offset", String(opts.offset));
  const query = params.toString();
  return edgeRequest<{
    orders: Array<{
      id: string;
      order_number: string;
      status: string;
      email: string;
      first_name: string;
      last_name: string;
      phone: string | null;
      street: string;
      city: string;
      postal_code: string;
      country: string;
      payment_method: string;
      subtotal: number;
      shipping_cost: number;
      discount: number;
      total: number;
      bigbuy_order_ids: string[] | null;
      shipping_service_name: string | null;
      shipping_service_delay: string | null;
      created_at: string;
      user_id: string | null;
      session_id: string | null;
    }>;
    itemsByOrder: Record<string, Array<{
      id: string;
      order_id: string;
      product_id: string;
      product_sku: string | null;
      product_name: string;
      product_price: number;
      quantity: number;
      product_image: string | null;
      variant_sku: string | null;
    }>>;
  }>(`/admin/orders${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: { "x-bigbuy-sync-secret": syncSecret },
  });
}

export function createAdminUser(syncSecret: string, email: string, password: string) {
  return edgeRequest<{ ok: boolean; message: string; userId: string; email: string }>(
    "/admin/create-user",
    {
      method: "POST",
      headers: { "x-bigbuy-sync-secret": syncSecret },
      body: { email, password },
    }
  );
}

// -----------------------------
// Email (Resend)
// -----------------------------

export function sendNewsletterWelcome(email: string) {
  return edgeRequest<{ ok: boolean }>("/email/newsletter-welcome", {
    method: "POST",
    body: { email },
  });
}

export function sendAbandonedCart(params: {
  email: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  cartTotal: number;
}) {
  return edgeRequest<{ ok: boolean }>("/email/abandoned-cart", {
    method: "POST",
    body: params,
  });
}

// -----------------------------
// Stripe
// -----------------------------

async function stripeEdgeRequest<T>(
  opts: { method?: "GET" | "POST"; body?: unknown }
): Promise<T> {
  const method = opts.method ?? "POST";
  const res = await fetch(STRIPE_EDGE_BASE_URL, {
    method,
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
      ...(opts.body ? { "Content-Type": "application/json" } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* ignore */
  }

  if (!res.ok) {
    const msg = json?.error || json?.message || text || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return (json ?? (text as any)) as T;
}

/**
 * Stripe: usa la función stripe-checkout (dedicada, evita 404).
 */
export async function createStripeCheckoutSession(params: {
  items: Array<{ name: string; quantity: number; price: number; image?: string }>;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
}): Promise<{ url: string; sessionId: string }> {
  const body = {
    _action: "stripe/create-checkout-session",
    items: params.items,
    customerEmail: params.customerEmail,
    successUrl: params.successUrl,
    cancelUrl: params.cancelUrl,
    metadata: params.metadata,
  };
  const data = await stripeEdgeRequest<{ url?: string; sessionId?: string; error?: string | { message?: string } }>({
    method: "POST",
    body,
  });
  if (data?.error) {
    throw new Error(
      typeof data.error === "string" ? data.error : data.error?.message ?? "Error creando sesión de pago"
    );
  }
  if (!data?.url) {
    throw new Error("No se recibió URL de pago de Stripe. Comprueba STRIPE_SECRET_KEY en Supabase.");
  }
  return { url: data.url, sessionId: data.sessionId ?? "" };
}

export async function getOrderByStripeSession(sessionId: string): Promise<{
  orderId: string;
  bigbuyOrderIds?: string[];
  shippingOption?: { serviceName: string; delay?: string; cost?: number };
  customerInfo: { email: string; firstName: string; lastName: string; phone: string };
  shippingAddress: { street: string; city: string; postalCode: string; country: string };
  paymentMethod: string;
  total: number;
  items?: unknown[];
}> {
  const data = await stripeEdgeRequest<any>({
    method: "POST",
    body: { _action: "stripe-order-by-session", session_id: sessionId },
  });
  if (data?.error) {
    throw new Error(typeof data.error === "string" ? data.error : data.error?.message ?? "Orden no encontrada");
  }
  return data;
}


