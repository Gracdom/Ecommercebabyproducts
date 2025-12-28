import { useState } from 'react';
import { Mail, Sparkles, Gift, ArrowRight, Check } from 'lucide-react';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setIsSubscribed(false);
      }, 3000);
    }
  };

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#9fb3b8] to-accent" />
      
      {/* Animated shapes */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-[#e6dfd9] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl mb-6 border border-white/30">
            <Mail className="h-10 w-10 text-white" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/30">
            <Gift className="h-4 w-4 text-white" />
            <span className="text-sm text-white font-medium">10% de descuento en tu primera compra</span>
          </div>

          {/* Heading */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl text-white mb-4">
            Únete a nuestra familia
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Suscríbete y recibe ofertas exclusivas, consejos para bebés y las últimas novedades directamente en tu email
          </p>

          {/* Benefits */}
          <div className="grid sm:grid-cols-3 gap-6 mb-10 max-w-3xl mx-auto">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="text-sm text-white font-medium">Ofertas exclusivas</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <div className="text-sm text-white font-medium">Regalos especiales</div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div className="text-sm text-white font-medium">Consejos premium</div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
            <div className="relative">
              {!isSubscribed ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      className="w-full pl-12 pr-4 py-5 bg-white rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-4 focus:ring-white/30 transition-all text-lg"
                    />
                  </div>
                  <button
                    type="submit"
                    className="group px-8 py-5 bg-[#4a4541] hover:bg-[#2c2a29] text-white rounded-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <span className="font-medium text-lg">Suscribirme</span>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-xl px-6 py-5 flex items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg text-foreground font-medium">
                    ¡Gracias por suscribirte! Revisa tu email 🎉
                  </span>
                </div>
              )}
            </div>

            <p className="text-sm text-white/80 mt-4">
              Al suscribirte, aceptas nuestra política de privacidad. Puedes darte de baja en cualquier momento.
            </p>
          </form>

          {/* Social Proof */}
          <div className="mt-12 flex items-center justify-center gap-6 text-white/90">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <img
                  key={i}
                  src={[
                    "https://images.unsplash.com/photo-1764859878528-2b512ab9d4d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGJhYnklMjBmYWNlJTIwbmF0dXJhbCUyMGxpZ2h0fGVufDF8fHx8MTc2NjgzMjY0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
                    "https://images.unsplash.com/photo-1622632405663-f43782a098b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RoZXIlMjBzbWlsaW5nJTIwcG9ydHJhaXQlMjBzb2Z0JTIwY29sb3JzfGVufDF8fHx8MTc2NjgzMjY1M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
                    "https://images.unsplash.com/photo-1761891949359-abd8fb35b987?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXRoZXIlMjBiYWJ5JTIwcG9ydHJhaXQlMjBuYXR1cmFsfGVufDF8fHx8MTc2NjgzMjY1NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
                    "https://images.unsplash.com/photo-1725393197924-e1dff51c29f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVnbmFudCUyMHdvbWFuJTIwc21pbGluZyUyMHBvcnRyYWl0JTIwbmF0dXJhbCUyMGxpZ2h0fGVufDF8fHx8MTc2Njg1MTQ5MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
                    "https://images.unsplash.com/photo-1606051228013-5c2ececa4c61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RoZXIlMjBraXNzaW5nJTIwYmFieSUyMHNvZnQlMjBuYXR1cmFsJTIwbGlnaHR8ZW58MXx8fHwxNzY2ODUxNjA4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  ][i - 1]}
                  alt="Happy subscriber"
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                />
              ))}
            </div>
            <div className="text-left">
              <div className="text-sm font-medium">+15,000 familias suscritas</div>
              <div className="text-xs text-white/70">Únete a nuestra comunidad</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
