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
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md shadow-sm border-b border-border">
      {/* Promo bar */}
      <div className="bg-primary/20 text-center py-2 px-4">
        <p className="text-sm text-foreground font-medium">
          Envío gratis en pedidos superiores a 50€ · Devolución gratuita en 30 días
        </p>
      </div>

      {/* Main header */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <button className="lg:hidden mr-4 p-2 text-foreground">
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold text-foreground">
                Baby<span className="text-primary">Only</span>
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
                    className="w-full px-4 py-2.5 pl-10 pr-4 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-background transition-all"
                  />
                  <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="hidden sm:block p-2.5 hover:bg-muted text-foreground rounded-lg transition-colors">
                <User className="h-5 w-5" />
              </button>
              <button 
                onClick={onWishlistClick}
                className="relative hidden sm:block p-2.5 hover:bg-muted text-foreground rounded-lg transition-colors"
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </button>
              <button 
                onClick={onCartClick}
                className="relative p-2.5 hover:bg-muted text-foreground rounded-lg transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation with Mega Menu */}
      <div className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MegaMenu />
          
          {/* Mobile horizontal scroll fallback */}
          <nav className="flex lg:hidden items-center gap-0 overflow-x-auto scrollbar-hide">
            {['Nuevos', 'Ropa', 'Accesorios', 'Habitación', 'Textil', 'Juguetes', 'Cuidado', 'Paseo', 'Outlet'].map((item) => (
              <a key={item} href="#" className="flex items-center gap-1 px-4 py-4 text-sm text-foreground hover:text-primary whitespace-nowrap border-b-2 border-transparent hover:border-primary transition-all">
                {item}
                <span className="text-muted-foreground">›</span>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}