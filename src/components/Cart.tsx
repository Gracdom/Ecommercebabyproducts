import { X, Minus, Plus, ShoppingBag, ArrowRight, Gift, Tag, Zap, Award } from 'lucide-react';
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
    image: 'https://images.unsplash.com/photo-1518036456775-3016c91dd75d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWJ5JTIwY3VkZGxlJTIwY2xvdGh8ZW58MXx8fHwxNzY2NjU4MjgxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'toys',
  },
  {
    id: 202,
    name: 'Organic cotton rattle',
    price: 14.95,
    image: 'https://images.unsplash.com/photo-1640215775136-75e0c69df035?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWJ5JTIwb3JnYW5pYyUyMGNvdHRvbiUyMHRveXxlbnwxfHx8fDE3NjY2NTg5OTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    category: 'toys',
  },
];

export function Cart({ isOpen, onClose, items, onUpdateQuantity, onRemove, onCheckout }: CartProps) {
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [expressShipping, setExpressShipping] = useState(false);
  const [giftWrap, setGiftWrap] = useState(false);
  
  const subtotal = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const freeShippingThreshold = 50;
  const standardShipping = subtotal >= freeShippingThreshold ? 0 : 4.99;
  const expressShippingCost = 9.99;
  const giftWrapCost = giftWrap ? 2.99 : 0;
  const shipping = expressShipping ? expressShippingCost : standardShipping;
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
      <div className={`fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200">
          <h3 className="text-xl text-stone-900">
            Carrito ({items.reduce((sum, item) => sum + (item.quantity || 1), 0)})
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-lg"
          >
            <X className="h-5 w-5 text-stone-600" />
          </button>
        </div>

        {/* Progress Bars - Sticky at top */}
        {items.length > 0 && (
          <div className="bg-stone-50 p-4 border-b border-stone-200 space-y-3">
            {/* Free shipping progress */}
            {subtotal < freeShippingThreshold && (
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                      <ArrowRight className="h-3 w-3 text-amber-700" />
                    </div>
                    <span className="text-stone-700">
                      <strong>€{(freeShippingThreshold - subtotal).toFixed(2)}</strong> para envío gratis
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
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
                    <div className="w-6 h-6 bg-rose-100 rounded-full flex items-center justify-center">
                      <Gift className="h-3 w-3 text-rose-600" />
                    </div>
                    <span className="text-stone-700">
                      <strong>€{(giftThreshold - subtotal).toFixed(2)}</strong> para regalo gratis
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((subtotal / giftThreshold) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Success message */}
            {subtotal >= giftThreshold && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                <Gift className="h-4 w-4" />
                <span>¡Felicidades! Regalo gratis incluido 🎁</span>
              </div>
            )}

            {subtotal >= freeShippingThreshold && subtotal < giftThreshold && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                <ArrowRight className="h-4 w-4" />
                <span>¡Envío gratis desbloqueado! 🚚</span>
              </div>
            )}
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="h-16 w-16 text-stone-300 mb-4" />
              <p className="text-stone-600 mb-2">Tu carrito está vacío</p>
              <p className="text-sm text-stone-500">¡Añade productos para empezar!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Cart items */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 bg-stone-50 p-4 rounded-xl">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm text-stone-900 mb-1">{item.name}</h4>
                      <p className="text-stone-800 mb-2">€{item.price.toFixed(2)}</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) - 1)}
                          className="p-1 hover:bg-white rounded border border-stone-200"
                        >
                          <Minus className="h-4 w-4 text-stone-600" />
                        </button>
                        <span className="text-sm w-8 text-center text-stone-900">{item.quantity || 1}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) + 1)}
                          className="p-1 hover:bg-white rounded border border-stone-200"
                        >
                          <Plus className="h-4 w-4 text-stone-600" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemove(item.id)}
                      className="text-stone-400 hover:text-stone-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Recommended products */}
              <div className="border-t border-stone-200 pt-4">
                <h4 className="text-sm text-stone-900 mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Completa tu compra
                </h4>
                <div className="space-y-3">
                  {recommendedProducts.slice(0, 2).map((product) => (
                    <div key={product.id} className="flex gap-3 p-3 border border-stone-200 rounded-lg hover:border-stone-300 transition-colors">
                      <ImageWithFallback
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="text-xs text-stone-900 mb-1 line-clamp-2">{product.name}</p>
                        <p className="text-sm text-stone-800">€{product.price.toFixed(2)}</p>
                      </div>
                      <button className="text-xs text-stone-600 hover:text-stone-900 hover:underline self-start">
                        Añadir
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-stone-200 p-6 space-y-4">
            {/* Coupon Code */}
            <div>
              <label className="text-sm text-stone-700 mb-2 block">Código de descuento</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="WELCOME10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={couponApplied}
                  className="flex-1 px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 text-sm disabled:bg-stone-100"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponApplied}
                  className="bg-stone-900 text-white px-4 py-2 rounded-lg hover:bg-stone-800 transition-colors text-sm disabled:bg-green-600"
                >
                  {couponApplied ? '✓' : 'Aplicar'}
                </button>
              </div>
              {couponApplied && (
                <p className="text-xs text-green-700 mt-1">¡Código aplicado! -10% de descuento</p>
              )}
            </div>

            {/* Shipping Options */}
            <div className="space-y-2">
              <p className="text-sm text-stone-700 mb-2">Opciones de envío</p>
              <label className="flex items-center gap-3 p-3 border border-stone-200 rounded-lg cursor-pointer hover:bg-stone-50">
                <input
                  type="radio"
                  name="shipping"
                  checked={!expressShipping}
                  onChange={() => setExpressShipping(false)}
                  className="text-stone-900"
                />
                <div className="flex-1">
                  <p className="text-sm text-stone-900">Envío estándar</p>
                  <p className="text-xs text-stone-600">2-4 días laborables</p>
                </div>
                <span className="text-sm text-stone-900">
                  {standardShipping === 0 ? 'GRATIS' : `€${standardShipping.toFixed(2)}`}
                </span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-stone-200 rounded-lg cursor-pointer hover:bg-stone-50">
                <input
                  type="radio"
                  name="shipping"
                  checked={expressShipping}
                  onChange={() => setExpressShipping(true)}
                  className="text-stone-900"
                />
                <div className="flex-1 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-600" />
                  <div>
                    <p className="text-sm text-stone-900">Envío express</p>
                    <p className="text-xs text-stone-600">Recíbelo mañana</p>
                  </div>
                </div>
                <span className="text-sm text-stone-900">€{expressShippingCost.toFixed(2)}</span>
              </label>
            </div>

            {/* Gift Wrap */}
            <label className="flex items-center justify-between p-3 border border-stone-200 rounded-lg cursor-pointer hover:bg-stone-50">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={giftWrap}
                  onChange={(e) => setGiftWrap(e.target.checked)}
                  className="text-stone-900"
                />
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-rose-600" />
                  <div>
                    <p className="text-sm text-stone-900">Envoltorio de regalo</p>
                    <p className="text-xs text-stone-600">Incluye tarjeta personalizada</p>
                  </div>
                </div>
              </div>
              <span className="text-sm text-stone-900">+ €{giftWrapCost.toFixed(2)}</span>
            </label>

            {/* Loyalty Points */}
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <Award className="h-5 w-5 text-amber-600" />
              <div className="flex-1">
                <p className="text-sm text-amber-900">Gana {pointsEarned} puntos con esta compra</p>
                <p className="text-xs text-amber-700">1 punto = €0.05 de descuento</p>
              </div>
            </div>

            <div className="space-y-2 text-sm pt-4 border-t border-stone-200">
              <div className="flex justify-between">
                <span className="text-stone-600">Subtotal</span>
                <span className="text-stone-900">€{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-stone-600">Descuento</span>
                  <span className="text-green-700">-€{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-600">Envío</span>
                <span className={shipping === 0 ? 'text-green-700' : 'text-stone-900'}>
                  {shipping === 0 ? 'GRATIS' : `€${shipping.toFixed(2)}`}
                </span>
              </div>
              {giftWrapCost > 0 && (
                <div className="flex justify-between">
                  <span className="text-stone-600">Envoltorio</span>
                  <span className="text-stone-900">€{giftWrapCost.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-stone-200">
                <span className="text-stone-900">Total</span>
                <span className="text-xl text-stone-900">€{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={onCheckout}
              className="w-full bg-stone-800 text-white py-3.5 rounded-lg hover:bg-stone-900 transition-colors flex items-center justify-center gap-2"
            >
              Finalizar Compra
              <ArrowRight className="h-5 w-5" />
            </button>

            <button 
              onClick={onClose}
              className="w-full border border-stone-300 text-stone-700 py-3.5 rounded-lg hover:bg-stone-50 transition-colors"
            >
              Seguir Comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
}