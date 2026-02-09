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
      {/* Promo bar - Teal/Petrol blue background like Rabildoz */}
      <div className="text-center py-4 px-4" style={{ 
        backgroundColor: '#008080',
        borderBottom: 'none'
      }}>
        <p className="text-sm font-semibold text-white">
          Envío gratis en pedidos superiores a 50€ · Devolución gratuita en 30 días
        </p>
      </div>

      {/* Main header - Clean white, no heavy borders */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: 'none' }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between h-24" style={{ minHeight: '96px' }}>
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

            {/* Actions - Very colorful and rounded icons */}
            <div className="flex items-center gap-3">
              <button 
                onClick={onUserClick}
                className="hidden sm:block p-3 bg-[#E0F7FA]/30 hover:bg-[#E0F7FA]/60 text-[#2d3748] rounded-2xl transition-all duration-200 relative hover:scale-110 shadow-sm hover:shadow-md"
              >
                <User className="h-6 w-6" />
                {user && (
                  <span className="absolute top-0.5 right-0.5 h-3.5 w-3.5 bg-[#4ade80] rounded-full border-2 border-white shadow-md" />
                )}
              </button>
              <button 
                onClick={onWishlistClick}
                className="relative hidden sm:block p-3 bg-[#FFC1CC]/30 hover:bg-[#FFC1CC]/50 text-[#FF6B9D] rounded-2xl transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
              >
                <Heart className="h-6 w-6" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-br from-[#FF6B9D] to-[#FF4D6D] text-white text-xs rounded-full h-7 w-7 flex items-center justify-center font-bold shadow-xl border-2 border-white">
                    {wishlistCount}
                  </span>
                )}
              </button>
              <button 
                onClick={onCartClick}
                className="relative p-3 bg-[#FFF9C4]/40 hover:bg-[#FFF9C4]/60 text-[#2d3748] rounded-2xl transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-br from-[#FFC1CC] to-[#FFB3C1] text-white text-xs rounded-full h-7 w-7 flex items-center justify-center font-bold shadow-xl border-2 border-white">
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
            {['Nuevos', 'Ropa', 'Accesorios', 'Habitación', 'Textil', 'Juguetes', 'Cuidado', 'Paseo', 'Outlet'].map((item) => (
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