import { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Eye, Star, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { fetchFeaturedProducts } from '@/utils/bigbuy/catalog';
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
    fetchFeaturedProducts(8, 50)
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
    if (mlScore >= 50) return 'from-[#8da399] to-[#7a8f85]'; // Trending
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
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-secondary rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-primary rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-secondary/20 to-accent/20 px-4 py-2 rounded-full mb-6 border border-secondary/30">
            <Star className="h-4 w-4 text-secondary fill-secondary" />
            <span className="text-sm text-foreground">Productos destacados</span>
          </div>
          <h2 className="text-4xl sm:text-5xl text-foreground mb-4 font-medium">
            Los favoritos de nuestros clientes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Productos premium cuidadosamente seleccionados para el bienestar de tu bebé
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border animate-pulse">
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
          <div className="text-center py-12 text-muted-foreground">
            No hay productos destacados disponibles
          </div>
        ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
              {/* Product Card */}
                  <div className="relative bg-card rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border border-border cursor-pointer">
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

                  {/* Badge */}
                      {badgeText && (
                        <div className={`absolute top-4 left-4 px-3 py-1 bg-gradient-to-r ${getBadgeColor(product.mlScore)} text-white text-xs rounded-full flex items-center gap-1 shadow-lg`}>
                          {getBadgeIcon(product.mlScore)}
                          <span>{badgeText}</span>
                    </div>
                  )}

                  {/* Discount badge */}
                  {product.originalPrice && (
                    <div className="absolute top-4 right-4 w-14 h-14 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-lg transform rotate-12 border-2 border-background">
                      <div className="text-center leading-tight">
                        <div className="text-xs">-{Math.round((1 - product.price / product.originalPrice) * 100)}%</div>
                        <div className="text-[10px]">OFF</div>
                      </div>
                    </div>
                  )}

                  {/* Quick actions */}
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
                      className="flex-1 bg-background/95 backdrop-blur-sm hover:bg-primary text-foreground hover:text-primary-foreground px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl group/btn border border-border/50"
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
                      className={`bg-background/95 backdrop-blur-sm hover:bg-secondary text-foreground hover:text-secondary-foreground p-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl group/heart border border-border/50 ${
                        isInWishlist && isInWishlist(product.id) ? 'bg-red-50 hover:bg-red-100' : ''
                      }`}
                    >
                      <Heart className={`h-4 w-4 transition-transform group-hover/heart:scale-110 ${
                        isInWishlist && isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''
                      }`} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onProductClick) {
                          onProductClick(product);
                        }
                      }}
                      className="bg-background/95 backdrop-blur-sm hover:bg-accent text-foreground hover:text-accent-foreground p-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl group/eye border border-border/50"
                    >
                      <Eye className="h-4 w-4 transition-transform group-hover/eye:scale-110" />
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5 space-y-3">
                  {/* Category */}
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    {product.category}
                  </div>

                  {/* Name */}
                  <h3 className="text-base text-foreground line-clamp-2 min-h-[3rem] group-hover:text-primary transition-colors duration-300 font-medium">
                    {product.name}
                  </h3>

                      {/* Rating - Show conversion rate if available */}
                      {product.analytics && product.analytics.conversionRate > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-muted-foreground">
                              {product.analytics.conversionRate.toFixed(1)}% conversión
                    </span>
                  </div>
                        </div>
                      )}

                  {/* Price */}
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-2xl text-foreground font-light">
                      €{product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        €{product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Hover glow effect */}
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${getBadgeColor(product.mlScore)} rounded-2xl opacity-0 group-hover:opacity-10 blur transition-opacity duration-500 -z-10`} />
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
