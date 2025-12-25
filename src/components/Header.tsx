import { ShoppingCart, Search, Menu, Heart, User } from 'lucide-react';
import { SearchAutocomplete } from './SearchAutocomplete';
import { MegaMenu } from './MegaMenu';
import { Product } from '../types';

interface HeaderProps {
  cartCount: number;
  wishlistCount?: number;
  onCartClick: () => void;
  onWishlistClick?: () => void;
  products?: Product[];
  onProductClick?: (product: Product) => void;
}

export function Header({ 
  cartCount, 
  wishlistCount = 0,
  onCartClick, 
  onWishlistClick,
  products = [], 
  onProductClick 
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Promo bar */}
      <div className="bg-stone-100 text-center py-2 px-4">
        <p className="text-sm text-stone-700">
          Envío gratis en pedidos superiores a 50€ · Devolución gratuita en 30 días
        </p>
      </div>

      {/* Main header */}
      <div className="border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <button className="lg:hidden mr-4 p-2">
                <Menu className="h-6 w-6 text-stone-600" />
              </button>
              <h1 className="text-2xl text-stone-800">
                Baby<span className="text-stone-500">Only</span>
              </h1>
            </div>

            {/* Search bar - hidden on mobile */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              {products.length > 0 && onProductClick ? (
                <SearchAutocomplete products={products} onProductClick={onProductClick} />
              ) : (
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    className="w-full px-4 py-2.5 pl-10 pr-4 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-300 focus:bg-white"
                  />
                  <Search className="absolute left-3 top-3 h-5 w-5 text-stone-400" />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="hidden sm:block p-2.5 hover:bg-stone-100 rounded-lg transition-colors">
                <User className="h-5 w-5 text-stone-600" />
              </button>
              <button 
                onClick={onWishlistClick}
                className="relative hidden sm:block p-2.5 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <Heart className="h-5 w-5 text-stone-600" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>
              <button 
                onClick={onCartClick}
                className="relative p-2.5 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <ShoppingCart className="h-5 w-5 text-stone-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-stone-800 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation with Mega Menu */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MegaMenu />
          
          {/* Mobile horizontal scroll fallback */}
          <nav className="flex lg:hidden items-center gap-0 overflow-x-auto scrollbar-hide">
            <a href="#" className="flex items-center gap-1 px-4 py-4 text-sm text-stone-700 hover:text-stone-900 whitespace-nowrap border-b-2 border-transparent hover:border-stone-900 transition-all">
              Nuevos
              <span className="text-stone-400">›</span>
            </a>
            <a href="#" className="flex items-center gap-1 px-4 py-4 text-sm text-stone-700 hover:text-stone-900 whitespace-nowrap border-b-2 border-transparent hover:border-stone-900 transition-all">
              Ropa
              <span className="text-stone-400">›</span>
            </a>
            <a href="#" className="flex items-center gap-1 px-4 py-4 text-sm text-stone-700 hover:text-stone-900 whitespace-nowrap border-b-2 border-transparent hover:border-stone-900 transition-all">
              Accesorios
              <span className="text-stone-400">›</span>
            </a>
            <a href="#" className="flex items-center gap-1 px-4 py-4 text-sm text-stone-700 hover:text-stone-900 whitespace-nowrap border-b-2 border-transparent hover:border-stone-900 transition-all">
              Habitación
              <span className="text-stone-400">›</span>
            </a>
            <a href="#" className="flex items-center gap-1 px-4 py-4 text-sm text-stone-700 hover:text-stone-900 whitespace-nowrap border-b-2 border-transparent hover:border-stone-900 transition-all">
              Textil
              <span className="text-stone-400">›</span>
            </a>
            <a href="#" className="flex items-center gap-1 px-4 py-4 text-sm text-stone-700 hover:text-stone-900 whitespace-nowrap border-b-2 border-transparent hover:border-stone-900 transition-all">
              Juguetes
              <span className="text-stone-400">›</span>
            </a>
            <a href="#" className="flex items-center gap-1 px-4 py-4 text-sm text-stone-700 hover:text-stone-900 whitespace-nowrap border-b-2 border-transparent hover:border-stone-900 transition-all">
              Cuidado
              <span className="text-stone-400">›</span>
            </a>
            <a href="#" className="flex items-center gap-1 px-4 py-4 text-sm text-stone-700 hover:text-stone-900 whitespace-nowrap border-b-2 border-transparent hover:border-stone-900 transition-all">
              Paseo
              <span className="text-stone-400">›</span>
            </a>
            <a href="#" className="flex items-center gap-1 px-4 py-4 text-sm text-stone-900 hover:text-stone-900 whitespace-nowrap border-b-2 border-transparent hover:border-stone-900 transition-all">
              Outlet
              <span className="text-stone-400">›</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}