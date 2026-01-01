import type { Context, Next } from "npm:hono";
import { getServiceSupabase } from "./supabase.tsx";

export function requireSyncSecret() {
  return async (c: Context, next: Next) => {
    // Prefer env var, fallback to DB (bigbuy_private_settings) for MCP-managed setup.
    let expected = (Deno.env.get("BIGBUY_SYNC_SECRET") ?? "").trim();
    if (!expected) {
      try {
        const supabase = getServiceSupabase();
        const { data, error } = await supabase
          .from("bigbuy_private_settings")
          .select("sync_secret")
          .eq("id", 1)
          .maybeSingle();
        if (error) throw error;
        expected = String((data as any)?.sync_secret ?? "").trim();
      } catch (_e) {
        expected = "";
      }
    }
    if (!expected) return c.json({ error: "Server misconfigured: missing BIGBUY_SYNC_SECRET" }, 500);

    // NOTE: Supabase Edge Functions with verify_jwt=true also use Authorization header.
    // Use a dedicated header for the sync secret to avoid conflicts.
    const token = (c.req.header("x-bigbuy-sync-secret") ?? "").trim();
    if (!token || token !== expected) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    await next();
  };
}


