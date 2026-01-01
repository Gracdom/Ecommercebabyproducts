/**
 * Utilities for managing AI-generated product descriptions
 */

import { supabaseAnonKey, supabaseUrl } from "@/utils/supabase/client";

const FUNCTION_NAME = "make-server-335110ef";
const EDGE_BASE_URL = `${supabaseUrl}/functions/v1/${FUNCTION_NAME}`;

async function edgeRequest<T>(
  path: string,
  opts: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    headers?: Record<string, string>;
    body?: unknown;
  } = {}
): Promise<T> {
  const url = `${EDGE_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    method: opts.method || "GET",
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
      "Content-Type": "application/json",
      ...opts.headers,
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  const text = await response.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // ignore
  }

  if (!response.ok) {
    const msg = json?.error || json?.message || text || `Request failed (${response.status})`;
    throw new Error(msg);
  }

  return (json ?? (text as any)) as T;
}

interface GenerateDescriptionsResponse {
  ok: boolean;
  generated: number;
  total: number;
  failed: number;
  message?: string;
}

/**
 * Generate AI descriptions for products
 */
export async function generateProductDescriptions(
  syncSecret: string,
  options?: {
    productIds?: number[];
    forceRegenerate?: boolean;
    limit?: number;
  }
): Promise<GenerateDescriptionsResponse> {
  return edgeRequest<GenerateDescriptionsResponse>(
    "/bigbuy/ai/descriptions/generate",
    {
      method: "POST",
      headers: { "x-bigbuy-sync-secret": syncSecret },
      body: {
        productIds: options?.productIds,
        forceRegenerate: options?.forceRegenerate,
        limit: options?.limit,
      },
    }
  );
}

