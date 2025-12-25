import { Eye, X } from 'lucide-react';
import { Product } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface RecentlyViewedProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  onClear: () => void;
}

export function RecentlyViewed({ products, onProductClick, onClear }: RecentlyViewedProps) {
  if (products.length === 0) return null;

  return (
    <div className="fixed bottom-8 left-8 z-40 hidden lg:block">
      <div className="bg-white rounded-lg shadow-xl border border-stone-200 w-72 max-h-[500px] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-stone-600" />
            <h3 className="text-sm text-stone-900">Vistos recientemente</h3>
          </div>
          <button
            onClick={onClear}
            className="p-1 hover:bg-stone-200 rounded transition-colors"
            aria-label="Limpiar historial"
          >
            <X className="h-4 w-4 text-stone-500" />
          </button>
        </div>

        {/* Products List */}
        <div className="overflow-y-auto max-h-[420px]">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => onProductClick(product)}
              className="w-full flex items-center gap-3 p-3 hover:bg-stone-50 transition-colors border-b border-stone-100 last:border-0"
            >
              <div className="w-16 h-16 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 text-left min-w-0">
                <h4 className="text-sm text-stone-900 line-clamp-2 mb-1">
                  {product.name}
                </h4>
                <p className="text-sm text-stone-700">
                  € {product.price.toFixed(2)}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-stone-200 bg-stone-50">
          <p className="text-xs text-stone-500 text-center">
            {products.length} {products.length === 1 ? 'producto visto' : 'productos vistos'}
          </p>
        </div>
      </div>
    </div>
  );
}
