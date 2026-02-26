import { useState } from 'react';
import { ShoppingCart, Search, Menu, Heart, User, ChevronRight } from 'lucide-react';
import { navigate } from '@/utils/navigate';
import { SearchAutocomplete } from './SearchAutocomplete';
import { MegaMenu } from './MegaMenu';
import { Product } from '../types';
import { useAuth } from '../hooks/useAuth';
import type { CategoryInfo } from '@/utils/ebaby/catalog';
import { createSlug } from '@/utils/slug';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/components/ui/utils';

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
  categories = [],
}: HeaderProps) {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCategorySelect = (categoryName: string, subcategoryName?: string) => {
    setMobileMenuOpen(false);
    if (categoryName) {
      sessionStorage.setItem('selectedCategory', categoryName);
      if (subcategoryName) {
        sessionStorage.setItem('selectedSubCategory', subcategoryName);
      } else {
        sessionStorage.removeItem('selectedSubCategory');
      }
    }
    const tiendaPath = categoryName ? `/tienda/${createSlug(categoryName)}` : '/tienda';
    window.history.pushState(
      { view: 'category', categoryName, subcategoryName: subcategoryName ?? null },
      '',
      tiendaPath
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.dispatchEvent(
      new CustomEvent('categorySelected', { detail: { categoryName, subcategoryName: subcategoryName ?? null } })
    );
  };

  const displayCategories = categories
    .map((cat) => ({
      name: cat.name,
      id: cat.id,
      subcategories: cat.subcategories ?? [],
    }))
    .sort((a, b) => {
      if (a.subcategories.length > 0 && b.subcategories.length === 0) return -1;
      if (a.subcategories.length === 0 && b.subcategories.length > 0) return 1;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 8);

  return (
    <header
      className="sticky top-0 z-50 w-full bg-white shadow-sm"
      style={{ borderBottom: 'none', paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      {/* Promo bar - compacto en móvil */}
      <div
        className="text-center py-1.5 sm:py-2 px-3 sm:px-4"
        style={{ backgroundColor: '#008080' }}
      >
        <p className="text-[11px] sm:text-sm font-semibold text-white leading-tight">
          <span className="sm:inline">Envío gratis +50€</span>
          <span className="hidden sm:inline"> · </span>
          <span className="sm:inline">Devolución 30 días</span>
        </p>
      </div>

      {/* Main header - una sola fila clara */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between gap-2 h-14 sm:h-16 min-h-[56px]">
            {/* Hamburger - solo móvil/tablet */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl text-stone-700 hover:bg-stone-100 active:bg-stone-200 transition-colors touch-manipulation"
              aria-label="Abrir menú"
            >
              <Menu className="h-6 w-6" strokeWidth={2} />
            </button>

            {/* Logo - centrado en móvil cuando hay hamburger, flexible en desktop */}
            <div className="flex-1 flex justify-center lg:justify-start min-w-0">
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
                className="flex items-center justify-center lg:justify-start gap-2 sm:gap-3 py-2 outline-none focus:ring-2 focus:ring-[#FFC1CC]/40 focus:ring-offset-2 rounded-xl touch-manipulation"
                style={{ WebkitTapHighlightColor: 'transparent' }}
                aria-label="e-baby - Inicio"
              >
                <img
                  src="/logo.png"
                  alt="e-baby"
                  className="h-8 sm:h-10 lg:h-11 w-auto max-h-12 object-contain shrink-0"
                  onError={(e) => {
                    const t = e.currentTarget;
                    t.style.display = 'none';
                    const fallback = t.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'inline';
                  }}
                />
                <span className="text-xl font-bold text-[#FFC1CC] hidden" style={{ fontFamily: 'inherit' }}>
                  e-baby
                </span>
              </button>
            </div>

            {/* Search - desktop: barra; móvil: icono que abre barra */}
            <div className="hidden md:flex flex-1 max-w-xl mx-4 lg:mx-6">
              {products.length > 0 && onProductClick ? (
                <SearchAutocomplete products={products} onProductClick={onProductClick} />
              ) : (
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    className="w-full px-4 py-2.5 pl-11 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC1CC]/40 focus:border-[#FFC1CC]/50"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                </div>
              )}
            </div>

            {/* Acciones: usuario, wishlist, carrito */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Usuario - oculto en móvil muy pequeño si hace falta espacio */}
              <button
                type="button"
                onClick={onUserClick}
                className="hidden sm:flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl text-[#83b5b6] hover:bg-[#83b5b6]/10 transition-colors touch-manipulation relative"
                aria-label="Mi cuenta"
              >
                <User className="h-5 w-5" strokeWidth={2} />
                {user && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
                )}
              </button>

              {/* Wishlist */}
              <button
                type="button"
                onClick={onWishlistClick}
                className="relative flex items-center justify-center w-11 h-11 rounded-xl text-[#83b5b6] hover:bg-[#83b5b6]/10 transition-colors"
                aria-label="Favoritos"
              >
                <Heart className="h-5 w-5" strokeWidth={2} />
                {wishlistCount > 0 && (
                  <span className="absolute top-[-5px] left-5 flex h-4 min-w-[11px] items-center justify-center rounded-full bg-[#83b5b6] px-1 text-[10px] font-bold leading-5 text-white ring-2 ring-white">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </button>

              {/* Carrito */}
              <button
                type="button"
                onClick={onCartClick}
                className="relative flex items-center justify-center w-11 h-11 rounded-xl text-[#83b5b6] hover:bg-[#83b5b6]/10 transition-colors"
                aria-label="Carrito"
              >
                <ShoppingCart className="h-5 w-5" strokeWidth={2} />
                {cartCount > 0 && (
                  <span className="absolute top-[-5px] left-5 flex h-4 min-w-[11px] items-center justify-center rounded-full bg-[#83b5b6] px-1 text-[10px] font-bold leading-5 text-white ring-2 ring-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación desktop: MegaMenu */}
      <div className="hidden lg:block bg-white/80 backdrop-blur-sm border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <MegaMenu
            categories={categories}
            onCategoryClick={(categoryName, subcategoryName) => {
              if (categoryName) {
                sessionStorage.setItem('selectedCategory', categoryName);
                if (subcategoryName) {
                  sessionStorage.setItem('selectedSubCategory', subcategoryName);
                } else {
                  sessionStorage.removeItem('selectedSubCategory');
                }
              }
              const tiendaPath = categoryName ? `/tienda/${createSlug(categoryName)}` : '/tienda';
              window.history.pushState(
                { view: 'category', categoryName, subcategoryName },
                '',
                tiendaPath
              );
              window.scrollTo({ top: 0, behavior: 'smooth' });
              window.dispatchEvent(
                new CustomEvent('categorySelected', {
                  detail: { categoryName, subcategoryName },
                })
              );
            }}
          />
        </div>
      </div>

      {/* Móvil: una fila de categorías rápidas (scroll horizontal) */}
      <div className="lg:hidden bg-white border-b border-stone-100">
        <nav
          className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2.5 px-3 -mx-3"
          style={{ WebkitOverflowScrolling: 'touch' }}
          aria-label="Categorías"
        >
          {displayCategories.slice(0, 6).map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.name)}
              className={cn(
                'flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors touch-manipulation min-h-[44px] flex items-center',
                'text-stone-700 bg-stone-50 hover:bg-[#FFC1CC]/15 hover:text-stone-900 active:bg-[#FFC1CC]/25'
              )}
            >
              {cat.name}
            </button>
          ))}
          <button
            onClick={() => handleCategorySelect('Tienda')}
            className="flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap text-white transition-opacity touch-manipulation min-h-[44px] flex items-center"
            style={{ backgroundColor: '#84b4b5' }}
          >
            Tienda
          </button>
        </nav>
      </div>

      {/* Sheet: menú móvil con todas las categorías */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="left"
          className="w-[min(100vw-2rem,320px)] p-0 flex flex-col bg-white border-r border-stone-200"
        >
          <SheetHeader className="border-b border-stone-100 px-4 py-3">
            <SheetTitle className="text-lg font-semibold text-stone-900">
              Menú
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto py-2">
            {displayCategories.map((cat) => (
              <div key={cat.id} className="border-b border-stone-50 last:border-0">
                {cat.subcategories.length > 0 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleCategorySelect(cat.name)}
                      className="flex w-full items-center justify-between px-4 py-3.5 text-left text-stone-800 font-medium hover:bg-stone-50 active:bg-stone-100 transition-colors touch-manipulation min-h-[48px]"
                    >
                      {cat.name}
                      <ChevronRight className="h-5 w-5 text-stone-400 shrink-0" />
                    </button>
                    <div className="pl-4 pb-2">
                      {cat.subcategories.map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => handleCategorySelect(cat.name, sub.name)}
                          className="flex w-full items-center px-4 py-2.5 text-sm text-stone-600 hover:bg-[#FFC1CC]/10 hover:text-stone-900 rounded-lg transition-colors touch-manipulation min-h-[44px]"
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleCategorySelect(cat.name)}
                    className="flex w-full items-center px-4 py-3.5 text-left text-stone-800 font-medium hover:bg-stone-50 active:bg-stone-100 transition-colors touch-manipulation min-h-[48px]"
                  >
                    {cat.name}
                  </button>
                )}
              </div>
            ))}
            <div className="p-3 pt-4">
              <button
                type="button"
                onClick={() => handleCategorySelect('Tienda')}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-white font-semibold transition-opacity active:opacity-90 touch-manipulation"
                style={{ backgroundColor: '#84b4b5' }}
              >
                Tienda
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
