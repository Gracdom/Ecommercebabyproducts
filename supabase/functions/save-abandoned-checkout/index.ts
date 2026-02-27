/**
 * Función dedicada para GUARDAR abandonos de checkout (paso 1, 2, o cancelación Stripe).
 * POST sin autenticación - cualquier visitante puede llamarla al abandonar.
 */

import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function getServiceSupabase() {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const sessionId = body?.session_id ? String(body.session_id).slice(0, 128) : null;
    const email = body?.email ? String(body.email).trim().toLowerCase().slice(0, 255) : null;
    const items: Array<{ name: string; quantity: number; price: number; image?: string }> = Array.isArray(body?.items) ? body.items : [];
    const cartTotal = Number(body?.cartTotal) || 0;
    const validSources = ["checkout_step_1", "checkout_step_2", "checkout_cancel", "manual"];
    const source = validSources.includes(body?.source) ? body.source : "manual";

    if (items.length === 0 && !email) {
      return new Response(JSON.stringify({ error: "Se necesitan items o email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = getServiceSupabase();
    const isUpdateFlow = source === "checkout_step_2" || source === "checkout_cancel";
    let existingId: string | null = null;

    if (isUpdateFlow && sessionId) {
      const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const { data: existing } = await supabase
        .from("abandoned_checkouts")
        .select("id")
        .eq("session_id", sessionId)
        .gte("created_at", cutoff)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      existingId = existing?.id ?? null;
    }

    const updatePayload: Record<string, unknown> = {
      cart_items: items,
      cart_total: cartTotal,
      source,
    };
    if (email) updatePayload.email = email;
    if (body?.first_name) updatePayload.first_name = String(body.first_name).slice(0, 255);
    if (body?.last_name) updatePayload.last_name = String(body.last_name).slice(0, 255);
    if (body?.phone) updatePayload.phone = String(body.phone).slice(0, 50);
    if (body?.street) updatePayload.street = String(body.street).slice(0, 500);
    if (body?.city) updatePayload.city = String(body.city).slice(0, 200);
    if (body?.postal_code) updatePayload.postal_code = String(body.postal_code).slice(0, 20);
    if (body?.country) updatePayload.country = String(body.country).slice(0, 100);

    if (existingId) {
      const { error } = await supabase
        .from("abandoned_checkouts")
        .update(updatePayload)
        .eq("id", existingId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("abandoned_checkouts").insert({
        session_id: sessionId,
        user_id: null,
        email: email || null,
        first_name: body?.first_name ? String(body.first_name).slice(0, 255) : null,
        last_name: body?.last_name ? String(body.last_name).slice(0, 255) : null,
        phone: body?.phone ? String(body.phone).slice(0, 50) : null,
        street: body?.street ? String(body.street).slice(0, 500) : null,
        city: body?.city ? String(body.city).slice(0, 200) : null,
        postal_code: body?.postal_code ? String(body.postal_code).slice(0, 20) : null,
        country: body?.country ? String(body.country).slice(0, 100) : null,
        cart_items: items,
        cart_total: cartTotal,
        source,
      });
      if (error) throw error;
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("save-abandoned-checkout:", e);
    return new Response(JSON.stringify({ error: e?.message ?? "Error guardando" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
