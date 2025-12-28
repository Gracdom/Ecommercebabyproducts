import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Star, TrendingUp, Baby } from 'lucide-react';

interface HeroProps {
  onGenderPredictorClick?: () => void;
}

export function Hero({ onGenderPredictorClick }: HeroProps = {}) {
  const [scrollY, setScrollY] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const slides = [
    {
      title: 'Colección Primavera',
      subtitle: 'Nuevos diseños orgánicos',
      description: 'Algodón 100% orgánico certificado GOTS',
      image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1200&q=80',
      tag: 'Nuevo',
      discount: '15% OFF',
    },
    {
      title: 'Juguetes Sensoriales',
      subtitle: 'Desarrollo y diversión',
      description: 'Estimula sus sentidos con nuestros juguetes premium',
      image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1200&q=80',
      tag: 'Popular',
      discount: '20% OFF',
    },
    {
      title: 'Textiles Premium',
      subtitle: 'Suavidad incomparable',
      description: 'Mantas y textiles de la más alta calidad',
      image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=80',
      tag: 'Exclusivo',
      discount: '10% OFF',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-background via-secondary/10 to-primary/10">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        />
        <div 
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full blur-3xl animate-pulse"
          style={{ transform: `translateY(${-scrollY * 0.2}px)` }}
        />
        <div 
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl"
          style={{ transform: `translate(-50%, -50%) scale(${1 + scrollY * 0.001})` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div 
            className="space-y-8 animate-in fade-in slide-in-from-left duration-700"
            style={{ transform: `translateX(${-scrollY * 0.1}px)` }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-secondary/20 to-primary/20 px-4 py-2 rounded-full border border-secondary/30 shadow-sm">
              <Sparkles className="h-4 w-4 text-secondary animate-pulse" />
              <span className="text-sm text-foreground font-medium">
                Envío gratis en pedidos +50€
              </span>
              <div className="w-2 h-2 bg-[#8da399] rounded-full animate-pulse" />
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl text-foreground leading-tight font-medium">
                Lo mejor para
                <span className="block text-primary animate-in fade-in duration-1000">
                  tu bebé
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
                Productos premium de algodón orgánico, diseñados con amor para el confort y desarrollo de tu pequeño
              </p>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <img src="https://images.unsplash.com/photo-1764859878528-2b512ab9d4d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGJhYnklMjBmYWNlJTIwbmF0dXJhbCUyMGxpZ2h0fGVufDF8fHx8MTc2NjgzMjY0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="Bebé feliz" className="w-8 h-8 rounded-full border-2 border-background object-cover" />
                  <img src="https://images.unsplash.com/photo-1622632405663-f43782a098b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RoZXIlMjBzbWlsaW5nJTIwcG9ydHJhaXQlMjBzb2Z0JTIwY29sb3JzfGVufDF8fHx8MTc2NjgzMjY1M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="Mamá feliz" className="w-8 h-8 rounded-full border-2 border-background object-cover" />
                  <img src="https://images.unsplash.com/photo-1761891949359-abd8fb35b987?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXRoZXIlMjBiYWJ5JTIwcG9ydHJhaXQlMjBuYXR1cmFsfGVufDF8fHx8MTc2NjgzMjY1NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="Papá y bebé" className="w-8 h-8 rounded-full border-2 border-background object-cover" />
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9fb3b8] to-[#8ea2a7] border-2 border-background flex items-center justify-center">
                    <span className="text-xs text-white font-bold">+5K</span>
                  </div>
                </div>
                <span>Clientes felices</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#dccf9d] text-[#dccf9d]" />
                ))}
                <span className="ml-1 font-medium">4.9/5 (2,847 reseñas)</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="group relative px-8 py-4 bg-foreground text-background rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/20">
                <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center gap-2 group-hover:text-foreground">
                  <span className="font-medium">Explorar Colección</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
              
              <button className="px-8 py-4 border-2 border-foreground text-foreground rounded-xl hover:bg-foreground hover:text-background transition-all duration-300 hover:scale-105">
                Ver Ofertas
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
              <div className="space-y-1">
                <div className="text-2xl text-foreground font-semibold">15K+</div>
                <div className="text-xs text-muted-foreground">Productos vendidos</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl text-foreground font-semibold">98%</div>
                <div className="text-xs text-muted-foreground">Satisfacción</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-2xl text-foreground font-semibold">
                  <TrendingUp className="h-5 w-5 text-[#8da399]" />
                  24h
                </div>
                <div className="text-xs text-muted-foreground">Envío express</div>
              </div>
            </div>
          </div>

          {/* Right Content - Image Carousel */}
          <div 
            className="relative animate-in fade-in slide-in-from-right duration-700 delay-300"
            style={{ transform: `translateY(${scrollY * 0.05}px)` }}
          >
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl shadow-primary/20">
              {/* Main Image */}
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  
                  {/* Content overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs mb-3 border border-white/30">
                      {slide.tag}
                    </div>
                    <h3 className="text-3xl mb-2 font-medium">{slide.title}</h3>
                    <p className="text-white/90 mb-4">{slide.subtitle}</p>
                    <div className="inline-block px-4 py-2 bg-gradient-to-r from-secondary to-[#d6ccc2] rounded-lg font-medium text-foreground">
                      {slide.discount}
                    </div>
                  </div>
                </div>
              ))}

              {/* Carousel indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentSlide 
                        ? 'w-8 bg-white' 
                        : 'w-1.5 bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
              
              {/* Floating badge */}
              <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-lg border border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#8da399] to-[#7a8f85] rounded-xl flex items-center justify-center">
                    <Star className="h-5 w-5 text-white fill-white" />
                  </div>
                  <div>
                    <div className="text-sm text-foreground font-medium">Mejor valorado</div>
                    <div className="text-xs text-muted-foreground">2024</div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-secondary to-accent rounded-full blur-2xl opacity-60 animate-pulse" />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-primary to-secondary rounded-full blur-2xl opacity-60 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}