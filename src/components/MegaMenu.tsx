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

// Default placeholder image for categories
const DEFAULT_CATEGORY_IMAGE = 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200';

export function MegaMenu({ categories = [], onCategoryClick }: MegaMenuProps = {}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Convert CategoryInfo[] to Category[] format
  // Categories from ebaby_productos already have subcategories included
  const displayCategories: Category[] = categories
    .map(cat => ({
      name: cat.name,
      id: parseInt(cat.id.replace('cat-', '')) || 0,
      subcategories: cat.subcategories?.map(sub => ({
        name: sub.name,
        id: parseInt(sub.id.replace('sub-', '').split('-')[1]) || 0,
        image: DEFAULT_CATEGORY_IMAGE,
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
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-screen max-w-4xl bg-white shadow-2xl rounded-b-2xl border border-stone-200 z-50 max-h-[min(70vh,520px)] overflow-hidden flex flex-col"
                >
                  <div className="p-5 flex-1 overflow-y-auto">
                    <h3 className="text-base font-semibold text-stone-900 mb-4 sticky top-0 bg-white pb-2 z-10">
                      {category.name}
                    </h3>
                    <div className="grid grid-cols-5 sm:grid-cols-6 gap-3">
                      {category.subcategories.map((sub) => (
                        <button
                          key={sub.id}
                          className="group text-left flex flex-col items-center sm:items-start"
                          onClick={() => {
                            if (onCategoryClick) {
                              onCategoryClick(category.name, sub.name);
                            }
                          }}
                        >
                          <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-stone-50 rounded-xl overflow-hidden mb-2">
                            <img
                              src={sub.image}
                              alt={sub.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <p className="text-xs font-medium text-stone-700 group-hover:text-stone-900 transition-colors line-clamp-2 text-center sm:text-left leading-tight">
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

      {/* Sale/Outlet - highlighted */}
      <button 
        onClick={() => {
          if (onCategoryClick) {
            onCategoryClick('Outlet');
          }
        }}
        className="flex items-center gap-1 px-4 py-4 text-sm text-amber-600 hover:text-amber-700 whitespace-nowrap border-b-2 border-amber-600 transition-all"
      >
        Outlet
        <span className="text-stone-400">›</span>
      </button>
    </nav>
  );
}
