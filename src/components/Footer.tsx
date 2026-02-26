import { Heart, Mail, MessageCircle, Instagram, Facebook } from 'lucide-react';
import { navigate } from '@/utils/navigate';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="overflow-x-hidden">
      {/* Main Footer - Teal/Petrol blue background */}
      <div style={{ backgroundColor: '#008080' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10 lg:py-16">
          {/* Grid: móvil 1 col + 3 cols para enlaces; tablet 2 cols; desktop 5 cols */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-12 mb-8 sm:mb-12">
            {/* Brand Column - full width móvil, 2 cols desktop */}
            <div className="lg:col-span-2 space-y-5 sm:space-y-6">
              <div>
                <div className="mb-3 flex items-center min-h-[2.5rem]">
                  <img
                    src="/logo-white.png"
                    alt="e-baby"
                    className="h-9 sm:h-10 w-auto shrink-0 object-contain"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                  <span className="text-2xl font-bold bg-gradient-to-r from-[#FFC1CC] to-[#E0F7FA] bg-clip-text text-transparent hidden">
                    e-baby
                  </span>
                </div>
                <p className="text-white/90 text-sm sm:text-base leading-relaxed max-w-md">
                  Productos premium de algodón orgánico, diseñados con amor para el confort y desarrollo de tu bebé. Calidad certificada y sostenible.
                </p>
              </div>

              {/* Contact - touch-friendly en móvil */}
              <div className="space-y-2.5">
                <a
                  href="https://wa.me/34910202911"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 min-h-[44px] py-2 -my-2 rounded-lg active:bg-white/10 transition-colors w-fit"
                >
                  <MessageCircle className="h-5 w-5 text-white/80 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-white/90 hover:text-white">+34 910 202 911 (WhatsApp)</span>
                </a>
                <a
                  href="mailto:info@ebaby-shop.com"
                  className="flex items-center gap-3 min-h-[44px] py-2 -my-2 rounded-lg active:bg-white/10 transition-colors w-fit"
                >
                  <Mail className="h-5 w-5 text-white/80 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-white/90 hover:text-white break-all">info@ebaby-shop.com</span>
                </a>
              </div>

              {/* Social - tamaño táctil en móvil */}
              <div>
                <h4 className="text-xs sm:text-sm font-semibold mb-3 text-white uppercase tracking-wider">Síguenos</h4>
                <div className="flex gap-2 sm:gap-3">
                  <a
                    href="https://www.instagram.com/tiendaebaby/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 sm:w-12 sm:h-12 min-w-[44px] min-h-[44px] bg-white/20 hover:bg-white/30 active:scale-95 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg border-2 border-white/30"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </a>
                  <a
                    href="https://www.facebook.com/tiendaebaby"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 sm:w-12 sm:h-12 min-w-[44px] min-h-[44px] bg-white/20 hover:bg-white/30 active:scale-95 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg border-2 border-white/30"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </a>
                </div>
              </div>
            </div>

            {/* Enlaces: móvil 3 columnas en una fila; desktop columnas sueltas */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:contents">
              {/* Comprar */}
              <div>
                <h4 className="text-xs sm:text-sm font-semibold mb-3 sm:mb-4 text-white uppercase tracking-wider">Comprar</h4>
                <ul className="space-y-1.5 sm:space-y-2">
                  {['Juguetes', 'Textiles', 'Ropa', 'Accesorios', 'Nuevos productos', 'Ofertas', 'Gift Cards'].map((item) => (
                    <li key={item}>
                      <button
                        onClick={() => navigate('/tienda')}
                        className="text-white/80 hover:text-white active:text-white text-left w-full font-medium text-xs sm:text-sm py-1.5 min-h-[32px] sm:min-h-[36px] rounded touch-manipulation transition-colors"
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ayuda */}
              <div>
                <h4 className="text-xs sm:text-sm font-semibold mb-3 sm:mb-4 text-white uppercase tracking-wider">Ayuda</h4>
                <ul className="space-y-1.5 sm:space-y-2">
                  <li>
                    <button onClick={() => navigate('/contacto')} className="text-white/80 hover:text-white active:text-white text-left w-full font-medium text-xs sm:text-sm py-1.5 min-h-[32px] sm:min-h-[36px] rounded touch-manipulation transition-colors">
                      Contacto
                    </button>
                  </li>
                  <li>
                    <button onClick={() => navigate('/tienda')} className="text-white/80 hover:text-white active:text-white text-left w-full font-medium text-xs sm:text-sm py-1.5 min-h-[32px] sm:min-h-[36px] rounded touch-manipulation transition-colors">
                      Catálogo
                    </button>
                  </li>
                </ul>
              </div>

              {/* Empresa */}
              <div>
                <h4 className="text-xs sm:text-sm font-semibold mb-3 sm:mb-4 text-white uppercase tracking-wider">Empresa</h4>
                <ul className="space-y-1.5 sm:space-y-2">
                  {['Sobre nosotros', 'Blog', 'Sostenibilidad', 'Prensa', 'Trabaja con nosotros', 'Afiliados', 'Programa B2B'].map((item) => (
                    <li key={item}>
                      <button
                        onClick={() => console.log(`Navigate to company: ${item}`)}
                        className="text-white/80 hover:text-white active:text-white text-left w-full font-medium text-xs sm:text-sm py-1.5 min-h-[32px] sm:min-h-[36px] rounded touch-manipulation transition-colors"
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar - apilado en móvil, centrado */}
        <div className="border-t border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-5 sm:py-6 lg:py-8">
            <div className="flex flex-col items-center text-center gap-4 sm:gap-5 md:flex-row md:justify-between md:text-left">
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs sm:text-sm text-white/90">
                <span>© {currentYear} e-baby.</span>
                <span className="flex items-center gap-1">
                  Hecho con <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white fill-white animate-pulse inline" /> en España
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 sm:gap-x-4 sm:gap-y-2 text-xs sm:text-sm">
                {[
                  { label: 'Aviso Legal', path: '/aviso-legal' },
                  { label: 'Privacidad', path: '/privacidad' },
                  { label: 'Términos', path: '/terminos' },
                  { label: 'Cookies', path: '/cookies' },
                  { label: 'Contacto', path: '/contacto' },
                ].map(({ label, path }) => (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className="text-white/80 hover:text-white active:text-white font-medium py-2 min-h-[44px] px-2 min-w-[44px] rounded-lg touch-manipulation transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}