import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, TrendingUp, Clock, X } from 'lucide-react';
import { Product } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface SearchAutocompleteProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const trendingSearches = [
  'Bodies de algodón',
  'Mantas para bebé',
  'Juguetes educativos',
  'Ropa recién nacido',
  'Chupetes premium'
];

/** Normaliza texto para búsqueda: minúsculas y sin acentos */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

/** Puntúa un producto según la relevancia respecto a los tokens de búsqueda */
function scoreProduct(product: Product, tokens: string[]): number {
  if (tokens.length === 0) return 0;
  const nameNorm = normalize(product.name);
  const categoryNorm = normalize(product.category);
  const subNorm = normalize(product.subCategory ?? '');
  const brandNorm = normalize(product.brand ?? '');
  const descNorm = normalize((product.description ?? '') + ' ' + (product.shortDescription ?? ''));

  let score = 0;
  for (const token of tokens) {
    if (!token.length) continue;
    if (nameNorm === token) score += 100;
    else if (nameNorm.startsWith(token)) score += 50;
    else if (nameNorm.includes(token)) score += 30;
    else if (categoryNorm.includes(token) || subNorm.includes(token)) score += 20;
    else if (brandNorm.includes(token)) score += 15;
    else if (descNorm.includes(token)) score += 5;
  }
  return score;
}

export function SearchAutocomplete({ products, onProductClick }: SearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounce búsqueda (300ms) para no filtrar en cada tecla
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = useMemo(() => {
    if (!debouncedQuery) return [];
    const tokens = normalize(debouncedQuery)
      .split(/\s+/)
      .filter((t) => t.length > 0);
    if (tokens.length === 0) return [];

    const scored = products
      .map((p) => ({ product: p, score: scoreProduct(p, tokens) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score);
    return scored.map(({ product }) => product).slice(0, 8);
  }, [products, debouncedQuery]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    
    // Add to recent searches
    if (searchQuery.trim() && !recentSearches.includes(searchQuery)) {
      const updated = [searchQuery, ...recentSearches].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    }
  };

  const handleProductClick = (product: Product) => {
    handleSearch(product.name);
    setIsOpen(false);
    onProductClick(product);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const removeRecentSearch = (search: string) => {
    const updated = recentSearches.filter(s => s !== search);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar productos..."
          className="w-full px-4 py-2.5 pl-10 pr-10 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-300 focus:bg-white transition-all"
        />
        <Search className="absolute left-3 top-3 h-5 w-5 text-stone-400 pointer-events-none" />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-3 p-0.5 hover:bg-stone-200 rounded transition-colors"
          >
            <X className="h-4 w-4 text-stone-500" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-lg shadow-xl z-50 max-h-[500px] overflow-y-auto">
          {/* Buscando... (mientras debounce) */}
          {query.trim() && query.trim() !== debouncedQuery && (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-stone-500">Buscando...</p>
            </div>
          )}

          {/* Search Results */}
          {debouncedQuery && filteredProducts.length > 0 && (
            <div className="border-b border-stone-100">
              <div className="px-4 py-2 bg-stone-50">
                <p className="text-xs text-stone-600">
                  {filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''}
                </p>
              </div>
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-stone-50 transition-colors"
                >
                  <div className="w-12 h-12 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm text-stone-900 line-clamp-1">{product.name}</p>
                    <p className="text-sm text-stone-700">€ {product.price.toFixed(2)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {debouncedQuery && filteredProducts.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-sm text-stone-600">No se encontraron productos</p>
              <p className="text-xs text-stone-500 mt-1">Prueba con otras palabras o sin acentos (ej. bebe, ropa)</p>
            </div>
          )}

          {/* Recent Searches */}
          {!query.trim() && recentSearches.length > 0 && (
            <div className="border-b border-stone-100">
              <div className="px-4 py-2 bg-stone-50 flex items-center justify-between">
                <p className="text-xs text-stone-600">Búsquedas recientes</p>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-stone-500 hover:text-stone-700 transition-colors"
                >
                  Limpiar todo
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between hover:bg-stone-50 transition-colors group"
                >
                  <button
                    onClick={() => handleSearch(search)}
                    className="flex-1 flex items-center gap-3 p-3 text-left"
                  >
                    <Clock className="h-4 w-4 text-stone-400" />
                    <span className="text-sm text-stone-700">{search}</span>
                  </button>
                  <button
                    onClick={() => removeRecentSearch(search)}
                    className="p-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4 text-stone-400 hover:text-stone-600" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Trending Searches */}
          {!query.trim() && (
            <div>
              <div className="px-4 py-2 bg-stone-50">
                <p className="text-xs text-stone-600">Búsquedas populares</p>
              </div>
              {trendingSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(search)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-stone-50 transition-colors text-left"
                >
                  <TrendingUp className="h-4 w-4 text-stone-400" />
                  <span className="text-sm text-stone-700">{search}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
