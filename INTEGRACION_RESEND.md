# 📧 Integración de Resend

## Estado

Resend está integrado para el envío de emails transaccionales.

## Configuración

1. Crea una cuenta en [Resend](https://resend.com)
2. Crea una API Key en [API Keys](https://resend.com/api-keys)
3. Configura el secreto en Supabase: `supabase secrets set RESEND_API_KEY=re_xxx`
4. Verifica el dominio **ebaby-shop.com** en Resend (remitente: info@ebaby-shop.com)

## Correos creados

| Correo | Cuándo se envía | Dónde editar |
|--------|-----------------|--------------|
| **Newsletter bienvenida** | Suscripción en el formulario de newsletter | `supabase/functions/make-server-335110ef/index.ts` (buscar `newsletter-welcome`) |
| **Confirmación de compra** | Tras crear pedido en BigBuy | Ídem, buscar el bloque "Confirmación al cliente" dentro de `order/create` |
| **Carrito abandonado (3 correos)** | 1) Inmediato 2) +24h 3) +48h | Se dispara al enviar el Exit Intent popup con items en el carrito. Editar: buscar `abandoned-cart` en `index.ts` |
| **Notificación venta al admin** | Cada pedido nuevo | Envía a karen.rivera@gracdom.com. Editar: buscar "Notificación al administrador" en `index.ts` |

## Dónde editar cada correo

Todos los HTML de los correos están en:

```
supabase/functions/make-server-335110ef/index.ts
```

- **Newsletter:** Línea ~83, `app.post("/make-server-335110ef/email/newsletter-welcome"`
- **Confirmación compra:** Dentro de `app.post("/make-server-335110ef/bigbuy/order/create"`, bloque "1. Confirmación al cliente"
- **Carrito abandonado (3 correos):** Línea ~120, `app.post("/make-server-335110ef/email/abandoned-cart"`
  - Email 1: inmediato
  - Email 2: `schedule: "in 24 hours"`
  - Email 3: `schedule: "in 48 hours"`
- **Admin:** mismo bloque que confirmación, sección "2. Notificación al administrador"

## Flujo carrito abandonado

- Se activa cuando el usuario rellena el popup de Exit Intent **y tiene productos en el carrito**
- Si no hay productos, se envía el correo de newsletter bienvenida en su lugar
