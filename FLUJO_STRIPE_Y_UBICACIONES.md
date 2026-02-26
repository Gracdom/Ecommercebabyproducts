# Validación: Flujo Stripe y dónde está cada pieza

## 1. Configuración base (proyecto Supabase)

| Archivo | Qué hace | Valores actuales |
|---------|----------|------------------|
| `src/utils/supabase/info.tsx` | projectId y publicAnonKey | `projectId: qozeqcfavcnfwkexxbjm` |
| `src/utils/supabase/client.ts` | Crea supabaseUrl y supabaseAnonKey | `supabaseUrl = https://qozeqcfavcnfwkexxbjm.supabase.co` |

**URL de la Edge Function:**
```
https://qozeqcfavcnfwkexxbjm.supabase.co/functions/v1/make-server-335110ef
```
⚠️ Nombre correcto: **335110** (no 335118)

---

## 2. Frontend – quién llama Stripe

| Archivo | Línea aprox. | Función |
|---------|--------------|---------|
| `src/components/CheckoutPage.tsx` | ~230 | Llama a `createStripeCheckoutSession()` al hacer clic en "Completar pedido" |
| `src/App.tsx` | ~208 | Llama a `getOrderByStripeSession(sessionId)` en `/checkout/success?session_id=...` |

---

## 3. Cliente HTTP – cómo se envían las peticiones

| Archivo | Función | Qué hace |
|---------|---------|----------|
| `src/utils/bigbuy/edge.ts` | `edgeRequest()` | Hace `fetch(EDGE_BASE_URL + path)` con Authorization |
| `src/utils/bigbuy/edge.ts` | `createStripeCheckoutSession()` | POST a `EDGE_BASE_URL` con body `{ _action: "stripe/create-checkout-session", items, customerEmail, successUrl, cancelUrl, metadata }` |
| `src/utils/bigbuy/edge.ts` | `getOrderByStripeSession()` | POST a `EDGE_BASE_URL` con body `{ _action: "stripe-order-by-session", session_id }` |

**Constante importante:**
```ts
const FUNCTION_NAME = "make-server-335110ef";  // Línea 4
const EDGE_BASE_URL = `${supabaseUrl}/functions/v1/${FUNCTION_NAME}`;
```

---

## 4. Backend – Edge Function

| Archivo | Qué hace |
|---------|----------|
| `supabase/functions/make-server-335110ef/index.ts` | Hono app con todas las rutas |
| `supabase/functions/make-server-335110ef/services/stripe_client.tsx` | Llama a Stripe API (createCheckoutSession) |

**Rutas Stripe:**
- POST con `body._action === "stripe/create-checkout-session"` → crea sesión Stripe
- POST con `body._action === "stripe-order-by-session"` → devuelve orden por session_id
- Webhook: `POST /make-server-335110ef/stripe/webhook` (para Stripe)

---

## 5. Secretos necesarios en Supabase

Configurar en **Supabase Dashboard → Project Settings → Edge Functions → Secrets** (o `supabase secrets set`):

| Secreto | Para qué |
|---------|----------|
| `STRIPE_SECRET_KEY` | Crear sesiones de pago (sk_test_... o sk_live_...) |
| `STRIPE_WEBHOOK_SECRET` | Verificar firma del webhook (whsec_...) |
| `RESEND_API_KEY` | Enviar correos (re_...) |

---

## 6. Comprobar que todo está bien

1. **Nombre de la función:** Solo `make-server-335110ef` (no 335118).
2. **URL usada:** `https://qozeqcfavcnfwkexxbjm.supabase.co/functions/v1/make-server-335110ef`.
3. **Función desplegada:** Dashboard → Edge Functions → `make-server-335110ef` desplegada.
4. **Secretos:** `STRIPE_SECRET_KEY` configurado.

---

## 7. Flujo completo (pago con tarjeta)

1. Usuario completa checkout → clic en "Completar pedido"
2. `CheckoutPage` → `createStripeCheckoutSession()` en `edge.ts`
3. `edgeRequest("", { method: "POST", body: { _action: "stripe/create-checkout-session", ... } })`
4. Fetch a `https://qozeqcfavcnfwkexxbjm.supabase.co/functions/v1/make-server-335110ef`
5. Edge Function recibe POST, lee `_action`, ejecuta `handleStripeCreateCheckoutSession`
6. Llama a Stripe API → obtiene `url` de Checkout
7. Devuelve `{ url, sessionId }` al frontend
8. Frontend hace `window.location.href = url` → redirige a Stripe Checkout
9. Usuario paga en Stripe → redirige a `/checkout/success?session_id=xxx`
10. `App.tsx` llama `getOrderByStripeSession(sessionId)` → muestra confirmación
