import { Heart, TrendingUp, Flame, Eye } from 'lucide-react';
import { Product } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useProductAnalytics } from '../hooks/useProductAnalytics';
import { ProductBadge } from './ProductBadge';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onProductClick?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  isInWishlist?: (productId: number) => boolean;
}

// Simulate which products are bestsellers
const bestsellerIds = [1, 3, 5, 7, 9];

export function ProductGrid({ 
  products, 
  onAddToCart, 
  onProductClick, 
  onQuickView,
  onToggleWishlist,
  isInWishlist 
}: ProductGridProps) {
  const { trackClick } = useProductAnalytics();

  const handleProductClick = (product: Product) => {
    trackClick(product.id);
    if (onProductClick) {
      onProductClick(product);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => {
        const isBestseller = bestsellerIds.includes(product.id);
        const isInWish = isInWishlist ? isInWishlist(product.id) : false;
        
        return (
          <div key={product.id} className="group">
            <div 
              onClick={() => handleProductClick(product)}
              className="w-full text-left cursor-pointer"
            >
              <div className="relative aspect-square mb-3 bg-stone-50 rounded-lg overflow-hidden">
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <ProductBadge mlScore={product.mlScore} />
                  {product.badge && (
                    <span className="bg-white px-2 py-1 rounded text-xs text-stone-700">
                      {product.badge}
                    </span>
                  )}
                  {isBestseller && (
                    <span className="bg-[#dccf9d] text-stone-900 px-2 py-1 rounded text-xs flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Bestseller
                    </span>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onToggleWishlist) {
                        onToggleWishlist(product);
                      }
                    }}
                    className={`p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                      isInWish 
                        ? 'bg-red-50 hover:bg-red-100' 
                        : 'bg-white hover:bg-stone-100'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${isInWish ? 'text-red-500 fill-red-500' : 'text-stone-600'}`} />
                  </button>
                  {onQuickView && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickView(product);
                      }}
                      className="bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-stone-100"
                      title="Vista rápida"
                    >
                      <Eye className="h-4 w-4 text-stone-600" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm text-stone-900 line-clamp-2 min-h-[2.5rem]">
                  {product.name}
                </h3>
                <p className="text-stone-700">€ {product.price.toFixed(2)}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}