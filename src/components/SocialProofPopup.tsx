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
    productImage: '/img/5.webp',
    timeAgo: 'hace 3 minutos'
  },
  {
    id: 2,
    customerName: 'Carmen R.',
    location: 'Barcelona',
    productName: 'Manta de punto suave',
    productImage: '/img/6.webp',
    timeAgo: 'hace 8 minutos'
  },
  {
    id: 3,
    customerName: 'Laura S.',
    location: 'Valencia',
    productName: 'Set de baberos premium',
    productImage: '/img/7.webp',
    timeAgo: 'hace 12 minutos'
  },
  {
    id: 4,
    customerName: 'Ana M.',
    location: 'Sevilla',
    productName: 'Pijama de estrellas',
    productImage: '/img/8.webp',
    timeAgo: 'hace 15 minutos'
  },
  {
    id: 5,
    customerName: 'Isabel G.',
    location: 'Málaga',
    productName: 'Gorro de punto bebé',
    productImage: '/img/9.webp',
    timeAgo: 'hace 18 minutos'
  },
  {
    id: 6,
    customerName: 'Elena P.',
    location: 'Bilbao',
    productName: 'Zapatitos de algodón',
    productImage: '/img/10.webp',
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
      className={`fixed bottom-8 right-8 z-50 transition-all duration-500 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      style={{ 
        left: 'auto',
        right: '2rem',
        bottom: '2rem',
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)'
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-3 max-w-xs flex items-center gap-3 hover:shadow-2xl transition-shadow">
        {/* Product Image */}
        <div className="w-12 h-12 bg-[#F9F9F9] rounded-xl overflow-hidden flex-shrink-0">
          <ImageWithFallback
            src={currentPurchase.productImage}
            alt={currentPurchase.productName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <ShoppingBag className="h-3 w-3 text-[#4ade80] flex-shrink-0" />
            <span className="text-xs text-[#2d3748] truncate">
              <strong className="font-semibold">{currentPurchase.customerName}</strong> compró
            </span>
          </div>
          <p className="text-xs text-[#718096] line-clamp-1 mb-0.5 font-medium">
            {currentPurchase.productName}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-[#718096]">
            <span className="flex items-center gap-1">
              <MapPin className="h-2.5 w-2.5" />
              {currentPurchase.location}
            </span>
            <span>•</span>
            <span>{currentPurchase.timeAgo}</span>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 text-[#718096] hover:text-[#2d3748] transition-colors text-sm"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
