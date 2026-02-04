import { useState, useMemo, useEffect } from 'react';
import { X, SlidersHorizontal, Grid3x3, List, Star, Heart, ShoppingCart, Eye, TrendingUp, Sparkles, ChevronDown } from 'lucide-react';
import { Product } from '../types';
import { InfiniteProductGrid } from './InfiniteProductGrid';
import { ProductBadge } from './ProductBadge';

const BATCH_SIZE = 20;

interface CategoryPageProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onBack: () => void;
  onProductClick: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  isInWishlist: (productId: number) => boolean;
}

export function CategoryPage({ products, onAddToCart, onBack, onProductClick, onQuickView, onToggleWishlist, isInWishlist }: CategoryPageProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('ml_score');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category))).sort(), [products]);

  // Calculate price range from products
  const priceBounds = useMemo(() => {
    if (products.length === 0) return [0, 1000];
    const prices = products.map(p => p.price);
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
  }, [products]);

  // Initialize price range with actual bounds
  useEffect(() => {
    if (priceRange[1] === 1000 && priceBounds[1] !== 1000) {
      setPriceRange([priceBounds[0], priceBounds[1]]);
    }
  }, [priceBounds]);

  const filteredProducts = useMemo(() => {
    let filtered = products
      .filter(p => selectedCategories.length === 0 || selectedCategories.includes(p.category))
      .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
      .slice();

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'ml_score':
          return (b.mlScore ?? 0) - (a.mlScore ?? 0);
        case 'newest':
          return b.id - a.id;
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'conversion':
          return (b.analytics?.conversionRate ?? 0) - (a.analytics?.conversionRate ?? 0);
        default:
          return (b.mlScore ?? 0) - (a.mlScore ?? 0);
      }
    });

    return filtered;
  }, [products, selectedCategories, priceRange, sortBy]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
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
    <div className="min-h-screen bg-stone-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={onBack} className="text-stone-600 hover:text-stone-900 transition-colors">
              Inicio
            </button>
            <span className="text-stone-400">/</span>
            <span className="text-stone-900 font-medium">Productos por categoría</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-background to-secondary/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full text-xs text-stone-600 mb-4 border border-stone-200">
                <Sparkles className="h-3 w-3 text-[#dccf9d]" />
                {filteredProducts.length} productos
              </div>
              <h1 className="text-4xl sm:text-5xl text-stone-900 mb-3">
                Catálogo de productos
              </h1>
              <p className="text-lg text-stone-600 max-w-2xl">
                Descubre nuestra selección con stock actualizado y precios calculados automáticamente
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
                <span className="bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
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
                <option value="ml_score">Destacados (ML Score)</option>
                <option value="conversion">Mejor conversión</option>
                <option value="newest">Más nuevos</option>
                <option value="price-low">Precio: Menor a mayor</option>
                <option value="price-high">Precio: Mayor a menor</option>
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
                        className="w-5 h-5 rounded border-stone-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-stone-700 group-hover:text-stone-900">
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
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-stone-600 mb-2">
                      <span>€{priceRange[0]}</span>
                      <span>€{priceRange[1]}</span>
                    </div>
                    <input
                      type="range"
                      min={priceBounds[0]}
                      max={priceBounds[1]}
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="w-full accent-primary"
                    />
                  <input
                    type="range"
                      min={priceBounds[0]}
                      max={priceBounds[1]}
                    value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full accent-primary"
                  />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={priceBounds[0]}
                      max={priceBounds[1]}
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      min={priceBounds[0]}
                      max={priceBounds[1]}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || priceBounds[1]])}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div className="bg-white rounded-2xl p-6 border border-stone-200">
                <h3 className="text-lg font-medium text-stone-900 mb-4">Valoración</h3>
                <div className="space-y-3">
                  {[5, 4, 3].map((rating) => (
                    <label key={rating} className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="w-5 h-5 rounded border-stone-300 text-primary focus:ring-primary" />
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < rating ? 'fill-[#dccf9d] text-[#dccf9d]' : 'text-stone-300'}`}
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
            <InfiniteProductGrid
              initialProducts={filteredProducts.slice(0, BATCH_SIZE)}
              onAddToCart={onAddToCart}
              onProductClick={onProductClick}
              onQuickView={onQuickView}
              onToggleWishlist={onToggleWishlist}
              isInWishlist={isInWishlist}
              filters={{
                minPrice: priceRange[0],
                maxPrice: priceRange[1],
                category: selectedCategories.length === 1 ? selectedCategories[0] : undefined,
              }}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
