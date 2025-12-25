import { Heart, Mail, Phone, MapPin, Instagram, Facebook, Twitter, Youtube, CreditCard, Shield, Truck, Award } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-stone-900 text-white">
      {/* Trust Badges Bar */}
      <div className="border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Truck className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-medium">Envío gratis</div>
                <div className="text-xs text-stone-400">En pedidos +50€</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <div className="text-sm font-medium">Pago seguro</div>
                <div className="text-xs text-stone-400">100% protegido</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Award className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <div className="text-sm font-medium">Garantía</div>
                <div className="text-xs text-stone-400">Calidad premium</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Heart className="h-5 w-5 text-rose-400" />
              </div>
              <div>
                <div className="text-sm font-medium">15K+ clientes</div>
                <div className="text-xs text-stone-400">Satisfechos</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
                BabyOnly
              </h3>
              <p className="text-stone-400 leading-relaxed">
                Productos premium de algodón orgánico, diseñados con amor para el confort y desarrollo de tu bebé. Calidad certificada y sostenible.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-stone-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-stone-400">
                  Calle Mayor 123<br />
                  28013 Madrid, España
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-stone-400 flex-shrink-0" />
                <a href="tel:+34900123456" className="text-sm text-stone-400 hover:text-white transition-colors">
                  +34 900 123 456
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-stone-400 flex-shrink-0" />
                <a href="mailto:hola@babyonly.com" className="text-sm text-stone-400 hover:text-white transition-colors">
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
                  className="w-10 h-10 bg-white/10 hover:bg-gradient-to-br hover:from-pink-500 hover:to-purple-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
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
                  <a href="#" className="text-stone-400 hover:text-white transition-colors text-sm">
                    {item}
                  </a>
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
                  <a href="#" className="text-stone-400 hover:text-white transition-colors text-sm">
                    {item}
                  </a>
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
                  <a href="#" className="text-stone-400 hover:text-white transition-colors text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-stone-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="text-sm text-stone-400">Métodos de pago:</span>
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-stone-400" />
                </div>
                <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center text-xs font-medium text-stone-400">
                  VISA
                </div>
                <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center text-xs font-medium text-stone-400">
                  MC
                </div>
                <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center text-xs font-medium text-stone-400">
                  AMEX
                </div>
                <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center text-xs font-medium text-stone-400">
                  PP
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                <Shield className="h-4 w-4 text-green-400" />
                <span className="text-xs text-stone-400">SSL Seguro</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                <Award className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-stone-400">GOTS Certificado</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-stone-400">
              <span>© {currentYear} BabyOnly.</span>
              <span>Hecho con</span>
              <Heart className="h-4 w-4 text-rose-500 fill-rose-500 animate-pulse" />
              <span>en España</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="text-stone-400 hover:text-white transition-colors">
                Privacidad
              </a>
              <a href="#" className="text-stone-400 hover:text-white transition-colors">
                Términos
              </a>
              <a href="#" className="text-stone-400 hover:text-white transition-colors">
                Cookies
              </a>
              <a href="#" className="text-stone-400 hover:text-white transition-colors">
                Accesibilidad
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
