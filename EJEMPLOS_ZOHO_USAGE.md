# 📚 Ejemplos de Uso - Zoho SalesIQ

## 🎯 Casos de Uso Comunes

### 1. Configuración Básica en App.tsx

Agrega el componente `ZohoSalesIQ` en tu `App.tsx` para configuración global:

```typescript
import { ZohoSalesIQ } from './components/ZohoSalesIQ';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { user } = useAuth();
  
  return (
    <div className="app">
      {/* Otros componentes */}
      
      {/* Configuración de Zoho SalesIQ */}
      <ZohoSalesIQ
        showWelcomeMessage={true}
        welcomeDelay={5000}
        welcomeText="¡Hola! 👶 ¿Necesitas ayuda para encontrar el producto perfecto para tu bebé?"
        visitorInfo={
          user ? {
            name: user.name,
            email: user.email,
            phone: user.phone,
          } : undefined
        }
      />
    </div>
  );
}
```

### 2. Botón "Chatea con Nosotros" en Producto

Agrega un botón en la página de producto para abrir el chat:

```typescript
import { openZohoChat } from './components/ZohoSalesIQ';
import { MessageCircle } from 'lucide-react';

export function ProductPage({ product }) {
  const handleChatClick = () => {
    // Abrir el chat y rastrear el evento
    openZohoChat();
    trackZohoEvent('product_inquiry', {
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
    });
  };
  
  return (
    <div className="product-page">
      {/* Información del producto */}
      
      <button
        onClick={handleChatClick}
        className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#83b5b6] text-[#83b5b6] rounded-xl hover:bg-[#83b5b6] hover:text-white transition-all"
      >
        <MessageCircle className="h-5 w-5" />
        <span>¿Tienes dudas? Chatea con nosotros</span>
      </button>
    </div>
  );
}
```

### 3. Rastrear Evento "Añadir al Carrito"

Rastrea cuando un usuario agrega un producto al carrito:

```typescript
import { trackZohoEvent } from './components/ZohoSalesIQ';

export function ProductCard({ product, onAddToCart }) {
  const handleAddToCart = () => {
    onAddToCart(product);
    
    // Rastrear en Zoho SalesIQ
    trackZohoEvent('product_added_to_cart', {
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      category: product.category,
    });
  };
  
  return (
    <div className="product-card">
      <button onClick={handleAddToCart}>
        Añadir al carrito
      </button>
    </div>
  );
}
```

### 4. Rastrear Compra Completada

En la página de confirmación de pedido:

```typescript
import { trackZohoEvent } from './components/ZohoSalesIQ';

export function OrderConfirmation({ orderData }) {
  useEffect(() => {
    // Rastrear compra completada
    trackZohoEvent('purchase_completed', {
      order_id: orderData.orderId,
      order_value: orderData.total,
      items_count: orderData.items.length,
      payment_method: orderData.paymentMethod,
    });
  }, [orderData]);
  
  return (
    <div className="order-confirmation">
      <h2>¡Pedido completado!</h2>
      {/* Resto del contenido */}
    </div>
  );
}
```

### 5. Hook Personalizado en Componentes

Usa el hook `useZohoSalesIQ` para tener acceso a todas las funciones:

```typescript
import { useZohoSalesIQ } from './components/ZohoSalesIQ';

export function CustomerSupport() {
  const zoho = useZohoSalesIQ();
  
  const handleContactSupport = () => {
    zoho.openChat();
  };
  
  const handleTrackIssue = (issueType: string) => {
    zoho.trackEvent('customer_issue', {
      issue_type: issueType,
      page: window.location.pathname,
    });
    zoho.openChat();
  };
  
  return (
    <div className="support-section">
      <h3>¿Necesitas ayuda?</h3>
      <button onClick={handleContactSupport}>
        Contactar Soporte
      </button>
      <button onClick={() => handleTrackIssue('shipping')}>
        Problema con Envío
      </button>
      <button onClick={() => handleTrackIssue('product')}>
        Problema con Producto
      </button>
    </div>
  );
}
```

### 6. Actualizar Info del Usuario tras Login

Cuando un usuario inicia sesión, actualiza su información en Zoho:

```typescript
import { updateZohoVisitor } from './components/ZohoSalesIQ';

export function LoginModal({ onClose }) {
  const { signIn } = useAuth();
  
  const handleLogin = async (email, password) => {
    const user = await signIn(email, password);
    
    // Actualizar información en Zoho SalesIQ
    updateZohoVisitor({
      name: user.name || user.email.split('@')[0],
      email: user.email,
      phone: user.phone,
    });
    
    onClose();
  };
  
  return (
    <div className="login-modal">
      {/* Formulario de login */}
    </div>
  );
}
```

### 7. Botón Flotante "Ayuda" Personalizado

Crea un botón flotante alternativo que abre Zoho:

```typescript
import { openZohoChat } from './components/ZohoSalesIQ';
import { MessageCircle } from 'lucide-react';

export function CustomChatButton() {
  return (
    <button
      onClick={openZohoChat}
      className="fixed bottom-24 right-6 z-40 p-4 bg-gradient-to-r from-[#FFC1CC] to-[#FFB3C1] text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
      aria-label="Chat con soporte"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full animate-pulse" />
    </button>
  );
}
```

### 8. Rastrear Abandono de Carrito

Detecta cuando un usuario va a salir sin completar la compra:

```typescript
import { trackZohoEvent } from './components/ZohoSalesIQ';

export function Cart({ items }) {
  useEffect(() => {
    // Rastrear que el usuario vio el carrito
    if (items.length > 0) {
      trackZohoEvent('cart_viewed', {
        items_count: items.length,
        cart_total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      });
    }
  }, [items]);
  
  return (
    <div className="cart">
      {/* Contenido del carrito */}
    </div>
  );
}
```

### 9. Ocultar Widget en Páginas Específicas

Oculta el widget en páginas donde no sea necesario:

```typescript
import { useEffect } from 'react';
import { hideZohoWidget, showZohoWidget } from './components/ZohoSalesIQ';

export function CheckoutPage() {
  useEffect(() => {
    // Ocultar widget durante checkout para no distraer
    hideZohoWidget();
    
    return () => {
      // Mostrar de nuevo al salir
      showZohoWidget();
    };
  }, []);
  
  return (
    <div className="checkout">
      {/* Proceso de checkout */}
    </div>
  );
}
```

### 10. Botón de Ayuda en el Header

Agrega un botón de ayuda en el header:

```typescript
import { openZohoChat } from './components/ZohoSalesIQ';
import { HelpCircle } from 'lucide-react';

export function Header() {
  return (
    <header className="header">
      <nav>
        {/* Otros elementos del nav */}
        
        <button
          onClick={openZohoChat}
          className="flex items-center gap-2 px-4 py-2 text-[#718096] hover:text-[#2d3748] transition-colors"
          aria-label="Ayuda"
        >
          <HelpCircle className="h-5 w-5" />
          <span className="hidden md:inline">Ayuda</span>
        </button>
      </nav>
    </header>
  );
}
```

### 11. Rastrear Búsquedas de Productos

Rastrea qué buscan los usuarios:

```typescript
import { trackZohoEvent } from './components/ZohoSalesIQ';

export function SearchBar() {
  const [query, setQuery] = useState('');
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rastrear búsqueda
    trackZohoEvent('product_search', {
      search_query: query,
      timestamp: new Date().toISOString(),
    });
    
    // Realizar búsqueda...
  };
  
  return (
    <form onSubmit={handleSearch}>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar productos..."
      />
    </form>
  );
}
```

### 12. Widget de Ayuda Contextual

Muestra ayuda específica según la página:

```typescript
import { openZohoChat, trackZohoEvent } from './components/ZohoSalesIQ';

export function ContextualHelp() {
  const location = useLocation();
  
  const getHelpMessage = () => {
    if (location.pathname.includes('/product/')) {
      return '¿Dudas sobre este producto?';
    }
    if (location.pathname.includes('/cart')) {
      return '¿Necesitas ayuda con tu pedido?';
    }
    if (location.pathname.includes('/checkout')) {
      return '¿Problemas con el pago?';
    }
    return '¿En qué podemos ayudarte?';
  };
  
  const handleClick = () => {
    trackZohoEvent('contextual_help_clicked', {
      page: location.pathname,
      help_message: getHelpMessage(),
    });
    openZohoChat();
  };
  
  return (
    <div className="fixed bottom-4 left-4 max-w-xs bg-white rounded-2xl shadow-lg p-4 border-2 border-[#E0F7FA]">
      <p className="text-sm text-[#2d3748] mb-3">
        {getHelpMessage()}
      </p>
      <button
        onClick={handleClick}
        className="w-full bg-[#83b5b6] text-white py-2 rounded-lg hover:bg-[#6fa3a5] transition-colors"
      >
        Chatea con nosotros
      </button>
    </div>
  );
}
```

## 🎯 Eventos Recomendados para Rastrear

```typescript
// E-commerce events
trackZohoEvent('product_viewed', { product_id, product_name });
trackZohoEvent('product_added_to_cart', { product_id, price });
trackZohoEvent('cart_viewed', { items_count, cart_total });
trackZohoEvent('checkout_started', { cart_total });
trackZohoEvent('purchase_completed', { order_id, order_value });

// User engagement
trackZohoEvent('search_performed', { search_query });
trackZohoEvent('category_viewed', { category_name });
trackZohoEvent('filter_applied', { filter_type, filter_value });
trackZohoEvent('newsletter_subscribed', { email });

// Support
trackZohoEvent('help_page_viewed', { page_url });
trackZohoEvent('faq_clicked', { question });
trackZohoEvent('return_requested', { order_id });
```

## 📊 Análisis de Datos

Todos estos eventos estarán disponibles en tu dashboard de Zoho SalesIQ para:
- Identificar productos con más consultas
- Ver qué páginas necesitan más soporte
- Analizar el recorrido del cliente
- Optimizar la experiencia de compra

## ⚡ Tips de Performance

1. **Lazy Load**: El script de Zoho ya usa `defer`
2. **Eventos Throttled**: No rastrear eventos duplicados rápidamente
3. **Condicional**: Solo cargar en producción si lo prefieres

```typescript
// Solo en producción
{process.env.NODE_ENV === 'production' && <ZohoSalesIQ />}
```

---

**Nota:** Todos estos ejemplos son opcionales. El widget funcionará automáticamente sin necesidad de implementar ninguno de estos casos de uso.
