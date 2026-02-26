import { useState, useEffect, useRef } from 'react';
import { Instagram, ExternalLink } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const BRAND_COLOR = '#83b5b6';
const INSTAGRAM_URL = 'https://www.instagram.com/tiendaebaby/';
const INSTAGRAM_HANDLE = 'tiendaebaby';
const AUTOPLAY_MS = 3000;

const IMAGES = [
  '/img/5.webp',
  '/img/6.webp',
  '/img/7.webp',
  '/img/8.webp',
  '/img/9.webp',
  '/img/10.webp',
];

export function InstagramSection() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const maxSlide = IMAGES.length - 3;

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setSlideIndex((prev) => (prev >= maxSlide ? 0 : prev + 1));
    }, AUTOPLAY_MS);
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [maxSlide]);

  const goToSlide = (i: number) => {
    setSlideIndex(i);
    if (timerRef.current) clearInterval(timerRef.current);
    startTimer();
  };

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Branding: título, subtítulo, botón */}
        <div className="text-center mb-12">
          <h2
            className="text-4xl sm:text-5xl font-bold mb-4"
            style={{ color: BRAND_COLOR }}
          >
            #eBabyMoments
          </h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto mb-8">
            Comparte tus momentos especiales y forma parte de nuestra comunidad
          </p>
          <div className="flex justify-center">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 group"
              style={{ backgroundColor: BRAND_COLOR }}
            >
              <Instagram className="h-5 w-5" />
              <span>Seguir @{INSTAGRAM_HANDLE}</span>
              <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* ESCRITORIO: hidden en móvil, grid 6 columnas fijo */}
        <div className="hidden lg:grid lg:grid-cols-6 gap-4 w-full">
          {IMAGES.map((src, i) => (
            <a
              key={i}
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-[24px] overflow-hidden min-w-0 group relative"
              style={{ aspectRatio: '1' }}
              onMouseEnter={() => setHoveredId(i)}
              onMouseLeave={() => setHoveredId(null)}
              aria-label="Ver en Instagram"
            >
              <span className="block w-full pt-[100%] relative" aria-hidden />
              <span className="absolute inset-0 block">
                <ImageWithFallback
                  src={src}
                  alt="eBaby Moments"
                  className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ${
                    hoveredId === i ? 'scale-105' : 'scale-100'
                  }`}
                />
              </span>
            </a>
          ))}
        </div>

        {/* MÓVIL: visible solo en móvil, carrusel 3 imágenes */}
        <div className="block lg:hidden w-full overflow-hidden">
          <div
            className="flex gap-4 transition-transform duration-700 ease-in-out"
            style={{
              width: 'calc(200% + 5rem)',
              transform: `translateX(calc(-${slideIndex} * (100% / 6 + 1rem)))`,
            }}
          >
            {IMAGES.map((src, i) => (
              <a
                key={i}
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 block rounded-[24px] overflow-hidden box-border relative"
                style={{ width: 'calc(100% / 6)' }}
                aria-label="Ver en Instagram"
              >
                <span className="block w-full pt-[100%]" aria-hidden />
                <span className="absolute inset-0 rounded-[24px] overflow-hidden">
                  <ImageWithFallback
                    src={src}
                    alt="eBaby Moments"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </span>
              </a>
            ))}
          </div>

          {/* 4 dots: activo píldora #83b5b6 */}
          <div className="flex justify-center items-center gap-2 mt-5">
            {[0, 1, 2, 3].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => goToSlide(i)}
                aria-label={`Ir a slide ${i + 1}`}
                className="rounded-full transition-all duration-300 flex-shrink-0"
                style={{
                  width: i === slideIndex ? 24 : 10,
                  height: 10,
                  backgroundColor: i === slideIndex ? BRAND_COLOR : '#d6d3d1',
                }}
              />
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-stone-600 mb-4">Etiquétanos en tus fotos para aparecer aquí</p>
          <div
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-stone-200"
            style={{ backgroundColor: '#fafaf9' }}
          >
            <Instagram className="h-5 w-5" style={{ color: BRAND_COLOR }} />
            <span className="font-medium text-stone-900">#eBabyMoments</span>
          </div>
        </div>
      </div>
    </section>
  );
}
