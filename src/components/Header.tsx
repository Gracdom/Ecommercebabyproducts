import { ShoppingCart, Search, Menu, Heart, User } from 'lucide-react';
import { navigate } from '@/utils/navigate';
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 sm:h-20" style={{ minHeight: '64px' }}>
            {/* Logo */}
            <div className="flex items-center min-w-0">
              <button 
                onClick={() => {
                  navigate('/categoria');
                }}
                className="lg:hidden mr-2 sm:mr-4 p-2.5 sm:p-3 text-[#2d3748] hover:bg-[#FFC1CC]/20 rounded-2xl transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
                aria-label="Abrir menú"
              >
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onLogoClick) {
                    onLogoClick();
                  } else {
                    navigate('/');
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
                  className="h-9 sm:h-12 w-auto max-h-12 shrink-0 object-contain"
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

            {/* Actions - Carrito en verde corporativo #83b5b6 */}
            <div className="flex items-center gap-2">
              <button 
                onClick={onUserClick}
                className="hidden sm:flex p-2 items-center justify-center rounded-xl transition-all duration-200 relative hover:opacity-80"
                style={{ color: '#83b5b6' }}
              >
                <User className="h-4 w-4" strokeWidth={2} />
                {user && (
                  <span className="absolute top-0.5 right-0.5 h-2 w-2 bg-[#4ade80] rounded-full border border-white" />
                )}
              </button>
              <button 
                onClick={onWishlistClick}
                className="relative hidden sm:flex p-2 items-center justify-center rounded-xl transition-all duration-200 hover:opacity-80"
                style={{ color: '#83b5b6' }}
              >
                <Heart className="h-4 w-4" strokeWidth={2} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[1rem] h-4 px-0.5 text-white text-[10px] rounded-full flex items-center justify-center font-bold border border-white" style={{ backgroundColor: '#83b5b6' }}>
                    {wishlistCount}
                  </span>
                )}
              </button>
              <button 
                onClick={onCartClick}
                className="relative flex p-2.5 items-center justify-center rounded-xl transition-all duration-200 hover:opacity-80 min-h-[44px] min-w-[44px]"
                style={{ color: '#83b5b6' }}
                aria-label="Ver carrito"
              >
                <ShoppingCart className="h-5 w-5 sm:h-4 sm:w-4" strokeWidth={2} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 min-w-5 text-white text-xs rounded-full flex items-center justify-center font-bold border-2 border-white leading-none" style={{ backgroundColor: '#83b5b6' }}>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
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
              window.history.pushState({ view: 'category', categoryName, subcategoryName }, '', '/categoria');
              window.scrollTo({ top: 0, behavior: 'smooth' });
              // Trigger custom event to notify App.tsx
              window.dispatchEvent(new CustomEvent('categorySelected', { 
                detail: { categoryName, subcategoryName } 
              }));
            }} 
          />
          
          {/* Mobile horizontal scroll fallback - touch-friendly, smooth scroll */}
          <nav 
            className="flex lg:hidden items-center gap-2 overflow-x-auto scrollbar-hide py-3 -mx-4 px-4"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {['Nuevos', 'Ropa', 'Accesorios', 'Habitación', 'Textil', 'Juguetes', 'Cuidado', 'Paseo', 'Tienda'].map((item) => (
              <button 
                key={item} 
                onClick={() => {
                  navigate('/categoria');
                }}
                className="flex items-center gap-1 px-4 py-3 text-sm text-[#2d3748] hover:text-[#FF6B9D] active:bg-[#FFC1CC]/10 whitespace-nowrap rounded-2xl hover:bg-[#FFC1CC]/10 transition-all duration-200 font-semibold min-h-[44px] flex-shrink-0"
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