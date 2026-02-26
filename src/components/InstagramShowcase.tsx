import { useState, useEffect, useRef } from 'react';
import { Instagram, ExternalLink } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const BRAND_COLOR = '#83b5b6';
const AUTOPLAY_MS = 3000;
const DEFAULT_URL = 'https://www.instagram.com/tiendaebaby/';
const DEFAULT_HANDLE = 'tiendaebaby';

const POSTS = [
  { id: 1, image: '/img/5.webp', caption: 'eBaby Moments' },
  { id: 2, image: '/img/6.webp', caption: 'eBaby Moments' },
  { id: 3, image: '/img/7.webp', caption: 'eBaby Moments' },
  { id: 4, image: '/img/8.webp', caption: 'eBaby Moments' },
  { id: 5, image: '/img/9.webp', caption: 'eBaby Moments' },
  { id: 6, image: '/img/10.webp', caption: 'eBaby Moments' },
];

export interface InstagramShowcaseProps {
  instagramHandle?: string;
  instagramUrl?: string;
}

export function InstagramShowcase({
  instagramHandle = DEFAULT_HANDLE,
  instagramUrl = DEFAULT_URL,
}: InstagramShowcaseProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const maxSlide = POSTS.length - 3;

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
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 group"
              style={{ backgroundColor: BRAND_COLOR }}
            >
              <Instagram className="h-5 w-5" />
              <span>Seguir @{instagramHandle}</span>
              <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Desktop (lg+): 6 imágenes en una fila, sin scroll */}
        <div className="hidden lg:grid lg:grid-cols-6 gap-4 w-full">
          {POSTS.map((post) => (
            <a
              key={post.id}
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block aspect-square rounded-[24px] overflow-hidden min-w-0"
              aria-label={`Ver en Instagram: ${post.caption}`}
            >
              <ImageWithFallback
                src={post.image}
                alt={post.caption}
                className="w-full h-full object-cover"
              />
            </a>
          ))}
        </div>

        {/* Mobile: carrusel 3 imágenes, gap-4, autoplay cada 3s */}
        <div className="lg:hidden w-full overflow-hidden">
          <div
            className="flex gap-4 transition-transform duration-700 ease-in-out"
            style={{
              width: 'calc(200% + 5rem)',
              transform: `translateX(calc(-${slideIndex} * (100% / 6 + 1rem)))`,
            }}
          >
            {POSTS.map((post) => (
              <a
                key={post.id}
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 block rounded-[24px] overflow-hidden box-border"
                style={{ width: 'calc(100% / 6)' }}
                aria-label={`Ver en Instagram: ${post.caption}`}
              >
                <div className="aspect-square">
                  <ImageWithFallback
                    src={post.image}
                    alt={post.caption}
                    className="w-full h-full object-cover"
                  />
                </div>
              </a>
            ))}
          </div>

          {/* 4 dots, activo tipo píldora #83b5b6 */}
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
