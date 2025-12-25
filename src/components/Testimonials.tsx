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
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    rating: 5,
    text: 'La calidad de los productos es excepcional. Mi bebé duerme mejor con las mantas de muselina orgánica. El tejido es súper suave y se mantiene perfecto después de muchos lavados.',
    product: 'Manta de muselina orgánica',
    verified: true,
  },
  {
    id: 2,
    name: 'Laura Martínez',
    role: 'Madre de Lucas, 1 año',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    rating: 5,
    text: 'Increíble servicio y productos. Los juguetes sensoriales han ayudado mucho en el desarrollo de mi hijo. Además, el envío fue rapidísimo. ¡Totalmente recomendado!',
    product: 'Set de juguetes sensoriales',
    verified: true,
  },
  {
    id: 3,
    name: 'Ana López',
    role: 'Madre de Sofía, 6 meses',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
    rating: 5,
    text: 'Llevo comprando aquí desde el embarazo y no cambio por nada. Todo es de primera calidad, orgánico y con diseños preciosos. El set de regalo fue perfecto.',
    product: 'Set de regalo recién nacido',
    verified: true,
  },
  {
    id: 4,
    name: 'Carmen Ruiz',
    role: 'Madre de Diego, 10 meses',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
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
    <section className="py-20 bg-gradient-to-br from-stone-50 via-rose-50/30 to-amber-50/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-stone-200">
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span className="text-sm text-stone-900">Opiniones verificadas</span>
          </div>
          <h2 className="text-4xl sm:text-5xl text-stone-900 mb-4">
            Lo que dicen nuestras familias
          </h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
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
                  <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl relative">
                    {/* Quote icon */}
                    <div className="absolute top-8 right-8 w-16 h-16 bg-gradient-to-br from-rose-100 to-purple-100 rounded-2xl flex items-center justify-center opacity-50">
                      <Quote className="h-8 w-8 text-rose-600" />
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-5 w-5 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>

                    {/* Testimonial text */}
                    <p className="text-xl sm:text-2xl text-stone-800 leading-relaxed mb-8 relative z-10">
                      "{testimonial.text}"
                    </p>

                    {/* Product mentioned */}
                    <div className="inline-block px-4 py-2 bg-stone-100 rounded-lg text-sm text-stone-600 mb-8">
                      Producto: <span className="text-stone-900 font-medium">{testimonial.product}</span>
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
                        <div className="text-lg text-stone-900">{testimonial.name}</div>
                        <div className="text-sm text-stone-600">{testimonial.role}</div>
                      </div>
                      {testimonial.verified && (
                        <div className="ml-auto">
                          <div className="text-xs text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                            ✓ Compra verificada
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Decorative gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-purple-500/5 rounded-3xl pointer-events-none" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation buttons */}
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-12 w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
            aria-label="Anterior testimonio"
          >
            <ChevronLeft className="h-6 w-6 text-stone-900 group-hover:text-rose-600 transition-colors" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-12 w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
            aria-label="Siguiente testimonio"
          >
            <ChevronRight className="h-6 w-6 text-stone-900 group-hover:text-rose-600 transition-colors" />
          </button>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsAutoPlaying(false);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-gradient-to-r from-rose-500 to-purple-500'
                    : 'w-2 bg-stone-300 hover:bg-stone-400'
                }`}
                aria-label={`Ir al testimonio ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-stone-200">
            <div className="text-3xl sm:text-4xl text-stone-900 mb-2">15,000+</div>
            <div className="text-sm text-stone-600">Clientes felices</div>
          </div>
          <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-stone-200">
            <div className="text-3xl sm:text-4xl text-stone-900 mb-2">4.9/5</div>
            <div className="text-sm text-stone-600">Valoración media</div>
          </div>
          <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-stone-200">
            <div className="text-3xl sm:text-4xl text-stone-900 mb-2">98%</div>
            <div className="text-sm text-stone-600">Satisfacción</div>
          </div>
          <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-stone-200">
            <div className="text-3xl sm:text-4xl text-stone-900 mb-2">2,847</div>
            <div className="text-sm text-stone-600">Reseñas</div>
          </div>
        </div>
      </div>
    </section>
  );
}
