import { useEffect } from 'react';
import { CheckCircle, Package, Mail, Download, Home, MapPin, CreditCard, Calendar } from 'lucide-react';
import { OrderData } from './CheckoutPage';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface OrderConfirmationProps {
  orderData: OrderData;
  onBackToHome: () => void;
}

export function OrderConfirmation({ orderData, onBackToHome }: OrderConfirmationProps) {
  const estimatedDeliveryDate = new Date();
  const delayStr = orderData.shippingOption?.delay ?? '';
  const delayDays = delayStr ? parseInt((delayStr.match(/\d+/)?.[0] ?? '4'), 10) : 4;
  estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + (Number.isFinite(delayDays) ? delayDays : 4));

  // Disparar evento purchase para Google Tag Manager (GTM)
  // Usa parámetros de la URL si existen, si no los de orderData
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const transactionId = params.get('transaction_id') ?? orderData.orderId;
    const valueParam = params.get('value');
    const value = valueParam != null ? Number(valueParam) : Number(orderData.total.toFixed(2));
    const currency = params.get('currency') ?? 'EUR';
    const email = params.get('email') ?? orderData.customerInfo.email;
    const phone = params.get('phone') ?? orderData.customerInfo.phone;

    const w = window as any;
    w.dataLayer = w.dataLayer || [];

    w.dataLayer.push({
      event: 'purchase',
      transaction_id: transactionId,
      value,
      currency,
      email,
      phone,
      items: orderData.items.map((item) => ({
        item_id: item.sku || item.variantSku || String(item.id),
        item_name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
      })),
    });
  }, [orderData]);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl text-stone-900 mb-3">¡Pedido confirmado!</h1>
          <p className="text-lg text-stone-600 mb-2">Gracias por tu compra, {orderData.customerInfo.firstName}</p>
          <p className="text-sm text-stone-500">
            Te hemos enviado un email de confirmación a <strong>{orderData.customerInfo.email}</strong>
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <div className="grid sm:grid-cols-2 gap-6 mb-8 pb-8 border-b border-stone-200">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-5 w-5 text-stone-600" />
                <h3 className="text-sm text-stone-600">Número de pedido</h3>
              </div>
              <p className="text-lg text-stone-900">{orderData.orderId}</p>
              {orderData.bigbuyOrderIds && orderData.bigbuyOrderIds.length > 0 && (
                <div className="mt-3 text-sm text-stone-600">
                  <div className="font-medium text-stone-900">Pedidos BigBuy</div>
                  <div className="mt-1 space-y-1">
                    {orderData.bigbuyOrderIds.map((id) => (
                      <div key={id}>#{id}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-stone-600" />
                <h3 className="text-sm text-stone-600">Entrega estimada</h3>
              </div>
              <p className="text-lg text-stone-900">
                {estimatedDeliveryDate.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </p>
              {orderData.shippingOption?.serviceName && (
                <p className="text-sm text-stone-600 mt-1">
                  Envío: {orderData.shippingOption.serviceName}
                  {orderData.shippingOption.cost !== undefined ? ` (€${Number(orderData.shippingOption.cost).toFixed(2)})` : ''}
                </p>
              )}
            </div>
          </div>

          {/* Products Ordered */}
          <div className="mb-8">
            <h3 className="text-lg text-stone-900 mb-4">Productos pedidos</h3>
            <div className="space-y-4">
              {orderData.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-stone-50 rounded-lg">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="text-sm text-stone-900 mb-1">{item.name}</h4>
                    <p className="text-sm text-stone-600">Cantidad: {item.quantity || 1}</p>
                    <p className="text-sm text-stone-900 mt-2">€{(item.price * (item.quantity || 1)).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Payment Info */}
          <div className="grid sm:grid-cols-2 gap-6 mb-8 pb-8 border-b border-stone-200">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-5 w-5 text-stone-600" />
                <h3 className="text-sm text-stone-900">Dirección de envío</h3>
              </div>
              <div className="text-sm text-stone-600 space-y-1">
                <p>{orderData.customerInfo.firstName} {orderData.customerInfo.lastName}</p>
                <p>{orderData.shippingAddress.street}</p>
                <p>{orderData.shippingAddress.postalCode} {orderData.shippingAddress.city}</p>
                <p>{orderData.shippingAddress.country}</p>
                {orderData.customerInfo.phone && <p>{orderData.customerInfo.phone}</p>}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="h-5 w-5 text-stone-600" />
                <h3 className="text-sm text-stone-900">Método de pago</h3>
              </div>
              <div className="text-sm text-stone-600">
                <p className="capitalize">
                  {orderData.paymentMethod === 'card' && 'Tarjeta de crédito/débito'}
                  {orderData.paymentMethod === 'paypal' && 'PayPal'}
                  {orderData.paymentMethod === 'bank' && 'Transferencia bancaria'}
                </p>
              </div>
            </div>
          </div>

          {/* Order Total */}
          <div className="flex justify-between items-center mb-8">
            <span className="text-lg text-stone-900">Total pagado</span>
            <span className="text-2xl text-stone-900">€{orderData.total.toFixed(2)}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex-1 bg-stone-900 text-white py-3 rounded-lg hover:bg-stone-800 transition-colors flex items-center justify-center gap-2">
              <Download className="h-5 w-5" />
              Descargar factura
            </button>
            <button 
              onClick={onBackToHome}
              className="flex-1 border border-stone-300 text-stone-900 py-3 rounded-lg hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
            >
              <Home className="h-5 w-5" />
              Volver a la tienda
            </button>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="text-lg text-blue-900 mb-4">¿Qué sigue ahora?</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Mail className="h-4 w-4 text-blue-700" />
              </div>
              <div>
                <p className="font-medium">Recibirás un email de confirmación</p>
                <p className="text-blue-700">Con todos los detalles de tu pedido y el número de seguimiento</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Package className="h-4 w-4 text-blue-700" />
              </div>
              <div>
                <p className="font-medium">Preparamos tu pedido</p>
                <p className="text-blue-700">Nuestro equipo empaquetará tus productos con cuidado</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="h-4 w-4 text-blue-700" />
              </div>
              <div>
                <p className="font-medium">Entrega a domicilio</p>
                <p className="text-blue-700">
                  Recibirás tu pedido en {estimatedDeliveryDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="bg-white rounded-xl p-6 text-center">
          <h3 className="text-lg text-stone-900 mb-2">¿Necesitas ayuda?</h3>
          <p className="text-sm text-stone-600 mb-4">
            Nuestro equipo de atención al cliente está disponible de lunes a viernes de 9:00 a 18:00
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
            <a href="mailto:info@ebaby-shop.com" className="text-stone-900 hover:underline flex items-center gap-2">
              <Mail className="h-4 w-4" />
              info@ebaby-shop.com
            </a>
            <span className="hidden sm:inline text-stone-300">|</span>
            <a href="https://wa.me/34910202911" target="_blank" rel="noopener noreferrer" className="text-stone-600 hover:underline">
              +34 910 202 911
            </a>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Compra 100% segura</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Devoluciones gratuitas 30 días</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Garantía de satisfacción</span>
          </div>
        </div>
      </div>
    </div>
  );
}
