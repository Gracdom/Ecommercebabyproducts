import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
// import { QuickShop } from './components/QuickShop';
import { CategoryDirectory } from './components/CategoryDirectory';
import { CategoryPage } from './components/CategoryPage';
import { ProductPage } from './components/ProductPage';
// import { LifestyleSection } from './components/LifestyleSection';
import { AboutUs } from './components/AboutUs';
// import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';
import { Cart } from './components/Cart';
import { QuickViewModal } from './components/QuickViewModal';
import { RecentlyViewed } from './components/RecentlyViewed';
import { SocialProofPopup } from './components/SocialProofPopup';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ToastNotifications } from './components/ToastNotifications';
import { WishlistPage } from './components/WishlistPage';
import { ExitIntentPopup } from './components/ExitIntentPopup';
// import { RecommendedProducts } from './components/RecommendedProducts';
import { CheckoutPage, OrderData } from './components/CheckoutPage';
import { OrderConfirmation } from './components/OrderConfirmation';
import { WhatsAppButton } from './components/WhatsAppButton';
// import { FeaturedProducts } from './components/FeaturedProducts';
import { FeaturesSection } from './components/FeaturesSection';
import { CategoryBentoGrid } from './components/CategoryBentoGrid';
import { Testimonials } from './components/Testimonials';
import { InstagramFeed } from './components/InstagramFeed';
import { BrandCarousel } from './components/BrandCarousel';
import { GenderPredictor } from './components/GenderPredictor';
import { GenderPredictorBanner } from './components/GenderPredictorBanner';
import { BigBuyAdmin } from './components/BigBuyAdmin';
import { useWishlist } from './components/WishlistManager';
import { useAuth } from './hooks/useAuth';
import { LoginModal } from './components/LoginModal';
import { SignUpModal } from './components/SignUpModal';
import { UserProfile } from './components/UserProfile';
import { toast } from 'sonner@2.0.3';
import { Product } from './types';
import { fetchCatalogProducts, fetchCategories, fetchProductsByCategory, type CategoryInfo } from './utils/ebaby/catalog';
import { createProductSlug, createSlug } from './utils/slug';

type View = 'home' | 'category' | 'product' | 'wishlist' | 'checkout' | 'confirmation' | 'gender-predictor' | 'admin' | 'login' | 'signup' | 'profile';

export default function App() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Wishlist integration
  const { wishlist, addToWishlist, removeFromWishlist, isInWishlist, wishlistCount } = useWishlist();
  
  // Auth integration
  const { user, isAdmin, loading: authLoading } = useAuth();

  // Load categories from ebaby_productos (once on mount)
  useEffect(() => {
    let cancelled = false;
    fetchCategories()
      .then((cats) => {
        if (!cancelled) setCategories(cats);
      })
      .catch((err) => console.error('Error loading categories:', err));
    return () => { cancelled = true; };
  }, []);

  // Single source of truth: load products from ebaby_productos
  useEffect(() => {
    let cancelled = false;

    const load = selectedCategory
      ? fetchProductsByCategory(selectedCategory, selectedSubCategory || undefined)
      : fetchCatalogProducts();

    load
      .then((products) => {
        if (!cancelled) setAllProducts(Array.isArray(products) ? products : []);
      })
      .catch((err) => {
        console.error('Error loading products from ebaby_productos:', err);
        if (!cancelled) {
          setAllProducts([]);
          toast.error('No se pudieron cargar los productos', {
            description: err?.message || 'Revisa la conexión y la tabla ebaby_productos.',
            duration: 5000,
          });
        }
      });

    return () => { cancelled = true; };
  }, [selectedCategory, selectedSubCategory]);

  // Listen for category selection from header
  useEffect(() => {
    const handleCategorySelected = (event: CustomEvent<{ categoryName: string; subcategoryName?: string }>) => {
      setSelectedCategory(event.detail.categoryName);
      setSelectedSubCategory(event.detail.subcategoryName || null);
      setCurrentView('category');
    };
    window.addEventListener('categorySelected', handleCategorySelected as EventListener);
    return () => window.removeEventListener('categorySelected', handleCategorySelected as EventListener);
  }, []);

  // Hash-based navigation (/#admin, #product/..., #category, etc.)
  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash;
      
      // Check for category selection in sessionStorage
      const storedCategory = sessionStorage.getItem('selectedCategory');
      const storedSubCategory = sessionStorage.getItem('selectedSubCategory');
      if (storedCategory && hash === '#category') {
        setSelectedCategory(storedCategory);
        setSelectedSubCategory(storedSubCategory && storedSubCategory !== 'null' ? storedSubCategory : null);
      }
      
      // Admin route
      if (hash === '#admin') {
        if (isAdmin) {
          setCurrentView('admin');
        } else {
          toast.error('Acceso denegado', {
            description: 'Necesitas permisos de administrador para acceder al panel.',
          });
          window.location.hash = '';
          setShowLoginModal(true);
        }
        return;
      }
      
      // Product route (#product/nombre-del-producto)
      if (hash.startsWith('#product/')) {
        const productSlug = hash.replace('#product/', '');
        // Buscar producto por slug del nombre (prioritario), luego por SKU o ID (retrocompatibilidad)
        const product = allProducts.find(p => {
          const nameSlug = createProductSlug(p);
          return nameSlug === productSlug || 
                 p.sku === productSlug || 
                 p.id.toString() === productSlug ||
                 `product-${p.id}` === productSlug ||
                 `producto-${p.id}` === productSlug;
        });
        if (product) {
          setSelectedProduct(product);
          setCurrentView('product');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }
      
      // Category route
      if (hash === '#category') {
        setCurrentView('category');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      
      // Home route (empty hash or #home)
      if (!hash || hash === '#home') {
        setCurrentView('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    };
    
    applyHash();
    window.addEventListener('hashchange', applyHash);
    window.addEventListener('popstate', applyHash);
    return () => {
      window.removeEventListener('hashchange', applyHash);
      window.removeEventListener('popstate', applyHash);
    };
  }, [isAdmin, allProducts]);

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

  const normalizeCartItem = (product: Product): Product => {
    // If the product already targets a specific variant, keep it.
    if (product.variantId && product.variantSku) {
      return {
        ...product,
        productId: product.productId ?? product.id,
        id: product.variantId,
      };
    }

    // If the product has variants, pick the first in-stock variant (or the first one).
    const variants = product.variants ?? [];
    if (variants.length) {
      const chosen = variants.find(v => v.stock > 0) ?? variants[0];
      return {
        ...product,
        productId: product.id,
        id: chosen.id,
        price: chosen.price ?? product.price,
        variantId: chosen.id,
        variantSku: chosen.sku,
      };
    }

    return product;
  };

  const addToCart = (product: Product) => {
    const cartItem = normalizeCartItem(product);
    const qtyToAdd = cartItem.quantity || 1;

    setCartItems(prev => {
      const existing = prev.find(item => item.id === cartItem.id);
      if (existing) {
        return prev.map(item =>
          item.id === cartItem.id
            ? { ...item, quantity: (item.quantity || 1) + qtyToAdd }
            : item
        );
      }
      return [...prev, { ...cartItem, quantity: qtyToAdd }];
    });
    
    // Show toast notification
    toast.success(`${cartItem.name} añadido al carrito`, {
      description: `Cantidad: ${qtyToAdd} - Total: €${(cartItem.price * qtyToAdd).toFixed(2)}`,
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
    setSelectedProduct(product);
    setCurrentView('product');
    // Update URL without page reload - usar nombre del producto como slug
    const productSlug = createProductSlug(product);
    window.history.pushState({ view: 'product', productId: product.id }, '', `#product/${productSlug}`);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <div className="min-h-screen min-h-[100dvh] bg-white pb-24 lg:pb-0" style={{ backgroundColor: '#FFFFFF' }}>
          <Header
            cartCount={cartCount}
            wishlistCount={wishlistCount}
            onCartClick={() => setIsCartOpen(true)}
            onWishlistClick={() => setCurrentView('wishlist')}
            onUserClick={() => {
              if (user) {
                setShowProfileModal(true);
              } else {
                setShowLoginModal(true);
              }
            }}
            onLogoClick={() => {
              // Navigate to home and update URL
              window.history.pushState({ view: 'home' }, '', window.location.pathname);
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            products={allProducts}
            onProductClick={handleProductClick}
            categories={categories}
          />
      
      {currentView === 'home' ? (
        <>
          <Hero 
            onGenderPredictorClick={() => setCurrentView('gender-predictor')}
            onExploreClick={() => {
              sessionStorage.removeItem('selectedCategory');
              sessionStorage.removeItem('selectedSubCategory');
              setSelectedCategory(null);
              setSelectedSubCategory(null);
              window.history.pushState({ view: 'category' }, '', '#category');
              setCurrentView('category');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOffersClick={() => {
              sessionStorage.removeItem('selectedCategory');
              sessionStorage.removeItem('selectedSubCategory');
              setSelectedCategory(null);
              setSelectedSubCategory(null);
              window.history.pushState({ view: 'category' }, '', '#category');
              setCurrentView('category');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
          <FeaturesSection />
          <CategoryBentoGrid
            categories={categories}
            onCategoryClick={(categoryName) => {
              sessionStorage.setItem('selectedCategory', categoryName);
              sessionStorage.removeItem('selectedSubCategory');
              setSelectedCategory(categoryName);
              setSelectedSubCategory(null);
              window.history.pushState({ view: 'category' }, '', '#category');
              setCurrentView('category');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
          <GenderPredictorBanner onClick={() => setCurrentView('gender-predictor')} />
          {/* <FeaturedProducts 
            onProductClick={handleProductClick}
            onAddToCart={addToCart}
            onToggleWishlist={addToWishlist}
            isInWishlist={isInWishlist}
            onViewAllClick={() => {
              sessionStorage.removeItem('selectedCategory');
              sessionStorage.removeItem('selectedSubCategory');
              setSelectedCategory(null);
              setSelectedSubCategory(null);
              window.history.pushState({ view: 'category' }, '', '#category');
              setCurrentView('category');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          /> */}
          <CategoryDirectory 
            onCategoryClick={(categoryName) => {
              window.history.pushState({ view: 'category' }, '', '#category');
              setCurrentView('category');
              window.scrollTo({ top: 0, behavior: 'smooth' });
              // Could filter by category in the future
            }} 
          />
          {/* <QuickShop 
            products={allProducts}
            onProductClick={handleProductClick}
            onAddToCart={addToCart}
            onToggleWishlist={addToWishlist}
            isInWishlist={isInWishlist}
            onViewAllClick={() => {
              sessionStorage.removeItem('selectedCategory');
              sessionStorage.removeItem('selectedSubCategory');
              setSelectedCategory(null);
              setSelectedSubCategory(null);
              window.history.pushState({ view: 'category' }, '', '#category');
              setCurrentView('category');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          /> */}
          <InstagramFeed />
          {/* <RecommendedProducts 
            recentlyViewed={recentlyViewed}
            allProducts={allProducts}
            onProductClick={handleProductClick}
          /> */}
          {/* <LifestyleSection /> */}
          <AboutUs />
          {/* <Newsletter /> */}
          <Testimonials />
          <BrandCarousel />
          <Footer />
        </>
      ) : currentView === 'category' ? (
        <>
          <CategoryPage 
            products={allProducts}
            categoryOptions={categories}
            selectedCategory={selectedCategory}
            selectedSubCategory={selectedSubCategory}
            onAddToCart={addToCart}
            onBack={() => {
              sessionStorage.removeItem('selectedCategory');
              sessionStorage.removeItem('selectedSubCategory');
              setSelectedCategory(null);
              setSelectedSubCategory(null);
              // Reload all products
              fetchCatalogProducts().then(setAllProducts).catch(console.error);
              window.history.pushState({ view: 'home' }, '', window.location.pathname);
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onProductClick={handleProductClick}
            onQuickView={handleQuickView}
            onToggleWishlist={addToWishlist}
            isInWishlist={isInWishlist}
          />
          {/* <Newsletter /> */}
          <BrandCarousel />
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
          {/* <Newsletter /> */}
          <BrandCarousel />
          <Footer />
        </>
      ) : currentView === 'product' ? (
        <>
          <ProductPage 
            product={selectedProduct}
            allProducts={allProducts}
            onAddToCart={addToCart}
            onBack={() => {
              window.history.pushState({ view: 'category' }, '', '#category');
              setCurrentView('category');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onToggleWishlist={addToWishlist}
            isInWishlist={isInWishlist}
            onProductClick={handleProductClick}
          />
          {/* <Newsletter /> */}
          <BrandCarousel />
          <Footer />
        </>
      ) : currentView === 'checkout' ? (
        <CheckoutPage
          items={cartItems}
          onBack={() => {
            window.history.pushState({ view: 'home' }, '', window.location.pathname);
            setCurrentView('home');
            setIsCartOpen(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
            window.history.pushState({ view: 'category' }, '', '#category');
            setCurrentView('category');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            toast.success(`¡Descubre productos perfectos para tu ${gender === 'boy' ? 'niño' : 'niña'}!`, {
              description: 'Usa el código BABYBOY15 o BABYGIRL15 para tu descuento',
              duration: 5000,
            });
          }}
          onBack={() => setCurrentView('home')}
        />
      ) : currentView === 'admin' ? (
        isAdmin ? (
          <BigBuyAdmin
            onBack={() => {
              window.history.pushState({ view: 'home' }, '', window.location.pathname);
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-stone-900 mb-4">Acceso denegado</h2>
              <p className="text-stone-600 mb-6">Necesitas permisos de administrador para acceder al panel.</p>
              <button
                onClick={() => {
                  window.history.pushState({ view: 'home' }, '', window.location.pathname);
                  setCurrentView('home');
                  setShowLoginModal(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-3 bg-stone-900 text-white rounded-lg hover:bg-stone-800"
              >
                Iniciar sesión
              </button>
            </div>
          </div>
        )
      ) : null}

      {/* Auth Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignUp={() => {
          setShowLoginModal(false);
          setShowSignUpModal(true);
        }}
      />
      <SignUpModal
        isOpen={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
        onSwitchToLogin={() => {
          setShowSignUpModal(false);
          setShowLoginModal(true);
        }}
      />
      <UserProfile
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onAdminClick={() => {
          if (isAdmin) {
            setCurrentView('admin');
            window.location.hash = '#admin';
          }
        }}
      />
      
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
        onHomeClick={() => {
          window.history.pushState({ view: 'home' }, '', window.location.pathname);
          setCurrentView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onCategoriesClick={() => {
          window.history.pushState({ view: 'category' }, '', '#category');
          setCurrentView('category');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onCartClick={() => setIsCartOpen(true)}
      />

      <ToastNotifications />

      <WhatsAppButton />
    </div>
  );
}