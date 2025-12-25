import { useState } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { Slider } from './ui/slider';

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  onSortChange: (sort: SortOption) => void;
}

export interface FilterState {
  priceRange: [number, number];
  ageRange: string[];
  colors: string[];
  brands: string[];
  rating: number;
  inStock: boolean;
}

export type SortOption = 
  | 'popularity' 
  | 'price-low' 
  | 'price-high' 
  | 'newest' 
  | 'rating';

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Más populares' },
  { value: 'newest', label: 'Novedades' },
  { value: 'price-low', label: 'Precio: bajo a alto' },
  { value: 'price-high', label: 'Precio: alto a bajo' },
  { value: 'rating', label: 'Mejor valorados' },
] as const;

const AGE_RANGES = [
  '0-3 meses',
  '3-6 meses',
  '6-12 meses',
  '1-2 años',
  '2-3 años',
  '3+ años',
];

const COLORS = [
  { name: 'Beige', color: '#F5F5DC' },
  { name: 'Rosa', color: '#FFB6C1' },
  { name: 'Azul', color: '#ADD8E6' },
  { name: 'Verde', color: '#90EE90' },
  { name: 'Gris', color: '#D3D3D3' },
  { name: 'Blanco', color: '#FFFFFF' },
];

const BRANDS = [
  "Baby's Only",
  'Little Dutch',
  'Mushie',
  'Liewood',
  'Konges Sløjd',
];

export function AdvancedFilters({ onFilterChange, onSortChange }: AdvancedFiltersProps) {
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 100],
    ageRange: [],
    colors: [],
    brands: [],
    rating: 0,
    inStock: false,
  });

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    onSortChange(value);
  };

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleArrayFilter = (key: 'ageRange' | 'colors' | 'brands', value: string) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  return (
    <div>
      {/* Sort & Filter Bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <span className="text-sm text-stone-600">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
            className="px-4 py-2 bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-300 text-sm"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="lg:hidden flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
        </button>
      </div>

      {/* Filters Sidebar (Desktop) / Drawer (Mobile) */}
      <div className={`
        ${showMobileFilters ? 'fixed inset-0 z-50 bg-white overflow-y-auto p-6' : 'hidden'}
        lg:block lg:static lg:z-auto
      `}>
        {/* Mobile header */}
        {showMobileFilters && (
          <div className="flex items-center justify-between mb-6 pb-4 border-b">
            <h2 className="text-xl text-stone-900">Filtros</h2>
            <button
              onClick={() => setShowMobileFilters(false)}
              className="text-stone-600 hover:text-stone-900"
            >
              Cerrar
            </button>
          </div>
        )}

        <div className="space-y-6">
          {/* Price Range */}
          <div>
            <h3 className="text-sm text-stone-900 mb-4">Precio</h3>
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
              min={0}
              max={200}
              step={5}
              className="mb-2"
            />
            <div className="flex items-center justify-between text-sm text-stone-600">
              <span>€{filters.priceRange[0]}</span>
              <span>€{filters.priceRange[1]}</span>
            </div>
          </div>

          {/* Age Range */}
          <div>
            <h3 className="text-sm text-stone-900 mb-3">Edad del bebé</h3>
            <div className="space-y-2">
              {AGE_RANGES.map((age) => (
                <label key={age} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.ageRange.includes(age)}
                    onChange={() => toggleArrayFilter('ageRange', age)}
                    className="rounded border-stone-300 text-stone-900 focus:ring-stone-500"
                  />
                  <span className="text-sm text-stone-700">{age}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <h3 className="text-sm text-stone-900 mb-3">Color</h3>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => toggleArrayFilter('colors', color.name)}
                  className={`
                    w-10 h-10 rounded-full border-2 transition-all
                    ${filters.colors.includes(color.name) 
                      ? 'border-stone-900 ring-2 ring-stone-900 ring-offset-2' 
                      : 'border-stone-300 hover:border-stone-400'}
                  `}
                  style={{ backgroundColor: color.color }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Brands */}
          <div>
            <h3 className="text-sm text-stone-900 mb-3">Marca</h3>
            <div className="space-y-2">
              {BRANDS.map((brand) => (
                <label key={brand} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.brands.includes(brand)}
                    onChange={() => toggleArrayFilter('brands', brand)}
                    className="rounded border-stone-300 text-stone-900 focus:ring-stone-500"
                  />
                  <span className="text-sm text-stone-700">{brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <h3 className="text-sm text-stone-900 mb-3">Valoración mínima</h3>
            <div className="space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => updateFilter('rating', filters.rating === rating ? 0 : rating)}
                  className={`
                    flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-colors
                    ${filters.rating === rating 
                      ? 'bg-stone-900 text-white' 
                      : 'bg-stone-50 text-stone-700 hover:bg-stone-100'}
                  `}
                >
                  <div className="flex">
                    {Array.from({ length: rating }).map((_, i) => (
                      <span key={i} className="text-amber-400">★</span>
                    ))}
                  </div>
                  <span className="text-sm">y más</span>
                </button>
              ))}
            </div>
          </div>

          {/* In Stock */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => updateFilter('inStock', e.target.checked)}
                className="rounded border-stone-300 text-stone-900 focus:ring-stone-500"
              />
              <span className="text-sm text-stone-700">Solo productos en stock</span>
            </label>
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => {
              const resetFilters: FilterState = {
                priceRange: [0, 100],
                ageRange: [],
                colors: [],
                brands: [],
                rating: 0,
                inStock: false,
              };
              setFilters(resetFilters);
              onFilterChange(resetFilters);
            }}
            className="w-full py-2 text-sm text-stone-600 hover:text-stone-900 underline"
          >
            Limpiar filtros
          </button>
        </div>

        {/* Mobile Apply Button */}
        {showMobileFilters && (
          <button
            onClick={() => setShowMobileFilters(false)}
            className="fixed bottom-6 left-6 right-6 bg-stone-900 text-white py-4 rounded-lg"
          >
            Aplicar filtros
          </button>
        )}
      </div>
    </div>
  );
}
