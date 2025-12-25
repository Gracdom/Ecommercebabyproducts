import { useState, useEffect } from 'react';
import { X, Gift, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Check if user has already seen the popup
    const dismissed = localStorage.getItem('exit_intent_dismissed');
    if (dismissed) {
      setHasShown(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger when mouse leaves from top (navigating away)
      if (e.clientY <= 0 && !hasShown && !isVisible) {
        setIsVisible(true);
        setHasShown(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasShown, isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('exit_intent_dismissed', 'true');
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubscribed(true);
    localStorage.setItem('exit_intent_dismissed', 'true');
    
    // Auto close after 2 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg mx-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-stone-100 transition-colors z-10"
              >
                <X className="h-5 w-5 text-stone-600" />
              </button>

              {!isSubscribed ? (
                <div className="p-8 md:p-12">
                  {/* Icon */}
                  <div className="flex justify-center mb-6">
                    <div className="bg-amber-100 p-4 rounded-full">
                      <Gift className="h-10 w-10 text-amber-600" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl text-stone-900 mb-3">
                      ¡Espera! 🎁
                    </h2>
                    <p className="text-lg text-stone-700 mb-2">
                      Consigue un <strong className="text-amber-600">10% de descuento</strong>
                    </p>
                    <p className="text-stone-600">
                      en tu primera compra
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubscribe} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Tu correo electrónico"
                        required
                        className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-lg transition-colors"
                    >
                      ¡Quiero mi descuento!
                    </button>
                  </form>

                  {/* Fine print */}
                  <p className="text-xs text-stone-500 text-center mt-4">
                    Al suscribirte, aceptas recibir emails promocionales. Puedes darte de baja en cualquier momento.
                  </p>
                </div>
              ) : (
                <div className="p-8 md:p-12 text-center">
                  <div className="flex justify-center mb-6">
                    <div className="bg-green-100 p-4 rounded-full">
                      <Gift className="h-10 w-10 text-green-600" />
                    </div>
                  </div>
                  <h2 className="text-2xl text-stone-900 mb-3">
                    ¡Perfecto! 🎉
                  </h2>
                  <p className="text-stone-700 mb-2">
                    Revisa tu email para obtener tu código de descuento
                  </p>
                  <p className="text-sm text-stone-600">
                    <strong>Código:</strong> <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded">WELCOME10</span>
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
