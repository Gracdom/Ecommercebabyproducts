import { X, Minus, Plus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { Product } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

const FALLBACK_PRODUCTS: Product[] = [
  { id: 201, name: 'Cuddle cloth Animals', price: 16.95, image: '/img/5.webp', category: 'Juguetes' },
  { id: 202, name: 'Organic cotton rattle', price: 14.95, image: '/img/6.webp', category: 'Juguetes' },
  { id: 203, name: 'Muselina suave', price: 12.99, image: '/img/7.webp', category: 'Textiles' },
];

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
  onCheckout: () => void;
  onAddToCart?: (product: Product) => void;
  /** Productos del catálogo real para mostrar relacionados */
  allProducts?: Product[];
}

export function Cart({ isOpen, onClose, items, onUpdateQuantity, onRemove, onCheckout, onAddToCart, allProducts = [] }: CartProps) {
  // Productos relacionados reales: misma categoría que los del carrito; máximo 3
  const relatedProducts = (() => {
    const pool = allProducts.length > 0 ? allProducts : FALLBACK_PRODUCTS;
    const cartCategories = [...new Set(items.map((i) => i.category).filter(Boolean))] as string[];
    const cartIds = new Set(items.map((i) => i.id));
    const sameCategory = pool.filter((p) =>
      cartCategories.length ? cartCategories.includes(p.category) : true
    );
    const candidates = sameCategory.length >= 3 ? sameCategory : pool;
    return candidates.filter((p) => !cartIds.has(p.id)).slice(0, 3);
  })();

  const IVA_RATE = 0.21;
  const subtotal = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  // Coste de envío fijo para el cliente
  const shipping = items.length > 0 ? 6 : 0;
  const baseImponible = subtotal + shipping;
  const iva = baseImponible * IVA_RATE;
  const total = baseImponible + iva;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Cart panel */}
      <div className={`fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e6dfd9] bg-white">
          <h3 className="text-base text-[#5e544e] font-medium">
            Carrito ({items.reduce((sum, item) => sum + (item.quantity || 1), 0)})
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#faf9f8] active:bg-[#f0eeec] rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Cerrar carrito"
          >
            <X className="h-4 w-4 text-[#9ca3af]" />
          </button>
        </div>

        {/* (Sin barras de progreso de envío: coste fijo de 6 €) */}

        {/* Scrollable Content: Items + Options */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <div className="w-24 h-24 bg-[#faf9f8] rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                <ShoppingBag className="h-10 w-10 text-[#83b5b6]" />
              </div>
              <div>
                <p className="text-xl text-[#5e544e] font-medium mb-2">Tu carrito está vacío</p>
                <p className="text-[#9ca3af] max-w-[200px] mx-auto">Descubre nuestra colección de productos orgánicos</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8 pb-4">
              {/* Cart items */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 bg-[#faf9f8] p-4 rounded-2xl border border-[#e6dfd9] group transition-colors hover:border-[#d6cfc9]">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 shrink-0 object-cover rounded-xl border border-white shadow-sm"
                    />
                    <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-sm font-medium text-[#5e544e] line-clamp-2 mb-1">{item.name}</h4>
                          <button
                            onClick={() => onRemove(item.id)}
                            className="text-[#9ca3af] hover:text-[#ef4444] hover:bg-red-50 p-1.5 rounded-lg transition-all shrink-0 -mr-2 -mt-2"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-[#83b5b6] font-medium">€{item.price.toFixed(2)}</p>
                      </div>
                      
                      <div className="flex items-center mt-2">
                        <div className="flex items-center gap-3 bg-white rounded-lg p-1 border border-[#e6dfd9] shadow-sm">
                          <button
                            onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) - 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-[#faf9f8] rounded text-[#5e544e] transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm min-w-[1.5rem] text-center text-[#5e544e] font-medium">{item.quantity || 1}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) + 1)}
                            className="w-7 h-7 flex items-center justify-center hover:bg-[#faf9f8] rounded text-[#5e544e] transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Productos relacionados - 3 mini tarjetas */}
              {relatedProducts.length > 0 && (
                <div className="border-t border-[#e6dfd9] pt-4">
                  <h4 className="text-xs font-medium text-[#5e544e] mb-2 flex items-center gap-1.5">
                    <Tag className="h-3 w-3 text-[#83b5b6] shrink-0" />
                    Productos relacionados
                  </h4>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1">
                    {relatedProducts.map((product) => (
                      <div key={product.id} className="flex-shrink-0 w-[72px] snap-start">
                        <button
                          onClick={() => onAddToCart?.({ ...product, quantity: 1 })}
                          className="flex flex-col items-center gap-1 w-full p-1.5 border border-[#e6dfd9] rounded-lg hover:border-[#83b5b6]/50 transition-colors bg-[#faf9f8]/50 group text-left"
                        >
                          <div className="w-12 h-12 rounded-md overflow-hidden bg-[#f0eeec] shrink-0">
                            <ImageWithFallback
                              src={product.images?.[0] ?? product.image ?? '/img/5.webp'}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <p className="text-[10px] font-medium text-[#5e544e] line-clamp-2 leading-tight w-full">{product.name}</p>
                          <p className="text-[10px] text-[#83b5b6] font-medium">€{product.price.toFixed(2)}</p>
                          <span className="text-[10px] text-[#83b5b6] font-medium">+</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer (Totals & Actions) */}
        {items.length > 0 && (
          <div className="border-t border-[#e6dfd9] p-6 space-y-4 bg-white shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] z-10">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#9ca3af]">Subtotal</span>
                <span className="text-[#5e544e] font-medium">€{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9ca3af]">Envío</span>
                <span className="font-medium text-[#5e544e]">€{shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9ca3af]">IVA (21%)</span>
                <span className="text-[#5e544e] font-medium">€{iva.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-[#e6dfd9] mt-2">
                <span className="text-[#5e544e] text-base font-medium">Total</span>
                <span className="text-xl text-[#5e544e] font-bold">€{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={onCheckout}
              className="w-full bg-[#83b5b6] text-white py-4 rounded-xl hover:bg-[#6fa3a5] transition-all duration-300 hover:shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2 font-medium text-lg"
            >
              Finalizar Compra
              <ArrowRight className="h-5 w-5" />
            </button>

            <button 
              onClick={onClose}
              className="w-full text-[#9ca3af] hover:text-[#5e544e] text-sm font-medium transition-colors"
            >
              Seguir Comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
}
