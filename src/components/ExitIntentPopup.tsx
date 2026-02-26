import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { sendAbandonedCart, sendNewsletterWelcome } from '@/utils/bigbuy/edge';
import type { Product } from '@/types';

interface ExitIntentPopupProps {
  cartItems?: Product[];
  sessionId?: string;
}

export function ExitIntentPopup({ cartItems = [], sessionId }: ExitIntentPopupProps) {
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

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      if (cartItems.length > 0) {
        const items = cartItems.map((i) => ({
          name: i.name ?? 'Producto',
          quantity: i.quantity ?? 1,
          price: (i.price ?? 0) * (i.quantity ?? 1),
        }));
        const cartTotal = cartItems.reduce((s, i) => s + (i.price ?? 0) * (i.quantity ?? 1), 0);
        await sendAbandonedCart({ email, items, cartTotal, session_id: sessionId });
      } else {
        await sendNewsletterWelcome(email);
      }
    } catch {
      // Silenciar error; el usuario ya ve el mensaje de éxito
    }

    setIsSubscribed(true);
    localStorage.setItem('exit_intent_dismissed', 'true');

    setTimeout(() => setIsVisible(false), 3000);
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
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal - TODO alineado a la derecha */}
          <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ type: 'spring', duration: 0.4 }}
    // CAMBIO AQUÍ: de max-w-[700px] a max-w-4xl (aprox 900px) o max-w-[950px]
    className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-4xl mx-auto px-4" 
    onClick={(e) => e.stopPropagation()}
          >
            {!isSubscribed ? (
              <div 
                className="relative rounded-[2rem] shadow-2xl overflow-hidden"
                style={{
                  backgroundImage: 'url(/popup-overlay.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: 'white',
                }}
              >
                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 z-10 p-1.5 bg-white rounded-full hover:bg-gray-100 transition-all shadow-md"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>

                {/* Contenido del formulario - TODO a la derecha */}
                <div className="p-8 md:p-12 flex flex-col justify-center min-h-[450px]">
                  <div className="ml-auto max-w-sm text-right">
                    {/* Título - derecha */}
                    <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#FFB3BA' }}>
                      ¡Espera!
                    </h2>

                    {/* Subtítulo - derecha */}
                    <p className="text-lg md:text-xl text-gray-800 font-medium mb-8 leading-relaxed">
                      Consigue un <span className="font-bold">10% de descuento</span><br />
                      en tu primera compra
                    </p>

                    {/* Formulario - derecha */}
                    <form onSubmit={handleSubscribe} className="space-y-4">
                      {/* Campo de email - derecha */}
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        required
                        className="w-full px-4 py-3.5 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 transition-all text-gray-800 placeholder:text-gray-400 text-right"
                        style={{ 
                          borderColor: '#83b5b6',
                        }}
                      />

                      {/* Botón Enviar - derecha */}
                      <button
                        type="submit"
                        className="w-full py-3.5 rounded-full font-semibold text-white text-lg transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                        style={{ backgroundColor: '#FFB3BA' }}
                      >
                        Enviar
                      </button>
                    </form>

                    {/* Texto legal - derecha */}
                    <p className="text-xs text-gray-600 mt-6 leading-relaxed">
                      Al suscribirte, aceptas recibir emails promocionales.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Estado de éxito - TODO a la derecha */
              <div 
                className="relative rounded-[2rem] shadow-2xl overflow-hidden"
                style={{
                  backgroundImage: 'url(/popup-overlay.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: 'white',
                }}
              >
                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 z-10 p-1.5 bg-white rounded-full hover:bg-gray-100 transition-all shadow-md"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>

                <div className="p-8 md:p-12 flex flex-col justify-center min-h-[450px]">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="ml-auto max-w-sm text-right"
                  >
                    {/* Título éxito - derecha */}
                    <h2 className="text-4xl font-bold mb-4 text-gray-800">
                      ¡Perfecto! 🎉
                    </h2>
                    
                    <p className="text-lg text-gray-700 mb-6">
                      Revisa tu email para obtener<br />tu código de descuento
                    </p>
                    
                    {/* Código de descuento - derecha */}
                    <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6 mb-6 border-2" style={{ borderColor: '#FFB3BA' }}>
                      <p className="text-sm text-gray-600 mb-2">Tu código de descuento:</p>
                      <p className="text-3xl font-bold tracking-wider" style={{ color: '#FFB3BA' }}>
                        WELCOME10
                      </p>
                    </div>

                    {/* Auto-close indicator - derecha */}
                    <div className="flex items-center justify-end gap-2 text-xs text-gray-500">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span>Esta ventana se cerrará automáticamente</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
