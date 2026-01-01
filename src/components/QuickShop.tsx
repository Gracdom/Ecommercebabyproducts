import { useState } from 'react';
import { Heart, ShoppingCart, Star, Zap, TrendingUp, Clock, Flame } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Product } from '@/types';
import { ProductBadge } from './ProductBadge';

interface QuickShopProps {
  products?: Product[];
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  isInWishlist?: (productId: number) => boolean;
  onViewAllClick?: () => void;
}

export function QuickShop({ 
  products: propProducts, 
  onProductClick,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  onViewAllClick
}: QuickShopProps = {}) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  
  // Use provided products or empty array (will be populated from App.tsx)
  const products = propProducts || [];
  
  // Get top 4 products by ML score
  const displayProducts = products
    .filter(p => p.mlScore !== undefined && p.mlScore > 0)
    .sort((a, b) => (b.mlScore ?? 0) - (a.mlScore ?? 0))
    .slice(0, 4);

  const getBadgeIcon = (mlScore?: number) => {
    if (!mlScore) return <Star className="h-3 w-3" />;
    if (mlScore >= 70) return <Flame className="h-3 w-3" />;
    if (mlScore >= 50) return <Zap className="h-3 w-3" />;
    return <TrendingUp className="h-3 w-3" />;
  };

  const getBadgeColor = (mlScore?: number) => {
    if (!mlScore) return 'from-stone-500 to-stone-600';
    if (mlScore >= 70) return 'from-destructive to-accent';
    if (mlScore >= 50) return 'from-primary to-[#7a8f85]';
    return 'from-secondary to-[#d6ccc2]';
  };

  const getBadgeText = (mlScore?: number, hasOriginalPrice?: boolean) => {
    if (hasOriginalPrice) return 'Oferta Flash';
    if (!mlScore) return 'Recomendado';
    if (mlScore >= 70) return 'Destacado';
    if (mlScore >= 50) return 'Popular';
    return 'Recomendado';
  };

  return (
    <section className="py-20 bg-gradient-to-b from-stone-50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#8da399]/40 to-[#9fb3b8]/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[#e6dfd9]/40 to-[#a09085]/40 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full mb-6 border border-stone-200 shadow-sm">
            <Flame className="h-4 w-4 text-destructive animate-pulse" />
            <span className="text-sm text-stone-900 font-medium">Ofertas destacadas del día</span>
          </div>
          <h2 className="text-4xl sm:text-5xl text-stone-900 mb-4">
            Compra rápido
          </h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            Los productos más populares seleccionados especialmente para ti
          </p>
        </div>

        {/* Products Grid */}
        {displayProducts.length === 0 ? (
          <div className="text-center py-12 text-stone-600">
            No hay productos disponibles en este momento
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.map((product) => {
              const badgeText = getBadgeText(product.mlScore, !!product.originalPrice);
              return (
                <div
                  key={product.id}
                  className="group relative"
                  onMouseEnter={() => setHoveredId(product.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => {
                    if (onProductClick) {
                      onProductClick(product);
                    }
                  }}
                >
                  {/* Product Card */}
                  <div className="relative bg-white rounded-2xl overflow-hidden border-2 border-stone-200 hover:border-stone-300 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 cursor-pointer">
                    {/* Image */}
                    <div className="relative aspect-square bg-stone-50 overflow-hidden">
                      <ImageWithFallback
                        src={product.image}
                        alt={product.name}
                        className={`w-full h-full object-cover transition-all duration-700 ${
                          hoveredId === product.id ? 'scale-110 rotate-2' : 'scale-100 rotate-0'
                        }`}
                      />

                      {/* Gradient overlay on hover */}
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/30 to-transparent transition-opacity duration-300 ${
                        hoveredId === product.id ? 'opacity-100' : 'opacity-0'
                      }`} />

                      {/* Badge */}
                      <div className="absolute top-4 left-4">
                        <ProductBadge mlScore={product.mlScore} />
                      </div>
                      {product.originalPrice && badgeText === 'Oferta Flash' && (
                        <div className={`absolute top-4 left-20 px-3 py-1.5 bg-gradient-to-r ${getBadgeColor(product.mlScore)} text-white text-xs font-medium rounded-full flex items-center gap-1 shadow-lg`}>
                          <span>{badgeText}</span>
                        </div>
                      )}

                      {/* Discount */}
                      {product.originalPrice && (
                        <div className="absolute top-4 right-4 w-14 h-14 bg-gradient-to-br from-destructive to-accent text-white rounded-full flex items-center justify-center shadow-lg animate-pulse">
                          <div className="text-center leading-tight">
                            <div className="text-sm font-bold">-{Math.round((1 - product.price / product.originalPrice) * 100)}%</div>
                          </div>
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className={`absolute inset-x-4 bottom-4 flex gap-2 transition-all duration-300 ${
                        hoveredId === product.id ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                      }`}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onAddToCart) {
                              onAddToCart(product);
                            }
                          }}
                          className="flex-1 bg-white/95 backdrop-blur-sm hover:bg-stone-900 text-stone-900 hover:text-white px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg group/btn"
                        >
                          <ShoppingCart className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
                          <span className="text-sm font-medium">Añadir</span>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onToggleWishlist) {
                              onToggleWishlist(product);
                            }
                          }}
                          className={`bg-white/95 backdrop-blur-sm hover:bg-accent text-stone-900 hover:text-white p-2.5 rounded-xl transition-all duration-300 shadow-lg group/heart ${
                            isInWishlist && isInWishlist(product.id) ? 'bg-red-50 hover:bg-red-100' : ''
                          }`}
                        >
                          <Heart className={`h-4 w-4 transition-transform group-hover/heart:scale-110 ${
                            isInWishlist && isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''
                          }`} />
                        </button>
                      </div>
                    </div>

                {/* Product Info */}
                <div className="p-5 space-y-3">
                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(product.rating)
                              ? 'fill-[#dccf9d] text-[#dccf9d]'
                              : 'text-stone-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-stone-600">
                      {product.rating} ({product.reviews})
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="text-base text-stone-900 line-clamp-2 min-h-[3rem] group-hover:text-primary transition-colors duration-300">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-2xl text-stone-900 font-medium">
                      €{product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-stone-400 line-through">
                        €{product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Progress bar for stock */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-stone-600">
                      <span>Quedan pocas unidades</span>
                      <span className="font-medium text-destructive">78%</span>
                    </div>
                    <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-destructive to-accent rounded-full transition-all duration-500" style={{ width: '78%' }} />
                    </div>
                  </div>
                </div>

                    {/* Glow effect on hover */}
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${getBadgeColor(product.mlScore)} rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500 -z-10`} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-stone-600 mb-4">¿No encuentras lo que buscas?</p>
          <button 
            onClick={onViewAllClick}
            className="px-8 py-4 border-2 border-stone-900 text-stone-900 rounded-xl hover:bg-stone-900 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            Explorar todos los productos
          </button>
        </div>
      </div>
    </section>
  );
}
