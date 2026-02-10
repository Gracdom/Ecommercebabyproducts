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
    <div className="w-full relative overflow-hidden" style={{ 
      background: 'linear-gradient(to bottom, rgba(224, 247, 250, 0.6) 0%, rgba(255, 255, 255, 1) 100%)',
    }}>
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

      {/* Split Screen Grid */}
      <div className="grid lg:grid-cols-2 min-h-[600px] lg:min-h-[700px]">
        {/* Left Column - Text Content */}
        <div 
          className="flex flex-col justify-center px-6 sm:px-8 lg:pl-20 lg:pr-10 py-8 sm:py-12 lg:py-16 relative z-10 space-y-6 sm:space-y-8"
          style={{ transform: `translateX(${-scrollY * 0.1}px)` }}
        >
          {/* Badge - More rounded, pastel colors */}
          <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-[#FFC1CC]/30 via-[#E0F7FA]/30 to-[#FFF9C4]/30 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full border-2 border-[#FFC1CC]/40 shadow-sm backdrop-blur-sm flex-wrap">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-[#FF6B9D] animate-pulse flex-shrink-0" />
            <span className="text-xs sm:text-sm text-[#2d3748] font-semibold">
              Envío gratis en pedidos +50€
            </span>
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#FFC1CC] rounded-full animate-pulse flex-shrink-0" />
          </div>

          {/* Main Headline - Responsive typography */}
          <div className="space-y-4 sm:space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#2d3748] leading-[1.15] font-bold" style={{ fontFamily: "'Quicksand', 'Nunito', sans-serif" }}>
              Lo mejor para
              <span className="block text-[#FFC1CC] animate-in fade-in duration-1000" style={{ color: '#FFC1CC' }}>
                tu bebé
              </span>
            </h1>
            <p className="text-base sm:text-xl lg:text-2xl text-[#718096] max-w-xl leading-relaxed font-normal">
              Productos premium de algodón orgánico, diseñados con amor para el confort y desarrollo de tu pequeño
            </p>
          </div>

          {/* Trust indicators - Responsive wrap and size */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm sm:text-base text-[#718096]">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex -space-x-2 sm:-space-x-3 flex-shrink-0">
                <img src="https://images.unsplash.com/photo-1764859878528-2b512ab9d4d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGJhYnklMjBmYWNlJTIwbmF0dXJhbCUyMGxpZ2h0fGVufDF8fHx8MTc2NjgzMjY0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="Bebé feliz" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 sm:border-[3px] border-white object-cover shadow-md" />
                <img src="https://images.unsplash.com/photo-1622632405663-f43782a098b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RoZXIlMjBzbWlsaW5nJTIwcG9ydHJhaXQlMjBzb2Z0JTIwY29sb3JzfGVufDF8fHx8MTc2NjgzMjY1M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="Mamá feliz" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 sm:border-[3px] border-white object-cover shadow-md" />
                <img src="https://images.unsplash.com/photo-1761891949359-abd8fb35b987?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXRoZXIlMjBiYWJ5JTIwcG9ydHJhaXQlMjBuYXR1cmFsfGVufDF8fHx8MTc2NjgzMjY1NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="Papá y bebé" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 sm:border-[3px] border-white object-cover shadow-md" />
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#FFC1CC] to-[#FFB3C1] border-2 sm:border-[3px] border-white flex items-center justify-center shadow-md">
                  <span className="text-[10px] sm:text-xs text-white font-bold">+5K</span>
                </div>
              </div>
              <span className="font-semibold whitespace-nowrap">Clientes felices</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-[#FBBF24] text-[#FBBF24] flex-shrink-0" />
              ))}
              <span className="font-semibold text-[#2d3748] text-xs sm:text-sm">4.9/5 (2,847 reseñas)</span>
            </div>
          </div>

          {/* CTAs - Touch-friendly min height, full width on mobile */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <button 
              onClick={onExploreClick}
              className="group relative w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 min-h-[48px] sm:min-h-0 bg-[#FFC1CC] text-white rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-[#83b5b6] active:scale-[0.98] font-bold text-base sm:text-lg"
              style={{ backgroundColor: '#FFC1CC' }}
            >
              <div className="relative flex items-center justify-center gap-3">
                <span>Explorar Colección</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
              </div>
            </button>
            
            <button 
              onClick={onOffersClick}
              className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 min-h-[48px] sm:min-h-0 border-[3px] border-[#FFC1CC] text-[#FFC1CC] rounded-full hover:bg-[#83b5b6] hover:text-white hover:border-[#83b5b6] transition-all duration-300 hover:scale-105 active:scale-[0.98] font-bold text-base sm:text-lg bg-white backdrop-blur-sm"
              style={{ borderColor: '#FFC1CC', color: '#FFC1CC' }}
            >
              Ver Ofertas
            </button>
          </div>

          {/* Stats - Responsive grid and text */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-1">
              <div className="text-xl sm:text-2xl lg:text-3xl text-[#2d3748] font-bold">15K+</div>
              <div className="text-xs sm:text-sm text-[#718096] font-medium">Productos vendidos</div>
            </div>
            <div className="space-y-1">
              <div className="text-xl sm:text-2xl lg:text-3xl text-[#2d3748] font-bold">98%</div>
              <div className="text-xs sm:text-sm text-[#718096] font-medium">Satisfacción</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 sm:gap-2 text-xl sm:text-2xl lg:text-3xl text-[#2d3748] font-bold">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-[#FF6B9D] flex-shrink-0" />
                24h
              </div>
              <div className="text-xs sm:text-sm text-[#718096] font-medium">Envío express</div>
            </div>
          </div>
        </div>

        {/* Right Column - Image (Desktop) - Pegada al borde */}
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

        {/* Mobile Image - Show on small screens */}
        <div className="lg:hidden h-64 sm:h-80 relative overflow-hidden">
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

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </div>
  );
}