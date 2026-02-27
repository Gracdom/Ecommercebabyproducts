/**
 * Función dedicada para listar pedidos/compras en el panel admin.
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
    const limit = Math.min(Number(url.searchParams.get("limit")) || 100, 500);
    const offset = Number(url.searchParams.get("offset")) || 0;

    const supabase = getServiceSupabase();
    const { data: orders, error: ordersErr } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (ordersErr) throw ordersErr;

    if (!orders?.length) {
      return new Response(JSON.stringify({ orders: [], itemsByOrder: {} }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orderIds = orders.map((o: any) => o.id);
    const { data: items, error: itemsErr } = await supabase
      .from("order_items")
      .select("*")
      .in("order_id", orderIds)
      .order("created_at");

    if (itemsErr) throw itemsErr;

    const itemsByOrder: Record<string, any[]> = {};
    for (const o of orders) {
      itemsByOrder[o.id] = [];
    }
    for (const it of items || []) {
      const arr = itemsByOrder[it.order_id];
      if (arr) arr.push(it);
    }

    return new Response(JSON.stringify({ orders, itemsByOrder }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("admin-orders:", e);
    return new Response(JSON.stringify({ error: e?.message ?? "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
