import { useEffect, useState } from 'react';
import { ShoppingBag, MapPin } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Purchase {
  id: number;
  customerName: string;
  location: string;
  productName: string;
  productImage: string;
  timeAgo: string;
}

const mockPurchases: Purchase[] = [
  {
    id: 1,
    customerName: 'María L.',
    location: 'Madrid',
    productName: 'Body de algodón orgánico',
    productImage: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400',
    timeAgo: 'hace 3 minutos'
  },
  {
    id: 2,
    customerName: 'Carmen R.',
    location: 'Barcelona',
    productName: 'Manta de punto suave',
    productImage: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400',
    timeAgo: 'hace 8 minutos'
  },
  {
    id: 3,
    customerName: 'Laura S.',
    location: 'Valencia',
    productName: 'Set de baberos premium',
    productImage: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400',
    timeAgo: 'hace 12 minutos'
  },
  {
    id: 4,
    customerName: 'Ana M.',
    location: 'Sevilla',
    productName: 'Pijama de estrellas',
    productImage: 'https://images.unsplash.com/photo-1602345397613-0934a8812d90?w=400',
    timeAgo: 'hace 15 minutos'
  },
  {
    id: 5,
    customerName: 'Isabel G.',
    location: 'Málaga',
    productName: 'Gorro de punto bebé',
    productImage: 'https://images.unsplash.com/photo-1533062618053-d51e617307ec?w=400',
    timeAgo: 'hace 18 minutos'
  },
  {
    id: 6,
    customerName: 'Elena P.',
    location: 'Bilbao',
    productName: 'Zapatitos de algodón',
    productImage: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400',
    timeAgo: 'hace 22 minutos'
  }
];

export function SocialProofPopup() {
  const [currentPurchase, setCurrentPurchase] = useState<Purchase | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show first notification after 5 seconds
    const initialTimer = setTimeout(() => {
      showRandomPurchase();
    }, 5000);

    // Then show every 15 seconds
    const interval = setInterval(() => {
      showRandomPurchase();
    }, 15000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  const showRandomPurchase = () => {
    const randomPurchase = mockPurchases[Math.floor(Math.random() * mockPurchases.length)];
    setCurrentPurchase(randomPurchase);
    setIsVisible(true);

    // Hide after 6 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 6000);
  };

  if (!currentPurchase) return null;

  return (
    <div
      className={`fixed bottom-8 left-8 z-50 transition-all duration-500 ${
        isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      }`}
    >
      <div className="bg-white rounded-lg shadow-2xl border border-stone-200 p-4 max-w-sm flex items-center gap-4 hover:shadow-xl transition-shadow">
        {/* Product Image */}
        <div className="w-16 h-16 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
          <ImageWithFallback
            src={currentPurchase.productImage}
            alt={currentPurchase.productName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag className="h-4 w-4 text-green-600 flex-shrink-0" />
            <span className="text-sm text-stone-900 truncate">
              <strong>{currentPurchase.customerName}</strong> compró
            </span>
          </div>
          <p className="text-sm text-stone-700 line-clamp-1 mb-1">
            {currentPurchase.productName}
          </p>
          <div className="flex items-center gap-3 text-xs text-stone-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {currentPurchase.location}
            </span>
            <span>•</span>
            <span>{currentPurchase.timeAgo}</span>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 text-stone-400 hover:text-stone-600 transition-colors"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
