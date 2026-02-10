import { useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import type { CategoryInfo } from '../utils/ebaby/catalog';

// Imagen desde /public/categorias: "Nombre categoría (1).webp"
function getCategoryImage(categoryName: string): string {
  const filename = `${categoryName} (1).webp`;
  return `/categorias/${encodeURIComponent(filename)}`;
}

const FALLBACK_IMAGES = [
  '/img/5.webp',
  '/img/6.webp',
  '/img/7.webp',
  '/img/8.webp',
  '/img/9.webp',
  '/img/10.webp',
  '/img/1.webp',
];

interface CategoryBentoGridProps {
  categories?: CategoryInfo[] | null;
  onCategoryClick?: (categoryName: string) => void;
}

export function CategoryBentoGrid({ categories: propCategories, onCategoryClick }: CategoryBentoGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Tomar más categorías para el carrusel (hasta 10)
  const categories = useMemo(() => {
    const list = (propCategories ?? []).filter((c) => c.name && c.productCount > 0);
    return list.slice(0, 10).map((cat, index) => ({
      id: cat.id,
      name: cat.name,
      productCount: cat.productCount,
      image: getCategoryImage(cat.name),
      fallbackImage: FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
    }));
  }, [propCategories]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  if (categories.length === 0) return null;

  return (
    <section className="py-16 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block uppercase text-xs font-semibold tracking-wider text-[#FF6B9D] mb-3">
            Compra por categorías
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-[#2d3748] mb-2">
            e-baby Especiales
          </h2>
        </div>

        {/* Carrusel Container */}
        <div className="relative">
          {/* Botón Izquierdo */}
          <button
            onClick={() => scroll('left')}
            className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-xl border-2 border-[#E2E8F0] items-center justify-center hover:bg-[#FFC1CC]/10 transition-all duration-300 hover:scale-110"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6 text-[#2d3748]" />
          </button>

          {/* Carrusel de Categorías */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 px-2"
            style={{ scrollbarWidth: 'none' }}
          >
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => onCategoryClick?.(category.name)}
                className="flex-shrink-0 w-48 sm:w-56 cursor-pointer group"
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-[#E2E8F0]/50">
                  {/* Imagen */}
                  <div className="relative aspect-square bg-[#F9F9F9] overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        const t = e.currentTarget;
                        if (t.dataset.failed !== '1') {
                          t.dataset.failed = '1';
                          t.src = category.fallbackImage;
                        }
                      }}
                    />
                  </div>

                  {/* Información de la Categoría */}
                  <div className="p-4 text-center">
                    <h3 className="text-base font-semibold text-[#2d3748] group-hover:text-[#FF6B9D] transition-colors mb-1">
                      {category.name}
                    </h3>
                    
                    {/* Número de Productos */}
                    <p className="text-xs text-gray-500 mb-2">
                      {category.productCount} productos
                    </p>
                    
                    {/* Calificación con Estrellas */}
                    <div className="flex items-center justify-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Botón Derecho */}
          <button
            onClick={() => scroll('right')}
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-xl border-2 border-[#E2E8F0] items-center justify-center hover:bg-[#FFC1CC]/10 transition-all duration-300 hover:scale-110"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6 text-[#2d3748]" />
          </button>
        </div>

        {/* Indicadores de Página (Dots) */}
        <div className="hidden lg:flex justify-center gap-2 mt-8">
          <div className="h-2 w-2 rounded-full bg-[#FF6B9D]"></div>
          <div className="h-2 w-2 rounded-full bg-[#E2E8F0]"></div>
        </div>

        {/* Botón Ver Todos los Productos */}
        <div className="text-center mt-10">
          <button
            onClick={() => onCategoryClick?.('')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#FFC1CC] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-[#83b5b6] group"
            style={{ backgroundColor: '#FFC1CC' }}
          >
            <span>Ver todos los productos</span>
            <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
