import { useState, useMemo, useEffect } from 'react';
import { SlidersHorizontal, Grid3x3, List, Star, ChevronDown, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { ProductGrid } from './ProductGrid';
import type { CategoryInfo } from '@/utils/ebaby/catalog';
import { fetchCatalogProducts, fetchProductsByCategory } from '@/utils/ebaby/catalog';

interface CategoryPageProps {
  products: Product[];
  /** Categorías del catálogo (desde fetchCategories) para rellenar filtros aunque products esté vacío */
  categoryOptions?: CategoryInfo[] | null;
  selectedCategory?: string | null;
  selectedSubCategory?: string | null;
  onAddToCart: (product: Product) => void;
  onBack: () => void;
  onProductClick: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  isInWishlist: (productId: number) => boolean;
}

export function CategoryPage({ products, categoryOptions, selectedCategory, selectedSubCategory, onAddToCart, onBack, onProductClick, onQuickView, onToggleWishlist, isInWishlist }: CategoryPageProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('ml_score');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [subcategoriesOpen, setSubcategoriesOpen] = useState(false);
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Si App no pasa productos, cargar directamente desde ebaby_productos
  useEffect(() => {
    if (products.length > 0) {
      setLocalProducts([]);
      setLocalLoading(false);
      setLoadError(null);
      return;
    }
    let cancelled = false;
    setLocalLoading(true);
    setLoadError(null);
    const sub = selectedSubCategory && selectedSubCategory !== 'null' ? selectedSubCategory : undefined;
    const load = selectedCategory
      ? fetchProductsByCategory(selectedCategory, sub)
      : fetchCatalogProducts();
    load
      .then((list) => {
        if (!cancelled) {
          setLocalProducts(Array.isArray(list) ? list : []);
          setLoadError(null);
        }
      })
      .catch((err) => {
        console.error('[CategoryPage] Error cargando ebaby_productos:', err);
        if (!cancelled) {
          setLocalProducts([]);
          setLoadError(err?.message || err?.error_description || String(err));
        }
      })
      .finally(() => {
        if (!cancelled) setLocalLoading(false);
      });
    return () => { cancelled = true; };
  }, [products.length, selectedCategory, selectedSubCategory]);

  const productsToUse = products.length > 0 ? products : localProducts;

  // Categorías: usar catálogo si está disponible, si no derivar de products
  const categories = useMemo(() => {
    if (categoryOptions?.length) {
      return categoryOptions.map(c => c.name).sort();
    }
    return Array.from(new Set(productsToUse.map(p => p.category).filter(Boolean))).sort();
  }, [categoryOptions, productsToUse]);

  // Subcategorías: usar catálogo si está disponible, si no derivar de products
  const subcategories = useMemo(() => {
    if (categoryOptions?.length) {
      const names = categoryOptions.flatMap(c => (c.subcategories ?? []).map(s => s.name));
      return Array.from(new Set(names)).sort();
    }
    return Array.from(new Set(productsToUse.map(p => p.subCategory).filter((s): s is string => Boolean(s)))).sort();
  }, [categoryOptions, productsToUse]);

  const brands = useMemo(() =>
    Array.from(new Set(productsToUse.map(p => p.brand).filter((b): b is string => Boolean(b)))).sort(),
    [productsToUse]
  );

  // Calculate price range from products (evitar NaN que filtraría todo)
  const priceBounds = useMemo(() => {
    if (productsToUse.length === 0) return [0, 1000];
    const prices = productsToUse.map(p => Number(p.price)).filter(n => !isNaN(n) && isFinite(n));
    if (prices.length === 0) return [0, 1000];
    const min = Math.floor(Math.min(...prices));
    const max = Math.ceil(Math.max(...prices));
    return isFinite(min) && isFinite(max) ? [min, max] : [0, 1000];
  }, [productsToUse]);

  // Initialize price range with actual bounds
  useEffect(() => {
    if (priceRange[1] === 1000 && priceBounds[1] !== 1000) {
      setPriceRange([priceBounds[0], priceBounds[1]]);
    }
  }, [priceBounds]);

  const filteredProducts = useMemo(() => {
    let filtered = productsToUse
      .filter(p => selectedCategories.length === 0 || selectedCategories.includes(p.category))
      .filter(p => selectedSubCategories.length === 0 || (p.subCategory && selectedSubCategories.includes(p.subCategory)))
      .filter(p => selectedBrands.length === 0 || (p.brand && selectedBrands.includes(p.brand)))
      .filter(p => {
        const price = Number(p.price);
        if (isNaN(price)) return true;
        return price >= priceRange[0] && price <= priceRange[1];
      })
      .filter(p => minRating == null || (p.rating ?? 0) >= minRating)
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
  }, [productsToUse, selectedCategories, selectedSubCategories, selectedBrands, priceRange, minRating, sortBy]);

  const activeFilterCount = selectedCategories.length + selectedSubCategories.length + selectedBrands.length + (minRating != null ? 1 : 0);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };
  const toggleSubCategory = (sub: string) => {
    setSelectedSubCategories(prev =>
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };
  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };
  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedSubCategories([]);
    setSelectedBrands([]);
    setMinRating(null);
    setPriceRange(priceBounds);
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm flex-wrap">
            <button onClick={onBack} className="text-stone-600 hover:text-stone-900 active:opacity-80 transition-colors py-1 min-h-[44px] flex items-center -ml-2 pl-2 pr-1">
              Inicio
            </button>
            <span className="text-stone-400">/</span>
            {selectedCategory && (
              <>
                <span className="text-stone-900 font-medium">{selectedCategory}</span>
                {selectedSubCategory && (
                  <>
                    <span className="text-stone-400">/</span>
                    <span className="text-stone-900 font-medium">{selectedSubCategory}</span>
                  </>
                )}
              </>
            )}
            {!selectedCategory && (
              <span className="text-stone-900 font-medium">Todos los productos</span>
            )}
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-background to-secondary/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-full text-xs text-stone-600 mb-3 sm:mb-4 border border-stone-200">
                <Sparkles className="h-3 w-3 text-[#dccf9d] flex-shrink-0" />
                <span>{filteredProducts.length} productos</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl text-stone-900 mb-2 sm:mb-3">
                Catálogo de productos
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-stone-600 max-w-2xl">
                Descubre nuestra selección con stock actualizado y precios calculados automáticamente
              </p>
            </div>
          </div>

          {/* Toolbar - touch-friendly buttons */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Filter Button */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-3 sm:py-2.5 min-h-[44px] bg-white border border-stone-300 rounded-xl hover:border-stone-400 active:bg-stone-50 transition-all"
            >
              <SlidersHorizontal className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm font-medium">Filtros</span>
              {activeFilterCount > 0 && (
                <span className="bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 sm:py-2.5 min-h-[44px] bg-white border border-stone-300 rounded-xl hover:border-stone-400 transition-all text-sm font-medium cursor-pointer w-full min-w-[180px]"
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
            <div className="flex items-center gap-1 bg-white border border-stone-300 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 sm:p-2 min-h-[44px] min-w-[44px] rounded-lg transition-all flex items-center justify-center ${
                  viewMode === 'grid' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Vista cuadrícula"
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 sm:p-2 min-h-[44px] min-w-[44px] rounded-lg transition-all flex items-center justify-center ${
                  viewMode === 'list' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Vista lista"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar Filters - full width on mobile when open, drawer-like */}
          <aside className={`${isFilterOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
            <div className="lg:sticky lg:top-24 space-y-6 max-h-[85vh] overflow-y-auto lg:max-h-none pr-2 -mx-4 px-4 lg:mx-0 lg:px-0 bg-stone-50/50 lg:bg-transparent rounded-xl lg:rounded-none py-4 lg:py-0">
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="w-full py-2.5 text-sm font-medium text-primary hover:underline"
                >
                  Limpiar filtros
                </button>
              )}

              {/* Categorías */}
              <div className="bg-white rounded-2xl p-6 border border-stone-200">
                <h3 className="text-lg font-medium text-stone-900 mb-4">Categorías</h3>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="w-5 h-5 rounded border-stone-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-stone-700 group-hover:text-stone-900">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Subcategorías (cerrado por defecto, el usuario lo despliega) */}
              {subcategories.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-stone-200">
                  <button
                    type="button"
                    onClick={() => setSubcategoriesOpen((prev) => !prev)}
                    className="flex w-full items-center justify-between text-left"
                    aria-expanded={subcategoriesOpen}
                  >
                    <h3 className="text-lg font-medium text-stone-900">Subcategorías</h3>
                    <ChevronDown
                      className={`h-5 w-5 text-stone-500 transition-transform ${subcategoriesOpen ? '' : '-rotate-90'}`}
                    />
                  </button>
                  {subcategoriesOpen && (
                    <div className="mt-4 space-y-3 max-h-48 overflow-y-auto">
                      {subcategories.map((sub) => (
                        <label key={sub} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedSubCategories.includes(sub)}
                            onChange={() => toggleSubCategory(sub)}
                            className="w-5 h-5 rounded border-stone-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-stone-700 group-hover:text-stone-900">{sub}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Marca */}
              {brands.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-stone-200">
                  <h3 className="text-lg font-medium text-stone-900 mb-4">Marca</h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {brands.map((brand) => (
                      <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="w-5 h-5 rounded border-stone-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-stone-700 group-hover:text-stone-900">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Rango de precio */}
              <div className="bg-white rounded-2xl p-6 border border-stone-200">
                <h3 className="text-lg font-medium text-stone-900 mb-4">Rango de precio</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-stone-600 mb-2">
                      <span>€{priceRange[0].toFixed(2)}</span>
                      <span>€{priceRange[1].toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={priceBounds[0]}
                      max={priceBounds[1]}
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full accent-primary"
                    />
                    <input
                      type="range"
                      min={priceBounds[0]}
                      max={priceBounds[1]}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full accent-primary"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={priceBounds[0]}
                      max={priceBounds[1]}
                      step={0.01}
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                      placeholder="Mín"
                    />
                    <input
                      type="number"
                      min={priceBounds[0]}
                      max={priceBounds[1]}
                      step={0.01}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || priceBounds[1]])}
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm"
                      placeholder="Máx"
                    />
                  </div>
                </div>
              </div>

              {/* Valoración */}
              <div className="bg-white rounded-2xl p-6 border border-stone-200">
                <h3 className="text-lg font-medium text-stone-900 mb-4">Valoración</h3>
                <div className="space-y-3">
                  {[5, 4, 3].map((rating) => (
                    <label key={rating} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="minRating"
                        checked={minRating === rating}
                        onChange={() => setMinRating(prev => (prev === rating ? null : rating))}
                        className="w-5 h-5 rounded border-stone-300 text-primary focus:ring-primary"
                      />
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
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="minRating"
                      checked={minRating === null}
                      onChange={() => setMinRating(null)}
                      className="w-5 h-5 rounded border-stone-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-stone-600">Cualquier valoración</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* ProductGrid: todos los productos filtrados sin paginación */}
          <main className="flex-1">
            {productsToUse.length === 0 && localLoading ? (
              <div className="flex flex-col items-center justify-center py-24 text-stone-600">
                <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-lg font-medium">Cargando productos desde catálogo...</p>
                <p className="text-sm mt-1">Tabla: ebaby_productos</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-stone-600 max-w-md px-4 text-center">
                <p className="text-lg font-medium">No se encontraron productos</p>
                <p className="text-sm mt-1">
                  {productsToUse.length === 0
                    ? 'Comprueba la conexión y que la tabla ebaby_productos tenga datos.'
                    : 'Prueba a cambiar o limpiar los filtros.'}
                </p>
                {loadError && (
                  <p className="text-xs mt-3 text-red-600 font-mono bg-red-50 px-2 py-1 rounded">
                    Error: {loadError}
                  </p>
                )}
                {productsToUse.length === 0 && !loadError && (
                  <p className="text-xs mt-2 text-stone-500">Abre la consola del navegador (F12) para más detalles.</p>
                )}
              </div>
            ) : (
              <ProductGrid
                products={filteredProducts}
                onAddToCart={onAddToCart}
                onProductClick={onProductClick}
                onQuickView={onQuickView}
                onToggleWishlist={onToggleWishlist}
                isInWishlist={isInWishlist}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
