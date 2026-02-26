import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Star, TrendingUp, Baby } from 'lucide-react';

interface HeroProps {
  onGenderPredictorClick?: () => void;
  onExploreClick?: () => void;
  onOffersClick?: () => void;
}

export function Hero({ onGenderPredictorClick, onExploreClick, onOffersClick }: HeroProps = {}) {
  const [scrollY, setScrollY] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const slides = [
    {
      image: '/hero-1.png',
    },
    {
      image: '/hero-2.png',
    },
    {
      image: '/hero-3.png',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="w-full relative overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, rgba(224, 247, 250, 0.6) 0%, rgba(255, 255, 255, 1) 100%)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      {/* Soft animated background shapes - Pastel theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-[#FFC1CC]/25 to-[#E1BEE7]/20 rounded-full blur-3xl animate-pulse"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        />
        <div
          className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-gradient-to-br from-[#E0F7FA]/25 to-[#C8E6C9]/20 rounded-full blur-3xl animate-pulse"
          style={{ transform: `translateY(${-scrollY * 0.2}px)` }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-br from-[#FFF9C4]/20 to-[#FFE0B2]/15 rounded-full blur-3xl"
          style={{ transform: `translate(-50%, -50%) scale(${1 + scrollY * 0.001})` }}
        />
      </div>

      {/* Grid: móvil = una columna (fondo absoluto + texto); desktop = 2 cols */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[85dvh] lg:min-h-[700px] relative">
        {/* Móvil: imágenes como fondo con opacidad + overlay (misma área que el texto por posición absoluta) */}
        <div className="lg:hidden absolute inset-0 z-0">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={slide.image}
                alt=""
                aria-hidden
                className="w-full h-full object-cover object-center opacity-50"
              />
            </div>
          ))}
          <div
            className="absolute inset-0 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none"
            aria-hidden
          />
        </div>

        {/* Columna texto: en móvil va encima del fondo (z-10) y abajo (justify-end); en desktop centrado */}
        <div
          className="flex flex-col justify-end lg:justify-center order-2 lg:order-1 px-4 py-6 sm:px-6 sm:py-8 lg:pl-[7.5rem] lg:pr-10 lg:py-16 relative z-10 space-y-4 sm:space-y-6 lg:space-y-8 pb-8 lg:pb-0"
          style={{ transform: `translateX(${-scrollY * 0.1}px)` }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-[#FFC1CC]/30 via-[#E0F7FA]/30 to-[#FFF9C4]/30 px-3 sm:px-6 py-2 sm:py-3 rounded-full backdrop-blur-sm flex-wrap w-fit">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-[#FF6B9D] animate-pulse flex-shrink-0" />
            <span className="text-xs sm:text-sm text-[#2d3748] font-semibold">
              Envío gratis a partir de 200€
            </span>
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#FFC1CC] rounded-full animate-pulse flex-shrink-0" />
          </div>

          {/* Headline - móvil más compacto */}
          <div className="space-y-3 sm:space-y-6">
            <h1
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-[#2d3748] leading-[1.15] font-bold"
              style={{ fontFamily: "'Quicksand', 'Nunito', sans-serif" }}
            >
              Lo mejor para
              <span className="block text-[#FFC1CC] animate-in fade-in duration-1000" style={{ color: '#FFC1CC' }}>
                tu bebé
              </span>
            </h1>
            <p className="text-sm sm:text-xl lg:text-2xl text-[#718096] max-w-xl leading-relaxed font-normal">
              Productos premium de algodón orgánico, diseñados con amor para el confort y desarrollo de tu pequeño
            </p>
          </div>

          {/* Trust */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm sm:text-base text-[#718096]">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-[#FBBF24] text-[#FBBF24] flex-shrink-0" />
              ))}
              <span className="font-semibold text-[#2d3748] text-xs sm:text-sm">4.9/5 (2,847 reseñas)</span>
            </div>
          </div>

          {/* CTAs - botón grande como original; full width móvil, touch 48px */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <button
              onClick={onExploreClick}
              className="group relative w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 min-h-[48px] bg-[#FFC1CC] text-white rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-[#83b5b6] active:scale-[0.98] font-bold text-base sm:text-lg touch-manipulation"
              style={{ backgroundColor: '#FFC1CC' }}
            >
              <div className="relative flex items-center justify-center gap-3">
                <span>Explorar Colección</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
              </div>
            </button>
            <button
              onClick={onOffersClick}
              className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 min-h-[48px] border-[3px] border-[#FFC1CC] text-[#FFC1CC] rounded-full hover:bg-[#83b5b6] hover:text-white hover:border-[#83b5b6] transition-all duration-300 hover:scale-105 active:scale-[0.98] font-bold text-base sm:text-lg bg-white backdrop-blur-sm touch-manipulation"
              style={{ borderColor: '#FFC1CC', color: '#FFC1CC' }}
            >
              Ver Ofertas
            </button>
          </div>

          {/* Stats - más compacto en móvil */}
          <div className="grid grid-cols-3 gap-2 sm:gap-6">
            <div className="space-y-0.5 sm:space-y-1">
              <div className="text-lg sm:text-2xl lg:text-3xl text-[#2d3748] font-bold">15K+</div>
              <div className="text-[10px] sm:text-sm text-[#718096] font-medium leading-tight">Productos vendidos</div>
            </div>
            <div className="space-y-0.5 sm:space-y-1">
              <div className="text-lg sm:text-2xl lg:text-3xl text-[#2d3748] font-bold">98%</div>
              <div className="text-[10px] sm:text-sm text-[#718096] font-medium leading-tight">Satisfacción</div>
            </div>
            <div className="space-y-0.5 sm:space-y-1">
              <div className="flex items-center gap-1 sm:gap-2 text-lg sm:text-2xl lg:text-3xl text-[#2d3748] font-bold">
                <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-[#FF6B9D] flex-shrink-0" />
                24h
              </div>
              <div className="text-[10px] sm:text-sm text-[#718096] font-medium leading-tight">Envío express</div>
            </div>
          </div>
        </div>

        {/* Desktop: imagen derecha */}
        <div className="hidden lg:block lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="relative w-full h-full overflow-hidden">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={slide.image}
                  alt={`Hero image ${index + 1}`}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </div>
  );
}