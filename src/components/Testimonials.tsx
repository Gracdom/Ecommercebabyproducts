import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  image: string;
  rating: number;
  text: string;
  verified: boolean;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'María y Carlos',
    role: 'Padres de Emma',
    image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&h=400&fit=crop',
    rating: 5,
    text: 'La calidad de los productos es excepcional. Mi bebé duerme mejor con las mantas de muselina orgánica. El tejido es súper suave y se mantiene perfecto después de muchos lavados.',
    verified: true,
  },
  {
    id: 2,
    name: 'Laura y Miguel',
    role: 'Padres de Lucas',
    image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=400&fit=crop',
    rating: 5,
    text: 'Increíble servicio y productos. Los juguetes sensoriales han ayudado mucho en el desarrollo de mi hijo. Además, el envío fue rapidísimo. ¡Totalmente recomendado!',
    verified: true,
  },
  {
    id: 3,
    name: 'Ana y Javier',
    role: 'Compradores Verificados',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
    rating: 5,
    text: 'Llevo comprando aquí desde el embarazo y no cambio por nada. Todo es de primera calidad, orgánico y con diseños preciosos. El set de regalo fue perfecto.',
    verified: true,
  },
  {
    id: 4,
    name: 'Carmen y David',
    role: 'Padres de Diego',
    image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400&h=400&fit=crop',
    rating: 5,
    text: 'La mejor tienda para bebés que he encontrado. Precios justos, calidad premium y atención al cliente impecable. Los bodies de algodón orgánico son una maravilla.',
    verified: true,
  },
  {
    id: 5,
    name: 'Elena y Pablo',
    role: 'Padres de Sofía',
    image: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400&h=400&fit=crop',
    rating: 5,
    text: 'Me encanta la variedad y la calidad. Los productos son exactamente como se ven en las fotos. El servicio al cliente es excelente y muy atento.',
    verified: true,
  },
  {
    id: 6,
    name: 'Isabel y Sergio',
    role: 'Compradores Verificados',
    image: 'https://images.unsplash.com/photo-1542359649-31e03cd4d909?w=400&h=400&fit=crop',
    rating: 5,
    text: 'Compré el set de biberones y estoy encantada. Mi bebé los acepta muy bien y son súper fáciles de limpiar. La entrega fue más rápida de lo esperado.',
    verified: true,
  },
];

export function Testimonials() {
  const [currentPage, setCurrentPage] = useState(0);
  const testimonialsPerPage = 3;
  const totalPages = Math.ceil(testimonials.length / testimonialsPerPage);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 6000);

    return () => clearInterval(timer);
  }, [totalPages]);

  const currentTestimonials = testimonials.slice(
    currentPage * testimonialsPerPage,
    (currentPage + 1) * testimonialsPerPage
  );

  return (
    <section className="py-20 sm:py-24 lg:py-28 bg-[#FFC1CC]/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#FFC1CC] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FFB3C1] rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl mb-4 font-bold text-[#2d3748]">
            Lo que dicen mamá y papá
          </h2>
          <p className="text-base text-gray-500 max-w-2xl mx-auto">
            Historias reales de familias felices
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {currentTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-[#FFC1CC]/40 backdrop-blur-sm rounded-3xl p-8 shadow-lg shadow-[#FFC1CC]/20 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden border border-[#FFC1CC]/30 text-[12px]"
            >
              {/* Decorative Quote Icon */}
              <div className="absolute top-6 left-6 text-[#83b5b6] opacity-10 text-8xl leading-none font-serif">
                ❝
              </div>

              {/* Testimonial Text - PRIMERO */}
              <p className="text-slate-600 text-[12px] leading-relaxed mb-4 relative z-10">
                "{testimonial.text}"
              </p>

              {/* Stars - SEGUNDO (después del texto) */}
              <div className="flex items-center gap-1 mb-7 relative z-10">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Author Profile - TERCERO (al final) */}
              <div className="flex items-center gap-4 relative z-10">
                {/* Avatar con badge de Google */}
                <div className="relative">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white/80 shadow-md"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&h=400&fit=crop';
                    }}
                  />
                  {/* Google Badge */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[#2d3748] text-sm">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-slate-600">
                    {testimonial.role}
                  </div>
                </div>
                {testimonial.verified && (
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-2">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentPage
                  ? 'w-8 bg-[#83b5b6]'
                  : 'w-2 bg-gray-300 hover:bg-[#83b5b6]/50'
              }`}
              aria-label={`Ir a página ${index + 1}`}
            />
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md">
            <div className="text-3xl sm:text-4xl font-bold text-[#83b5b6] mb-2">15K+</div>
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Clientes felices</div>
          </div>
          <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md">
            <div className="text-3xl sm:text-4xl font-bold text-[#83b5b6] mb-2">4.9/5</div>
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Valoración</div>
          </div>
          <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md">
            <div className="text-3xl sm:text-4xl font-bold text-[#83b5b6] mb-2">98%</div>
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Satisfacción</div>
          </div>
          <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md">
            <div className="text-3xl sm:text-4xl font-bold text-[#83b5b6] mb-2">2.8K</div>
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Reseñas</div>
          </div>
        </div>
      </div>
    </section>
  );
}
