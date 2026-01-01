import { useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Category {
  name: string;
  subcategories: {
    name: string;
    image: string;
  }[];
}

interface MegaMenuProps {
  onCategoryClick?: (categoryName: string, subcategoryName?: string) => void;
}

const CATEGORIES: Category[] = [
  {
    name: 'Ropa',
    subcategories: [
      { name: 'Bodies', image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=200' },
      { name: 'Pijamas', image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=200' },
      { name: 'Conjuntos', image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200' },
      { name: 'Calcetines', image: 'https://images.unsplash.com/photo-1530623004145-e0e8dfdd1bd5?w=200' },
    ],
  },
  {
    name: 'Accesorios',
    subcategories: [
      { name: 'Gorros', image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200' },
      { name: 'Baberos', image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=200' },
      { name: 'Chupetes', image: 'https://images.unsplash.com/photo-1620194366499-0ea899cac523?w=200' },
      { name: 'Manoplas', image: 'https://images.unsplash.com/photo-1566512823390-c650c95b96e0?w=200' },
    ],
  },
  {
    name: 'Habitación',
    subcategories: [
      { name: 'Cunas', image: 'https://images.unsplash.com/photo-1610019684340-9abb93846767?w=200' },
      { name: 'Colchones', image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=200' },
      { name: 'Móviles', image: 'https://images.unsplash.com/photo-1617300040847-369dee9d35f1?w=200' },
      { name: 'Lámparas', image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=200' },
    ],
  },
  {
    name: 'Textil',
    subcategories: [
      { name: 'Mantas', image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200' },
      { name: 'Sábanas', image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=200' },
      { name: 'Toallas', image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=200' },
      { name: 'Cojines', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200' },
    ],
  },
  {
    name: 'Juguetes',
    subcategories: [
      { name: 'Peluches', image: 'https://images.unsplash.com/photo-1760853382088-c3168c4b9ccc?w=200' },
      { name: 'Sonajeros', image: 'https://images.unsplash.com/photo-1683276700110-6e7aba8170a3?w=200' },
      { name: 'Mordedores', image: 'https://images.unsplash.com/photo-1671469627397-2bfdab72070d?w=200' },
      { name: 'Alfombras', image: 'https://images.unsplash.com/photo-1619490742958-50b38a5846b8?w=200' },
    ],
  },
];

export function MegaMenu({ onCategoryClick }: MegaMenuProps = {}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      {CATEGORIES.map((category) => (
        <div
          key={category.name}
          onMouseEnter={() => handleMouseEnter(category.name)}
          onMouseLeave={handleMouseLeave}
          className="relative"
        >
          <button
            className={`
              flex items-center gap-1 px-4 py-4 text-sm transition-all whitespace-nowrap
              border-b-2 
              ${activeCategory === category.name
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-700 hover:text-stone-900 hover:border-stone-300'}
            `}
          >
            {category.name}
            <ChevronDown className={`h-4 w-4 transition-transform ${activeCategory === category.name ? 'rotate-180' : ''}`} />
          </button>

          {/* Mega Menu Dropdown */}
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
                        key={sub.name}
                        className="group text-left"
                        onClick={() => {
                          if (onCategoryClick) {
                            onCategoryClick(category.name, sub.name);
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
