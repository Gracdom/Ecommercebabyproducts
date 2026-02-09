import { ShoppingCart, Search, Menu, Heart, User } from 'lucide-react';
import { SearchAutocomplete } from './SearchAutocomplete';
import { MegaMenu } from './MegaMenu';
import { Product } from '../types';
import { useAuth } from '../hooks/useAuth';
import type { CategoryInfo } from '@/utils/ebaby/catalog';

interface HeaderProps {
  cartCount: number;
  wishlistCount?: number;
  onCartClick: () => void;
  onWishlistClick?: () => void;
  onUserClick?: () => void;
  onLogoClick?: () => void;
  products?: Product[];
  onProductClick?: (product: Product) => void;
  categories?: CategoryInfo[];
}

export function Header({ 
  cartCount, 
  wishlistCount = 0,
  onCartClick, 
  onWishlistClick,
  onUserClick,
  onLogoClick,
  products = [], 
  onProductClick,
  categories = []
}: HeaderProps) {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md shadow-sm" style={{ backgroundColor: '#FFFFFF', borderBottom: 'none' }}>
      {/* Promo bar - Teal/Petrol blue background */}
      <div className="text-center py-1 px-4" style={{ 
        backgroundColor: '#008080',
        borderBottom: 'none'
      }}>
        <p className="text-xs sm:text-sm font-semibold text-white">
          Envío gratis en pedidos superiores a 50€ · Devolución gratuita en 30 días
        </p>
      </div>

      {/* Main header - Clean white, no heavy borders */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: 'none' }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between h-20" style={{ minHeight: '80px' }}>
            {/* Logo */}
            <div className="flex items-center">
              <button 
                onClick={() => {
                  window.location.hash = '#category';
                }}
                className="lg:hidden mr-4 p-3 text-[#2d3748] hover:bg-[#FFC1CC]/20 rounded-2xl transition-all duration-200"
              >
                <Menu className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onLogoClick) {
                    onLogoClick();
                  } else {
                    window.location.hash = '';
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none p-0 outline-none focus:outline-none"
                style={{ WebkitTapHighlightColor: 'transparent' }}
                aria-label="e-baby - Inicio"
              >
                <img
                  src="/logo.png"
                  alt="e-baby"
                  className="h-12 w-auto shrink-0 object-contain"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'inline';
                  }}
                />
                <span className="text-2xl font-bold text-[#FFC1CC] hidden" style={{ fontFamily: 'inherit' }}>
                  e-baby
                </span>
              </button>
            </div>

            {/* Search bar - hidden on mobile - More rounded, softer */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              {products.length > 0 && onProductClick ? (
                <SearchAutocomplete products={products} onProductClick={onProductClick} />
              ) : (
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    className="w-full px-5 py-3.5 pl-12 pr-5 bg-[#F9F9F9] border-2 border-transparent rounded-3xl focus:outline-none focus:ring-2 focus:ring-[#FFC1CC]/50 focus:bg-white focus:border-[#FFC1CC]/30 transition-all shadow-sm hover:shadow-md"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#718096]" />
                </div>
              )}
            </div>

            {/* Actions - Small icons, color #84b4b5 */}
            <div className="flex items-center gap-2">
              <button 
                onClick={onUserClick}
                className="hidden sm:flex p-2 items-center justify-center rounded-xl transition-all duration-200 relative hover:opacity-80"
                style={{ color: '#84b4b5' }}
              >
                <User className="h-4 w-4" strokeWidth={2} />
                {user && (
                  <span className="absolute top-0.5 right-0.5 h-2 w-2 bg-[#4ade80] rounded-full border border-white" />
                )}
              </button>
              <button 
                onClick={onWishlistClick}
                className="relative hidden sm:flex p-2 items-center justify-center rounded-xl transition-all duration-200 hover:opacity-80"
                style={{ color: '#84b4b5' }}
              >
                <Heart className="h-4 w-4" strokeWidth={2} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[1rem] h-4 px-0.5 text-white text-[10px] rounded-full flex items-center justify-center font-bold border border-white" style={{ backgroundColor: '#84b4b5' }}>
                    {wishlistCount}
                  </span>
                )}
              </button>
              <button 
                onClick={onCartClick}
                className="relative flex p-2 items-center justify-center rounded-xl transition-all duration-200 hover:opacity-80"
                style={{ color: '#84b4b5' }}
              >
                <ShoppingCart className="h-4 w-4" strokeWidth={2} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[1rem] h-4 px-0.5 text-white text-[10px] rounded-full flex items-center justify-center font-bold border border-white" style={{ backgroundColor: '#84b4b5' }}>
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation with Mega Menu - Soft background, no heavy borders */}
      <div className="bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <MegaMenu 
            categories={categories}
            onCategoryClick={(categoryName, subcategoryName) => {
              // Store category info in sessionStorage for CategoryPage to use
              if (categoryName) {
                sessionStorage.setItem('selectedCategory', categoryName);
                if (subcategoryName) {
                  sessionStorage.setItem('selectedSubCategory', subcategoryName);
                } else {
                  sessionStorage.removeItem('selectedSubCategory');
                }
              }
              window.history.pushState({ view: 'category', categoryName, subcategoryName }, '', '#category');
              window.scrollTo({ top: 0, behavior: 'smooth' });
              // Trigger custom event to notify App.tsx
              window.dispatchEvent(new CustomEvent('categorySelected', { 
                detail: { categoryName, subcategoryName } 
              }));
            }} 
          />
          
          {/* Mobile horizontal scroll fallback - More rounded, playful */}
          <nav className="flex lg:hidden items-center gap-2 overflow-x-auto scrollbar-hide py-3">
            {['Nuevos', 'Ropa', 'Accesorios', 'Habitación', 'Textil', 'Juguetes', 'Cuidado', 'Paseo', 'Tienda'].map((item) => (
              <button 
                key={item} 
                onClick={() => {
                  window.location.hash = '#category';
                }}
                className="flex items-center gap-1 px-5 py-2.5 text-sm text-[#2d3748] hover:text-[#FF6B9D] whitespace-nowrap rounded-2xl hover:bg-[#FFC1CC]/10 transition-all duration-200 font-semibold"
              >
                {item}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}