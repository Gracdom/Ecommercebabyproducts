import { Sparkles, ArrowRight, Baby } from 'lucide-react';

interface GenderPredictorBannerProps {
  onClick: () => void;
}

export function GenderPredictorBanner({ onClick }: GenderPredictorBannerProps) {
  return (
    <section className="relative py-8 lg:py-0 overflow-hidden" style={{ 
      backgroundColor: '#83b4b6',
      minHeight: '350px'
    }}>
      {/* Right side - Ultrasound image - Absolute positioned, no padding */}
      <div className="hidden lg:block absolute top-0 right-0 w-[50vw] h-full" style={{ 
        right: 0,
        top: 0,
        bottom: 0
      }}>
        <img
          src="/gender-predictor-banner.png"
          alt="Ecografía - Predicción de género"
          className="w-full h-full object-cover"
          style={{
            display: 'block',
            objectFit: 'cover',
            objectPosition: 'right center',
            height: '100%',
            width: '100%'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:pl-10 lg:pr-0 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 min-h-[350px] relative">
          {/* Left side - Text Content */}
          <div className="flex-1 lg:max-w-2xl space-y-4 py-4 z-10 lg:py-8">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-[#FF6B9D] animate-pulse fill-[#FF6B9D]" />
              <span className="text-sm uppercase tracking-wider font-bold text-[#2d3748]">
                Gratis • Divertido • Instantáneo
              </span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2d3748] leading-tight">
              ¿Niño o niña?<br />
              Descúbrelo ahora
            </h2>
            
            <p className="text-lg sm:text-xl text-[#718096] leading-relaxed max-w-xl">
              Predicción personalizada + 15% descuento en productos
            </p>

            {/* CTA Button - Smaller */}
            <button
              onClick={onClick}
              className="group px-8 py-4 bg-[#FFC1CC] hover:bg-[#FFB3C1] text-white rounded-full text-base font-bold transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center gap-2 whitespace-nowrap shadow-lg mt-4"
              style={{ backgroundColor: '#FFC1CC' }}
            >
              <span>Hacer predicción</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
          
          {/* Mobile image */}
          <div className="lg:hidden relative w-full h-auto min-h-[300px]">
            <img
              src="/gender-predictor-banner.png"
              alt="Ecografía - Predicción de género"
              className="w-full h-auto max-h-[400px] object-contain mx-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
