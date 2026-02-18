import { X, Minus, Plus, ShoppingBag, ArrowRight, Gift, Tag, Award } from 'lucide-react';
import { Product } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState } from 'react';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
  onCheckout: () => void;
}

const recommendedProducts: Product[] = [
  {
    id: 201,
    name: 'Cuddle cloth Animals',
    price: 16.95,
    image: '/img/5.webp',
    category: 'Juguetes',
  },
  {
    id: 202,
    name: 'Organic cotton rattle',
    price: 14.95,
    image: '/img/6.webp',
    category: 'Juguetes',
  },
];

export function Cart({ isOpen, onClose, items, onUpdateQuantity, onRemove, onCheckout }: CartProps) {
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [giftWrap, setGiftWrap] = useState(false);
  
  const subtotal = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const freeShippingThreshold = 200;
  const shipping = subtotal >= freeShippingThreshold ? 0 : 4.99;
  const giftWrapCost = giftWrap ? 2.99 : 0;
  const discount = couponApplied ? subtotal * 0.1 : 0;
  const giftThreshold = 75;
  const total = subtotal + shipping + giftWrapCost - discount;
  const pointsEarned = Math.floor(total * 2); // 2 points per euro

  const handleApplyCoupon = () => {
    if (couponCode.toLowerCase() === 'welcome10') {
      setCouponApplied(true);
    }
  };

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
        <div className="flex items-center justify-between p-6 border-b border-[#e6dfd9] bg-white">
          <h3 className="text-xl text-[#5e544e] font-medium">
            Carrito ({items.reduce((sum, item) => sum + (item.quantity || 1), 0)})
          </h3>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-[#faf9f8] active:bg-[#f0eeec] rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Cerrar carrito"
          >
            <X className="h-5 w-5 text-[#9ca3af]" />
          </button>
        </div>

        {/* Progress Bars - Sticky at top */}
        {items.length > 0 && (
          <div className="bg-[#faf9f8] p-4 border-b border-[#e6dfd9] space-y-3">
            {/* Free shipping progress */}
            {subtotal < freeShippingThreshold && (
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#83b5b6]/20 rounded-full flex items-center justify-center">
                      <ArrowRight className="h-3 w-3 text-[#83b5b6]" />
                    </div>
                    <span className="text-[#5e544e]">
                      <strong>€{(freeShippingThreshold - subtotal).toFixed(2)}</strong> para envío gratis
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-[#e6dfd9] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#83b5b6] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((subtotal / freeShippingThreshold) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Free gift progress */}
            {subtotal >= freeShippingThreshold && subtotal < giftThreshold && (
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#e2bfb3]/30 rounded-full flex items-center justify-center">
                      <Gift className="h-3 w-3 text-[#c59a8b]" />
                    </div>
                    <span className="text-[#5e544e]">
                      <strong>€{(giftThreshold - subtotal).toFixed(2)}</strong> para regalo gratis
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-[#e6dfd9] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#e2bfb3] to-[#c59a8b] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((subtotal / giftThreshold) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {subtotal >= freeShippingThreshold && subtotal < giftThreshold && (
              <div className="flex items-center gap-2 text-sm text-[#83b5b6] bg-[#83b5b6]/10 px-3 py-2 rounded-lg font-medium">
                <ArrowRight className="h-4 w-4" />
                <span>¡Envío gratis desbloqueado! 🚚</span>
              </div>
            )}
          </div>
        )}

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

              {/* Recommended products */}
              <div className="border-t border-[#e6dfd9] pt-6">
                <h4 className="text-sm font-medium text-[#5e544e] mb-4 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-[#83b5b6]" />
                  Completa tu compra
                </h4>
                <div className="grid gap-3">
                  {recommendedProducts.slice(0, 2).map((product) => (
                    <div key={product.id} className="flex gap-3 p-3 border border-[#e6dfd9] rounded-xl hover:border-[#83b5b6]/50 transition-colors bg-[#faf9f8]/50">
                      <ImageWithFallback
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-[#5e544e] mb-1 line-clamp-2">{product.name}</p>
                        <p className="text-sm text-[#83b5b6]">€{product.price.toFixed(2)}</p>
                      </div>
                      <button className="text-xs text-[#5e544e] hover:text-[#83b5b6] font-medium px-3 py-1.5 bg-white border border-[#e6dfd9] rounded-lg shadow-sm hover:shadow transition-all">
                        Añadir
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart Options (Moved to Scrollable Area) */}
              <div className="border-t border-[#e6dfd9] pt-6 space-y-6">
                 {/* Coupon Code */}
                <div>
                  <label className="text-sm font-medium text-[#5e544e] mb-2 block">Código de descuento</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="WELCOME10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={couponApplied}
                      className="flex-1 px-3 py-2 border border-[#e6dfd9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#83b5b6]/20 text-sm disabled:bg-[#faf9f8] text-[#5e544e] placeholder:text-[#9ca3af]"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponApplied}
                      className="bg-[#5e544e] text-white px-4 py-2 rounded-lg hover:bg-[#4a4541] transition-colors text-sm disabled:bg-[#83b5b6]"
                    >
                      {couponApplied ? '✓' : 'Aplicar'}
                    </button>
                  </div>
                  {couponApplied && (
                    <p className="text-xs text-[#83b5b6] mt-1 font-medium">¡Código aplicado! -10% de descuento</p>
                  )}
                </div>

                {/* Gift Wrap */}
                <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${giftWrap ? 'border-[#c59a8b] bg-[#c59a8b]/5' : 'border-[#e6dfd9] hover:bg-[#faf9f8]'}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={giftWrap}
                      onChange={(e) => setGiftWrap(e.target.checked)}
                      className="text-[#c59a8b] rounded focus:ring-[#c59a8b]"
                    />
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-[#c59a8b]" />
                      <div>
                        <p className="text-sm font-medium text-[#5e544e]">Envoltorio de regalo</p>
                        <p className="text-xs text-[#9ca3af]">Incluye tarjeta personalizada</p>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-[#5e544e]">+ €{giftWrapCost.toFixed(2)}</span>
                </label>

                {/* Loyalty Points */}
                <div className="flex items-center gap-2 p-3 bg-[#faf9f8] border border-[#e6dfd9] rounded-xl">
                  <Award className="h-5 w-5 text-[#83b5b6]" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#5e544e]">Gana {pointsEarned} puntos</p>
                    <p className="text-xs text-[#9ca3af]">1 punto = €0.05 de descuento</p>
                  </div>
                </div>
              </div>
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
              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#9ca3af]">Descuento</span>
                  <span className="text-[#83b5b6] font-medium">-€{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#9ca3af]">Envío</span>
                <span className={`font-medium ${shipping === 0 ? 'text-[#83b5b6]' : 'text-[#5e544e]'}`}>
                  {shipping === 0 ? 'GRATIS' : `€${shipping.toFixed(2)}`}
                </span>
              </div>
              {giftWrapCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#9ca3af]">Envoltorio</span>
                  <span className="text-[#5e544e] font-medium">€{giftWrapCost.toFixed(2)}</span>
                </div>
              )}
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
