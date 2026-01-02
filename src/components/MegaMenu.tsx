import { useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { CategoryInfo } from '@/utils/bigbuy/catalog';

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
  onCategoryClick?: (categoryName: string, subcategoryName?: string, categoryId?: number, subcategoryId?: number) => void;
}

// Default placeholder image for categories
const DEFAULT_CATEGORY_IMAGE = 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200';

export function MegaMenu({ categories = [], onCategoryClick }: MegaMenuProps = {}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Group categories: parent categories become main categories, child categories become subcategories
  const parentCategoryMap = new Map<number, Category>();
  const childCategoryMap = new Map<number, CategoryInfo>();

  // First pass: identify parent categories and child categories
  for (const cat of categories) {
    if (cat.parentName && cat.parentId) {
      // This is a child category
      childCategoryMap.set(cat.id, cat);
      
      // Ensure parent category exists
      if (!parentCategoryMap.has(cat.parentId)) {
        parentCategoryMap.set(cat.parentId, {
          name: cat.parentName,
          id: cat.parentId,
          subcategories: [],
        });
      }
    } else {
      // This is a top-level category (no parent)
      // Check if it has children
      const hasChildren = categories.some(c => c.parentId === cat.id);
      
      if (!parentCategoryMap.has(cat.id)) {
        parentCategoryMap.set(cat.id, {
          name: cat.name,
          id: cat.id,
          subcategories: [],
        });
      }
    }
  }

  // Second pass: add child categories to their parents
  for (const childCat of childCategoryMap.values()) {
    if (childCat.parentId && parentCategoryMap.has(childCat.parentId)) {
      const parent = parentCategoryMap.get(childCat.parentId)!;
      // Avoid duplicates
      if (!parent.subcategories.some(sub => sub.id === childCat.id)) {
        parent.subcategories.push({
          name: childCat.name,
          id: childCat.id,
          image: DEFAULT_CATEGORY_IMAGE,
        });
      }
    }
  }

  // Convert to array, prioritize categories with subcategories, limit to 6
  const finalCategories = Array.from(parentCategoryMap.values())
    .sort((a, b) => {
      // Categories with subcategories first
      if (a.subcategories.length > 0 && b.subcategories.length === 0) return -1;
      if (a.subcategories.length === 0 && b.subcategories.length > 0) return 1;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 6);

  // If no categories from DB, use fallback with first few categories as subcategories
  const displayCategories = finalCategories.length > 0 ? finalCategories : (categories.length > 0 ? [
    {
      name: 'Productos',
      id: 0,
      subcategories: categories.slice(0, 8).map(cat => ({
        name: cat.name,
        id: cat.id,
        image: DEFAULT_CATEGORY_IMAGE,
      })),
    },
  ] : []);

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
                onCategoryClick(category.name, undefined, category.id, undefined);
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
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-screen max-w-4xl bg-white shadow-2xl rounded-b-lg border border-stone-200 z-50"
                >
                  <div className="p-8">
                    <h3 className="text-lg font-semibold text-stone-900 mb-6">{category.name}</h3>
                    <div className="grid grid-cols-4 gap-6">
                      {category.subcategories.map((sub) => (
                        <button
                          key={sub.id}
                          className="group text-left"
                          onClick={() => {
                            if (onCategoryClick) {
                              onCategoryClick(category.name, sub.name, category.id, sub.id);
                            }
                          }}
                        >
                          <div className="aspect-square bg-stone-50 rounded-lg overflow-hidden mb-3">
                            <img
                              src={sub.image}
                              alt={sub.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          <p className="text-sm font-medium text-stone-700 group-hover:text-stone-900 transition-colors">
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
