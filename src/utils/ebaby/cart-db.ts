import { supabase } from '../supabase/client';
import type { Product } from '../../types';

const CART_SESSION_KEY = 'ebaby_cart_session_id';

export function getOrCreateSessionId(): string {
  let id = typeof window !== 'undefined' ? localStorage.getItem(CART_SESSION_KEY) : null;
  if (!id) {
    id = crypto.randomUUID();
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_SESSION_KEY, id);
    }
  }
  return id;
}

function productToCartRow(item: Product, userId: string | null, sessionId: string | null) {
  return {
    product_id: String(item.id),
    product_sku: item.sku ?? item.variantSku ?? undefined,
    product_name: item.name,
    product_price: item.price,
    product_image: item.image || undefined,
    quantity: item.quantity ?? 1,
    variant_id: item.variantId ? String(item.variantId) : undefined,
    variant_sku: item.variantSku ?? undefined,
    user_id: userId || null,
    session_id: userId ? null : (sessionId || null),
  };
}

function cartRowToProduct(row: {
  product_id: string;
  product_sku?: string | null;
  product_name: string;
  product_price: number;
  product_image?: string | null;
  quantity: number;
  variant_id?: string | null;
  variant_sku?: string | null;
}): Product {
  const numericId = /^\d+$/.test(row.product_id)
    ? parseInt(row.product_id, 10)
    : Math.abs(row.product_id.split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0));
  return {
    id: numericId || 0,
    name: row.product_name,
    price: Number(row.product_price),
    image: row.product_image || '',
    category: '',
    quantity: row.quantity,
    sku: row.product_sku ?? undefined,
    variantSku: row.variant_sku ?? undefined,
    variantId: row.variant_id ? parseInt(row.variant_id, 10) : undefined,
  };
}

export async function loadCartFromDb(
  userId: string | null,
  sessionId: string | null
): Promise<Product[]> {
  if (!userId && !sessionId) return [];

  let query = supabase.from('cart_items').select('*');
  if (userId) {
    query = query.eq('user_id', userId).is('session_id', null);
  } else {
    query = query.is('user_id', null).eq('session_id', sessionId!);
  }

  const { data, error } = await query.order('created_at', { ascending: true });

  if (error) {
    console.warn('[cart-db] Error loading cart:', error);
    return [];
  }

  return (data ?? []).map((row) => cartRowToProduct(row));
}

export async function saveCartToDb(
  items: Product[],
  userId: string | null,
  sessionId: string | null
): Promise<void> {
  if (!userId && !sessionId) return;

  const rows = items.map((item) => productToCartRow(item, userId, sessionId));

  if (rows.length === 0) {
    let del = supabase.from('cart_items').delete();
    if (userId) del = del.eq('user_id', userId).is('session_id', null);
    else del = del.is('user_id', null).eq('session_id', sessionId!);
    await del;
    return;
  }

  // Delete existing and re-insert (simple upsert alternative)
  let del = supabase.from('cart_items').delete();
  if (userId) del = del.eq('user_id', userId).is('session_id', null);
  else del = del.is('user_id', null).eq('session_id', sessionId!);
  await del;

  const { error } = await supabase.from('cart_items').insert(rows);
  if (error) {
    console.warn('[cart-db] Error saving cart:', error);
  }
}

export async function clearCartInDb(userId: string | null, sessionId: string | null): Promise<void> {
  await saveCartToDb([], userId, sessionId);
}
