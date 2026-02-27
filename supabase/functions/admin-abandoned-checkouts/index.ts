/**
 * Función dedicada para listar carritos/checkouts abandonados en el panel admin.
 * Sin rutas complejas: GET a la URL base devuelve los datos.
 */

import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-bigbuy-sync-secret",
};

function getServiceSupabase() {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function verifySyncSecret(req: Request): Promise<boolean> {
  const expected = (Deno.env.get("BIGBUY_SYNC_SECRET") ?? "").trim();
  if (!expected) {
    try {
      const supabase = getServiceSupabase();
      const { data } = await supabase.from("bigbuy_private_settings").select("sync_secret").eq("id", 1).maybeSingle();
      const secret = String((data as any)?.sync_secret ?? "").trim();
      if (!secret) return false;
      const token = (req.headers.get("x-bigbuy-sync-secret") ?? "").trim();
      return token === secret;
    } catch {
      return false;
    }
  }
  const token = (req.headers.get("x-bigbuy-sync-secret") ?? "").trim();
  return token !== "" && token === expected;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const ok = await verifySyncSecret(req);
  if (!ok) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get("limit")) || 100, 200);
    const offset = Number(url.searchParams.get("offset")) || 0;

    const supabase = getServiceSupabase();
    const { data: list, error } = await supabase
      .from("abandoned_checkouts")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return new Response(JSON.stringify({ abandoned: list ?? [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("admin-abandoned-checkouts:", e);
    return new Response(JSON.stringify({ error: e?.message ?? "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
