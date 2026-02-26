import { Truck, RefreshCw, CreditCard } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: Truck,
      title: 'Envío Gratuito',
      description: 'Cada compra superior a 199€ es elegible para envío gratuito.',
    },
    {
      icon: RefreshCw,
      title: 'Devoluciones Fáciles',
      description: '30 días de garantía para cada producto de nuestra tienda.',
    },
    {
      icon: CreditCard,
      title: 'Pagos Seguros',
      description: 'Todos los pagos procesados a través de un protocolo de pago seguro.',
    },
  ];

  return (
    <section className="py-6 sm:py-10 lg:py-12 bg-white" aria-label="Ventajas de compra">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Móvil: 3 columnas (uno al lado del otro); tablet/desktop: mismo */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center sm:p-6 rounded-xl md:rounded-2xl hover:bg-stone-50/50 md:hover:bg-stone-50/30 transition-colors touch-manipulation min-w-0"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center flex-shrink-0 mb-2 sm:mb-3">
                  <IconComponent className="w-6 h-6 sm:w-10 sm:h-10 text-[#83b5b6]" strokeWidth={1.5} aria-hidden />
                </div>
                <h3 className="text-[11px] sm:text-sm font-bold text-[#2d3748] mb-1 sm:mb-1.5 leading-tight px-0.5">
                  {feature.title}
                </h3>
                <p className="hidden sm:block text-xs text-stone-500 leading-snug max-w-xs mx-auto">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
