import { Shield, Truck, RefreshCw, Award, Lock, Heart } from 'lucide-react';

export function TrustBadges() {
  return (
    <div className="bg-gradient-to-r from-stone-50 to-stone-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-xs text-stone-900 mb-1">Pago 100%</p>
            <p className="text-xs text-stone-600">Seguro</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-xs text-stone-900 mb-1">Envío gratis</p>
            <p className="text-xs text-stone-600">+50€</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
              <RefreshCw className="h-6 w-6 text-accent" />
            </div>
            <p className="text-xs text-stone-900 mb-1">Devolución</p>
            <p className="text-xs text-stone-600">30 días gratis</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
              <Award className="h-6 w-6 text-amber-600" />
            </div>
            <p className="text-xs text-stone-900 mb-1">Garantía de</p>
            <p className="text-xs text-stone-600">Calidad</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
              <Lock className="h-6 w-6 text-stone-600" />
            </div>
            <p className="text-xs text-stone-900 mb-1">Datos</p>
            <p className="text-xs text-stone-600">Protegidos SSL</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <p className="text-xs text-stone-900 mb-1">+15,000</p>
            <p className="text-xs text-stone-600">Clientes felices</p>
          </div>
        </div>
      </div>
    </div>
  );
}
