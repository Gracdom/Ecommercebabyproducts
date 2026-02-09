import { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Eye, Star, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { fetchFeaturedProducts } from '@/utils/ebaby/catalog';
import { Product } from '@/types';

interface FeaturedProductsProps {
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  isInWishlist?: (productId: number) => boolean;
  onViewAllClick?: () => void;
}

export function FeaturedProducts({ 
  onProductClick, 
  onAddToCart, 
  onToggleWishlist,
  isInWishlist,
  onViewAllClick 
}: FeaturedProductsProps = {}) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts(8)
      .then((fetchedProducts) => {
        setProducts(fetchedProducts);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading featured products:', err);
        setLoading(false);
      });
  }, []);

  const getBadgeColor = (mlScore?: number) => {
    if (!mlScore) return 'from-[#e6dfd9] to-[#d6ccc2]'; // Sand
    if (mlScore >= 70) return 'from-[#e08e8e] to-[#dcbaba]'; // Hot/Destacado
    if (mlScore >= 50) return 'from-[#83b5b6] to-[#7a8f85]'; // Trending
        return 'from-[#a09085] to-[#8e7f75]'; // Taupe
  };

  const getBadgeIcon = (mlScore?: number) => {
    if (!mlScore) return <Star className="h-3 w-3" />;
    if (mlScore >= 70) return <Zap className="h-3 w-3" />;
    if (mlScore >= 50) return <TrendingUp className="h-3 w-3" />;
        return <Sparkles className="h-3 w-3" />;
  };

  const getBadgeText = (mlScore?: number) => {
    if (!mlScore) return undefined;
    if (mlScore >= 70) return 'Destacado';
    if (mlScore >= 50) return 'Popular';
    return undefined;
  };

  return (
    <section className="py-32 lg:py-40 bg-white relative overflow-hidden" style={{ paddingTop: '8rem', paddingBottom: '8rem' }}>
      {/* Background decoration - Pastel theme */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#FFC1CC] rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#E0F7FA] rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 relative z-10">
        {/* Header - More spacing, pastel colors */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#FFC1CC]/30 via-[#E0F7FA]/30 to-[#FFF9C4]/30 px-6 py-3 rounded-full mb-8 border-2 border-[#FFC1CC]/40 shadow-sm">
            <Star className="h-5 w-5 text-[#FF6B9D] fill-[#FF6B9D]" />
            <span className="text-sm font-semibold text-[#2d3748]">Productos destacados</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl text-[#2d3748] mb-6 font-bold leading-tight">
            Los favoritos de nuestros clientes
          </h2>
          <p className="text-xl text-[#718096] max-w-3xl mx-auto leading-relaxed">
            Productos premium cuidadosamente seleccionados para el bienestar de tu bebé
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-[#E2E8F0] animate-pulse">
                <div className="aspect-square bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-6 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-8 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-[#718096]">
            No hay productos destacados disponibles
          </div>
        ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {products.map((product) => {
              const badgeText = getBadgeText(product.mlScore);
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
              {/* Product Card - Extremely rounded, pastel theme */}
                  <div className="relative bg-white rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 shadow-xl cursor-pointer border border-[#E2E8F0]/30"
                    style={{ borderRadius: '2rem', boxShadow: '0 15px 40px rgba(0, 0, 0, 0.1)' }}
                  >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      hoveredId === product.id ? 'scale-110 rotate-2' : 'scale-100 rotate-0'
                    }`}
                  />
                  
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/20 to-transparent transition-opacity duration-300 ${
                    hoveredId === product.id ? 'opacity-100' : 'opacity-0'
                  }`} />

                  {/* Badge - Pastel colors */}
                      {badgeText && (
                        <div className="absolute top-4 left-4 px-4 py-2 bg-gradient-to-r from-[#FFC1CC] to-[#FFB3C1] text-white text-xs font-semibold rounded-full flex items-center gap-1.5 shadow-lg">
                          {getBadgeIcon(product.mlScore)}
                          <span>{badgeText}</span>
                    </div>
                  )}

                  {/* Discount badge - Pastel yellow */}
                  {product.originalPrice && (
                    <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-[#FFF9C4] to-[#FFE5B4] text-[#2d3748] rounded-full flex items-center justify-center shadow-xl transform rotate-12 border-3 border-white">
                      <div className="text-center leading-tight font-bold">
                        <div className="text-sm">-{Math.round((1 - product.price / product.originalPrice) * 100)}%</div>
                        <div className="text-[10px]">OFF</div>
                      </div>
                    </div>
                  )}

                  {/* Quick actions - Vibrant pastel buttons */}
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
                      className="flex-1 bg-[#FFC1CC] hover:bg-[#FFB3C1] text-white px-5 py-4 rounded-full transition-all duration-300 flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl group/btn font-bold text-base"
                      style={{ backgroundColor: '#FFC1CC', boxShadow: '0 8px 20px rgba(255, 193, 204, 0.4)' }}
                    >
                      <ShoppingCart className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
                      <span className="text-sm">Añadir</span>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleWishlist) {
                          onToggleWishlist(product);
                        }
                      }}
                      className={`p-3.5 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl group/heart ${
                        isInWishlist && isInWishlist(product.id) 
                          ? 'bg-[#FFC1CC] hover:bg-[#FFB3C1]' 
                          : 'bg-white/95 backdrop-blur-sm hover:bg-[#FFC1CC]/20'
                      }`}
                      style={{ borderRadius: '9999px' }}
                    >
                      <Heart className={`h-4 w-4 transition-transform group-hover/heart:scale-110 ${
                        isInWishlist && isInWishlist(product.id) ? 'fill-white text-white' : 'text-[#FF6B9D]'
                      }`} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onProductClick) {
                          onProductClick(product);
                        }
                      }}
                      className="bg-white/95 backdrop-blur-sm hover:bg-[#E0F7FA]/30 p-3.5 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl group/eye"
                      style={{ borderRadius: '9999px' }}
                    >
                      <Eye className="h-4 w-4 transition-transform group-hover/eye:scale-110 text-[#2d3748]" />
                    </button>
                  </div>
                </div>

                {/* Product Info - More spacing, pastel theme */}
                <div className="p-6 space-y-3">
                  {/* Category */}
                  <div className="text-xs text-[#718096] uppercase tracking-wider font-semibold">
                    {product.category}
                  </div>

                  {/* Name */}
                  <h3 className="text-base font-semibold text-[#2d3748] line-clamp-2 min-h-[3rem] group-hover:text-[#FF6B9D] transition-colors duration-300">
                    {product.name}
                  </h3>

                      {/* Rating - Show conversion rate if available */}
                      {product.analytics && product.analytics.conversionRate > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-[#FBBF24] text-[#FBBF24]" />
                    <span className="text-xs text-[#718096] font-medium">
                              {product.analytics.conversionRate.toFixed(1)}% conversión
                    </span>
                  </div>
                        </div>
                      )}

                  {/* Price */}
                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-2xl font-bold text-[#2d3748]">
                      €{product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-[#718096] line-through">
                        €{product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Hover glow effect - Pastel */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FFC1CC] to-[#E0F7FA] rounded-3xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500 -z-10" />
              </div>
            </div>
              );
            })}
        </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12">
          <button 
            onClick={onViewAllClick}
            className="group relative px-8 py-4 bg-primary text-primary-foreground rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 hover:shadow-primary/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-2">
              <span className="font-medium">Ver toda la colección</span>
              <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xs">→</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
