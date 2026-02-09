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
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="flex flex-col items-center text-center">
                {/* Icon Container - Pink icon on light grey circle */}
                <div className="w-20 h-20 bg-[#F5F5F5] rounded-full flex items-center justify-center mb-6">
                  <IconComponent className="h-10 w-10 text-[#FF6B9D]" strokeWidth={1.5} />
                </div>
                
                {/* Title - Bold dark text */}
                <h3 className="text-xl font-bold text-[#2d3748] mb-3">
                  {feature.title}
                </h3>
                
                {/* Description - Grey text */}
                <p className="text-base text-[#718096] max-w-sm leading-relaxed">
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
