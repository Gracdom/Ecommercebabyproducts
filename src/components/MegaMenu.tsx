import { useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { CategoryInfo } from '@/utils/ebaby/catalog';

interface Category {
  name: string;
  id: number;
  subcategories: {
    name: string;
    id: number;
    image: string;
  }[];
}

interface MegaMenuProps {
  categories?: CategoryInfo[];
  onCategoryClick?: (categoryName: string, subcategoryName?: string) => void;
}

// Images from /public/categorias: "Category Name (1).webp", "(2).webp", "(3).webp"
function getSubcategoryImage(categoryName: string, subIndex: number): string {
  const num = (subIndex % 3) + 1;
  const filename = `${categoryName} (${num}).webp`;
  return `/categorias/${encodeURIComponent(filename)}`;
}

const DEFAULT_CATEGORY_IMAGE = '/img/5.webp';

export function MegaMenu({ categories = [], onCategoryClick }: MegaMenuProps = {}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Convert CategoryInfo[] to Category[] format
  const displayCategories: Category[] = categories
    .map(cat => ({
      name: cat.name,
      id: parseInt(cat.id.replace('cat-', '')) || 0,
      subcategories: cat.subcategories?.map((sub, idx) => ({
        name: sub.name,
        id: parseInt(sub.id.replace('sub-', '').split('-')[1]) || 0,
        image: getSubcategoryImage(cat.name, idx),
      })) || [],
    }))
    .sort((a, b) => {
      // Categories with subcategories first
      if (a.subcategories.length > 0 && b.subcategories.length === 0) return -1;
      if (a.subcategories.length === 0 && b.subcategories.length > 0) return 1;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 6); // Limit to 6 categories for the menu

  const handleMouseEnter = (categoryName: string) => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveCategory(categoryName);
  };

  const handleMouseLeave = () => {
    // Delay hiding to allow moving to dropdown
    timeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 150);
  };

  const handleDropdownMouseEnter = () => {
    // Clear timeout when entering dropdown
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleDropdownMouseLeave = () => {
    setActiveCategory(null);
  };

  return (
    <nav className="hidden lg:flex items-center gap-0 relative">
      {displayCategories.map((category) => (
        <div
          key={category.name}
          onMouseEnter={() => handleMouseEnter(category.name)}
          onMouseLeave={handleMouseLeave}
          className="relative"
        >
          <button
            onClick={() => {
              // If no subcategories, navigate directly
              if (category.subcategories.length === 0 && onCategoryClick) {
                onCategoryClick(category.name);
              }
            }}
            className={`
              flex items-center gap-1 px-4 py-4 text-sm transition-all whitespace-nowrap
              border-b-2 
              ${activeCategory === category.name && category.subcategories.length > 0
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-700 hover:text-stone-900 hover:border-stone-300'}
            `}
          >
            {category.name}
            {category.subcategories.length > 0 && (
              <ChevronDown className={`h-4 w-4 transition-transform ${activeCategory === category.name ? 'rotate-180' : ''}`} />
            )}
          </button>

          {/* Mega Menu Dropdown - only show if there are subcategories */}
          {category.subcategories.length > 0 && (
            <AnimatePresence>
              {activeCategory === category.name && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  onMouseEnter={handleDropdownMouseEnter}
                  onMouseLeave={handleDropdownMouseLeave}
                  className="fixed left-1/2 -translate-x-1/2 top-[10rem] w-full max-w-3xl bg-white shadow-2xl rounded-b-2xl border border-stone-200 z-50 max-h-[min(65vh,420px)] overflow-hidden flex flex-col"
                >
                  <div className="p-4 flex-1 overflow-y-auto">
                    <h3 className="text-sm font-semibold text-stone-900 mb-3 sticky top-0 bg-white pb-2 z-10">
                      {category.name}
                    </h3>
                    <div className="grid grid-cols-4 gap-3">
                      {category.subcategories.map((sub) => (
                        <button
                          key={sub.id}
                          className="group text-left flex flex-col items-center"
                          onClick={() => {
                            if (onCategoryClick) {
                              onCategoryClick(category.name, sub.name);
                            }
                          }}
                        >
                          <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-stone-50 rounded-xl overflow-hidden mb-2">
                            <img
                              src={sub.image}
                              alt={sub.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.currentTarget;
                                if (target.src !== DEFAULT_CATEGORY_IMAGE) {
                                  target.src = DEFAULT_CATEGORY_IMAGE;
                                }
                              }}
                            />
                          </div>
                          <p className="text-sm font-medium text-stone-700 group-hover:text-stone-900 transition-colors line-clamp-2 text-center leading-tight">
                            {sub.name}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      ))}

      {/* Tienda - button style */}
      <button 
        onClick={() => {
          if (onCategoryClick) {
            onCategoryClick('Tienda');
          }
        }}
        className="flex items-center gap-1 px-8 py-2.5 text-sm font-semibold whitespace-nowrap rounded-xl transition-all duration-300 ml-2 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        style={{ backgroundColor: '#84b4b5', color: '#ffffff' }}
      >
        Tienda
      </button>
    </nav>
  );
}
