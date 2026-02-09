import { Shield, Truck, RefreshCw, Award, Lock, Heart } from 'lucide-react';

export function TrustBadges() {
  return (
    <div className="bg-white py-12 border-t border-[#E2E8F0]" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-[#C8E6C9] to-[#A5D6A7] rounded-3xl flex items-center justify-center mb-4 shadow-lg">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <p className="text-sm font-semibold text-[#2d3748] mb-1">Pago 100%</p>
            <p className="text-xs text-[#718096]">Seguro</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-[#E0F7FA] to-[#B2EBF2] rounded-3xl flex items-center justify-center mb-4 shadow-lg">
              <Truck className="h-7 w-7 text-white" />
            </div>
            <p className="text-sm font-semibold text-[#2d3748] mb-1">Envío gratis</p>
            <p className="text-xs text-[#718096]">+50€</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-[#FFF9C4] to-[#FFE5B4] rounded-3xl flex items-center justify-center mb-4 shadow-lg">
              <RefreshCw className="h-7 w-7 text-white" />
            </div>
            <p className="text-sm font-semibold text-[#2d3748] mb-1">Devolución</p>
            <p className="text-xs text-[#718096]">30 días gratis</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-[#FFC1CC] to-[#FFB3C1] rounded-3xl flex items-center justify-center mb-4 shadow-lg">
              <Award className="h-7 w-7 text-white" />
            </div>
            <p className="text-sm font-semibold text-[#2d3748] mb-1">Garantía de</p>
            <p className="text-xs text-[#718096]">Calidad</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-[#E1BEE7] to-[#CE93D8] rounded-3xl flex items-center justify-center mb-4 shadow-lg">
              <Lock className="h-7 w-7 text-white" />
            </div>
            <p className="text-sm font-semibold text-[#2d3748] mb-1">Datos</p>
            <p className="text-xs text-[#718096]">Protegidos SSL</p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-[#FFC1CC] to-[#FFB3C1] rounded-3xl flex items-center justify-center mb-4 shadow-lg">
              <Heart className="h-7 w-7 text-white fill-white" />
            </div>
            <p className="text-sm font-semibold text-[#2d3748] mb-1">+15,000</p>
            <p className="text-xs text-[#718096]">Clientes felices</p>
          </div>
        </div>
      </div>
    </div>
  );
}
