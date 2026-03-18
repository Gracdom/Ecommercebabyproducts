/** Pedidos desde este importe (subtotal productos): envío sin coste. */
export const FREE_SHIPPING_FROM_EUR = 200;
/** Coste de envío estándar si el subtotal es inferior al umbral. */
export const STANDARD_SHIPPING_EUR = 6;

export function shippingCostEur(subtotalProducts: number): number {
  if (subtotalProducts <= 0) return 0;
  return subtotalProducts >= FREE_SHIPPING_FROM_EUR ? 0 : STANDARD_SHIPPING_EUR;
}
