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
    <div className="relative" style={{ 
      background: 'linear-gradient(to bottom, rgba(224, 247, 250, 0.6) 0%, rgba(255, 255, 255, 1) 100%)',
      minHeight: '700px',
      position: 'relative'
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

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-6 relative z-10" style={{ minHeight: '700px', paddingTop: '0px', paddingBottom: '80px', position: 'relative' }}>
        <div className="grid lg:grid-cols-2 gap-0 relative" style={{ minHeight: '700px' }}>
          {/* Left Content - More spacing, softer design */}
          <div 
            className="space-y-8 animate-in fade-in slide-in-from-left duration-700 py-6 px-4 lg:pr-12 relative z-10"
            style={{ transform: `translateX(${-scrollY * 0.1}px)` }}
          >
            {/* Badge - More rounded, pastel colors */}
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#FFC1CC]/30 via-[#E0F7FA]/30 to-[#FFF9C4]/30 px-6 py-3 rounded-full border-2 border-[#FFC1CC]/40 shadow-sm backdrop-blur-sm">
              <Sparkles className="h-5 w-5 text-[#FF6B9D] animate-pulse" />
              <span className="text-sm text-[#2d3748] font-semibold">
                Envío gratis en pedidos +50€
              </span>
              <div className="w-2.5 h-2.5 bg-[#FFC1CC] rounded-full animate-pulse" />
            </div>

            {/* Main Headline - Larger, more playful, like Rabildoz */}
            <div className="space-y-8">
              <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl text-[#2d3748] leading-[1.1] font-bold" style={{ fontFamily: "'Quicksand', 'Nunito', sans-serif" }}>
                Lo mejor para
                <span className="block text-[#FFC1CC] animate-in fade-in duration-1000" style={{ color: '#FFC1CC' }}>
                  tu bebé
                </span>
              </h1>
              <p className="text-2xl sm:text-3xl text-[#718096] max-w-3xl leading-relaxed font-normal">
                Productos premium de algodón orgánico, diseñados con amor para el confort y desarrollo de tu pequeño
              </p>
            </div>

            {/* Trust indicators - Simplified, more space */}
            <div className="flex flex-wrap items-center gap-8 text-base text-[#718096] pt-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  <img src="https://images.unsplash.com/photo-1764859878528-2b512ab9d4d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGJhYnklMjBmYWNlJTIwbmF0dXJhbCUyMGxpZ2h0fGVufDF8fHx8MTc2NjgzMjY0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="Bebé feliz" className="w-10 h-10 rounded-full border-[3px] border-white object-cover shadow-md" />
                  <img src="https://images.unsplash.com/photo-1622632405663-f43782a098b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RoZXIlMjBzbWlsaW5nJTIwcG9ydHJhaXQlMjBzb2Z0JTIwY29sb3JzfGVufDF8fHx8MTc2NjgzMjY1M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="Mamá feliz" className="w-10 h-10 rounded-full border-[3px] border-white object-cover shadow-md" />
                  <img src="https://images.unsplash.com/photo-1761891949359-abd8fb35b987?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXRoZXIlMjBiYWJ5JTIwcG9ydHJhaXQlMjBuYXR1cmFsfGVufDF8fHx8MTc2NjgzMjY1NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="Papá y bebé" className="w-10 h-10 rounded-full border-[3px] border-white object-cover shadow-md" />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFC1CC] to-[#FFB3C1] border-[3px] border-white flex items-center justify-center shadow-md">
                    <span className="text-xs text-white font-bold">+5K</span>
                  </div>
                </div>
                <span className="font-semibold">Clientes felices</span>
              </div>
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-[#FBBF24] text-[#FBBF24]" />
                ))}
                <span className="ml-2 font-semibold text-[#2d3748]">4.9/5 (2,847 reseñas)</span>
              </div>
            </div>

            {/* CTAs - Extremely rounded, vibrant pink, more space */}
            <div className="flex flex-col sm:flex-row gap-6 pt-8">
              <button 
                onClick={onExploreClick}
                className="group relative px-12 py-6 bg-[#FFC1CC] text-white rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#FFC1CC]/50 font-bold text-xl"
                style={{ backgroundColor: '#FFC1CC', boxShadow: '0 10px 30px rgba(255, 193, 204, 0.3)' }}
              >
                <div className="absolute inset-0 bg-[#FFB3C1] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center gap-3">
                  <span>Explorar Colección</span>
                  <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
                </div>
              </button>
              
              <button 
                onClick={onOffersClick}
                className="px-12 py-6 border-[3px] border-[#FFC1CC] text-[#FF6B9D] rounded-full hover:bg-[#FFC1CC]/10 transition-all duration-300 hover:scale-105 font-bold text-xl bg-white backdrop-blur-sm"
                style={{ borderColor: '#FFC1CC', color: '#FF6B9D' }}
              >
                Ver Ofertas
              </button>
            </div>

            {/* Stats - Simplified, more space, softer */}
            <div className="grid grid-cols-3 gap-8 pt-10">
              <div className="space-y-2">
                <div className="text-3xl text-[#2d3748] font-bold">15K+</div>
                <div className="text-sm text-[#718096] font-medium">Productos vendidos</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl text-[#2d3748] font-bold">98%</div>
                <div className="text-sm text-[#718096] font-medium">Satisfacción</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-3xl text-[#2d3748] font-bold">
                  <TrendingUp className="h-6 w-6 text-[#FF6B9D]" />
                  24h
                </div>
                <div className="text-sm text-[#718096] font-medium">Envío express</div>
              </div>
            </div>
          </div>

          {/* Right Content - Image Carousel - Full height, covering 50% right side, no shadows or text */}
          <div 
            className="relative lg:absolute lg:top-0 lg:right-0 lg:h-full"
            style={{ 
              height: '100%',
              minHeight: '700px',
              top: 0,
              right: 0,
              width: '50vw',
              zIndex: 1
            }}
          >
            <div className="relative w-full h-full" style={{ height: '100%', minHeight: '700px', overflow: 'hidden', margin: 0, padding: 0 }}>
              {/* Main Image - No overlays, no shadows, no text */}
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ 
                    height: '100%', 
                    width: '100%',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                  }}
                >
                  <img
                    src={slide.image}
                    alt={`Hero image ${index + 1}`}
                    className="w-full h-full object-cover"
                    style={{ 
                      objectFit: 'cover', 
                      height: '100%', 
                      width: '100%', 
                      display: 'block',
                      objectPosition: 'center',
                      margin: 0,
                      padding: 0
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Image - Show on small screens, no shadows or text */}
          <div className="lg:hidden relative mt-12 rounded-[3rem] overflow-hidden aspect-[4/5]">
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
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}