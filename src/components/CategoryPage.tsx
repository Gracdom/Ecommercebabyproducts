import { useState } from 'react';
import { X, SlidersHorizontal, Grid3x3, List, Star, Heart, ShoppingCart, Eye, TrendingUp, Sparkles, ChevronDown } from 'lucide-react';
import { Product } from '../types';

interface CategoryPageProps {
  onAddToCart: (product: Product) => void;
  onBack: () => void;
  onProductClick: () => void;
  onQuickView: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  isInWishlist: (productId: number) => boolean;
}

const products: Product[] = [
  {
    id: 1,
    name: 'Libro sensorial Animals laurel green',
    price: 19.95,
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80',
    badge: 'Nuevo',
    category: 'toys',
    rating: 4.9,
    reviews: 234,
    tag: 'new',
  },
  {
    id: 2,
    name: 'Cubo de actividades premium',
    price: 29.95,
    originalPrice: 39.95,
    image: 'https://images.unsplash.com/photo-1519689373023-dd07c7988603?w=600&q=80',
    category: 'toys',
    rating: 4.8,
    reviews: 189,
    badge: 'Oferta',
    tag: 'hot',
  },
  {
    id: 3,
    name: 'Espiral de actividades orgánico',
    price: 24.95,
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80',
    badge: 'Best Seller',
    category: 'toys',
    rating: 4.9,
    reviews: 342,
    tag: 'trending',
  },
  {
    id: 4,
    name: 'Manta de apego suave',
    price: 19.95,
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80',
    category: 'textiles',
    rating: 4.7,
    reviews: 156,
  },
  {
    id: 5,
    name: 'Torre de apilamiento madera',
    price: 34.95,
    image: 'https://images.unsplash.com/photo-1519689373023-dd07c7988603?w=600&q=80',
    category: 'toys',
    rating: 4.8,
    reviews: 198,
  },
  {
    id: 6,
    name: 'Caja musical Elephant',
    price: 39.95,
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80',
    category: 'toys',
    rating: 4.9,
    reviews: 267,
  },
  {
    id: 7,
    name: 'Alfombra de actividades XXL',
    price: 89.95,
    originalPrice: 119.95,
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80',
    badge: 'Premium',
    category: 'toys',
    rating: 5.0,
    reviews: 412,
    tag: 'hot',
  },
  {
    id: 8,
    name: 'Set bloques puzzle pastel',
    price: 24.95,
    image: 'https://images.unsplash.com/photo-1519689373023-dd07c7988603?w=600&q=80',
    category: 'toys',
    rating: 4.6,
    reviews: 123,
  },
];

export function CategoryPage({ onAddToCart, onBack, onProductClick, onQuickView, onToggleWishlist, isInWishlist }: CategoryPageProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const categories = ['toys', 'textiles', 'clothing', 'accessories'];

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const getBadgeColor = (tag?: string) => {
    switch (tag) {
      case 'hot': return 'from-rose-500 to-pink-500';
      case 'new': return 'from-blue-500 to-cyan-500';
      case 'trending': return 'from-purple-500 to-indigo-500';
      default: return 'from-amber-500 to-orange-500';
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={onBack} className="text-stone-600 hover:text-stone-900 transition-colors">
              Inicio
            </button>
            <span className="text-stone-400">/</span>
            <span className="text-stone-900 font-medium">Juguetes & Accesorios</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-stone-50 to-rose-50/30 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full text-xs text-stone-600 mb-4 border border-stone-200">
                <Sparkles className="h-3 w-3 text-amber-500" />
                147 productos
              </div>
              <h1 className="text-4xl sm:text-5xl text-stone-900 mb-3">
                Juguetes & Accesorios
              </h1>
              <p className="text-lg text-stone-600 max-w-2xl">
                Descubre nuestra colección de juguetes orgánicos y accesorios premium diseñados para el desarrollo de tu bebé
              </p>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Filter Button */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-300 rounded-xl hover:border-stone-400 transition-all"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="text-sm font-medium">Filtros</span>
              {selectedCategories.length > 0 && (
                <span className="bg-rose-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {selectedCategories.length}
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-stone-300 rounded-xl hover:border-stone-400 transition-all text-sm font-medium cursor-pointer"
              >
                <option value="featured">Destacados</option>
                <option value="newest">Más nuevos</option>
                <option value="price-low">Precio: Menor a mayor</option>
                <option value="price-high">Precio: Mayor a menor</option>
                <option value="rating">Mejor valorados</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-600 pointer-events-none" />
            </div>

            {/* View Mode */}
            <div className="ml-auto flex items-center gap-2 bg-white border border-stone-300 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`${isFilterOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
            <div className="sticky top-24 space-y-6">
              {/* Categories */}
              <div className="bg-white rounded-2xl p-6 border border-stone-200">
                <h3 className="text-lg font-medium text-stone-900 mb-4">Categorías</h3>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="w-5 h-5 rounded border-stone-300 text-rose-500 focus:ring-rose-500"
                      />
                      <span className="text-sm text-stone-700 group-hover:text-stone-900 capitalize">
                        {category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="bg-white rounded-2xl p-6 border border-stone-200">
                <h3 className="text-lg font-medium text-stone-900 mb-4">Rango de precio</h3>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full accent-rose-500"
                  />
                  <div className="flex items-center justify-between text-sm text-stone-600">
                    <span>€0</span>
                    <span>€{priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="bg-white rounded-2xl p-6 border border-stone-200">
                <h3 className="text-lg font-medium text-stone-900 mb-4">Valoración</h3>
                <div className="space-y-3">
                  {[5, 4, 3].map((rating) => (
                    <label key={rating} className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="w-5 h-5 rounded border-stone-300 text-rose-500 focus:ring-rose-500" />
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-stone-600">y más</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            <div className={viewMode === 'grid' 
              ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-6'
            }>
              {products.map((product) => (
                <div
                  key={product.id}
                  className={`group bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-stone-300 transition-all duration-300 hover:shadow-xl ${
                    viewMode === 'list' ? 'flex gap-6' : ''
                  }`}
                  onMouseEnter={() => setHoveredId(product.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Image */}
                  <div className={`relative bg-stone-50 overflow-hidden ${
                    viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-square'
                  }`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className={`w-full h-full object-cover transition-all duration-700 ${
                        hoveredId === product.id ? 'scale-110' : 'scale-100'
                      }`}
                    />

                    {/* Badge */}
                    {product.badge && (
                      <div className={`absolute top-4 left-4 px-3 py-1 bg-gradient-to-r ${getBadgeColor(product.tag)} text-white text-xs rounded-full shadow-lg`}>
                        {product.badge}
                      </div>
                    )}

                    {/* Discount */}
                    {product.originalPrice && (
                      <div className="absolute top-4 right-4 w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg">
                        <div className="text-center leading-tight">
                          <div className="text-xs font-medium">-{Math.round((1 - product.price / product.originalPrice) * 100)}%</div>
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className={`absolute inset-x-4 bottom-4 flex gap-2 transition-all duration-300 ${
                      hoveredId === product.id ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                    }`}>
                      <button
                        onClick={() => onAddToCart(product)}
                        className="flex-1 bg-stone-900 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg group/btn"
                      >
                        <ShoppingCart className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
                        <span className="text-sm font-medium">Añadir</span>
                      </button>
                      <button
                        onClick={() => onToggleWishlist(product)}
                        className={`p-2.5 rounded-xl transition-all duration-300 shadow-lg ${
                          isInWishlist(product.id)
                            ? 'bg-rose-500 text-white'
                            : 'bg-white/95 backdrop-blur-sm text-stone-900 hover:bg-rose-500 hover:text-white'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-white' : ''}`} />
                      </button>
                      <button
                        onClick={() => onQuickView(product)}
                        className="bg-white/95 backdrop-blur-sm hover:bg-blue-500 text-stone-900 hover:text-white p-2.5 rounded-xl transition-all duration-300 shadow-lg"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className={`p-5 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-center' : ''}`}>
                    <div className="text-xs text-stone-500 uppercase tracking-wider mb-2">
                      {product.category}
                    </div>
                    
                    <h3 
                      onClick={onProductClick}
                      className="text-base text-stone-900 mb-3 line-clamp-2 cursor-pointer hover:text-rose-600 transition-colors"
                    >
                      {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < Math.floor(product.rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-stone-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-stone-600">
                        {product.rating} ({product.reviews})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="text-2xl text-stone-900 font-medium">
                        €{product.price.toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-stone-400 line-through">
                          €{product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {viewMode === 'list' && (
                      <button
                        onClick={() => onAddToCart(product)}
                        className="mt-4 w-full sm:w-auto px-6 py-2.5 bg-stone-900 hover:bg-rose-600 text-white rounded-xl transition-all duration-300"
                      >
                        Añadir al carrito
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <button className="px-8 py-4 border-2 border-stone-900 text-stone-900 rounded-xl hover:bg-stone-900 hover:text-white transition-all duration-300 hover:scale-105">
                Cargar más productos
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
