import { Heart, Mail, Phone, MapPin, Instagram, Facebook, Twitter, Youtube, CreditCard, Shield, Truck, Award, RefreshCw } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      {/* Trust Badges Bar - Light Theme with Pastel Accents */}
      <div className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Envío gratis */}
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-[#8da399]/20 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-300">
                <Truck className="h-6 w-6 text-[#8da399]" />
              </div>
              <div>
                <div className="text-base font-medium text-foreground">Envío gratis</div>
                <div className="text-sm text-muted-foreground">En pedidos +50€</div>
              </div>
            </div>

            {/* Pago seguro */}
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-[#9cadb3]/20 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-300">
                <Shield className="h-6 w-6 text-[#9cadb3]" />
              </div>
              <div>
                <div className="text-base font-medium text-foreground">Pago seguro</div>
                <div className="text-sm text-muted-foreground">100% protegido</div>
              </div>
            </div>

            {/* Devolución */}
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-[#9d8e80]/20 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-300">
                <RefreshCw className="h-6 w-6 text-[#9d8e80]" />
              </div>
              <div>
                <div className="text-base font-medium text-foreground">Devolución</div>
                <div className="text-sm text-muted-foreground">30 días gratis</div>
              </div>
            </div>

            {/* Garantía */}
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-[#dccf9d]/20 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 duration-300">
                <Award className="h-6 w-6 text-[#dccf9d]" />
              </div>
              <div>
                <div className="text-base font-medium text-foreground">Garantía</div>
                <div className="text-sm text-muted-foreground">Calidad premium</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer - Dark Theme */}
      <div className="bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  BabyOnly
                </h3>
                <p className="text-background/70 leading-relaxed">
                  Productos premium de algodón orgánico, diseñados con amor para el confort y desarrollo de tu bebé. Calidad certificada y sostenible.
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-background/50 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-background/70">
                    Calle Mayor 123<br />
                    28013 Madrid, España
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-background/50 flex-shrink-0" />
                  <a href="tel:+34900123456" className="text-sm text-background/70 hover:text-white transition-colors">
                    +34 900 123 456
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-background/50 flex-shrink-0" />
                  <a href="mailto:hola@babyonly.com" className="text-sm text-background/70 hover:text-white transition-colors">
                    hola@babyonly.com
                  </a>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h4 className="text-sm font-medium mb-3">Síguenos</h4>
                <div className="flex gap-3">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/10 hover:bg-gradient-to-br hover:from-[#c0776d] hover:to-[#a09085] rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/10 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/10 hover:bg-sky-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/10 hover:bg-red-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Shop Column */}
            <div>
              <h4 className="text-sm font-medium mb-4 uppercase tracking-wider">Comprar</h4>
              <ul className="space-y-3">
                {['Juguetes', 'Textiles', 'Ropa', 'Accesorios', 'Nuevos productos', 'Ofertas', 'Gift Cards'].map((item) => (
                  <li key={item}>
                    <button 
                      onClick={() => {
                        // Navigate to category page
                        window.location.hash = '#category';
                      }}
                      className="text-background/70 hover:text-white transition-colors text-sm text-left w-full"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help Column */}
            <div>
              <h4 className="text-sm font-medium mb-4 uppercase tracking-wider">Ayuda</h4>
              <ul className="space-y-3">
                {['Centro de ayuda', 'Seguimiento de pedido', 'Envíos y entregas', 'Devoluciones', 'Tallas', 'Contacto', 'FAQs'].map((item) => (
                  <li key={item}>
                    <button 
                      onClick={() => {
                        // Could open a modal or navigate to help page in the future
                        console.log(`Navigate to help: ${item}`);
                      }}
                      className="text-background/70 hover:text-white transition-colors text-sm text-left w-full"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="text-sm font-medium mb-4 uppercase tracking-wider">Empresa</h4>
              <ul className="space-y-3">
                {['Sobre nosotros', 'Blog', 'Sostenibilidad', 'Prensa', 'Trabaja con nosotros', 'Afiliados', 'Programa B2B'].map((item) => (
                  <li key={item}>
                    <button 
                      onClick={() => {
                        // Could navigate to company pages in the future
                        console.log(`Navigate to company: ${item}`);
                      }}
                      className="text-background/70 hover:text-white transition-colors text-sm text-left w-full"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="border-t border-background/10 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <span className="text-sm text-background/60">Métodos de pago:</span>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-background/60" />
                  </div>
                  <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center text-xs font-medium text-background/60">
                    VISA
                  </div>
                  <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center text-xs font-medium text-background/60">
                    MC
                  </div>
                  <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center text-xs font-medium text-background/60">
                    AMEX
                  </div>
                  <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center text-xs font-medium text-background/60">
                    PP
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                  <Shield className="h-4 w-4 text-green-300" />
                  <span className="text-xs text-background/60">SSL Seguro</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                  <Award className="h-4 w-4 text-[#dccf9d]" />
                  <span className="text-xs text-background/60">GOTS Certificado</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-background/60">
                <span>© {currentYear} BabyOnly.</span>
                <span>Hecho con</span>
                <Heart className="h-4 w-4 text-secondary fill-secondary animate-pulse" />
                <span>en España</span>
              </div>
              
              <div className="flex items-center gap-6 text-sm">
                <button 
                  onClick={() => console.log('Navigate to Privacy')}
                  className="text-background/70 hover:text-white transition-colors"
                >
                  Privacidad
                </button>
                <button 
                  onClick={() => console.log('Navigate to Terms')}
                  className="text-background/70 hover:text-white transition-colors"
                >
                  Términos
                </button>
                <button 
                  onClick={() => console.log('Navigate to Cookies')}
                  className="text-background/70 hover:text-white transition-colors"
                >
                  Cookies
                </button>
                <button 
                  onClick={() => console.log('Navigate to Legal')}
                  className="text-background/70 hover:text-white transition-colors"
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