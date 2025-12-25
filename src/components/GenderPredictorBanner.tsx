import { Baby, Sparkles, ArrowRight } from 'lucide-react';

interface GenderPredictorBannerProps {
  onClick: () => void;
}

export function GenderPredictorBanner({ onClick }: GenderPredictorBannerProps) {
  return (
    <section className="relative py-16 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-yellow-200 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left side - Icon & Text */}
          <div className="flex items-center gap-6 text-white">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border-2 border-white/30 animate-bounce">
              <Baby className="h-10 w-10 text-white" />
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 animate-pulse" />
                <span className="text-sm uppercase tracking-wider font-medium">Gratis • Divertido • Instantáneo</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                ¿Niño o niña? Descúbrelo ahora
              </h2>
              <p className="text-lg text-white/90">
                Predicción personalizada + 15% descuento en productos
              </p>
            </div>
          </div>

          {/* Right side - CTA */}
          <button
            onClick={onClick}
            className="group px-8 py-5 bg-white text-stone-900 rounded-2xl text-lg font-medium transition-all duration-300 hover:shadow-2xl hover:scale-105 flex items-center gap-3 whitespace-nowrap"
          >
            <span>Hacer predicción</span>
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1">
              <ArrowRight className="h-5 w-5 text-white" />
            </div>
          </button>
        </div>

        {/* Social Proof */}
        <div className="flex items-center justify-center gap-4 mt-8 text-white/90 text-sm">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-white/30 border-2 border-white"
              />
            ))}
          </div>
          <span>+50,000 mamás ya han hecho su predicción</span>
        </div>
      </div>
    </section>
  );
}
