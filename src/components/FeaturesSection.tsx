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
    <section className="py-8 sm:py-10 lg:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="flex flex-col items-center text-center">
                {/* Icon - Above the title */}
                <div className="w-12 h-12 flex items-center justify-center mb-3">
                  <IconComponent className="w-10 h-10 text-[#83b5b6]" strokeWidth={1.5} />
                </div>
                
                {/* Title - Bold */}
                <h3 className="text-sm font-bold text-[#2d3748] mb-1.5">
                  {feature.title}
                </h3>
                
                {/* Description - Small and soft */}
                <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
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
