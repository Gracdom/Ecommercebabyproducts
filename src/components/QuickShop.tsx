import { useState } from 'react';
import { Heart, ShoppingCart, Star, Zap, TrendingUp, Clock, Flame } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const products = [
  {
    id: 1,
    name: 'Set regalo premium recién nacido',
    price: 89.95,
    originalPrice: 129.95,
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&q=80',
    badge: 'Oferta Flash',
    rating: 4.9,
    reviews: 342,
    tag: 'hot',
    timeLeft: '2h 34m',
  },
  {
    id: 2,
    name: 'Manta muselina orgánica XL',
    price: 49.95,
    image: 'https://images.unsplash.com/photo-1519689373023-dd07c7988603?w=500&q=80',
    badge: 'Más vendido',
    rating: 4.8,
    reviews: 256,
    tag: 'trending',
  },
  {
    id: 3,
    name: 'Juguete sensorial Montessori',
    price: 34.95,
    originalPrice: 44.95,
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&q=80',
    badge: 'Nuevo',
    rating: 4.9,
    reviews: 189,
    tag: 'new',
  },
  {
    id: 4,
    name: 'Body set algodón (5 pack)',
    price: 59.95,
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&q=80',
    badge: 'Recomendado',
    rating: 4.7,
    reviews: 423,
  },
];

export function QuickShop() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const getBadgeIcon = (tag?: string) => {
    switch (tag) {
      case 'hot': return <Flame className="h-3 w-3" />;
      case 'new': return <Zap className="h-3 w-3" />;
      case 'trending': return <TrendingUp className="h-3 w-3" />;
      default: return <Star className="h-3 w-3" />;
    }
  };

  const getBadgeColor = (tag?: string) => {
    switch (tag) {
      case 'hot': return 'from-destructive to-accent';
      case 'new': return 'from-primary to-[#7a8f85]';
      case 'trending': return 'from-secondary to-[#d6ccc2]';
      default: return 'from-stone-500 to-stone-600';
    }
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group relative"
              onMouseEnter={() => setHoveredId(product.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Product Card */}
              <div className="relative bg-white rounded-2xl overflow-hidden border-2 border-stone-200 hover:border-stone-300 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
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
                  <div className={`absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r ${getBadgeColor(product.tag)} text-white text-xs font-medium rounded-full flex items-center gap-1 shadow-lg`}>
                    {getBadgeIcon(product.tag)}
                    <span>{product.badge}</span>
                  </div>

                  {/* Discount */}
                  {product.originalPrice && (
                    <div className="absolute top-4 right-4 w-14 h-14 bg-gradient-to-br from-destructive to-accent text-white rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <div className="text-center leading-tight">
                        <div className="text-sm font-bold">-{Math.round((1 - product.price / product.originalPrice) * 100)}%</div>
                      </div>
                    </div>
                  )}

                  {/* Timer for flash sale */}
                  {product.timeLeft && (
                    <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2">
                      <Clock className="h-4 w-4 text-accent" />
                      <span className="text-xs font-medium">Termina en {product.timeLeft}</span>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className={`absolute inset-x-4 ${product.timeLeft ? 'bottom-16' : 'bottom-4'} flex gap-2 transition-all duration-300 ${
                    hoveredId === product.id ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                  }`}>
                    <button className="flex-1 bg-white/95 backdrop-blur-sm hover:bg-stone-900 text-stone-900 hover:text-white px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg group/btn">
                      <ShoppingCart className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
                      <span className="text-sm font-medium">Añadir</span>
                    </button>
                    <button className="bg-white/95 backdrop-blur-sm hover:bg-accent text-stone-900 hover:text-white p-2.5 rounded-xl transition-all duration-300 shadow-lg group/heart">
                      <Heart className="h-4 w-4 transition-transform group-hover/heart:scale-110" />
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
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${getBadgeColor(product.tag)} rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500 -z-10`} />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-stone-600 mb-4">¿No encuentras lo que buscas?</p>
          <button className="px-8 py-4 border-2 border-stone-900 text-stone-900 rounded-xl hover:bg-stone-900 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-xl">
            Explorar todos los productos
          </button>
        </div>
      </div>
    </section>
  );
}
