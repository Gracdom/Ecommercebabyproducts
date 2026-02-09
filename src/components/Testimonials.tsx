import { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  image: string;
  rating: number;
  text: string;
  product: string;
  verified: boolean;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'María García',
    role: 'Madre de Emma, 8 meses',
    image: '/img/5.webp',
    rating: 5,
    text: 'La calidad de los productos es excepcional. Mi bebé duerme mejor con las mantas de muselina orgánica. El tejido es súper suave y se mantiene perfecto después de muchos lavados.',
    product: 'Manta de muselina orgánica',
    verified: true,
  },
  {
    id: 2,
    name: 'Laura Martínez',
    role: 'Madre de Lucas, 1 año',
    image: '/img/6.webp',
    rating: 5,
    text: 'Increíble servicio y productos. Los juguetes sensoriales han ayudado mucho en el desarrollo de mi hijo. Además, el envío fue rapidísimo. ¡Totalmente recomendado!',
    product: 'Set de juguetes sensoriales',
    verified: true,
  },
  {
    id: 3,
    name: 'Ana López',
    role: 'Madre de Sofía, 6 meses',
    image: '/img/7.webp',
    rating: 5,
    text: 'Llevo comprando aquí desde el embarazo y no cambio por nada. Todo es de primera calidad, orgánico y con diseños preciosos. El set de regalo fue perfecto.',
    product: 'Set de regalo recién nacido',
    verified: true,
  },
  {
    id: 4,
    name: 'Carmen Ruiz',
    role: 'Madre de Diego, 10 meses',
    image: '/img/8.webp',
    rating: 5,
    text: 'La mejor tienda para bebés que he encontrado. Precios justos, calidad premium y atención al cliente impecable. Los bodies de algodón orgánico son una maravilla.',
    product: 'Body set algodón orgánico',
    verified: true,
  },
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  return (
    <section className="py-32 lg:py-40 bg-white relative overflow-hidden" style={{ backgroundColor: '#FFFFFF', paddingTop: '8rem', paddingBottom: '8rem' }}>
      {/* Background decoration - Pastel theme */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[#FFC1CC] to-[#E1BEE7] rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#E0F7FA] to-[#C8E6C9] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#FFC1CC]/30 via-[#E0F7FA]/30 to-[#FFF9C4]/30 px-6 py-3 rounded-full mb-8 border-2 border-[#FFC1CC]/40 shadow-sm">
            <Star className="h-5 w-5 text-[#FF6B9D] fill-[#FF6B9D]" />
            <span className="text-sm font-semibold text-[#2d3748]">Opiniones verificadas</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl text-[#2d3748] mb-6 font-bold leading-tight">
            Lo que dicen nuestras familias
          </h2>
          <p className="text-xl text-[#718096] max-w-3xl mx-auto leading-relaxed">
            Miles de padres confían en nosotros para lo más importante
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-5xl mx-auto">
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="w-full flex-shrink-0 px-4"
                >
                  <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl relative border border-[#E2E8F0]/50">
                    {/* Quote icon */}
                    <div className="absolute top-8 right-8 w-16 h-16 bg-gradient-to-br from-[#FFC1CC]/20 to-[#E0F7FA]/20 rounded-3xl flex items-center justify-center opacity-50">
                      <Quote className="h-8 w-8 text-[#FF6B9D]" />
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-6 w-6 fill-[#FBBF24] text-[#FBBF24]"
                        />
                      ))}
                    </div>

                    {/* Testimonial text */}
                    <p className="text-xl sm:text-2xl text-[#2d3748] leading-relaxed mb-8 relative z-10 font-medium">
                      "{testimonial.text}"
                    </p>

                    {/* Product mentioned */}
                    <div className="inline-block px-5 py-2.5 bg-gradient-to-r from-[#FFF9C4]/30 to-[#FFE5B4]/30 rounded-2xl text-sm text-[#718096] mb-8 border border-[#FFC1CC]/30">
                      Producto: <span className="text-[#2d3748] font-semibold">{testimonial.product}</span>
                    </div>

                    {/* Author info */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-16 h-16 rounded-full object-cover ring-4 ring-stone-100"
                        />
                        {testimonial.verified && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center border-2 border-white">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-[#2d3748]">{testimonial.name}</div>
                        <div className="text-sm text-[#718096]">{testimonial.role}</div>
                      </div>
                      {testimonial.verified && (
                        <div className="ml-auto">
                          <div className="text-xs text-white bg-gradient-to-r from-[#C8E6C9] to-[#A5D6A7] px-4 py-1.5 rounded-full font-semibold shadow-sm">
                            ✓ Compra verificada
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Decorative gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FFC1CC]/5 via-transparent to-[#E0F7FA]/5 rounded-3xl pointer-events-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-12 w-14 h-14 bg-white rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group border-2 border-[#FFC1CC]/30"
            aria-label="Anterior testimonio"
          >
            <ChevronLeft className="h-7 w-7 text-[#2d3748] group-hover:text-[#FF6B9D] transition-colors" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-12 w-14 h-14 bg-white rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group border-2 border-[#FFC1CC]/30"
            aria-label="Siguiente testimonio"
          >
            <ChevronRight className="h-7 w-7 text-[#2d3748] group-hover:text-[#FF6B9D] transition-colors" />
          </button>

          {/* Dots indicator */}
          <div className="flex justify-center gap-3 mt-10">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsAutoPlaying(false);
                }}
                className={`h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-10 bg-gradient-to-r from-[#FFC1CC] to-[#FFB3C1] shadow-lg'
                    : 'w-3 bg-[#E2E8F0] hover:bg-[#FFC1CC]/50'
                }`}
                aria-label={`Ir al testimonio ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-24 max-w-4xl mx-auto">
          <div className="text-center p-8 bg-gradient-to-br from-[#FFC1CC]/10 to-[#E0F7FA]/10 backdrop-blur-sm rounded-3xl border-2 border-[#FFC1CC]/30 shadow-lg">
            <div className="text-4xl sm:text-5xl font-bold text-[#2d3748] mb-3">15,000+</div>
            <div className="text-sm font-semibold text-[#718096]">Clientes felices</div>
          </div>
          <div className="text-center p-8 bg-gradient-to-br from-[#E0F7FA]/10 to-[#FFF9C4]/10 backdrop-blur-sm rounded-3xl border-2 border-[#E0F7FA]/30 shadow-lg">
            <div className="text-4xl sm:text-5xl font-bold text-[#2d3748] mb-3">4.9/5</div>
            <div className="text-sm font-semibold text-[#718096]">Valoración media</div>
          </div>
          <div className="text-center p-8 bg-gradient-to-br from-[#FFF9C4]/10 to-[#FFC1CC]/10 backdrop-blur-sm rounded-3xl border-2 border-[#FFF9C4]/30 shadow-lg">
            <div className="text-4xl sm:text-5xl font-bold text-[#2d3748] mb-3">98%</div>
            <div className="text-sm font-semibold text-[#718096]">Satisfacción</div>
          </div>
          <div className="text-center p-8 bg-gradient-to-br from-[#E1BEE7]/10 to-[#C8E6C9]/10 backdrop-blur-sm rounded-3xl border-2 border-[#E1BEE7]/30 shadow-lg">
            <div className="text-4xl sm:text-5xl font-bold text-[#2d3748] mb-3">2,847</div>
            <div className="text-sm font-semibold text-[#718096]">Reseñas</div>
          </div>
        </div>
      </div>
    </section>
  );
}
