export interface Product {
  id: number;
  /** Base product id (when `id` is used as a variant/line-item id in cart) */
  productId?: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  badge?: string;
  rating?: number;
  reviews?: number;
  quantity?: number;

  /** BigBuy identifiers (optional, used when the product comes from BigBuy catalog) */
  sku?: string;
  variantId?: number;
  variantSku?: string;

  /** Rich detail (optional) */
  description?: string;
  images?: string[];
  inStock?: boolean;
  variants?: ProductVariant[];

  /** Analytics and ML Score (optional) */
  mlScore?: number;
  analytics?: {
    views: number;
    clicks: number;
    conversionRate: number;
    ctr: number;
  };
}

export interface Category {
  id: number;
  name: string;
  image: string;
  productCount: number;
}

export interface VariantAttribute {
  group_name: string;
  attribute_name: string;
}

export interface ProductVariant {
  id: number;
  sku: string;
  price: number;
  stock: number;
  attributes: VariantAttribute[];
}

export interface SyncLog {
  id: string;
  started_at: string;
  completed_at: string | null;
  status: "running" | "completed" | "failed";
  imported_products: number;
  imported_variants: number;
  updated_products: number;
  skipped_no_stock: number;
  deleted_products: number;
  restored_products: number;
  error_message: string | null;
  duration_ms: number | null;
  created_at: string;
}

export interface ProductStats {
  totalProducts: number;
  productsWithStock: number;
  productsWithoutStock: number;
  deletedProducts: number;
  lastSync: {
    completedAt: string;
    importedProducts: number;
    importedVariants: number;
    updatedProducts: number;
    skippedNoStock: number;
    durationMs: number;
  } | null;
}

export interface ProductFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  hasStock?: boolean;
  deleted?: boolean;
}

export interface AdminProduct {
  id: number;
  sku: string;
  name: string;
  price: number;
  stock: number;
  hasStock: boolean;
  deletedAt: string | null;
  updatedAt: string;
  image?: string | null;
  images?: string[];
  categoryId?: number | null;
  categoryName?: string | null;
  parentCategoryId?: number | null;
  parentCategoryName?: string | null;
  variants?: Array<{
    id: number;
    sku: string;
    stock: number;
    price?: number;
  }>;
  analytics?: {
    views: number;
    clicks: number;
    cartAdds: number;
    purchases: number;
    conversionRate: number;
    ctr: number;
    mlScore: number;
    avgTimeOnPage: number;
  };
}
