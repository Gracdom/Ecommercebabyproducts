import { useState, useEffect, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryDirectory } from './components/CategoryDirectory';
import { Footer } from './components/Footer';
import { Cart } from './components/Cart';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ToastNotifications } from './components/ToastNotifications';
import { Dialog, DialogContent, DialogTitle } from './components/ui/dialog';
import { WhatsAppButton } from './components/WhatsAppButton';
import { FeaturesSection } from './components/FeaturesSection';
import { useWishlist } from './components/WishlistManager';
import { useAuth } from './hooks/useAuth';
import { toast } from 'sonner@2.0.3';

// Lazy: sólo se cargan cuando el usuario navega a esa sección
const CategoryPage       = lazy(() => import('./components/CategoryPage').then(m => ({ default: m.CategoryPage })));
const ProductPage        = lazy(() => import('./components/ProductPage').then(m => ({ default: m.ProductPage })));
const CheckoutPage       = lazy(() => import('./components/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrderConfirmation  = lazy(() => import('./components/OrderConfirmation').then(m => ({ default: m.OrderConfirmation })));
const BigBuyAdmin        = lazy(() => import('./components/BigBuyAdmin').then(m => ({ default: m.BigBuyAdmin })));
const AdminLogin         = lazy(() => import('./components/AdminLogin').then(m => ({ default: m.AdminLogin })));
const GenderPredictor    = lazy(() => import('./components/GenderPredictor').then(m => ({ default: m.GenderPredictor })));
const GenderPredictorBanner = lazy(() => import('./components/GenderPredictorBanner').then(m => ({ default: m.GenderPredictorBanner })));
const WishlistPage       = lazy(() => import('./components/WishlistPage').then(m => ({ default: m.WishlistPage })));
const QuickViewModal     = lazy(() => import('./components/QuickViewModal').then(m => ({ default: m.QuickViewModal })));
const ExitIntentPopup    = lazy(() => import('./components/ExitIntentPopup').then(m => ({ default: m.ExitIntentPopup })));
const RecentlyViewed     = lazy(() => import('./components/RecentlyViewed').then(m => ({ default: m.RecentlyViewed })));
const SocialProofPopup   = lazy(() => import('./components/SocialProofPopup').then(m => ({ default: m.SocialProofPopup })));
const LoginModal         = lazy(() => import('./components/LoginModal').then(m => ({ default: m.LoginModal })));
const SignUpModal        = lazy(() => import('./components/SignUpModal').then(m => ({ default: m.SignUpModal })));
const UserProfile        = lazy(() => import('./components/UserProfile').then(m => ({ default: m.UserProfile })));
const AboutUs            = lazy(() => import('./components/AboutUs').then(m => ({ default: m.AboutUs })));
const Testimonials       = lazy(() => import('./components/Testimonials').then(m => ({ default: m.Testimonials })));
const BrandCarousel      = lazy(() => import('./components/BrandCarousel').then(m => ({ default: m.BrandCarousel })));
const InstagramSection   = lazy(() => import('./components/InstagramSection').then(m => ({ default: m.InstagramSection })));
const CategoryBentoGrid  = lazy(() => import('./components/CategoryBentoGrid').then(m => ({ default: m.CategoryBentoGrid })));
const ContactPage        = lazy(() => import('./components/pages/ContactPage').then(m => ({ default: m.ContactPage })));
const AvisoLegal         = lazy(() => import('./components/pages/AvisoLegal').then(m => ({ default: m.AvisoLegal })));
const Privacidad         = lazy(() => import('./components/pages/Privacidad').then(m => ({ default: m.Privacidad })));
const TerminosCondiciones = lazy(() => import('./components/pages/TerminosCondiciones').then(m => ({ default: m.TerminosCondiciones })));
const PoliticaCookies    = lazy(() => import('./components/pages/PoliticaCookies').then(m => ({ default: m.PoliticaCookies })));

// OrderData type from CheckoutPage (re-exportado para no importar el módulo entero aquí)
type OrderData = import('./components/CheckoutPage').OrderData;
import { shippingCostEur } from './constants/shipping';
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
                  try {
                    sessionStorage.removeItem('checkout_form_draft');
                  } catch {
                    /* ignore */
                  }
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
        // Preservar params de URL (transaction_id, value, etc.) para pruebas de GTM
        const urlParams = new URLSearchParams(window.location.search);
        const demoOrderId = urlParams.get('transaction_id') ?? 'DEMO-' + Date.now();
        const demoValue = urlParams.has('value') ? Number(urlParams.get('value')) : 0;
        const demoEmail = urlParams.get('email') ?? 'cliente@ejemplo.com';
        const demoPhone = urlParams.get('phone') ?? '+34 600 000 000';

        setOrderData({
          orderId: demoOrderId,
          bigbuyOrderIds: [],
          shippingOption: { serviceName: 'Envío estándar', delay: '4-6 días laborables', cost: 4.95 },
          customerInfo: { email: demoEmail, firstName: 'Cliente', lastName: 'Demo', phone: demoPhone },
          shippingAddress: { street: 'Calle Ejemplo 123', city: 'Madrid', postalCode: '28001', country: 'ES' },
          paymentMethod: 'card',
          total: demoValue,
          items: [],
        });
        setCurrentView('confirmation');
        // No reemplazar la URL: mantener params para que GTM pueda leerlos
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
      image: (i.images?.[0] ?? i.image) ?? undefined,
    }));
    const subAb = cartItems.reduce((s, i) => s + (i.price ?? 0) * (i.quantity ?? 1), 0);
    const shAb = shippingCostEur(subAb);
    const ivaAb = (subAb + shAb) * 0.21;
    const cartTotal = subAb + shAb + ivaAb;
    let email: string | undefined;
    try {
      const draft = sessionStorage.getItem('checkout_form_draft');
      if (draft) {
        const parsed = JSON.parse(draft) as { email?: string };
        if (parsed?.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsed.email)) {
          email = parsed.email;
        }
        sessionStorage.removeItem('checkout_form_draft');
      }
    } catch {
      /* ignore */
    }
    saveAbandonedCheckout({ session_id: sessionId, email, items, cartTotal, source: 'checkout_cancel' }).catch(() => {});
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

  const PageFallback = () => (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="h-10 w-10 border-2 border-[#FFC1CC] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className={`min-h-screen min-h-[100dvh] bg-white ${currentView !== 'admin' ? 'pb-24 lg:pb-0' : ''}`} style={{ backgroundColor: '#FFFFFF' }}>
    <Suspense fallback={null}>
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
        <Suspense fallback={<PageFallback />}>
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
        </Suspense>
      ) : currentView === 'category' ? (
        <Suspense fallback={<PageFallback />}>
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
        </Suspense>
      ) : currentView === 'product' ? (
        <Suspense fallback={<PageFallback />}>
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
        </Suspense>
      ) : currentView === 'checkout' ? (
        <Suspense fallback={<PageFallback />}>
        <CheckoutPage
          items={cartItems}
          sessionId={getOrCreateSessionId()}
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
        </Suspense>
      ) : currentView === 'confirmation' && orderData ? (
        <Suspense fallback={<PageFallback />}>
        <OrderConfirmation
          orderData={orderData}
          onBackToHome={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
        </Suspense>
      ) : currentView === 'gender-predictor' ? (
        <Suspense fallback={<PageFallback />}>
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
        </Suspense>
      ) : currentView === 'admin' ? (
        <Suspense fallback={<PageFallback />}>
        {authLoading ? (
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
        )}
        </Suspense>
      ) : currentView === 'contact' ? (
        <Suspense fallback={<PageFallback />}>
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
        </Suspense>
      ) : currentView === 'aviso-legal' ? (
        <Suspense fallback={<PageFallback />}>
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
        </Suspense>
      ) : currentView === 'privacidad' ? (
        <Suspense fallback={<PageFallback />}>
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
        </Suspense>
      ) : currentView === 'terminos' ? (
        <Suspense fallback={<PageFallback />}>
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
        </Suspense>
      ) : currentView === 'cookies' ? (
        <Suspense fallback={<PageFallback />}>
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
        </Suspense>
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
    </Suspense>
    </div>
  );
}