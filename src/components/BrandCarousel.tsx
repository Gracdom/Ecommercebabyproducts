import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

// Array de ejemplo con nombres de archivos de marcas
const brandLogos = [
  'marcas (1).png',
  'marcas (2).jpg',
  'marcas (3).webp',
  'marcas (4).png',
  'marcas (5).jpg',
  'marcas (6).webp',
];

// Duplicar logos para asegurar loop suave
const allLogos = [...brandLogos, ...brandLogos, ...brandLogos];

export function BrandCarousel() {
  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2d3748] mb-3">
            Marcas de confianza
          </h2>
          <p className="text-sm text-gray-500">
            Trabajamos con las mejores marcas para ofrecerte calidad garantizada
          </p>
        </div>

        {/* Carousel */}
        <Swiper
          modules={[Autoplay]}
          loop={true}
          loopAdditionalSlides={6}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
          }}
          speed={3000}
          slidesPerView={2}
          spaceBetween={30}
          allowTouchMove={false}
          breakpoints={{
            640: {
              slidesPerView: 3,
              spaceBetween: 40,
            },
            768: {
              slidesPerView: 4,
              spaceBetween: 50,
            },
            1024: {
              slidesPerView: 6,
              spaceBetween: 60,
            },
          }}
          className="brand-carousel"
        >
          {allLogos.map((logo, index) => (
            <SwiperSlide key={`${logo}-${index}`}>
              <div className="flex items-center justify-center h-24 group cursor-pointer">
                <img
                  src={`/marcas/${logo}`}
                  alt={`Logo marca`}
                  className="h-12 w-auto object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style>{`
        .brand-carousel .swiper-wrapper {
          transition-timing-function: linear !important;
        }
        
        .brand-carousel .swiper-slide {
          width: auto !important;
        }
      `}</style>
    </section>
  );
}
