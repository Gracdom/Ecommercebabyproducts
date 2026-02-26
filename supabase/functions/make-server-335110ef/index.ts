import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { requireSyncSecret } from "./middleware.tsx";
import * as kv from "./kv_store.tsx";
import { getServiceSupabase } from "./supabase.tsx";
import { sendEmail } from "./services/resend_client.tsx";
import { createCheckoutSession, constructWebhookEvent } from "./services/stripe_client.tsx";
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
// Email (Resend)
// -----------------------------
const DEFAULT_FROM_EMAIL = "e-baby <info@ebaby-shop.com>";

app.post("/make-server-335110ef/email/newsletter-welcome", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return c.json({ error: "Email invÃƒÆ’Ã‚Â¡lido" }, 400);
    }

    await sendEmail({
      from: DEFAULT_FROM_EMAIL,
      to: email,
      subject: "Ãƒâ€šÃ‚Â¡Bienvenido a e-baby! ÃƒÂ°Ã…Â¸Ã…Â½Ã¢â‚¬Â° 10% de descuento en tu primera compra",
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; color: #2d3748;">
          <h1 style="color: #FFC1CC; margin-bottom: 16px;">Ãƒâ€šÃ‚Â¡Gracias por suscribirte! ÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ‚Â¶</h1>
          <p>Hola,</p>
          <p>Ãƒâ€šÃ‚Â¡Bienvenido a la familia e-baby! Estamos encantados de tenerte.</p>
          <p>Como regalo de bienvenida, disfruta de <strong>10% de descuento</strong> en tu primera compra.</p>
          <p style="margin: 24px 0;"><a href="https://e-baby.es" style="background: #FFC1CC; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; display: inline-block;">Ir a la tienda</a></p>
          <p>RecibirÃƒÆ’Ã‚Â¡s ofertas exclusivas, consejos para bebÃƒÆ’Ã‚Â©s y las ÃƒÆ’Ã‚Âºltimas novedades.</p>
          <p style="color: #718096; font-size: 14px; margin-top: 32px;">e-baby ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ Productos para tu bebÃƒÆ’Ã‚Â© con amor ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã¢â‚¬Â¢</p>
        </body>
        </html>
      `,
    });

    return c.json({ ok: true });
  } catch (e: any) {
    console.error("Resend newsletter-welcome:", e);
    return c.json({ error: e?.message ?? "Error enviando email" }, 500);
  }
});

// Carrito abandonado - flujo de 3 correos (1 ahora, 2 programados)
app.post("/make-server-335110ef/email/abandoned-cart", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();
    const items: Array<{ name: string; quantity: number; price: number }> = Array.isArray(body?.items) ? body.items : [];
    const cartTotal = Number(body?.cartTotal) || 0;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return c.json({ error: "Email invÃƒÆ’Ã‚Â¡lido" }, 400);
    }

    const itemsList = items
      .map((i) => `ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ ${i.name} x${i.quantity} - ${Number(i.price || 0).toFixed(2)} ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬`)
      .join("<br>") || "Productos en tu carrito";

    // Email 1: inmediato
    await sendEmail({
      from: DEFAULT_FROM_EMAIL,
      to: email,
      subject: "Ãƒâ€šÃ‚Â¿Olvidaste algo? Tu carrito te espera ÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ‚Â¶",
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; color: #2d3748;">
          <h1 style="color: #FFC1CC; margin-bottom: 16px;">Ãƒâ€šÃ‚Â¡Hola! ÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ‚Â¶</h1>
          <p>Has dejado productos en tu carrito. Ãƒâ€šÃ‚Â¿Necesitas ayuda para terminar tu compra?</p>
          <p><strong>Resumen:</strong></p>
          <div style="background: #f9f9f9; padding: 16px; border-radius: 12px; margin: 16px 0;">${itemsList}</div>
          <p><strong>Total:</strong> ${cartTotal.toFixed(2)} ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬</p>
          <p style="margin: 24px 0;"><a href="https://e-baby.es" style="background: #FFC1CC; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; display: inline-block;">Recuperar carrito</a></p>
          <p style="color: #718096; font-size: 14px; margin-top: 32px;">e-baby ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ Productos para tu bebÃƒÆ’Ã‚Â© con amor ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã¢â‚¬Â¢</p>
        </body>
        </html>
      `,
    });

    // Email 2: en 24 horas
    await sendEmail({
      from: DEFAULT_FROM_EMAIL,
      to: email,
      subject: "Ãƒâ€šÃ‚Â¿Seguimos con tu pedido? 10% de descuento te espera ÃƒÂ°Ã…Â¸Ã…Â½Ã‚Â",
      schedule: "in 24 hours",
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; color: #2d3748;">
          <h1 style="color: #FFC1CC; margin-bottom: 16px;">Te echamos de menos ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂºÃ¢â‚¬â„¢</h1>
          <p>Tu carrito sigue esperÃƒÆ’Ã‚Â¡ndote. Como regalo, usa <strong>RECUERDA10</strong> para un <strong>10% de descuento</strong> en tu prÃƒÆ’Ã‚Â³xima compra.</p>
          <p><strong>Total en tu carrito:</strong> ${cartTotal.toFixed(2)} ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬</p>
          <p style="margin: 24px 0;"><a href="https://e-baby.es" style="background: #83b5b6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; display: inline-block;">Completar compra con descuento</a></p>
          <p style="color: #718096; font-size: 14px; margin-top: 32px;">e-baby ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ Productos para tu bebÃƒÆ’Ã‚Â© con amor ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã¢â‚¬Â¢</p>
        </body>
        </html>
      `,
    });

    // Email 3: en 48 horas
    await sendEmail({
      from: DEFAULT_FROM_EMAIL,
      to: email,
      subject: "ÃƒÆ’Ã…Â¡ltima oportunidad: tu carrito estÃƒÆ’Ã‚Â¡ a punto de vaciarse ÃƒÂ¢Ã‚ÂÃ‚Â°",
      schedule: "in 48 hours",
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; color: #2d3748;">
          <h1 style="color: #FFC1CC; margin-bottom: 16px;">Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã…Â¡ltima oportunidad! ÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ‚Â¶</h1>
          <p>Tu carrito se vaciarÃƒÆ’Ã‚Â¡ pronto. No pierdas tus productos ni el 10% de descuento con <strong>RECUERDA10</strong>.</p>
          <p><strong>Total:</strong> ${cartTotal.toFixed(2)} ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬</p>
          <p style="margin: 24px 0;"><a href="https://e-baby.es" style="background: #FFC1CC; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; display: inline-block;">Finalizar compra ahora</a></p>
          <p style="color: #718096; font-size: 14px; margin-top: 32px;">e-baby ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ Productos para tu bebÃƒÆ’Ã‚Â© con amor ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã¢â‚¬Â¢</p>
        </body>
        </html>
      `,
    });

    return c.json({ ok: true });
  } catch (e: any) {
    console.error("Resend abandoned-cart:", e);
    return c.json({ error: e?.message ?? "Error enviando email" }, 500);
  }
});

// -----------------------------
// Stripe
// -----------------------------
async function handleStripeCreateCheckoutSession(c: any, bodyOverride?: any) {
  const body = bodyOverride ?? await c.req.json().catch(() => ({}));
  const items = Array.isArray(body?.items) ? body.items : [];
  const customerEmail = String(body?.customerEmail ?? "").trim();
  const successUrl = String(body?.successUrl ?? "").trim();
  const cancelUrl = String(body?.cancelUrl ?? "").trim();
  const metadata = (body?.metadata && typeof body.metadata === "object") ? body.metadata : {};

  if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return c.json({ error: "Email de cliente invÃƒÆ’Ã‚Â¡lido" }, 400);
  }
  if (!successUrl || !cancelUrl) {
    return c.json({ error: "successUrl y cancelUrl son obligatorios" }, 400);
  }
  if (items.length === 0) {
    return c.json({ error: "No hay productos en el carrito" }, 400);
  }

  const lineItems = items.map((i: any) => ({
    name: String(i.name ?? "Producto").slice(0, 500),
    quantity: Math.max(1, Math.min(99, Number(i.quantity) || 1)),
    amountCents: Math.round((Number(i.price) || 0) * 100),
    image: i.image ? String(i.image).slice(0, 500) : undefined,
  }));

  const session = await createCheckoutSession({
    lineItems,
    customerEmail,
    successUrl,
    cancelUrl,
    metadata: Object.fromEntries(
      Object.entries(metadata).map(([k, v]) => [k, String(v).slice(0, 500)])
    ),
    clientReferenceId: metadata?.internalReference,
  });

  return c.json({ url: session.url, sessionId: session.id });
}

app.post("/make-server-335110ef/stripe/create-checkout-session", async (c) => {
  try {
    return await handleStripeCreateCheckoutSession(c);
  } catch (e: any) {
    console.error("Stripe create-checkout-session:", e);
    return c.json({ error: e?.message ?? "Error creando sesiÃƒÆ’Ã‚Â³n de pago" }, 500);
  }
});
// Ruta sin prefijo por si Supabase pasa solo el path relativo
app.post("/stripe/create-checkout-session", async (c) => {
  try {
    return await handleStripeCreateCheckoutSession(c);
  } catch (e: any) {
    console.error("Stripe create-checkout-session:", e);
    return c.json({ error: e?.message ?? "Error creando sesiÃƒÆ’Ã‚Â³n de pago" }, 500);
  }
});

async function handleStripeOrderBySession(c: any) {
  const sessionId = c.req.query("session_id");
  if (!sessionId) return c.json({ error: "session_id requerido" }, 400);
  const orderData = await kv.get(`stripe_session:${sessionId}`);
  if (!orderData) return c.json({ error: "Orden no encontrada" }, 404);
  return c.json(orderData);
}

app.get("/make-server-335110ef/stripe/order-by-session", async (c) => {
  try {
    return await handleStripeOrderBySession(c);
  } catch (e: any) {
    return c.json({ error: e?.message ?? "Error" }, 500);
  }
});
app.get("/stripe/order-by-session", async (c) => {
  try {
    return await handleStripeOrderBySession(c);
  } catch (e: any) {
    return c.json({ error: e?.message ?? "Error" }, 500);
  }
});

// Ruta base: Supabase solo invoca la funciÃƒÆ’Ã‚Â³n en la URL sin subpath; dispatch por _action (POST) o action (GET)
async function dispatchStripePost(c: any) {
  const body = await c.req.json().catch(() => ({}));
  const action = body?._action;
  if (action === "stripe/create-checkout-session") {
    const { _action: _, ...rest } = body;
    return await handleStripeCreateCheckoutSession(c, rest);
  }
  if (action === "stripe-order-by-session") {
    const sessionId = body?.session_id;
    if (!sessionId) return c.json({ error: "session_id requerido" }, 400);
    try {
      const orderData = await kv.get(`stripe_session:${sessionId}`);
      if (!orderData) return c.json({ error: "Orden no encontrada" }, 404);
      return c.json(orderData);
    } catch (e: any) {
      return c.json({ error: e?.message ?? "Error" }, 500);
    }
  }
  return c.json({ error: "AcciÃƒÆ’Ã‚Â³n no reconocida" }, 400);
}
async function dispatchStripeGet(c: any) {
  const action = c.req.query("action");
  if (action === "stripe-order-by-session") {
    return await handleStripeOrderBySession(c);
  }
  return c.json({ error: "AcciÃƒÆ’Ã‚Â³n no reconocida" }, 400);
}
function wrapStripePost(handler: (c: any) => Promise<any>) {
  return async (c: any) => {
    try {
      return await handler(c);
    } catch (e: any) {
      console.error("Stripe create-checkout-session:", e?.message ?? e);
      return c.json({ error: e?.message ?? "Error creando sesiÃƒÆ’Ã‚Â³n de pago" }, 500);
    }
  };
}
function wrapStripeGet(handler: (c: any) => Promise<any>) {
  return async (c: any) => {
    try {
      return await handler(c);
    } catch (e: any) {
      return c.json({ error: e?.message ?? "Error" }, 500);
    }
  };
}
// Path que Supabase puede enviar: nombre de funciÃƒÆ’Ã‚Â³n o path completo /functions/v1/<nombre>
app.post("/make-server-335110ef", wrapStripePost(dispatchStripePost));
app.get("/make-server-335110ef", wrapStripeGet(dispatchStripeGet));
app.post("/make-server-335110ef/", wrapStripePost(dispatchStripePost));
app.get("/make-server-335110ef/", wrapStripeGet(dispatchStripeGet));
app.post("/functions/v1/make-server-335110ef", wrapStripePost(dispatchStripePost));
app.get("/functions/v1/make-server-335110ef", wrapStripeGet(dispatchStripeGet));
app.post("/functions/v1/make-server-335110ef/", wrapStripePost(dispatchStripePost));
app.get("/functions/v1/make-server-335110ef/", wrapStripeGet(dispatchStripeGet));
app.post("/v1/make-server-335110ef", wrapStripePost(dispatchStripePost));
app.get("/v1/make-server-335110ef", wrapStripeGet(dispatchStripeGet));
app.post("/v1/make-server-335110ef/", wrapStripePost(dispatchStripePost));
app.get("/v1/make-server-335110ef/", wrapStripeGet(dispatchStripeGet));
app.post("/", wrapStripePost(dispatchStripePost));
app.get("/", wrapStripeGet(dispatchStripeGet));

// Catch-all: cualquier otro path que envÃƒÆ’Ã‚Â­e Supabase
app.post("*", wrapStripePost(dispatchStripePost));
app.get("*", wrapStripeGet(dispatchStripeGet));

// Webhook Stripe - usa body raw para verificar firma
app.post("/make-server-335110ef/stripe/webhook", async (c) => {
  const signature = c.req.header("Stripe-Signature") ?? "";
  const webhookSecret = (Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "").trim();
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET no configurado");
    return c.json({ error: "Webhook no configurado" }, 500);
  }

  let event: { type: string; data: { object: any } };
  try {
    const rawBody = await c.req.text();
    event = await constructWebhookEvent(rawBody, signature, webhookSecret);
  } catch (e: any) {
    console.error("Stripe webhook verification failed:", e);
    return c.json({ error: "Invalid signature" }, 400);
  }

  if (event.type !== "checkout.session.completed") {
    return c.json({ received: true });
  }

  const session = event.data.object;
  const metadata = session.metadata ?? {};
  const customerEmail = session.customer_details?.email ?? session.customer_email ?? metadata.customerEmail ?? "";

  try {
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

    const productsJson = metadata.products ?? "[]";
    let products: Array<{ reference: string; quantity: number }> = [];
    try {
      products = JSON.parse(productsJson);
    } catch {
      products = [];
    }

    const supabase = getServiceSupabase();
    const total = Number(metadata.total) || 0;
    const shippingAddressObj = shippingAddress;

    try {
      await supabase.from("bigbuy_orders").insert({
        email: shippingAddressObj?.email ?? "",
        first_name: shippingAddressObj?.firstName ?? "",
        last_name: shippingAddressObj?.lastName ?? "",
        phone: shippingAddressObj?.phone ?? null,
        country: shippingAddressObj?.country ?? "",
        postcode: shippingAddressObj?.postcode ?? "",
        town: shippingAddressObj?.town ?? "",
        address: shippingAddressObj?.address ?? "",
        selected_shipping_service_id: metadata.carrierName ?? null,
        selected_shipping_service_name: metadata.serviceName ?? null,
        shipping_cost: Number(metadata.shippingCost) || null,
        subtotal: Number(metadata.subtotal) || null,
        total,
        payment_method: "stripe",
        bigbuy_orders: null,
        bigbuy_errors: null,
        bigbuy_raw: null,
      }).select("id").maybeSingle();
    } catch (_e) { /* ignore */ }

    const customerName = [shippingAddressObj?.firstName, shippingAddressObj?.lastName].filter(Boolean).join(" ").trim() || "Cliente";
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
        firstName: shippingAddressObj?.firstName ?? "",
        lastName: shippingAddressObj?.lastName ?? "",
        phone: shippingAddressObj?.phone ?? "",
      },
      shippingAddress: {
        street: shippingAddressObj?.address ?? "",
        city: shippingAddressObj?.town ?? "",
        postalCode: shippingAddressObj?.postcode ?? "",
        country: shippingAddressObj?.country ?? "ES",
      },
      paymentMethod: "card",
      total,
      items: [], // El frontend puede no necesitar los items en la confirmaciÃƒÆ’Ã‚Â³n
    };

    await kv.set(`stripe_session:${session.id}`, orderDataForClient);

    if (customerEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      await sendEmail({
        from: DEFAULT_FROM_EMAIL,
        to: customerEmail,
        subject: `Ãƒâ€šÃ‚Â¡Pedido confirmado! #${internalReference} - e-baby`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"></head>
          <body style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; color: #2d3748;">
            <h1 style="color: #FFC1CC; margin-bottom: 16px;">Ãƒâ€šÃ‚Â¡Gracias por tu compra, ${customerName}! ÃƒÂ°Ã…Â¸Ã…Â½Ã¢â‚¬Â°</h1>
            <p>Tu pedido ha sido confirmado correctamente.</p>
            <p><strong>NÃƒâ€šÃ‚Âº de pedido:</strong> ${internalReference}</p>
            <p><strong>Total:</strong> ${total.toFixed(2)} ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬</p>
            <p>Te avisaremos cuando tu pedido salga de nuestro almacÃƒÆ’Ã‚Â©n.</p>
            <p style="margin: 24px 0;"><a href="https://e-baby.es" style="background: #FFC1CC; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; display: inline-block;">Seguir comprando</a></p>
            <p style="color: #718096; font-size: 14px; margin-top: 32px;">e-baby ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ Productos para tu bebÃƒÆ’Ã‚Â© con amor ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã¢â‚¬Â¢</p>
          </body>
          </html>
        `,
      });
    }

    await sendEmail({
      from: DEFAULT_FROM_EMAIL,
      to: "karen.rivera@gracdom.com",
      subject: `ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂºÃ¢â‚¬â„¢ Nueva venta #${internalReference} - e-baby`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #2d3748;">
          <h1 style="color: #83b5b6;">Nueva venta (Stripe)</h1>
          <p><strong>Pedido:</strong> ${internalReference}</p>
          <p><strong>Cliente:</strong> ${customerName} (${customerEmail})</p>
          <p><strong>Total:</strong> ${total.toFixed(2)} ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬</p>
        </body>
        </html>
      `,
    });
  } catch (e: any) {
    console.error("Stripe webhook processing error:", e);
    return c.json({ error: e?.message ?? "Webhook processing failed" }, 500);
  }

  return c.json({ received: true });
});

// -----------------------------
// Admin (protected)
// -----------------------------

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


// -----------------------------
// Analytics Endpoints
// -----------------------------

// Track analytics event (public endpoint for frontend)
app.post("/make-server-335110ef/analytics/event", async (c) => {
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
app.post("/analytics/event", async (c) => {
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
app.get("/make-server-335110ef/analytics/summary", requireSyncSecret(), async (c) => {
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
// Admin Orders (protected - eBaby orders from public.orders)
app.get("/make-server-335110ef/admin/orders", requireSyncSecret(), async (c) => {
  try {
    const limit = Math.min(Number(c.req.query("limit")) || 100, 500);
    const offset = Number(c.req.query("offset")) || 0;
    const supabase = getServiceSupabase();

    const { data: orders, error: ordersErr } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (ordersErr) throw ordersErr;

    if (!orders?.length) {
      return c.json({ orders: [], itemsByOrder: {} });
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

    return c.json({ orders, itemsByOrder });
  } catch (e: any) {
    return c.json({ error: e?.message || "Internal error" }, 500);
  }
});

// -----------------------------
// Si ninguna ruta coincide, intentar dispatch Stripe (evita 404 para POST/GET con _action)
app.notFound(async (c) => {
  if (c.req.method === "POST") {
    try {
      return await wrapStripePost(dispatchStripePost)(c);
    } catch (_) {
      return c.json({ error: "Not Found" }, 404);
    }
  }
  if (c.req.method === "GET") {
    try {
      return await wrapStripeGet(dispatchStripeGet)(c);
    } catch (_) {
      return c.json({ error: "Not Found" }, 404);
    }
  }
  return c.json({ error: "Not Found" }, 404);
});

Deno.serve(app.fetch);
