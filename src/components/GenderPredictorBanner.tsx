import { Sparkles, ArrowRight } from 'lucide-react';

interface GenderPredictorBannerProps {
  onClick: () => void;
}

export function GenderPredictorBanner({ onClick }: GenderPredictorBannerProps) {
  return (
    <section
      className="relative py-6 sm:py-8 lg:py-0 overflow-hidden min-h-[280px] sm:min-h-[320px] lg:min-h-[350px] banner-section"
      style={{ backgroundColor: '#83b4b6' }}
    >
      <style>{`
        /* Móvil: letras blancas */
        .banner-section { --hero-text: white; --hero-subtext: rgba(255,255,255,0.9); }
        /* Desktop (lg = 1024px+): letras oscuras */
        @media (min-width: 1024px) {
          .banner-section { --hero-text: #2d3748; --hero-subtext: #718096; }
        }
      `}</style>

      {/* MÓVIL: imagen de fondo con opacidad (oculta en desktop) */}
      <div className="lg:hidden absolute inset-0 z-0">
        <img
          src="/gender-predictor-banner.png"
          alt=""
          aria-hidden
          className="w-full h-full object-cover object-right opacity-30"
        />
      </div>

      {/* DESKTOP: imagen derecha tal cual estaba */}
      <div className="hidden lg:block absolute top-0 right-0 w-[50vw] h-full" style={{ right: 0, top: 0, bottom: 0 }}>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 lg:pl-10 lg:pr-0 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 min-h-[260px] sm:min-h-[300px] lg:min-h-[350px] relative">
          {/* Texto */}
          <div className="flex-1 lg:max-w-2xl space-y-3 sm:space-y-4 py-4 z-10 lg:py-8 text-left">
            <div className="flex items-center justify-start gap-3">
              <Sparkles className="h-5 w-5 text-[#FF6B9D] animate-pulse fill-[#FF6B9D]" />
              <span
                className="text-sm uppercase tracking-wider font-bold"
                style={{ color: 'var(--hero-text, white)' }}
              >
                Gratis • Divertido • Instantáneo
              </span>
            </div>
            
            <h2
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
              style={{ color: 'var(--hero-text, white)' }}
            >
              ¿Niño o niña?<br />
              Descúbrelo ahora
            </h2>
            
            <p
              className="text-lg sm:text-xl leading-relaxed max-w-xl"
              style={{ color: 'var(--hero-subtext, rgba(255,255,255,0.9))' }}
            >
              Predicción personalizada + 15% descuento en productos
            </p>

            <div className="flex justify-start mt-4">
              <button
                onClick={onClick}
                className="group px-8 py-4 bg-[#FFC1CC] hover:bg-[#83b5b6] text-white rounded-full text-base font-bold transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center gap-2 whitespace-nowrap shadow-lg touch-manipulation min-h-[52px]"
                style={{ backgroundColor: '#FFC1CC' }}
              >
                <span>Hacer predicción</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
