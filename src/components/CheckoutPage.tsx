import { useState } from 'react';
import { ArrowLeft, CreditCard, Lock, MapPin, User, Mail, Phone, Home, Building, CheckCircle, Package, Truck, Gift } from 'lucide-react';
import { Product } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CheckoutPageProps {
  items: Product[];
  onBack: () => void;
  onComplete: (orderData: OrderData) => void;
}

export interface OrderData {
  orderId: string;
  customerInfo: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  total: number;
  items: Product[];
}

export function CheckoutPage({ items, onBack, onComplete }: CheckoutPageProps) {
  const [step, setStep] = useState(1); // 1: Contact, 2: Shipping, 3: Payment
  const [guestCheckout, setGuestCheckout] = useState(true);
  
  // Form states
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('España');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [saveInfo, setSaveInfo] = useState(false);
  const [expressShipping, setExpressShipping] = useState(false);
  const [giftWrap, setGiftWrap] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  
  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const freeShippingThreshold = 50;
  const standardShipping = subtotal >= freeShippingThreshold ? 0 : 4.99;
  const expressShippingCost = 9.99;
  const shipping = expressShipping ? expressShippingCost : standardShipping;
  const giftWrapCost = giftWrap ? 2.99 : 0;
  const discount = couponApplied ? subtotal * 0.1 : 0;
  const total = subtotal + shipping + giftWrapCost - discount;

  const handleApplyCoupon = () => {
    if (couponCode.toLowerCase() === 'welcome10') {
      setCouponApplied(true);
    }
  };

  const handleContinue = () => {
    if (step < 3) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Complete order
      const orderData: OrderData = {
        orderId: `BO-${Date.now()}`,
        customerInfo: { email, firstName, lastName, phone },
        shippingAddress: { street: `${street}${apartment ? ', ' + apartment : ''}`, city, postalCode, country },
        paymentMethod,
        total,
        items
      };
      onComplete(orderData);
    }
  };

  const isStepValid = () => {
    if (step === 1) return email && firstName && lastName;
    if (step === 2) return street && city && postalCode && country;
    if (step === 3) return paymentMethod;
    return false;
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Volver al carrito</span>
            </button>
            <div className="text-center">
              <h1 className="text-2xl text-stone-900">BabyOnly</h1>
              <p className="text-sm text-stone-600">Checkout seguro</p>
            </div>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center gap-2">
            {[
              { num: 1, label: 'Contacto' },
              { num: 2, label: 'Envío' },
              { num: 3, label: 'Pago' }
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      step > s.num
                        ? 'bg-green-600 text-white'
                        : step === s.num
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {step > s.num ? <CheckCircle className="h-5 w-5" /> : s.num}
                  </div>
                  <span className="text-xs text-stone-600 mt-1 hidden sm:inline">{s.label}</span>
                </div>
                {idx < 2 && (
                  <div
                    className={`w-12 sm:w-24 h-0.5 mx-2 ${
                      step > s.num ? 'bg-green-600' : 'bg-stone-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Step 1: Contact Information */}
            {step === 1 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-stone-700" />
                  </div>
                  <div>
                    <h2 className="text-xl text-stone-900">Información de contacto</h2>
                    <p className="text-sm text-stone-600">¿Ya tienes cuenta? <button className="text-stone-900 underline hover:no-underline">Iniciar sesión</button></p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-stone-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                      required
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-stone-700 mb-2">Nombre *</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Juan"
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-stone-700 mb-2">Apellidos *</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="García"
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-stone-700 mb-2">Teléfono</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+34 600 000 000"
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                    />
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveInfo}
                      onChange={(e) => setSaveInfo(e.target.checked)}
                      className="mt-1"
                    />
                    <span className="text-sm text-stone-700">
                      Guardar mi información para futuras compras
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Step 2: Shipping Address */}
            {step === 2 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-stone-700" />
                  </div>
                  <div>
                    <h2 className="text-xl text-stone-900">Dirección de envío</h2>
                    <p className="text-sm text-stone-600">¿A dónde enviamos tu pedido?</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-stone-700 mb-2">País/Región *</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                    >
                      <option>España</option>
                      <option>Portugal</option>
                      <option>Francia</option>
                      <option>Alemania</option>
                      <option>Italia</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-stone-700 mb-2">Dirección *</label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Calle Principal 123"
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-stone-700 mb-2">Apartamento, suite, etc. (opcional)</label>
                    <input
                      type="text"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      placeholder="Piso 3, Puerta B"
                      className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-stone-700 mb-2">Ciudad *</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Madrid"
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-stone-700 mb-2">Código Postal *</label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="28001"
                        className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Method */}
                <div className="mt-6 pt-6 border-t border-stone-200">
                  <h3 className="text-sm text-stone-900 mb-3">Método de envío</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 border-2 border-stone-200 rounded-lg cursor-pointer hover:border-stone-300 transition-colors">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          checked={!expressShipping}
                          onChange={() => setExpressShipping(false)}
                          className="text-stone-900"
                        />
                        <div className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-stone-600" />
                          <div>
                            <p className="text-sm text-stone-900">Envío estándar</p>
                            <p className="text-xs text-stone-600">Entrega en 2-4 días laborables</p>
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-stone-900">
                        {standardShipping === 0 ? <span className="text-green-700">GRATIS</span> : `€${standardShipping.toFixed(2)}`}
                      </span>
                    </label>

                    <label className="flex items-center justify-between p-4 border-2 border-stone-200 rounded-lg cursor-pointer hover:border-stone-300 transition-colors">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          checked={expressShipping}
                          onChange={() => setExpressShipping(true)}
                          className="text-stone-900"
                        />
                        <div className="flex items-center gap-2">
                          <Truck className="h-5 w-5 text-amber-600" />
                          <div>
                            <p className="text-sm text-stone-900">Envío express</p>
                            <p className="text-xs text-stone-600">Recíbelo mañana</p>
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-stone-900">€{expressShippingCost.toFixed(2)}</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-stone-700" />
                  </div>
                  <div>
                    <h2 className="text-xl text-stone-900">Método de pago</h2>
                    <p className="text-sm text-stone-600">Todas las transacciones son seguras y encriptadas</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start p-4 border-2 border-stone-200 rounded-lg cursor-pointer hover:border-stone-300 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-stone-900">Tarjeta de crédito/débito</span>
                        <div className="flex gap-2">
                          <img src="https://cdn-icons-png.flaticon.com/512/349/349221.png" alt="Visa" className="h-6" />
                          <img src="https://cdn-icons-png.flaticon.com/512/349/349228.png" alt="Mastercard" className="h-6" />
                        </div>
                      </div>
                      {paymentMethod === 'card' && (
                        <div className="space-y-3 pt-3 border-t border-stone-200">
                          <input
                            type="text"
                            placeholder="Número de tarjeta"
                            className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="MM/AA"
                              className="px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                            />
                            <input
                              type="text"
                              placeholder="CVV"
                              className="px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="Nombre en la tarjeta"
                            className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                          />
                        </div>
                      )}
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 border-stone-200 rounded-lg cursor-pointer hover:border-stone-300 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex items-center justify-between flex-1">
                      <span className="text-sm text-stone-900">PayPal</span>
                      <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal" className="h-6" />
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 border-stone-200 rounded-lg cursor-pointer hover:border-stone-300 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="bank"
                      checked={paymentMethod === 'bank'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex items-center justify-between flex-1">
                      <span className="text-sm text-stone-900">Transferencia bancaria</span>
                      <Building className="h-5 w-5 text-stone-600" />
                    </div>
                  </label>
                </div>

                {/* Security Badge */}
                <div className="mt-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <Lock className="h-5 w-5 text-green-700" />
                  <div>
                    <p className="text-sm text-green-900">Pago 100% seguro</p>
                    <p className="text-xs text-green-700">Tus datos están protegidos con encriptación SSL</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-2 px-6 py-3 border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Anterior
                </button>
              )}
              <button
                onClick={handleContinue}
                disabled={!isStepValid()}
                className="flex-1 bg-stone-900 text-white py-3 rounded-lg hover:bg-stone-800 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed"
              >
                {step === 3 ? 'Completar pedido' : 'Continuar al siguiente paso'}
              </button>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-4">
              <h3 className="text-lg text-stone-900 mb-4">Resumen del pedido</h3>

              {/* Products */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <span className="absolute -top-2 -right-2 bg-stone-900 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {item.quantity || 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-stone-900 line-clamp-2">{item.name}</p>
                      <p className="text-sm text-stone-600">€{item.price.toFixed(2)}</p>
                    </div>
                    <p className="text-sm text-stone-900">€{(item.price * (item.quantity || 1)).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mb-6 pb-6 border-b border-stone-200">
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
                  <p className="text-xs text-green-700 mt-2">¡Código aplicado! -10% de descuento</p>
                )}
              </div>

              {/* Gift Wrap */}
              <label className="flex items-center justify-between p-3 border border-stone-200 rounded-lg cursor-pointer hover:bg-stone-50 mb-6">
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
                      <p className="text-sm text-stone-900">Envoltorio regalo</p>
                      <p className="text-xs text-stone-600">+ tarjeta personalizada</p>
                    </div>
                  </div>
                </div>
                <span className="text-sm text-stone-900">€{giftWrapCost.toFixed(2)}</span>
              </label>

              {/* Totals */}
              <div className="space-y-2 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-stone-600">Subtotal</span>
                  <span className="text-stone-900">€{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-stone-600">Descuento (10%)</span>
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
                <div className="flex justify-between pt-4 border-t border-stone-200">
                  <span className="text-lg text-stone-900">Total</span>
                  <span className="text-2xl text-stone-900">€{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Trust Signals */}
              <div className="space-y-2 pt-4 border-t border-stone-200">
                <div className="flex items-center gap-2 text-xs text-stone-600">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Pago seguro encriptado</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-600">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Devoluciones gratuitas 30 días</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-600">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Garantía de satisfacción</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
