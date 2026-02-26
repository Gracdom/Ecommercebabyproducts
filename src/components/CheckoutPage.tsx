import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CreditCard, Lock, MapPin, User, Mail, Phone, Home, CheckCircle, Package, Truck } from 'lucide-react';
import { Product } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';
import { createStripeCheckoutSession } from '../utils/bigbuy/edge';
import { useProductAnalytics } from '../hooks/useProductAnalytics';

interface CheckoutPageProps {
  items: Product[];
  onBack: () => void;
  onComplete: (orderData: OrderData) => void;
}

export interface OrderData {
  orderId: string;
  bigbuyOrderIds?: string[];
  shippingOption?: {
    serviceName: string;
    delay?: string;
    cost?: number;
  };
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
  const { trackPurchase } = useProductAnalytics();
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
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  const [placingOrder, setPlacingOrder] = useState(false);

  const isoCountry = useMemo(() => {
    switch (country) {
      case 'España': return 'ES';
      case 'Portugal': return 'PT';
      case 'Francia': return 'FR';
      case 'Alemania': return 'DE';
      case 'Italia': return 'IT';
      default: return 'ES';
    }
  }, [country]);

  const bigbuyItems = useMemo(() => {
    return items
      .map((item) => ({
        reference: item.variantSku || item.sku || '',
        quantity: item.quantity || 1,
      }))
      .filter((p) => Boolean(p.reference) && p.quantity > 0);
  }, [items]);

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const shipping = items.length > 0 ? 6 : 0;
  const discount = 0;
  const total = subtotal + shipping;

  const handleApplyCoupon = () => {
    if (couponCode.toLowerCase() === 'welcome10') {
      setCouponApplied(true);
    }
  };

  const handleContinue = async () => {
    if (step < 3) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const internalReference = `BO-${Date.now()}`;
    const shippingAddress = {
      firstName,
      lastName,
      country: isoCountry,
      postcode: postalCode,
      town: city,
      address: `${street}${apartment ? ', ' + apartment : ''}`,
      phone,
      email,
      comment: '',
    };

    try {
      setPlacingOrder(true);

      // Stripe: redirigir a Checkout
      if (paymentMethod === 'card') {
        if (!items?.length) {
          toast.error('Carrito vacío', { description: 'Añade productos antes de pagar.', duration: 4000 });
          return;
        }
        const origin = window.location.origin;
        const successUrl = `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${origin}/checkout`;
        const stripeItems = [
          ...items.map((i) => {
            const img = i.images?.[0] ?? i.image;
            return {
              name: String(i.name ?? 'Producto').slice(0, 500),
              quantity: Math.max(1, Math.min(99, i.quantity ?? 1)),
              price: Number(i.price) || 0,
              image: img && String(img).startsWith('http') ? String(img).slice(0, 500) : undefined,
            };
          }),
          ...(shipping > 0 ? [{ name: 'Envío estándar', quantity: 1, price: shipping }] : []),
        ];
        const metadata: Record<string, string> = {
          internalReference,
          firstName: String(firstName ?? ''),
          lastName: String(lastName ?? ''),
          phone: String(phone ?? ''),
          country: isoCountry,
          postcode: String(postalCode ?? ''),
          town: String(city ?? ''),
          address: `${street}${apartment ? ', ' + apartment : ''}`,
          products: JSON.stringify(bigbuyItems),
          carrierName: 'standard',
          serviceName: 'Envío estándar',
          serviceDelay: '',
          subtotal: String(subtotal),
          total: String(total),
          shippingCost: String(shipping),
        };
        const { url } = await createStripeCheckoutSession({
          items: stripeItems,
          customerEmail: email.trim(),
          successUrl,
          cancelUrl,
          metadata,
        });
        if (url) {
          window.location.href = url;
          return;
        }
        toast.error('No se recibió URL de pago', { description: 'Inténtalo de nuevo.', duration: 5000 });
      }
    } catch (err: any) {
      console.error(err);
      toast.error('No se pudo iniciar el pago seguro', {
        description: err?.message || 'Comprueba tu conexión o inténtalo más tarde.',
        duration: 6000,
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  const isStepValid = () => {
    if (step === 1) return email && firstName && lastName;
    // Paso 2: solo validamos que la dirección esté completa para poder avanzar
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
              <h1 className="text-2xl text-stone-900">e-baby</h1>
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
                        ? 'bg-primary text-white'
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
                      step > s.num ? 'bg-primary' : 'bg-stone-200'
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

                {/* Shipping Method - ocultado BigBuy en UI */}
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
                        <p className="text-sm text-stone-600 pt-3 border-t border-stone-200">
                          Serás redirigido a Stripe para pagar de forma segura con tarjeta.
                        </p>
                      )}
                    </div>
                  </label>
                </div>

                {/* Security Badge */}
                <div className="mt-6 flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <Lock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-primary">Pago 100% seguro</p>
                    <p className="text-xs text-primary/80">Tus datos están protegidos con encriptación SSL</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="space-y-2">
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
                  disabled={!isStepValid() || placingOrder}
                  className="flex-1 bg-stone-900 text-white py-3 rounded-lg hover:bg-stone-800 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed"
                >
                  {placingOrder ? 'Procesando…' : step === 3 ? 'Completar pedido' : 'Continuar al siguiente paso'}
                </button>
              </div>
              {!isStepValid() && (
                <p className="text-xs text-red-600">
                  {step === 1 && 'Completa email, nombre y apellidos para continuar.'}
                  {step === 2 && 'Completa dirección, ciudad y código postal para continuar.'}
                  {step === 3 && 'Selecciona un método de pago para continuar.'}
                </p>
              )}
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
                  <p className="text-xs text-primary mt-2">¡Código aplicado! -10% de descuento</p>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-stone-600">Subtotal</span>
                  <span className="text-stone-900">€{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-stone-600">Descuento (10%)</span>
                    <span className="text-primary">-€{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-stone-600">Envío</span>
                  <span className={shipping === 0 ? 'text-primary' : 'text-stone-900'}>
                    {shipping === 0 ? 'GRATIS' : `€${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between pt-4 border-t border-stone-200">
                  <span className="text-lg text-stone-900">Total</span>
                  <span className="text-2xl text-stone-900">€{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Trust Signals */}
              <div className="space-y-2 pt-4 border-t border-stone-200">
                <div className="flex items-center gap-2 text-xs text-stone-600">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Pago seguro encriptado</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-600">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Devoluciones gratuitas 30 días</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-600">
                  <CheckCircle className="h-4 w-4 text-primary" />
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
