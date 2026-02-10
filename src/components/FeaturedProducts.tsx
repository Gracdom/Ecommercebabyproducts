import { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Star, Zap, TrendingUp, Sparkles } from 'lucide-react';
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
    fetchFeaturedProducts(12)
      .then((fetchedProducts) => {
        setProducts(fetchedProducts);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading featured products:', err);
        setLoading(false);
      });
  }, []);

  // Dividir productos en 2 filas
  const midPoint = Math.ceil(products.length / 2);
  const productsRow1 = products.slice(0, midPoint);
  const productsRow2 = products.slice(midPoint);

  const getBadgeColor = (mlScore?: number) => {
    if (!mlScore) return 'bg-[#83b5b6]';
    if (mlScore >= 70) return 'bg-gradient-to-r from-[#e08e8e] to-[#dcbaba]';
    if (mlScore >= 50) return 'bg-[#83b5b6]';
    return 'bg-[#a09085]';
  };

  const getBadgeIcon = (mlScore?: number) => {
    if (!mlScore) return <Star className="h-3 w-3" />;
    if (mlScore >= 70) return <Zap className="h-3 w-3" />;
    if (mlScore >= 50) return <TrendingUp className="h-3 w-3" />;
    return <Sparkles className="h-3 w-3" />;
  };

  const getBadgeText = (mlScore?: number) => {
    if (!mlScore) return 'Destacado';
    if (mlScore >= 70) return 'Hot';
    if (mlScore >= 50) return 'Popular';
    return 'Nuevo';
  };

  // Componente de tarjeta de producto premium
  const ProductCard = ({ product }: { product: Product }) => (
    <div
      className="group relative flex-shrink-0 w-[280px] sm:w-[320px]"
      onMouseEnter={() => setHoveredId(product.id)}
      onMouseLeave={() => setHoveredId(null)}
      onClick={() => onProductClick?.(product)}
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              hoveredId === product.id ? 'scale-105' : 'scale-100'
            }`}
          />

          {/* Badge Superior Izquierdo */}
          <div className={`absolute top-3 left-3 px-3 py-1.5 ${getBadgeColor(product.mlScore)} text-white text-xs font-semibold rounded-full flex items-center gap-1 shadow-lg`}>
            {getBadgeIcon(product.mlScore)}
            <span>{getBadgeText(product.mlScore)}</span>
          </div>

          {/* Discount Badge */}
          {product.originalPrice && (
            <div className="absolute top-3 right-3 bg-[#FFC1CC] text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
              -{Math.round((1 - product.price / product.originalPrice) * 100)}%
            </div>
          )}

          {/* Wishlist Button - Flotante */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist?.(product);
            }}
            className={`absolute bottom-3 right-3 w-10 h-10 rounded-full transition-all duration-300 shadow-lg flex items-center justify-center ${
              isInWishlist?.(product.id)
                ? 'bg-[#FFC1CC]'
                : 'bg-white/90 backdrop-blur-sm'
            }`}
          >
            <Heart
              className={`h-4 w-4 ${
                isInWishlist?.(product.id)
                  ? 'fill-white text-white'
                  : 'text-[#FF6B9D]'
              }`}
            />
          </button>

          {/* Botón de Añadir - Aparece en hover */}
          <div className={`absolute bottom-3 left-3 right-16 transition-all duration-300 ${
            hoveredId === product.id ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
          }`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart?.(product);
              }}
              className="w-full bg-[#83b5b6] hover:bg-[#6fa3a5] text-white py-2.5 rounded-full transition-all duration-300 flex items-center justify-center gap-2 shadow-lg font-semibold text-sm"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Añadir</span>
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Estrellas */}
          <div className="flex items-center gap-0.5 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-[#FBBF24] text-[#FBBF24]" />
            ))}
          </div>

          {/* Categoría */}
          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1">
            {product.category}
          </div>

          {/* Título */}
          <h3 className="text-sm font-bold text-[#2d3748] line-clamp-2 mb-3 flex-1">
            {product.name}
          </h3>

          {/* Precio */}
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-[#83b5b6]">
              €{product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                €{product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#FFC1CC] rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#E0F7FA] rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FFC1CC]/30 via-[#E0F7FA]/30 to-[#FFF9C4]/30 px-5 py-2.5 rounded-full mb-5 border-2 border-[#FFC1CC]/40 shadow-sm">
            <Star className="h-4 w-4 text-[#FF6B9D] fill-[#FF6B9D]" />
            <span className="text-xs font-semibold text-[#2d3748]">Productos destacados</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl mb-4 font-bold" style={{ color: '#83b5b6' }}>
            Los favoritos de nuestros clientes
          </h2>
          <p className="text-sm sm:text-base text-[#718096] max-w-2xl mx-auto">
            Productos premium cuidadosamente seleccionados para el bienestar de tu bebé
          </p>
        </div>

        {/* Carruseles */}
        {loading ? (
          <div className="space-y-6">
            {[...Array(2)].map((_, rowIdx) => (
              <div key={rowIdx} className="flex gap-6 overflow-hidden">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-[280px] sm:w-[320px] bg-white rounded-2xl overflow-hidden border border-[#E2E8F0] animate-pulse">
                    <div className="aspect-square bg-muted" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 bg-muted rounded w-2/3" />
                      <div className="h-4 bg-muted rounded w-1/4" />
                      <div className="h-5 bg-muted rounded w-full" />
                      <div className="h-6 bg-muted rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-[#718096]">
            No hay productos destacados disponibles
          </div>
        ) : (
          <div className="space-y-6">
            {/* Carrusel 1 */}
            <div className="relative px-2">
              <div 
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
                style={{ 
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {productsRow1.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>

            {/* Carrusel 2 */}
            <div className="relative px-2">
              <div 
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
                style={{ 
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {productsRow2.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-10">
          <button 
            onClick={onViewAllClick}
            className="group relative px-8 py-4 bg-[#83b5b6] text-white rounded-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 font-semibold"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-2">
              <span>Ver toda la colección</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
