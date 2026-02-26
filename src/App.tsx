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
import { Dialog, DialogContent, DialogTitle } from './components/ui/dialog';
import { ExitIntentPopup } from './components/ExitIntentPopup';
// import { RecommendedProducts } from './components/RecommendedProducts';
import { CheckoutPage, OrderData } from './components/CheckoutPage';
import { OrderConfirmation } from './components/OrderConfirmation';
import { ContactPage } from './components/pages/ContactPage';
import { AvisoLegal } from './components/pages/AvisoLegal';
import { Privacidad } from './components/pages/Privacidad';
import { TerminosCondiciones } from './components/pages/TerminosCondiciones';
import { PoliticaCookies } from './components/pages/PoliticaCookies';
import { WhatsAppButton } from './components/WhatsAppButton';
// import { FeaturedProducts } from './components/FeaturedProducts';
import { FeaturesSection } from './components/FeaturesSection';
import { CategoryBentoGrid } from './components/CategoryBentoGrid';
import { Testimonials } from './components/Testimonials';
import { BrandCarousel } from './components/BrandCarousel';
import { InstagramSection } from './components/InstagramSection';
import { GenderPredictor } from './components/GenderPredictor';
import { GenderPredictorBanner } from './components/GenderPredictorBanner';
import { BigBuyAdmin } from './components/BigBuyAdmin';
import { AdminLogin } from './components/AdminLogin';
import { useWishlist } from './components/WishlistManager';
import { useAuth } from './hooks/useAuth';
import { LoginModal } from './components/LoginModal';
import { SignUpModal } from './components/SignUpModal';
import { UserProfile } from './components/UserProfile';
import { toast } from 'sonner@2.0.3';
import { Product } from './types';
import { fetchCatalogProducts, fetchCategories, fetchProductsByCategory, type CategoryInfo } from './utils/ebaby/catalog';
import { createProductSlug, createSlug } from './utils/slug';
import {
  getOrCreateSessionId,
  loadCartFromDb,
  saveCartToDb,
  clearCartInDb,
} from './utils/ebaby/cart-db';
import { createOrderInDb } from './utils/ebaby/orders-db';
import { saveAbandonedCheckout } from './utils/bigbuy/edge';

type View = 'home' | 'category' | 'product' | 'wishlist' | 'checkout' | 'confirmation' | 'gender-predictor' | 'admin' | 'login' | 'signup' | 'profile' | 'contact' | 'aviso-legal' | 'privacidad' | 'terminos' | 'cookies';

function getInitialCartFromStorage(): Product[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('cartItems');
    if (saved) {
      const parsed = JSON.parse(saved) as Product[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* ignore */
  }
  return [];
}

/** URL de la tienda: /tienda o /tienda/slug-categoria (ej. /tienda/dormitorio) */
function getTiendaPath(categoryName: string | null | undefined): string {
  if (!categoryName?.trim()) return '/tienda';
  return `/tienda/${createSlug(categoryName.trim())}`;
}

export default function App() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [cartItems, setCartItems] = useState<Product[]>(getInitialCartFromStorage);
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
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  
  // Wishlist integration
  const { wishlist, addToWishlist, removeFromWishlist, isInWishlist, wishlistCount } = useWishlist();
  
  // Auth integration
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();

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

  // Path-based navigation (/admin, /categoria, /producto/..., /contacto, etc.)
  useEffect(() => {
    const applyPath = () => {
      // Redirigir hashes antiguos (#admin, #categoria...) a paths
      const hash = window.location.hash.slice(1);
      if (hash) {
        const hashToPath: Record<string, string> = {
          admin: '/admin',
          category: '/tienda',
          contact: '/contacto',
          'aviso-legal': '/aviso-legal',
          privacidad: '/privacidad',
          terminos: '/terminos',
          cookies: '/cookies',
        };
        const pathFromHash = hashToPath[hash] ?? (hash.startsWith('product/') ? `/producto/${hash.replace('product/', '')}` : '/');
        window.history.replaceState(null, '', pathFromHash);
      }
      let path = window.location.pathname.replace(/\/$/, '') || '/';

      // Redirigir /categoria a /tienda para URLs consistentes
      if (path === '/categoria') {
        window.history.replaceState(null, '', '/tienda');
        path = '/tienda';
      } else if (path.startsWith('/categoria/')) {
        const slug = path.replace(/^\/categoria\/?/, '');
        window.history.replaceState(null, '', `/tienda/${slug}`);
        path = `/tienda/${slug}`;
      }

      // Check for category selection in sessionStorage (solo si ya estamos en tienda sin slug)
      const storedCategory = sessionStorage.getItem('selectedCategory');
      const storedSubCategory = sessionStorage.getItem('selectedSubCategory');
      if (storedCategory && path === '/tienda') {
        setSelectedCategory(storedCategory);
        setSelectedSubCategory(storedSubCategory && storedSubCategory !== 'null' ? storedSubCategory : null);
      }

      // Admin route: siempre mostrar vista admin (login o panel según auth)
      if (path === '/admin') {
        setCurrentView('admin');
        return;
      }

      // Product route (/producto/nombre-del-producto)
      if (path.startsWith('/producto/')) {
        const productSlug = path.replace('/producto/', '');
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

      // Tienda route: /tienda o /tienda/:categorySlug
      if (path === '/tienda' || path.startsWith('/tienda/')) {
        setCurrentView('category');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (path === '/tienda') {
          setSelectedCategory(null);
          setSelectedSubCategory(null);
        } else {
          const categorySlug = path.replace(/^\/tienda\/?/, '').split('/')[0];
          if (categorySlug && categories.length > 0) {
            const cat = categories.find((c) => createSlug(c.name) === categorySlug);
            if (cat) {
              setSelectedCategory(cat.name);
              setSelectedSubCategory(null);
              sessionStorage.setItem('selectedCategory', cat.name);
              sessionStorage.removeItem('selectedSubCategory');
            } else {
              setSelectedCategory(null);
              setSelectedSubCategory(null);
            }
          }
        }
        return;
      }

      // Contact and Legal routes
      if (path === '/contacto') { setCurrentView('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      if (path === '/aviso-legal') { setCurrentView('aviso-legal'); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      if (path === '/privacidad') { setCurrentView('privacidad'); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      if (path === '/terminos') { setCurrentView('terminos'); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      if (path === '/cookies') { setCurrentView('cookies'); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }

      // Checkout routes
      if (path === '/checkout') {
        setCurrentView('checkout');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (path === '/checkout/success') {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');
        if (sessionId) {
          const loadOrder = (retry = false) =>
            import('@/utils/bigbuy/edge').then(({ getOrderByStripeSession }) =>
              getOrderByStripeSession(sessionId)
                .then((data) => {
                  setOrderData(data);
                  setCurrentView('confirmation');
                  const sid = getOrCreateSessionId();
                  clearCartInDb(null, sid);
                  setCartItems([]);
                  window.history.replaceState(null, '', '/checkout/success');
                })
                .catch((err) => {
                  if (!retry && (err?.message?.includes('Orden no encontrada') || err?.message?.includes('404'))) {
                    setTimeout(() => loadOrder(true), 2000);
                  } else {
                    setCurrentView('home');
                  }
                })
            );
          loadOrder();
          return;
        }
        // Acceso directo sin session_id: mostrar página de confirmación de prueba
        setOrderData({
          orderId: 'DEMO-' + Date.now(),
          bigbuyOrderIds: [],
          shippingOption: { serviceName: 'Envío estándar', delay: '4-6 días laborables', cost: 4.95 },
          customerInfo: { email: 'cliente@ejemplo.com', firstName: 'Cliente', lastName: 'Demo', phone: '+34 600 000 000' },
          shippingAddress: { street: 'Calle Ejemplo 123', city: 'Madrid', postalCode: '28001', country: 'ES' },
          paymentMethod: 'card',
          total: 0,
          items: [],
        });
        setCurrentView('confirmation');
        window.history.replaceState(null, '', '/checkout/success');
        return;
      }

      // Home route
      setCurrentView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    applyPath();
    window.addEventListener('popstate', applyPath);
    return () => window.removeEventListener('popstate', applyPath);
  }, [isAdmin, allProducts, categories]);

  // Guardar abandono cuando vuelven de Stripe cancel (checkout?cancelled=1)
  useEffect(() => {
    if (currentView !== 'checkout') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('cancelled') !== '1') return;
    if (cartItems.length === 0) {
      window.history.replaceState(null, '', '/checkout');
      return;
    }
    const sessionId = getOrCreateSessionId();
    const items = cartItems.map((i) => ({
      name: i.name ?? 'Producto',
      quantity: i.quantity ?? 1,
      price: (i.price ?? 0) * (i.quantity ?? 1),
    }));
    const cartTotal = cartItems.reduce((s, i) => s + (i.price ?? 0) * (i.quantity ?? 1), 0);
    saveAbandonedCheckout({ session_id: sessionId, items, cartTotal, source: 'checkout_cancel' }).catch(() => {});
    window.history.replaceState(null, '', '/checkout');
  }, [currentView, cartItems]);

  // Load cart: from DB first, fallback to localStorage (migración)
  useEffect(() => {
    if (authLoading) return;
    const sessionId = getOrCreateSessionId();
    const uid = user?.id ?? null;

    const load = async () => {
      const dbCart = await loadCartFromDb(uid, sessionId);
      if (dbCart.length > 0) {
        setCartItems(dbCart);
        return;
      }
      // Usuario recién logueado: fusionar carrito de sesión con carrito de usuario
      if (uid) {
        const sessionCart = await loadCartFromDb(null, sessionId);
        if (sessionCart.length > 0) {
          const userCart = await loadCartFromDb(uid, null);
          const merged = [...userCart];
          for (const si of sessionCart) {
            const existing = merged.find((m) => m.id === si.id && m.variantSku === si.variantSku);
            if (existing) {
              existing.quantity = (existing.quantity ?? 1) + (si.quantity ?? 1);
            } else {
              merged.push({ ...si });
            }
          }
          setCartItems(merged);
          await saveCartToDb(merged, uid, null);
          await clearCartInDb(null, sessionId);
          return;
        }
      }
      const savedCart = localStorage.getItem('cartItems');
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart) as Product[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCartItems(parsed);
            saveCartToDb(parsed, uid, uid ? null : sessionId);
          }
        } catch {
          /* ignore */
        }
      }
    };
    load();
  }, [authLoading, user?.id]);

  // Save cart: localStorage (inmediato) + BD (debounced)
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (authLoading) return;
    const sessionId = getOrCreateSessionId();
    const uid = user?.id ?? null;
    const t = setTimeout(() => {
      saveCartToDb(cartItems, uid, sessionId);
    }, 500);
    return () => clearTimeout(t);
  }, [cartItems, authLoading, user?.id]);

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
    window.history.pushState({ view: 'product', productId: product.id }, '', `/producto/${productSlug}`);
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
    <div className={`min-h-screen min-h-[100dvh] bg-white ${currentView !== 'admin' ? 'pb-24 lg:pb-0' : ''}`} style={{ backgroundColor: '#FFFFFF' }}>
          {currentView !== 'admin' && (
          <Header
            cartCount={cartCount}
            wishlistCount={wishlistCount}
            onCartClick={() => setIsCartOpen(true)}
            onWishlistClick={() => setShowWishlistModal(true)}
            onUserClick={() => {
              if (user) {
                setShowProfileModal(true);
              } else {
                setShowLoginModal(true);
              }
            }}
            onLogoClick={() => {
              // Navigate to home and update URL
              window.history.pushState({ view: 'home' }, '', '/');
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            products={allProducts}
            onProductClick={handleProductClick}
            categories={categories}
          />
          )}
      
      {currentView === 'home' ? (
        <>
          <Hero 
            onGenderPredictorClick={() => setCurrentView('gender-predictor')}
            onExploreClick={() => {
              sessionStorage.removeItem('selectedCategory');
              sessionStorage.removeItem('selectedSubCategory');
              setSelectedCategory(null);
              setSelectedSubCategory(null);
              window.history.pushState({ view: 'category' }, '', '/tienda');
              setCurrentView('category');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOffersClick={() => {
              sessionStorage.removeItem('selectedCategory');
              sessionStorage.removeItem('selectedSubCategory');
              setSelectedCategory(null);
              setSelectedSubCategory(null);
              window.history.pushState({ view: 'category' }, '', '/tienda');
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
              window.history.pushState({ view: 'category' }, '', getTiendaPath(categoryName));
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
              window.history.pushState({ view: 'category' }, '', '/tienda');
              setCurrentView('category');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          /> */}
          <CategoryDirectory 
            onCategoryClick={(categoryName) => {
              if (categoryName) {
                sessionStorage.setItem('selectedCategory', categoryName);
                setSelectedCategory(categoryName);
                setSelectedSubCategory(null);
              } else {
                sessionStorage.removeItem('selectedCategory');
                setSelectedCategory(null);
                setSelectedSubCategory(null);
              }
              window.history.pushState({ view: 'category' }, '', getTiendaPath(categoryName));
              setCurrentView('category');
              window.scrollTo({ top: 0, behavior: 'smooth' });
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
              window.history.pushState({ view: 'category' }, '', '/tienda');
              setCurrentView('category');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          /> */}
          {/* <RecommendedProducts 
            recentlyViewed={recentlyViewed}
            allProducts={allProducts}
            onProductClick={handleProductClick}
          /> */}
          {/* <LifestyleSection /> */}
          <InstagramSection />
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
              window.history.pushState({ view: 'home' }, '', '/');
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
      ) : currentView === 'product' ? (
        <>
          <ProductPage 
            product={selectedProduct}
            allProducts={allProducts}
            onAddToCart={addToCart}
            onBack={() => {
              window.history.pushState({ view: 'category' }, '', getTiendaPath(selectedCategory));
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
            window.history.pushState({ view: 'home' }, '', '/');
            setCurrentView('home');
            setIsCartOpen(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onComplete={async (data) => {
            const sessionId = getOrCreateSessionId();
            const uid = user?.id ?? null;
            await createOrderInDb({
              orderNumber: data.orderId,
              userId: uid,
              sessionId,
              customerInfo: data.customerInfo,
              shippingAddress: data.shippingAddress,
              paymentMethod: data.paymentMethod,
              subtotal: cartItems.reduce((s, i) => s + i.price * (i.quantity ?? 1), 0),
              shippingCost: data.shippingOption?.cost ?? 0,
              discount: 0,
              total: data.total,
              items: cartItems,
              bigbuyOrderIds: data.bigbuyOrderIds,
              shippingServiceName: data.shippingOption?.serviceName,
              shippingServiceDelay: data.shippingOption?.delay,
            });
            await clearCartInDb(uid, sessionId);
            setOrderData(data);
            setCurrentView('confirmation');
            setCartItems([]);
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
            window.history.pushState({ view: 'category' }, '', '/tienda');
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
        authLoading ? (
          <div className="min-h-screen flex items-center justify-center bg-[#f0f0f1]">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 border-2 border-[#2271b1] border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-600 text-sm">Cargando...</p>
            </div>
          </div>
        ) : !user ? (
          <AdminLogin
            onBack={() => {
              window.history.pushState({ view: 'home' }, '', '/');
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : isAdmin ? (
          <BigBuyAdmin
            onBack={() => {
              window.history.pushState({ view: 'home' }, '', '/');
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          <div className="min-h-screen flex items-center justify-center bg-[#f0f0f1]">
            <div className="bg-white rounded-xl border border-[#c3c4c7] p-8 max-w-md text-center">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Acceso denegado</h2>
              <p className="text-slate-600 mb-6">
                Tu cuenta no tiene permisos de administrador para acceder al panel.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={async () => {
                    await signOut();
                  }}
                  className="px-6 py-2.5 border border-[#8c8f94] text-slate-700 rounded hover:bg-slate-50 font-medium"
                >
                  Cerrar sesión
                </button>
                <button
                  onClick={() => {
                    window.history.pushState({ view: 'home' }, '', '/');
                    setCurrentView('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-2.5 bg-[#2271b1] text-white rounded hover:bg-[#135e96] font-medium"
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          </div>
        )
      ) : currentView === 'contact' ? (
        <>
          <ContactPage
            onBack={() => {
              window.history.replaceState(null, '', '/');
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
          <Footer />
        </>
      ) : currentView === 'aviso-legal' ? (
        <>
          <AvisoLegal
            onBack={() => {
              window.history.replaceState(null, '', '/');
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
          <Footer />
        </>
      ) : currentView === 'privacidad' ? (
        <>
          <Privacidad
            onBack={() => {
              window.history.replaceState(null, '', '/');
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
          <Footer />
        </>
      ) : currentView === 'terminos' ? (
        <>
          <TerminosCondiciones
            onBack={() => {
              window.history.replaceState(null, '', '/');
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
          <Footer />
        </>
      ) : currentView === 'cookies' ? (
        <>
          <PoliticaCookies
            onBack={() => {
              window.history.replaceState(null, '', '/');
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
          <Footer />
        </>
      ) : null}

      {/* Wishlist popup */}
      <Dialog open={showWishlistModal} onOpenChange={setShowWishlistModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-lg font-semibold mb-4">
            Mi Lista de Deseos
          </DialogTitle>
          <WishlistPage
            products={wishlist}
            onRemove={removeFromWishlist}
            onAddToCart={addToCart}
            onProductClick={handleProductClick}
          />
        </DialogContent>
      </Dialog>

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
            window.history.pushState({ view: 'admin' }, '', '/admin');
          }
        }}
      />
      
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        allProducts={allProducts}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onAddToCart={addToCart}
        onCheckout={() => {
          setIsCartOpen(false);
          window.history.pushState({ view: 'checkout' }, '', '/checkout');
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

      <ExitIntentPopup cartItems={cartItems} sessionId={getOrCreateSessionId()} />

      {currentView !== 'admin' && (
        <>
          <MobileBottomNav
            cartCount={cartCount}
            currentView={currentView}
            onHomeClick={() => {
              window.history.pushState({ view: 'home' }, '', '/');
              setCurrentView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onCategoriesClick={() => {
              window.history.pushState({ view: 'category' }, '', '/tienda');
              setCurrentView('category');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onCartClick={() => setIsCartOpen(true)}
          />
          <WhatsAppButton />
        </>
      )}

      <ToastNotifications />
    </div>
  );
}