import { useState } from 'react';
import { Bell, Check } from 'lucide-react';

interface BackInStockAlertProps {
  inStock?: boolean;
}

export function BackInStockAlert({ inStock = true }: BackInStockAlertProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };

  if (inStock) return null;

  return (
    <div className="border border-orange-200 bg-orange-50 rounded-lg p-6 mb-6">
      <div className="flex items-start gap-3 mb-4">
        <Bell className="h-5 w-5 text-orange-600 mt-0.5" />
        <div>
          <h3 className="text-stone-900 mb-1">Out of Stock</h3>
          <p className="text-sm text-stone-600">
            This item is currently unavailable. Sign up to be notified when it's back in stock!
          </p>
        </div>
      </div>

      {!subscribed ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
            required
          />
          <button
            type="submit"
            className="bg-stone-900 text-white px-6 py-2 rounded-lg hover:bg-stone-800 transition-colors whitespace-nowrap"
          >
            Notify Me
          </button>
        </form>
      ) : (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-3 rounded-lg">
          <Check className="h-5 w-5" />
          <span>You'll be notified when this product is back in stock!</span>
        </div>
      )}
    </div>
  );
}
