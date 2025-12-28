import { Sparkles, TrendingUp } from 'lucide-react';
import { Product } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface RecommendedProductsProps {
  recentlyViewed: Product[];
  allProducts: Product[];
  onProductClick: (product: Product) => void;
}

export function RecommendedProducts({ 
  recentlyViewed, 
  allProducts, 
  onProductClick 
}: RecommendedProductsProps) {
  // Generate recommendations based on recently viewed
  const getRecommendations = () => {
    if (recentlyViewed.length === 0) {
      // If no history, return popular items
      return allProducts.slice(0, 4);
    }

    // Get categories from recently viewed
    const viewedCategories = recentlyViewed.map(p => p.category);
    
    // Filter products from same categories, excluding already viewed
    const viewedIds = recentlyViewed.map(p => p.id);
    const recommended = allProducts
      .filter(p => !viewedIds.includes(p.id))
      .filter(p => viewedCategories.includes(p.category))
      .slice(0, 4);

    // If not enough recommendations, fill with popular items
    if (recommended.length < 4) {
      const additional = allProducts
        .filter(p => !viewedIds.includes(p.id) && !recommended.includes(p))
        .slice(0, 4 - recommended.length);
      return [...recommended, ...additional];
    }

    return recommended;
  };

  const recommendations = getRecommendations();

  if (recommendations.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-[#e6dfd9]/20 via-[#fcfbf9] to-[#8da399]/20 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-white p-3 rounded-full shadow-md">
            <Sparkles className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl text-stone-900">
              {recentlyViewed.length > 0 ? 'Recomendado para ti' : 'Productos destacados'}
            </h2>
            <p className="text-sm text-stone-600">
              {recentlyViewed.length > 0 
                ? 'Basado en lo que has visto recientemente' 
                : 'Los productos más populares de esta semana'}
            </p>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {recommendations.map((product) => (
            <div 
              key={product.id} 
              onClick={() => onProductClick(product)}
              className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all"
            >
              {/* Image */}
              <div className="relative aspect-square bg-stone-50 overflow-hidden">
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                
                {/* Badge */}
                {product.badge && (
                  <span className="absolute top-3 left-3 bg-primary text-white px-2 py-1 rounded text-xs">
                    {product.badge}
                  </span>
                )}

                {/* Trending indicator */}
                {product.rating && product.rating >= 4.7 && (
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-stone-700">Popular</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-sm text-stone-900 mb-2 line-clamp-2 min-h-[2.5rem]">
                  {product.name}
                </h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg text-stone-900">€{product.price.toFixed(2)}</p>
                    {product.originalPrice && (
                      <p className="text-xs text-stone-400 line-through">
                        €{product.originalPrice.toFixed(2)}
                      </p>
                    )}
                  </div>

                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-[#dccf9d]">★</span>
                      <span className="text-stone-600">{product.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
