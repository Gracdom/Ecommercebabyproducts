# 💳 Integración de Stripe

## Estado

Stripe está integrado para pagos con tarjeta mediante **Checkout Session** (redirección a la pasarela de Stripe).

## Configuración

### 1. Cuenta Stripe

1. Crea una cuenta en [Stripe](https://dashboard.stripe.com/register)
2. Activa tu cuenta y completa la verificación

### 2. Claves API

1. En el [Dashboard de Stripe](https://dashboard.stripe.com/apikeys) obtén:
   - **Secret key** (sk_test_... o sk_live_...)
2. Añade el secreto en Supabase:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
```

### 3. Webhook

1. En [Stripe Webhooks](https://dashboard.stripe.com/webhooks) crea un endpoint:
   - **URL:** `https://TU_PROYECTO.supabase.co/functions/v1/make-server-335110ef/stripe/webhook`
   - **Eventos:** `checkout.session.completed`
2. Copia el **Signing secret** (whsec_...)
3. Añádelo en Supabase:

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

### 4. URLs de éxito y cancelación

Por defecto:
- **Éxito:** `{origen}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
- **Cancelación:** `{origen}/checkout`

El origen se obtiene de `window.location.origin` en el frontend.

## Flujo de pago

1. El usuario selecciona **Tarjeta** en checkout y hace clic en "Realizar pedido"
2. Se crea una Checkout Session y se redirige a Stripe
3. El usuario paga en la página de Stripe
4. Stripe envía el webhook `checkout.session.completed`
5. El backend crea el pedido en BigBuy y envía emails
6. El usuario vuelve a `/checkout/success` y ve la confirmación

## Archivos relevantes

| Archivo | Descripción |
|---------|-------------|
| `supabase/functions/make-server-335110ef/services/stripe_client.tsx` | Cliente Stripe (Checkout Session, verificación de webhook) |
| `supabase/functions/make-server-335110ef/index.ts` | Endpoints: create-checkout-session, webhook, order-by-session |
| `src/utils/bigbuy/edge.ts` | Funciones cliente: createStripeCheckoutSession, getOrderByStripeSession |
| `src/components/CheckoutPage.tsx` | Integración: cuando pago = tarjeta, redirige a Stripe |

## Modo test vs live

- **Test:** usa `sk_test_...` y tarjetas de prueba (4242 4242 4242 4242)
- **Live:** usa `sk_live_...` y cambia las claves en los secretos de Supabase
