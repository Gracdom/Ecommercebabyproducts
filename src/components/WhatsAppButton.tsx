import { MessageCircle, X } from 'lucide-react';
import { useState } from 'react';

export function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const whatsappNumber = '+34900123456'; // Replace with actual number
  const message = encodeURIComponent('¡Hola! Tengo una consulta sobre los productos de BabyOnly.');

  return (
    <>
      {/* Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-2xl z-40 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-gradient-to-r from-green-600 to-green-500 p-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-white">BabyOnly</h3>
                  <p className="text-xs text-green-100">Soporte al cliente</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 p-1 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-stone-50 p-4 rounded-xl rounded-tl-none">
              <p className="text-sm text-stone-700 mb-2">
                ¡Hola! 👋 ¿En qué podemos ayudarte hoy?
              </p>
              <p className="text-xs text-stone-600">
                Estamos disponibles de Lunes a Viernes, 9:00 - 18:00
              </p>
            </div>

            <a
              href={`https://wa.me/${whatsappNumber}?text=${message}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              Iniciar conversación
            </a>

            <div className="space-y-2 pt-4 border-t border-stone-200">
              <p className="text-xs text-stone-600 text-center">Respuestas rápidas:</p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('¿Cuáles son los tiempos de envío?')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-stone-100 hover:bg-stone-200 px-3 py-2 rounded-lg transition-colors"
                >
                  Tiempos de envío
                </a>
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Información sobre devoluciones')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-stone-100 hover:bg-stone-200 px-3 py-2 rounded-lg transition-colors"
                >
                  Devoluciones
                </a>
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Seguimiento de pedido')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-stone-100 hover:bg-stone-200 px-3 py-2 rounded-lg transition-colors"
                >
                  Seguimiento
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 group"
        aria-label="Abrir chat de WhatsApp"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6 transition-transform group-hover:scale-110" />
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
              1
            </span>
          </>
        )}
      </button>
    </>
  );
}
