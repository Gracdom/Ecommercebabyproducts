import { useEffect, useRef, useState, useCallback } from 'react';
import { Product } from '@/types';
import { ProductGrid } from './ProductGrid';
import { Loader2 } from 'lucide-react';
import { fetchCatalogProducts } from '@/utils/ebaby/catalog';

interface InfiniteProductGridProps {
  onAddToCart: (product: Product) => void;
  onProductClick?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  isInWishlist?: (productId: number) => boolean;
  initialProducts?: Product[];
  filters?: {
    minPrice?: number;
    maxPrice?: number;
    category?: string;
    minMlScore?: number;
  };
}

const BATCH_SIZE = 20;

export function InfiniteProductGrid({
  onAddToCart,
  onProductClick,
  onQuickView,
  onToggleWishlist,
  isInWishlist,
  initialProducts = [],
  filters,
}: InfiniteProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(initialProducts.length);
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const newProducts = await fetchCatalogProducts({
        limit: BATCH_SIZE,
        offset,
        minMlScore: filters?.minMlScore,
      });

      // Apply price filters
      let filtered = newProducts;
      if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
        filtered = newProducts.filter((p) => {
          const price = p.price;
          if (filters.minPrice !== undefined && price < filters.minPrice) return false;
          if (filters.maxPrice !== undefined && price > filters.maxPrice) return false;
          return true;
        });
      }

      // Apply category filter
      if (filters?.category) {
        filtered = filtered.filter((p) => p.category === filters.category);
      }

      if (filtered.length === 0) {
        setHasMore(false);
      } else {
        setProducts((prev) => {
          // Avoid duplicates
          const existingIds = new Set(prev.map(p => p.id));
          const unique = filtered.filter(p => !existingIds.has(p.id));
          return [...prev, ...unique];
        });
        setOffset((prev) => prev + filtered.length);
        // If we got less than BATCH_SIZE, we've reached the end
        if (filtered.length < BATCH_SIZE) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Error loading more products:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, offset, filters]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMore, hasMore, loading]);

  // Reset when filters change
  useEffect(() => {
    setProducts(initialProducts);
    setOffset(initialProducts.length);
    setHasMore(true);
  }, [filters, initialProducts.length]);

  return (
    <div>
      <ProductGrid
        products={products}
        onAddToCart={onAddToCart}
        onProductClick={onProductClick}
        onQuickView={onQuickView}
        onToggleWishlist={onToggleWishlist}
        isInWishlist={isInWishlist}
      />
      
      {/* Loading indicator */}
      <div ref={observerTarget} className="flex justify-center items-center py-8">
        {loading && (
          <div className="flex items-center gap-2 text-stone-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Cargando más productos...</span>
          </div>
        )}
        {!hasMore && products.length > 0 && (
          <div className="text-stone-500 text-sm">
            No hay más productos para mostrar
          </div>
        )}
      </div>
    </div>
  );
}

