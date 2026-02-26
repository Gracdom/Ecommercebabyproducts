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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 xl:gap-8">
      {products.map((product) => {
        const isBestseller = bestsellerIds.includes(product.id);
        const isInWish = isInWishlist ? isInWishlist(product.id) : false;
        
        return (
          <div key={product.id} className="group">
            <div className="w-full text-left">
              {/* Product Card - Extremely rounded, soft shadow, white background */}
              <div 
                onClick={() => handleProductClick(product)}
                className="bg-white rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-[#E2E8F0]/30"
                style={{ borderRadius: '2rem', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)' }}
              >
                <div className="relative aspect-square bg-[#F9F9F9] overflow-hidden">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Badges - Pastel colors, very rounded */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <ProductBadge mlScore={product.mlScore} />
                    {product.badge && (
                      <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-[#2d3748] shadow-sm border border-[#FFC1CC]/30">
                        {product.badge}
                      </span>
                    )}
                    {isBestseller && (
                      <span className="bg-gradient-to-r from-[#FFF9C4] to-[#FFE5B4] px-3 py-1.5 rounded-full text-xs font-semibold text-[#2d3748] flex items-center gap-1.5 shadow-sm">
                        <TrendingUp className="h-3.5 w-3.5" />
                        Bestseller
                      </span>
                    )}
                  </div>
                  
                  {/* Action Buttons - Colorful, rounded */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleWishlist) {
                          onToggleWishlist(product);
                        }
                      }}
                      className={`p-2.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg ${
                        isInWish 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : 'bg-white/95 backdrop-blur-sm hover:bg-[#FFC1CC]/20'
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${isInWish ? 'text-white fill-white' : 'text-[#FF6B9D]'}`} />
                    </button>
                    {onQuickView && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickView(product);
                        }}
                        className="bg-white/95 backdrop-blur-sm p-2.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-[#E0F7FA]/30 shadow-lg"
                        title="Vista rápida"
                      >
                        <Eye className="h-5 w-5 text-[#2d3748]" />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Product Info */}
                <div className="p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-[#2d3748] line-clamp-2 min-h-[2.5rem] leading-snug">
                    {product.name}
                  </h3>
                  {/* 5 estrellas de reseñas amarillas */}
                  <div className="flex items-center gap-0.5" aria-hidden>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-sm leading-none" style={{ color: '#FBBF24' }}>★</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-[#2d3748]">€{product.price.toFixed(2)}</p>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-[#718096] line-through">€{product.originalPrice.toFixed(2)}</span>
                    )}
                  </div>
                  {/* Stock - mucho más pequeño */}
                  <p className="text-[10px] text-[#718096]">
                    {typeof product.stock === 'number' 
                      ? `${product.stock} en stock` 
                      : product.inStock 
                        ? 'En stock' 
                        : 'Agotado'}
                  </p>
                  {/* Add to Cart Button - smaller */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(product);
                    }}
                    className="w-full bg-[#FFC1CC] hover:bg-[#FFB3C1] text-white font-semibold py-2.5 px-4 rounded-full transition-all duration-200 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-1.5 text-sm"
                    style={{ backgroundColor: '#FFC1CC', boxShadow: '0 4px 12px rgba(255, 193, 204, 0.3)' }}
                  >
                    <span>Añadir al carrito</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}