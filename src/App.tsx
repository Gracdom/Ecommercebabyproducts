import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { QuickShop } from './components/QuickShop';
import { CategoryDirectory } from './components/CategoryDirectory';
import { CategoryPage } from './components/CategoryPage';
import { ProductPage } from './components/ProductPage';
import { LifestyleSection } from './components/LifestyleSection';
import { AboutUs } from './components/AboutUs';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';
import { Cart } from './components/Cart';
import { QuickViewModal } from './components/QuickViewModal';
import { RecentlyViewed } from './components/RecentlyViewed';
import { SocialProofPopup } from './components/SocialProofPopup';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ToastNotifications } from './components/ToastNotifications';
import { WishlistPage } from './components/WishlistPage';
import { ExitIntentPopup } from './components/ExitIntentPopup';
import { RecommendedProducts } from './components/RecommendedProducts';
import { CheckoutPage, OrderData } from './components/CheckoutPage';
import { OrderConfirmation } from './components/OrderConfirmation';
import { WhatsAppButton } from './components/WhatsAppButton';
import { TrustBadges } from './components/TrustBadges';
import { FeaturedProducts } from './components/FeaturedProducts';
import { Testimonials } from './components/Testimonials';
import { InstagramFeed } from './components/InstagramFeed';
import { CollectionShowcase } from './components/CollectionShowcase';
import { GenderPredictor } from './components/GenderPredictor';
import { GenderPredictorBanner } from './components/GenderPredictorBanner';
import { useWishlist } from './components/WishlistManager';
import { toast } from 'sonner@2.0.3';
import { Product } from './types';

type View = 'home' | 'category' | 'product' | 'wishlist' | 'checkout' | 'confirmation' | 'gender-predictor';

// Mock products for search and recently viewed
const allProducts: Product[] = [
  {
    id: 1,
    name: 'Sensory book Animals laurel green/warm linen',
    price: 19.95,
    image: 'https://images.unsplash.com/photo-1671469627397-2bfdab72070d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWJ5JTIwdGVldGhpbmclMjB0b3l8ZW58MXx8fHwxNzY2NTU2ODMyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    badge: 'New',
    category: 'toys',
    rating: 4.8,
    reviews: 156
  },
  {
    id: 2,
    name: 'Activity cube Animals laurel green/warm linen',
    price: 19.95,
    image: 'https://images.unsplash.com/photo-1683276700110-6e7aba8170a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWJ5JTIwcmF0dGxlJTIwdG95fGVufDF8fHx8MTc2NjU0OTU0M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    badge: 'New',
    category: 'toys',
    rating: 4.5,
    reviews: 89
  },
  {
    id: 3,
    name: 'Activity spiral Animals laurel green/warm linen',
    price: 24.95,
    image: 'https://images.unsplash.com/photo-1518036456775-3016c91dd75d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWJ5JTIwY3VkZGxlJTIwY2xvdGh8ZW58MXx8fHwxNzY2NjU4MjgxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    badge: 'New',
    category: 'toys',
    rating: 4.9,
    reviews: 234
  },
  {
    id: 4,
    name: 'Cuddle cloth Animals laurel green/warm linen',
    price: 19.95,
    image: 'https://images.unsplash.com/photo-1760853382088-c3168c4b9ccc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWJ5JTIwc29mdCUyMHRveXxlbnwxfHx8fDE3NjY2NTgyODN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    badge: 'New',
    category: 'toys',
    rating: 4.7,
    reviews: 112
  },
  {
    id: 5,
    name: 'Wooden stacking toy Natural',
    price: 29.95,
    image: 'https://images.unsplash.com/photo-1761891953816-c45849393b32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b29kZW4lMjBiYWJ5JTIwdG95fGVufDF8fHx8MTc2NjY1ODI4Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'toys',
    rating: 4.6,
    reviews: 98
  },
  {
    id: 6,
    name: 'Music box Elephant Lily white',
    price: 34.95,
    image: 'https://images.unsplash.com/photo-1617300040847-369dee9d35f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWJ5JTIwbXVzaWMlMjBtb2JpbGV8ZW58MXx8fHwxNzY2NjU4MjgyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'toys',
    rating: 4.8,
    reviews: 176
  },
  {
    id: 7,
    name: 'Activity mat Forest friends',
    price: 89.95,
    image: 'https://images.unsplash.com/photo-1619490742958-50b38a5846b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWJ5JTIwYWN0aXZpdHklMjBtYXR8ZW58MXx8fHwxNzY2NjU4MjgyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'toys',
    rating: 4.9,
    reviews: 245
  },
  {
    id: 8,
    name: 'Puzzle blocks Pastel',
    price: 24.95,
    image: 'https://images.unsplash.com/photo-1707353485825-69671262a2b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWJ5JTIwcHV6emxlJTIwdG95fGVufDF8fHx8MTc2NjY1ODI4M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    category: 'toys',
    rating: 4.7,
    reviews: 134
  },
  {
    id: 9,
    name: 'Body de algodón orgánico',
    price: 15.95,
    originalPrice: 19.95,
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400',
    category: 'clothing',
    rating: 4.8,
    reviews: 203
  },
  {
    id: 10,
    name: 'Manta suave de punto',
    price: 39.95,
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400',
    category: 'textiles',
    rating: 4.9,
    reviews: 189
  }
];

export default function App() {
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>('home');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  
  // Wishlist integration
  const { wishlist, addToWishlist, removeFromWishlist, isInWishlist, wishlistCount } = useWishlist();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Load recently viewed from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentlyViewed');
    if (saved) {
      setRecentlyViewed(JSON.parse(saved));
    }
  }, []);

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    
    // Show toast notification
    toast.success(`${product.name} añadido al carrito`, {
      description: `Cantidad: ${(product.quantity || 1)} - Total: €${product.price.toFixed(2)}`,
      duration: 3000,
    });
    
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
    addToRecentlyViewed(product);
  };

  const handleProductClick = (product: Product) => {
    addToRecentlyViewed(product);
    setCurrentView('product');
  };

  const addToRecentlyViewed = (product: Product) => {
    setRecentlyViewed(prev => {
      // Remove if already exists
      const filtered = prev.filter(p => p.id !== product.id);
      // Add to beginning
      const updated = [product, ...filtered].slice(0, 5);
      // Save to localStorage
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
    localStorage.removeItem('recentlyViewed');
  };

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header 
        cartCount={cartCount} 
        wishlistCount={wishlistCount}
        onCartClick={() => setIsCartOpen(true)}
        onWishlistClick={() => setCurrentView('wishlist')}
        products={allProducts}
        onProductClick={handleProductClick}
      />
      
      {currentView === 'home' ? (
        <>
          <Hero />
          <GenderPredictorBanner onClick={() => setCurrentView('gender-predictor')} />
          <TrustBadges />
          <FeaturedProducts />
          <CollectionShowcase />
          <Testimonials />
          <CategoryDirectory onCategoryClick={() => setCurrentView('category')} />
          <QuickShop />
          <InstagramFeed />
          <RecommendedProducts 
            recentlyViewed={recentlyViewed}
            allProducts={allProducts}
            onProductClick={handleProductClick}
          />
          <LifestyleSection />
          <AboutUs />
          <Newsletter />
          <Footer />
        </>
      ) : currentView === 'category' ? (
        <>
          <CategoryPage 
            onAddToCart={addToCart}
            onBack={() => setCurrentView('home')}
            onProductClick={() => setCurrentView('product')}
            onQuickView={handleQuickView}
            onToggleWishlist={addToWishlist}
            isInWishlist={isInWishlist}
          />
          <Newsletter />
          <Footer />
        </>
      ) : currentView === 'wishlist' ? (
        <>
          <WishlistPage
            products={wishlist}
            onRemove={removeFromWishlist}
            onAddToCart={addToCart}
            onProductClick={handleProductClick}
          />
          <Newsletter />
          <Footer />
        </>
      ) : currentView === 'product' ? (
        <>
          <ProductPage 
            onAddToCart={addToCart}
            onBack={() => setCurrentView('category')}
            onToggleWishlist={addToWishlist}
            isInWishlist={isInWishlist}
          />
          <Newsletter />
          <Footer />
        </>
      ) : currentView === 'checkout' ? (
        <CheckoutPage
          items={cartItems}
          onBack={() => {
            setCurrentView('home');
            setIsCartOpen(true);
          }}
          onComplete={(data) => {
            setOrderData(data);
            setCurrentView('confirmation');
            setCartItems([]); // Clear cart after successful order
          }}
        />
      ) : currentView === 'confirmation' && orderData ? (
        <OrderConfirmation
          orderData={orderData}
          onBackToHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : currentView === 'gender-predictor' ? (
        <GenderPredictor
          onComplete={(gender) => {
            // Redirect to category page filtered by gender
            setCurrentView('category');
            toast.success(`¡Descubre productos perfectos para tu ${gender === 'boy' ? 'niño' : 'niña'}!`, {
              description: 'Usa el código BABYBOY15 o BABYGIRL15 para tu descuento',
              duration: 5000,
            });
          }}
          onBack={() => setCurrentView('home')}
        />
      ) : null}
      
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={() => {
          setIsCartOpen(false);
          setCurrentView('checkout');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <QuickViewModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onAddToCart={addToCart}
      />

      <RecentlyViewed
        products={recentlyViewed}
        onProductClick={handleProductClick}
        onClear={clearRecentlyViewed}
      />

      <SocialProofPopup />

      <ExitIntentPopup />

      <MobileBottomNav
        cartCount={cartCount}
        currentView={currentView}
        onHomeClick={() => setCurrentView('home')}
        onCategoriesClick={() => setCurrentView('category')}
        onCartClick={() => setIsCartOpen(true)}
      />

      <ToastNotifications />

      <WhatsAppButton />
    </div>
  );
}