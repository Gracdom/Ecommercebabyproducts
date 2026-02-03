import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CreditCard, Lock, MapPin, User, Mail, Phone, Home, Building, CheckCircle, Package, Truck, Gift } from 'lucide-react';
import { Product } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';
import { getShippingOptions, orderCheck, orderCreate } from '../utils/bigbuy/edge';
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
  const [giftWrap, setGiftWrap] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  // BigBuy shipping options
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [selectedShippingOption, setSelectedShippingOption] = useState<any | null>(null);

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

  const bigbuyItemsKey = useMemo(() => {
    return bigbuyItems.map(i => `${i.reference}:${i.quantity}`).join('|');
  }, [bigbuyItems]);
  
  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  const shipping = Number(selectedShippingOption?.cost ?? 0);
  // Keep these at 0 so the checkout total matches BigBuy (MVP).
  const giftWrapCost = 0;
  const discount = 0;
  const total = subtotal + shipping;

  // Fetch shipping options whenever address changes (step 2)
  useEffect(() => {
    if (step !== 2) return;
    const pcRaw = String(postalCode ?? "");
    const pc = pcRaw.replace(/\s+/g, "").trim();

    const isValidPostal = (countryIso: string, postcode: string) => {
      const iso = String(countryIso || "").toUpperCase();
      // ES/FR/DE/IT are 5 digits in most cases. PT can be 4 or 4-3.
      if (iso === "PT") return /^\d{4}(-\d{3})?$/.test(postcode);
      if (["ES", "FR", "DE", "IT"].includes(iso)) return /^\d{5}$/.test(postcode);
      return postcode.length >= 4;
    };

    if (!pc || !isoCountry || !bigbuyItems.length || !isValidPostal(isoCountry, pc)) {
      // Clear stale options when the address is incomplete/invalid.
      setShippingLoading(false);
      setShippingError(null);
      setShippingOptions([]);
      setSelectedShippingOption(null);
      return;
    }

    let cancelled = false;
    const t = setTimeout(() => {
      if (cancelled) return;
      setShippingLoading(true);
      setShippingError(null);
      setSelectedShippingOption(null);

      getShippingOptions({ isoCountry, postcode: pc, items: bigbuyItems })
        .then((res: any) => {
          if (cancelled) return;
          const options = res?.shippingOptions ?? [];
          setShippingOptions(options);
          setSelectedShippingOption(options[0] ?? null);
        })
        .catch((err: any) => {
          if (cancelled) return;
          setShippingOptions([]);
          setSelectedShippingOption(null);
          setShippingError(err?.message || 'No se pudieron cargar opciones de envío');
        })
        .finally(() => {
          if (cancelled) return;
          setShippingLoading(false);
        });
    }, 650);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [step, postalCode, isoCountry, bigbuyItemsKey]);

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

    if (!selectedShippingOption?.shippingService?.serviceName) {
      toast.error('Selecciona una opción de envío', { duration: 3000 });
      return;
    }

    const carrierName = String(selectedShippingOption.shippingService.serviceName).toLowerCase();
    const bigbuyPaymentMethod =
      paymentMethod === 'card' ? 'moneybox' :
      paymentMethod === 'paypal' ? 'paypal' :
      'bankwire';

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

      const checkRes: any = await orderCheck({
        internalReference,
        language: 'es',
        paymentMethod: bigbuyPaymentMethod,
        carrierName,
        shippingAddress,
        items: bigbuyItems,
      });

      if (Array.isArray(checkRes?.errors) && checkRes.errors.length > 0) {
        throw new Error(checkRes.errors[0]?.message || 'Error validando el pedido en BigBuy');
      }

      const createRes: any = await orderCreate({
        internalReference,
        language: 'es',
        paymentMethod: bigbuyPaymentMethod,
        carrierName,
        shippingAddress,
        items: bigbuyItems,
        meta: {
          subtotal,
          shippingCost: shipping,
          total,
          selectedCarrier: carrierName,
          selectedServiceName: selectedShippingOption.shippingService.serviceName,
        },
      });

      if (Array.isArray(createRes?.errors) && createRes.errors.length > 0) {
        throw new Error(createRes.errors[0]?.message || 'Error creando el pedido en BigBuy');
      }

      const bigbuyOrderIds = (createRes?.orders ?? [])
        .map((o: any) => String(o?.id ?? '').trim())
        .filter(Boolean);

      const bigbuyTotal = Array.isArray(checkRes?.orders)
        ? checkRes.orders.reduce((sum: number, o: any) => sum + Number(o?.total ?? 0), 0)
        : 0;

      const orderData: OrderData = {
        orderId: internalReference,
        bigbuyOrderIds,
        shippingOption: {
          serviceName: selectedShippingOption.shippingService.serviceName,
          delay: selectedShippingOption.shippingService.delay,
          cost: selectedShippingOption.cost,
        },
        customerInfo: { email, firstName, lastName, phone },
        shippingAddress: { street: `${street}${apartment ? ', ' + apartment : ''}`, city, postalCode, country },
        paymentMethod,
        total: bigbuyTotal || total,
        items,
      };

      // Track purchase for each product
      items.forEach((item) => {
        trackPurchase(item.id, internalReference);
      });

      onComplete(orderData);
    } catch (err: any) {
      console.error(err);
      toast.error('No se pudo crear el pedido en BigBuy', {
        description: err?.message || 'Inténtalo de nuevo',
        duration: 6000,
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  const isStepValid = () => {
    if (step === 1) return email && firstName && lastName;
    if (step === 2) return street && city && postalCode && country && !!selectedShippingOption;
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
                  <h3 className="text-sm text-stone-900 mb-3">Opciones de envío (BigBuy)</h3>

                  {shippingLoading && (
                    <div className="text-sm text-stone-600">Cargando opciones de envío…</div>
                  )}

                  {shippingError && (
                    <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                      {shippingError}
                    </div>
                  )}

                  {!shippingLoading && !shippingError && shippingOptions.length === 0 && (
                    <div className="text-sm text-stone-600">
                      Introduce país y código postal para ver opciones de envío.
                    </div>
                  )}

                  {!shippingLoading && shippingOptions.length > 0 && (
                    <div className="space-y-3">
                      {shippingOptions.map((opt: any, idx: number) => {
                        const key = `${opt?.shippingService?.id ?? idx}-${opt?.shippingService?.serviceName ?? ''}`;
                        const checked = (selectedShippingOption?.shippingService?.id ?? null) === (opt?.shippingService?.id ?? null);
                        const label = opt?.shippingService?.serviceName || opt?.shippingService?.name || 'Envío';
                        const delay = opt?.shippingService?.delay;
                        const cost = Number(opt?.cost ?? 0);
                        return (
                          <label
                            key={key}
                            className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                              checked ? 'border-stone-900' : 'border-stone-200 hover:border-stone-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="shipping"
                                checked={checked}
                                onChange={() => setSelectedShippingOption(opt)}
                                className="text-stone-900"
                              />
                              <div className="flex items-center gap-2">
                                <Truck className="h-5 w-5 text-stone-600" />
                                <div>
                                  <p className="text-sm text-stone-900">{label}</p>
                                  {delay && <p className="text-xs text-stone-600">Entrega estimada: {delay}</p>}
                                </div>
                              </div>
                            </div>
                            <span className="text-sm text-stone-900">€{cost.toFixed(2)}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
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
                disabled={!isStepValid() || (step === 2 && shippingLoading) || placingOrder}
                className="flex-1 bg-stone-900 text-white py-3 rounded-lg hover:bg-stone-800 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed"
              >
                {placingOrder ? 'Procesando…' : step === 3 ? 'Completar pedido' : 'Continuar al siguiente paso'}
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
                  <p className="text-xs text-primary mt-2">¡Código aplicado! -10% de descuento</p>
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
                    <Gift className="h-4 w-4 text-accent" />
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
                    <span className="text-primary">-€{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-stone-600">Envío</span>
                  <span className={shipping === 0 ? 'text-primary' : 'text-stone-900'}>
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
