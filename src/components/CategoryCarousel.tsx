import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategoryCarouselProps {
  onCategoryClick?: (categoryName: string) => void;
}

const categories = [
  {
    id: 1,
    name: 'Playtime Paradise',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80',
  },
  {
    id: 2,
    name: 'Tiny Trendsetters',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=80',
  },
  {
    id: 3,
    name: 'Fairy Tale Bathland',
    image: 'https://images.unsplash.com/photo-1519689373023-dd07c7988603?w=400&q=80',
  },
  {
    id: 4,
    name: 'Healthy Heroes',
    image: 'https://images.unsplash.com/photo-1602345397613-0934a8812d90?w=400&q=80',
  },
  {
    id: 5,
    name: 'Tiny Trends',
    image: 'https://images.unsplash.com/photo-1533062618053-d51e617307ec?w=400&q=80',
  },
  {
    id: 6,
    name: 'Sleepy Dreams',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80',
  },
  {
    id: 7,
    name: 'Organic Essentials',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=80',
  },
];

export function CategoryCarousel({ onCategoryClick }: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="py-16 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block uppercase text-xs font-semibold tracking-wider text-[#FF6B9D] mb-3">
            SHOP BY CATEGORIES
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-[#2d3748] mb-2">
            e-baby Specials
          </h2>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-xl border-2 border-[#E2E8F0] items-center justify-center hover:bg-[#FFC1CC]/10 transition-all duration-300 hover:scale-110"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6 text-[#2d3748]" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 px-2"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => {
                  if (onCategoryClick) {
                    onCategoryClick(category.name);
                  }
                }}
                className="flex-shrink-0 w-48 sm:w-56 cursor-pointer group"
              >
                {/* Category Card */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-[#E2E8F0]/50">
                  {/* Image Container */}
                  <div className="relative aspect-square bg-[#F9F9F9] overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  
                  {/* Category Name */}
                  <div className="p-4 text-center">
                    <h3 className="text-base font-semibold text-[#2d3748] group-hover:text-[#FF6B9D] transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-xl border-2 border-[#E2E8F0] items-center justify-center hover:bg-[#FFC1CC]/10 transition-all duration-300 hover:scale-110"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6 text-[#2d3748]" />
          </button>
        </div>

        {/* Scroll Indicator Dots - Hidden on mobile */}
        <div className="hidden lg:flex justify-center gap-2 mt-8">
          {categories.slice(0, Math.ceil(categories.length / 4)).map((_, index) => (
            <div
              key={index}
              className="h-2 w-2 rounded-full bg-[#E2E8F0]"
            />
          ))}
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
