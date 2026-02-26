import { X, Heart, Star, ShoppingCart, TrendingUp, Flame, Package, Truck, Award } from 'lucide-react';
import { Product } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { useState } from 'react';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

const bestsellerIds = [1, 3, 5, 7, 9];

export function QuickViewModal({ product, isOpen, onClose, onAddToCart }: QuickViewModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const isBestseller = bestsellerIds.includes(product.id);
  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  const stockLeft = Math.floor(Math.random() * 8) + 3;

  const handleAddToCart = () => {
    onAddToCart({ ...product, quantity });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {/* Hidden accessibility title */}
        <DialogTitle className="sr-only">Vista rápida: {product.name}</DialogTitle>
        <DialogDescription className="sr-only">
          Detalles rápidos del producto {product.name}. Precio: €{product.price.toFixed(2)}
        </DialogDescription>
        
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 p-4 sm:p-6">
          {/* Product Images */}
          <div className="space-y-3 sm:space-y-4">
            <div className="relative aspect-square bg-stone-50 rounded-xl overflow-hidden">
              <ImageWithFallback
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.badge && (
                  <span className="bg-destructive text-white px-3 py-1 rounded text-xs">
                    {product.badge}
                  </span>
                )}
                {isBestseller && (
                  <span className="bg-[#dccf9d] text-stone-900 px-3 py-1 rounded text-xs flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Bestseller
                  </span>
                )}
              </div>

              <button 
                onClick={onClose}
                className="absolute top-3 right-3 bg-white p-2 rounded-full hover:bg-stone-100"
              >
                <X className="h-5 w-5 text-stone-600" />
              </button>
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-stone-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 ring-stone-800">
                  <ImageWithFallback
                    src={product.image}
                    alt={`${product.name} ${i}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-5">
            <div>
              {/* Título + wishlist */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <h2 className="text-xl sm:text-2xl text-stone-900 pr-4 leading-snug">
                  {product.name}
                </h2>
                <button className="p-2 hover:bg-stone-100 rounded-full">
                  <Heart className="h-5 w-5 text-stone-600" />
                </button>
              </div>
              
              {/* Rating + precio */}
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating || 4.5)
                            ? 'fill-[#dccf9d] text-[#dccf9d]'
                            : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm text-stone-600">
                    {product.rating || 4.5} ({product.reviews || 127} opiniones)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <p className="text-2xl sm:text-3xl text-stone-900">
                    € {product.price.toFixed(2)}
                  </p>
                  {product.originalPrice && (
                    <>
                      <p className="text-base sm:text-xl text-stone-400 line-through">
                        € {product.originalPrice.toFixed(2)}
                      </p>
                      <span className="bg-destructive text-white px-2 py-1 rounded text-xs sm:text-sm">
                        -{discount}%
                      </span>
                    </>
                  )}
                </div>

                {/* Stock Alert */}
                {stockLeft < 10 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
                    <Flame className="h-4 w-4 text-amber-600" />
                    <span className="text-sm text-amber-800">
                      ¡Solo quedan <strong>{stockLeft} unidades</strong> en stock!
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Size & Quantity - agrupados */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Size Selector */}
              <div>
                <label className="block text-sm text-stone-700 mb-2">
                  Talla: <strong>{selectedSize}</strong>
                </label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 border rounded-lg text-sm transition-all ${
                        selectedSize === size
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : 'border-stone-300 hover:border-stone-900'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div>
                <label className="block text-sm text-stone-700 mb-2">Cantidad</label>
                <div className="inline-flex items-center gap-3 border border-stone-300 rounded-lg px-2 py-1.5">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-2 py-1 text-lg leading-none hover:text-stone-900"
                  >
                    -
                  </button>
                  <span className="text-base w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="px-2 py-1 text-lg leading-none hover:text-stone-900"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              onClick={handleAddToCart}
              className="w-full bg-stone-900 text-white py-3.5 rounded-lg hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
              Añadir al carrito - € {(product.price * quantity).toFixed(2)}
            </Button>

            {/* Features */}
            <div className="space-y-3 pt-4 border-t border-stone-200">
              <div className="flex items-center gap-3 text-sm text-stone-700">
                <Truck className="h-5 w-5 text-stone-500" />
                <span>Envío 24/48h en España (coste fijo 6€)</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-700">
                <Package className="h-5 w-5 text-stone-500" />
                <span>Devolución gratuita en 30 días</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-700">
                <Award className="h-5 w-5 text-stone-500" />
                <span>Algodón orgánico certificado y calidad premium</span>
              </div>
            </div>

            {/* Description */}
            <div className="pt-4 border-t border-stone-200">
              <h3 className="text-sm text-stone-900 mb-2">Descripción</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Producto de alta calidad diseñado especialmente para el cuidado y confort de tu bebé. 
                Materiales premium certificados, seguros y suaves al tacto. Perfecto para el uso diario.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}