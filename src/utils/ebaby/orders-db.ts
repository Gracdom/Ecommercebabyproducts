import { supabase } from '../supabase/client';
import type { Product } from '../../types';
import type { OrderData } from '../components/CheckoutPage';

export interface CreateOrderParams {
  orderNumber: string;
  userId: string | null;
  sessionId: string | null;
  customerInfo: OrderData['customerInfo'];
  shippingAddress: OrderData['shippingAddress'];
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  items: Product[];
  bigbuyOrderIds?: string[];
  shippingServiceName?: string;
  shippingServiceDelay?: string;
}

export async function createOrderInDb(params: CreateOrderParams): Promise<string | null> {
  const {
    orderNumber,
    userId,
    sessionId,
    customerInfo,
    shippingAddress,
    paymentMethod,
    subtotal,
    shippingCost,
    discount,
    total,
    items,
    bigbuyOrderIds = [],
    shippingServiceName,
    shippingServiceDelay,
  } = params;

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      user_id: userId || null,
      session_id: sessionId || null,
      status: 'completed',
      email: customerInfo.email,
      first_name: customerInfo.firstName,
      last_name: customerInfo.lastName,
      phone: customerInfo.phone || null,
      street: shippingAddress.street,
      city: shippingAddress.city,
      postal_code: shippingAddress.postalCode,
      country: shippingAddress.country,
      payment_method: paymentMethod,
      subtotal,
      shipping_cost: shippingCost,
      discount,
      total,
      bigbuy_order_ids: bigbuyOrderIds,
      shipping_service_name: shippingServiceName || null,
      shipping_service_delay: shippingServiceDelay || null,
    })
    .select('id')
    .single();

  if (orderError || !order) {
    console.error('[orders-db] Error creating order:', orderError);
    return null;
  }

  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: String(item.id),
    product_sku: item.sku ?? item.variantSku ?? undefined,
    product_name: item.name,
    product_price: item.price,
    quantity: item.quantity ?? 1,
    product_image: item.image || undefined,
    variant_sku: item.variantSku ?? undefined,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

  if (itemsError) {
    console.error('[orders-db] Error creating order items:', itemsError);
    // Order was created, items failed - could rollback or leave as is
  }

  return order.id;
}

export async function getOrderByNumber(
  orderNumber: string,
  sessionId: string | null,
  userId: string | null
): Promise<{ order: any; items: any[] } | null> {
  let query = supabase.from('orders').select('*').eq('order_number', orderNumber);

  if (userId) {
    query = query.eq('user_id', userId);
  } else if (sessionId) {
    query = query.eq('session_id', sessionId);
  } else {
    return null;
  }

  const { data: order, error } = await query.single();
  if (error || !order) return null;

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id)
    .order('created_at');

  return { order, items: items ?? [] };
}
