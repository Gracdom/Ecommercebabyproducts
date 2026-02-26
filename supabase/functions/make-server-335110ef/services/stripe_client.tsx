/**
 * Stripe API client - Checkout Sessions y webhooks
 * API REST vía fetch para Deno/Edge
 */

const STRIPE_API = "https://api.stripe.com/v1";

async function getSecretKey(): Promise<string> {
  const key = (Deno.env.get("STRIPE_SECRET_KEY") ?? "").trim();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY no configurado. Configura el secreto en Supabase.");
  }
  return key;
}

export interface CreateCheckoutSessionParams {
  lineItems: Array<{ name: string; quantity: number; amountCents: number; image?: string }>;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
  clientReferenceId?: string;
}

export interface StripeCheckoutSession {
  id: string;
  url: string;
}

/**
 * Crea una Checkout Session en Stripe
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<StripeCheckoutSession> {
  const secretKey = await getSecretKey();

  const formParts: string[] = [
    "mode=payment",
    "payment_method_types[0]=card",
    `success_url=${encodeURIComponent(params.successUrl)}`,
    `cancel_url=${encodeURIComponent(params.cancelUrl)}`,
    `customer_email=${encodeURIComponent(params.customerEmail)}`,
    ...(params.clientReferenceId ? [`client_reference_id=${encodeURIComponent(params.clientReferenceId)}`] : []),
    ...params.lineItems.flatMap((item, i) => {
      const pre = `line_items[${i}]`;
      return [
        `${pre}[price_data][currency]=eur`,
        `${pre}[price_data][unit_amount]=${Math.round(item.amountCents)}`,
        `${pre}[price_data][product_data][name]=${encodeURIComponent(item.name)}`,
        `${pre}[quantity]=${item.quantity}`,
        ...(item.image ? [`${pre}[price_data][product_data][images][0]=${encodeURIComponent(item.image)}`] : []),
      ];
    }),
    ...Object.entries(params.metadata).map(([k, v]) => `metadata[${k}]=${encodeURIComponent(v)}`),
  ];

  const formBody = formParts.join("&");

  const res = await fetch(`${STRIPE_API}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formBody,
  });

  const data = await res.json().catch(() => ({}));

  if (data?.error) {
    throw new Error(data.error?.message ?? "Stripe API error");
  }
  if (!res.ok) {
    throw new Error(data?.error?.message ?? `Stripe error: ${res.status}`);
  }

  return { id: data.id, url: data.url };
}

/**
 * Verifica la firma del webhook de Stripe y devuelve el evento
 * Requiere el body raw (string) y el header Stripe-Signature
 */
export async function constructWebhookEvent(
  payload: string,
  signature: string,
  secret: string
): Promise<{ type: string; data: { object: any } }> {
  const parts = signature.split(",").reduce((acc, p) => {
    const eq = p.indexOf("=");
    if (eq > 0) acc[p.slice(0, eq)] = p.slice(eq + 1);
    return acc;
  }, {} as Record<string, string>);

  const timestamp = parts["t"];
  const v1Sig = parts["v1"];
  if (!timestamp || !v1Sig) {
    throw new Error("Invalid Stripe webhook signature");
  }

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

  if (computedHex !== v1Sig) {
    throw new Error("Stripe webhook signature verification failed");
  }

  return JSON.parse(payload);
}
