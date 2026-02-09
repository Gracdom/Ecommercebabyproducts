import { Heart, Mail, Phone, MapPin, Instagram, Facebook, Twitter, Youtube, CreditCard, Shield, Truck, Award, RefreshCw } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      {/* Trust Badges Bar - Pastel Theme */}
      <div className="bg-white border-b border-[#E2E8F0]/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Envío gratis */}
            <div className="flex items-center gap-4 group">
              <div className="w-14 h-14 bg-[#E0F7FA]/50 hover:bg-[#E0F7FA] rounded-3xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 shadow-sm group-hover:shadow-md">
                <Truck className="h-7 w-7 text-[#2d3748]" />
              </div>
              <div>
                <div className="text-base font-semibold text-[#2d3748]">Envío gratis</div>
                <div className="text-sm text-[#718096]">En pedidos +50€</div>
              </div>
            </div>

            {/* Pago seguro */}
            <div className="flex items-center gap-4 group">
              <div className="w-14 h-14 bg-[#FFC1CC]/30 hover:bg-[#FFC1CC]/50 rounded-3xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 shadow-sm group-hover:shadow-md">
                <Shield className="h-7 w-7 text-[#2d3748]" />
              </div>
              <div>
                <div className="text-base font-semibold text-[#2d3748]">Pago seguro</div>
                <div className="text-sm text-[#718096]">100% protegido</div>
              </div>
            </div>

            {/* Devolución */}
            <div className="flex items-center gap-4 group">
              <div className="w-14 h-14 bg-[#FFF9C4]/50 hover:bg-[#FFF9C4] rounded-3xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 shadow-sm group-hover:shadow-md">
                <RefreshCw className="h-7 w-7 text-[#2d3748]" />
              </div>
              <div>
                <div className="text-base font-semibold text-[#2d3748]">Devolución</div>
                <div className="text-sm text-[#718096]">30 días gratis</div>
              </div>
            </div>

            {/* Garantía */}
            <div className="flex items-center gap-4 group">
              <div className="w-14 h-14 bg-[#E1BEE7]/40 hover:bg-[#E1BEE7]/60 rounded-3xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 shadow-sm group-hover:shadow-md">
                <Award className="h-7 w-7 text-[#2d3748]" />
              </div>
              <div>
                <div className="text-base font-semibold text-[#2d3748]">Garantía</div>
                <div className="text-sm text-[#718096]">Calidad premium</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer - Teal/Petrol blue background like Rabildoz */}
      <div style={{ backgroundColor: '#008080' }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="mb-3 flex items-center min-h-[2.5rem]">
                  <img
                    src="/logo.png"
                    alt="e-baby"
                    className="h-10 w-auto shrink-0 object-contain"
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
                <p className="text-white/90 leading-relaxed">
                  Productos premium de algodón orgánico, diseñados con amor para el confort y desarrollo de tu bebé. Calidad certificada y sostenible.
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-white/80 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white/90">
                    Calle Mayor 123<br />
                    28013 Madrid, España
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-white/80 flex-shrink-0" />
                  <a href="tel:+34900123456" className="text-sm text-white/90 hover:text-white transition-colors">
                    +34 900 123 456
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-white/80 flex-shrink-0" />
                  <a href="mailto:hola@babyonly.com" className="text-sm text-white/90 hover:text-white transition-colors">
                    hola@babyonly.com
                  </a>
                </div>
              </div>

              {/* Social Media - White icons on teal circles */}
              <div>
                <h4 className="text-sm font-semibold mb-4 text-white">Síguenos</h4>
                <div className="flex gap-3">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl border-2 border-white/30"
                  >
                    <Instagram className="h-6 w-6 text-white" />
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl border-2 border-white/30"
                  >
                    <Facebook className="h-6 w-6 text-white" />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl border-2 border-white/30"
                  >
                    <Twitter className="h-6 w-6 text-white" />
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl border-2 border-white/30"
                  >
                    <Youtube className="h-6 w-6 text-white" />
                  </a>
                </div>
              </div>
            </div>

            {/* Shop Column */}
            <div>
              <h4 className="text-sm font-semibold mb-5 text-white uppercase tracking-wider">Comprar</h4>
              <ul className="space-y-3">
                {['Juguetes', 'Textiles', 'Ropa', 'Accesorios', 'Nuevos productos', 'Ofertas', 'Gift Cards'].map((item) => (
                  <li key={item}>
                    <button 
                      onClick={() => {
                        window.location.hash = '#category';
                      }}
                      className="text-white/80 hover:text-white transition-colors text-sm text-left w-full font-medium"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help Column */}
            <div>
              <h4 className="text-sm font-semibold mb-5 text-white uppercase tracking-wider">Ayuda</h4>
              <ul className="space-y-3">
                {['Centro de ayuda', 'Seguimiento de pedido', 'Envíos y entregas', 'Devoluciones', 'Tallas', 'Contacto', 'FAQs'].map((item) => (
                  <li key={item}>
                    <button 
                      onClick={() => {
                        console.log(`Navigate to help: ${item}`);
                      }}
                      className="text-white/80 hover:text-white transition-colors text-sm text-left w-full font-medium"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="text-sm font-semibold mb-5 text-white uppercase tracking-wider">Empresa</h4>
              <ul className="space-y-3">
                {['Sobre nosotros', 'Blog', 'Sostenibilidad', 'Prensa', 'Trabaja con nosotros', 'Afiliados', 'Programa B2B'].map((item) => (
                  <li key={item}>
                    <button 
                      onClick={() => {
                        console.log(`Navigate to company: ${item}`);
                      }}
                      className="text-white/80 hover:text-white transition-colors text-sm text-left w-full font-medium"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Payment Methods - White text on teal */}
          <div className="border-t border-white/20 pt-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <span className="text-sm text-white/90 font-medium">Métodos de pago:</span>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-lg border-2 border-white/30">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <div className="w-14 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xs font-semibold text-white shadow-lg border-2 border-white/30">
                    VISA
                  </div>
                  <div className="w-14 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xs font-semibold text-white shadow-lg border-2 border-white/30">
                    MC
                  </div>
                  <div className="w-14 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xs font-semibold text-white shadow-lg border-2 border-white/30">
                    AMEX
                  </div>
                  <div className="w-14 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xs font-semibold text-white shadow-lg border-2 border-white/30">
                    PP
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-5 py-2.5 bg-white/20 rounded-2xl border-2 border-white/30 shadow-lg">
                  <Shield className="h-4 w-4 text-white" />
                  <span className="text-xs text-white font-medium">SSL Seguro</span>
                </div>
                <div className="flex items-center gap-2 px-5 py-2.5 bg-white/20 rounded-2xl border-2 border-white/30 shadow-lg">
                  <Award className="h-4 w-4 text-white" />
                  <span className="text-xs text-white font-medium">GOTS Certificado</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar - White text on teal */}
        <div className="border-t border-white/20">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-white/90">
                <span>© {currentYear} e-baby.</span>
                <span>Hecho con</span>
                <Heart className="h-4 w-4 text-white fill-white animate-pulse" />
                <span>en España</span>
              </div>
              
              <div className="flex items-center gap-6 text-sm">
                <button 
                  onClick={() => console.log('Navigate to Privacy')}
                  className="text-white/80 hover:text-white transition-colors font-medium"
                >
                  Privacidad
                </button>
                <button 
                  onClick={() => console.log('Navigate to Terms')}
                  className="text-white/80 hover:text-white transition-colors font-medium"
                >
                  Términos
                </button>
                <button 
                  onClick={() => console.log('Navigate to Cookies')}
                  className="text-white/80 hover:text-white transition-colors font-medium"
                >
                  Cookies
                </button>
                <button 
                  onClick={() => console.log('Navigate to Legal')}
                  className="text-white/80 hover:text-white transition-colors font-medium"
                >
                  Accesibilidad
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}