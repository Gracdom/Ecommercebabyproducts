/**
 * Función minimal para Stripe Checkout.
 * Sin rutas Hono: maneja POST directamente.
 * - Crear sesión de pago
 * - Obtener orden por session_id
 * - Webhook Stripe (header Stripe-Signature)
 */

const STRIPE_API = "https://api.stripe.com/v1";
const RESEND_API = "https://api.resend.com/emails";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Stripe-Signature",
};

async function constructWebhookEvent(
  payload: string,
  signature: string,
  secret: string
): Promise<{ type: string; data: { object: any } }> {
  const parts = signature.split(",").reduce((acc: Record<string, string>, p) => {
    const eq = p.indexOf("=");
    if (eq > 0) acc[p.slice(0, eq)] = p.slice(eq + 1);
    return acc;
  }, {});

  const timestamp = parts["t"];
  const v1Sig = parts["v1"];
  if (!timestamp || !v1Sig) throw new Error("Invalid Stripe webhook signature");

  const signedPayload = `${timestamp}.${payload}`;
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const mac = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(signedPayload)
  );

  const computedHex = Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (computedHex !== v1Sig) throw new Error("Stripe webhook signature verification failed");
  return JSON.parse(payload);
}

async function createStripeSession(params: {
  items: Array<{ name: string; quantity: number; price: number; image?: string }>;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
}): Promise<{ id: string; url: string }> {
  const key = (Deno.env.get("STRIPE_SECRET_KEY") ?? "").trim();
  if (!key) throw new Error("STRIPE_SECRET_KEY no configurado");

  const lineItems = params.items.map((i) => ({
    name: String(i.name ?? "Producto").slice(0, 500),
    quantity: Math.max(1, Math.min(99, Number(i.quantity) || 1)),
    amountCents: Math.round((Number(i.price) || 0) * 100),
    image: i.image ? String(i.image).slice(0, 500) : undefined,
  }));

  const formParts: string[] = [
    "mode=payment",
    "payment_method_types[0]=card",
    `success_url=${encodeURIComponent(params.successUrl)}`,
    `cancel_url=${encodeURIComponent(params.cancelUrl)}`,
    `customer_email=${encodeURIComponent(params.customerEmail)}`,
    ...(params.metadata?.internalReference
      ? [`client_reference_id=${encodeURIComponent(params.metadata.internalReference)}`]
      : []),
    ...lineItems.flatMap((item, i) => {
      const pre = `line_items[${i}]`;
      return [
        `${pre}[price_data][currency]=eur`,
        `${pre}[price_data][unit_amount]=${Math.round(item.amountCents)}`,
        `${pre}[price_data][product_data][name]=${encodeURIComponent(item.name)}`,
        `${pre}[quantity]=${item.quantity}`,
        ...(item.image ? [`${pre}[price_data][product_data][images][0]=${encodeURIComponent(item.image)}`] : []),
      ];
    }),
    ...Object.entries(params.metadata || {}).map(
      ([k, v]) => `metadata[${k}]=${encodeURIComponent(String(v))}`
    ),
  ];

  const res = await fetch(`${STRIPE_API}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formParts.join("&"),
  });

  const data = await res.json().catch(() => ({}));
  if (data?.error) throw new Error(data.error?.message ?? "Stripe API error");
  if (!res.ok) throw new Error(data?.error?.message ?? `Stripe error: ${res.status}`);

  return { id: data.id, url: data.url };
}

async function kvSet(key: string, value: any): Promise<void> {
  const url = Deno.env.get("SUPABASE_URL");
  const key2 = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key2) throw new Error("Supabase no configurado");

  const res = await fetch(`${url}/rest/v1/kv_store_335110ef`, {
    method: "POST",
    headers: {
      apikey: key2,
      Authorization: `Bearer ${key2}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({ key, value }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `kv set failed: ${res.status}`);
  }
}

async function getOrderBySession(sessionId: string): Promise<any> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) throw new Error("Supabase no configurado");

  const res = await fetch(
    `${supabaseUrl}/rest/v1/kv_store_335110ef?key=eq.stripe_session:${encodeURIComponent(sessionId)}&select=value`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    }
  );
  const rows = await res.json();
  const row = Array.isArray(rows) ? rows[0] : null;
  return row?.value ?? null;
}

async function sendEmail(params: { from: string; to: string; subject: string; html: string }): Promise<void> {
  const apiKey = (Deno.env.get("RESEND_API_KEY") ?? "").trim();
  if (!apiKey) return; // opcional

  await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: params.from, to: params.to, subject: params.subject, html: params.html }),
  });
}

async function handleWebhook(rawBody: string, signature: string): Promise<void> {
  const webhookSecret = (Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "").trim();
  if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET no configurado");

  const event = await constructWebhookEvent(rawBody, signature, webhookSecret);
  if (event.type !== "checkout.session.completed") return;

  const session = event.data.object;
  const metadata = session.metadata ?? {};
  const customerEmail =
    session.customer_details?.email ?? session.customer_email ?? metadata.customerEmail ?? "";

  const internalReference = metadata.internalReference ?? `BO-${Date.now()}`;
  const shippingAddress = {
    firstName: metadata.firstName ?? "",
    lastName: metadata.lastName ?? "",
    email: customerEmail,
    phone: metadata.phone ?? null,
    country: metadata.country ?? "ES",
    postcode: metadata.postcode ?? "",
    town: metadata.town ?? "",
    address: metadata.address ?? "",
  };

  const total = Number(metadata.total) || 0;

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (supabaseUrl && serviceKey) {
    try {
      await fetch(`${supabaseUrl}/rest/v1/bigbuy_orders`, {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          email: shippingAddress.email ?? "",
          first_name: shippingAddress.firstName ?? "",
          last_name: shippingAddress.lastName ?? "",
          phone: shippingAddress.phone ?? null,
          country: shippingAddress.country ?? "",
          postcode: shippingAddress.postcode ?? "",
          town: shippingAddress.town ?? "",
          address: shippingAddress.address ?? "",
          selected_shipping_service_id: metadata.carrierName ?? null,
          selected_shipping_service_name: metadata.serviceName ?? null,
          shipping_cost: Number(metadata.shippingCost) || null,
          subtotal: Number(metadata.subtotal) || null,
          total,
          payment_method: "stripe",
          bigbuy_orders: null,
          bigbuy_errors: null,
          bigbuy_raw: null,
        }),
      });
    } catch (_e) {
      /* ignore */
    }
  }

  const orderDataForClient = {
    orderId: internalReference,
    bigbuyOrderIds: [] as string[],
    shippingOption: {
      serviceName: metadata.serviceName ?? "",
      delay: metadata.serviceDelay ?? "",
      cost: Number(metadata.shippingCost) || 0,
    },
    customerInfo: {
      email: customerEmail,
      firstName: shippingAddress.firstName ?? "",
      lastName: shippingAddress.lastName ?? "",
      phone: shippingAddress.phone ?? "",
    },
    shippingAddress: {
      street: shippingAddress.address ?? "",
      city: shippingAddress.town ?? "",
      postalCode: shippingAddress.postcode ?? "",
      country: shippingAddress.country ?? "ES",
    },
    paymentMethod: "card",
    total,
    items: [] as unknown[],
  };

  await kvSet(`stripe_session:${session.id}`, orderDataForClient);

  const customerName =
    [shippingAddress.firstName, shippingAddress.lastName].filter(Boolean).join(" ").trim() || "Cliente";

  if (customerEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    await sendEmail({
      from: "e-baby <info@ebaby-shop.com>",
      to: customerEmail,
      subject: `¡Pedido confirmado! #${internalReference} - e-baby`,
      html: `
        <!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:'Segoe UI',sans-serif;max-width:500px;margin:0 auto;padding:24px;color:#2d3748;">
        <h1 style="color:#FFC1CC;margin-bottom:16px;">¡Gracias por tu compra, ${customerName}!</h1>
        <p>Tu pedido ha sido confirmado correctamente.</p>
        <p><strong>Nº de pedido:</strong> ${internalReference}</p>
        <p><strong>Total:</strong> ${total.toFixed(2)} €</p>
        <p>Te avisaremos cuando tu pedido salga de nuestro almacén.</p>
        <p style="margin:24px 0;"><a href="https://e-baby.es" style="background:#FFC1CC;color:white;padding:12px 24px;text-decoration:none;border-radius:12px;display:inline-block;">Seguir comprando</a></p>
        <p style="color:#718096;font-size:14px;margin-top:32px;">e-baby – Productos para tu bebé con amor</p>
        </body></html>`,
    });
  }

  await sendEmail({
    from: "e-baby <info@ebaby-shop.com>",
    to: "karen.rivera@gracdom.com",
    subject: `Nueva venta #${internalReference} - e-baby`,
    html: `
      <!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:'Segoe UI',sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#2d3748;">
      <h1 style="color:#83b5b6;">Nueva venta (Stripe)</h1>
      <p><strong>Pedido:</strong> ${internalReference}</p>
      <p><strong>Cliente:</strong> ${customerName} (${customerEmail})</p>
      <p><strong>Total:</strong> ${total.toFixed(2)} €</p>
      </body></html>`,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const stripeSignature = req.headers.get("Stripe-Signature");
  if (stripeSignature) {
    try {
      const rawBody = await req.text();
      await handleWebhook(rawBody, stripeSignature);
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (e: any) {
      console.error("Stripe webhook error:", e);
      return new Response(
        JSON.stringify({ error: e?.message ?? "Webhook failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  try {
    const body = await req.json().catch(() => ({}));

    // Modo: obtener orden por session_id
    if (body?.action === "get-order" && body?.session_id) {
      const orderData = await getOrderBySession(body.session_id);
      if (!orderData) {
        return new Response(
          JSON.stringify({ error: "Orden no encontrada" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(JSON.stringify(orderData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Compatibilidad: _action para mismo formato que make-server
    const action = body?._action;
    const sessionId = body?.session_id ?? body?.sessionId;
    if (action === "stripe-order-by-session" && sessionId) {
      const orderData = await getOrderBySession(sessionId);
      if (!orderData) {
        return new Response(
          JSON.stringify({ error: "Orden no encontrada" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(JSON.stringify(orderData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Modo: crear sesión de checkout (body directo o dentro de _action)
    const payload = action === "stripe/create-checkout-session" ? { ...body, _action: undefined } : body;
    const items = Array.isArray(payload?.items) ? payload.items : [];
    const customerEmail = String(payload?.customerEmail ?? "").trim();
    const successUrl = String(payload?.successUrl ?? "").trim();
    const cancelUrl = String(payload?.cancelUrl ?? "").trim();
    const metadata = payload?.metadata && typeof payload.metadata === "object" ? payload.metadata : {};

    if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      return new Response(
        JSON.stringify({ error: "Email de cliente inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!successUrl || !cancelUrl) {
      return new Response(
        JSON.stringify({ error: "successUrl y cancelUrl son obligatorios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (items.length === 0) {
      return new Response(
        JSON.stringify({ error: "No hay productos en el carrito" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const session = await createStripeSession({
      items,
      customerEmail,
      successUrl,
      cancelUrl,
      metadata: Object.fromEntries(
        Object.entries(metadata).map(([k, v]) => [k, String(v).slice(0, 500)])
      ),
    });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("stripe-checkout error:", e);
    return new Response(
      JSON.stringify({ error: e?.message ?? "Error creando sesión de pago" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
