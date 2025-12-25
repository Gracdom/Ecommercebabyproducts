import { X, Heart, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface WishlistPageProps {
  products: Product[];
  onRemove: (productId: number) => void;
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
}

export function WishlistPage({ products, onRemove, onAddToCart, onProductClick }: WishlistPageProps) {
  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl text-stone-900 mb-8">Mi Lista de Deseos</h1>
          <div className="text-center py-16 bg-stone-50 rounded-lg">
            <Heart className="h-16 w-16 text-stone-300 mx-auto mb-4" />
            <p className="text-xl text-stone-600 mb-2">Tu lista de deseos está vacía</p>
            <p className="text-stone-500">Guarda tus productos favoritos aquí</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl text-stone-900">Mi Lista de Deseos</h1>
          <p className="text-stone-600">{products.length} {products.length === 1 ? 'producto' : 'productos'}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="group relative bg-white border border-stone-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              {/* Remove button */}
              <button
                onClick={() => onRemove(product.id)}
                className="absolute top-3 right-3 z-10 bg-white p-2 rounded-full shadow-md hover:bg-red-50 transition-colors"
              >
                <X className="h-4 w-4 text-stone-600 hover:text-red-600" />
              </button>

              {/* Product Image */}
              <div 
                onClick={() => onProductClick(product)}
                className="relative aspect-square bg-stone-50 cursor-pointer"
              >
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.badge && (
                  <span className="absolute top-3 left-3 bg-stone-900 text-white px-2 py-1 rounded text-xs">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 
                  onClick={() => onProductClick(product)}
                  className="text-sm text-stone-900 mb-2 line-clamp-2 cursor-pointer hover:text-stone-700"
                >
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg text-stone-900">€{product.price.toFixed(2)}</p>
                    {product.originalPrice && (
                      <p className="text-sm text-stone-400 line-through">
                        €{product.originalPrice.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onAddToCart(product)}
                    className="bg-stone-900 text-white p-2.5 rounded-lg hover:bg-stone-800 transition-colors"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add all to cart button */}
        {products.length > 1 && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => products.forEach(p => onAddToCart(p))}
              className="bg-stone-900 text-white px-8 py-4 rounded-lg hover:bg-stone-800 transition-colors"
            >
              Añadir todos al carrito ({products.length} productos)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
