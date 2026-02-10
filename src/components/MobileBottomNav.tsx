import { Home, Grid3x3, ShoppingCart, User, Heart } from 'lucide-react';

interface MobileBottomNavProps {
  cartCount: number;
  currentView: 'home' | 'category' | 'product';
  onHomeClick: () => void;
  onCategoriesClick: () => void;
  onCartClick: () => void;
}

export function MobileBottomNav({ 
  cartCount, 
  currentView, 
  onHomeClick, 
  onCategoriesClick,
  onCartClick 
}: MobileBottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-40 lg:hidden">
      <nav className="flex items-center justify-around px-2 py-2 min-h-[56px]" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))' }}>
        {/* Home */}
        <button
          onClick={onHomeClick}
          className={`flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[44px] py-2 px-3 transition-colors ${
            currentView === 'home' ? 'text-stone-900' : 'text-stone-500'
          }`}
        >
          <Home className={`h-5 w-5 ${currentView === 'home' ? 'fill-stone-900' : ''}`} />
          <span className="text-xs">Inicio</span>
        </button>

        {/* Categories */}
        <button
          onClick={onCategoriesClick}
          className={`flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[44px] py-2 px-3 transition-colors ${
            currentView === 'category' ? 'text-stone-900' : 'text-stone-500'
          }`}
        >
          <Grid3x3 className={`h-5 w-5 ${currentView === 'category' ? 'fill-stone-900' : ''}`} />
          <span className="text-xs">Categorías</span>
        </button>

        {/* Cart */}
        <button
          onClick={onCartClick}
          className="flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[44px] py-2 px-3 text-stone-500 relative"
        >
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute top-1 right-2 bg-stone-900 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
          <span className="text-xs">Carrito</span>
        </button>

        {/* Wishlist */}
        <button className="flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[44px] py-2 px-3 text-stone-500">
          <Heart className="h-5 w-5" />
          <span className="text-xs">Favoritos</span>
        </button>

        {/* Account */}
        <button className="flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[44px] py-2 px-3 text-stone-500">
          <User className="h-5 w-5" />
          <span className="text-xs">Cuenta</span>
        </button>
      </nav>
    </div>
  );
}
