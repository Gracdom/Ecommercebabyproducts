import { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff, Heart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner@2.0.3';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp?: () => void;
}

export function LoginModal({ isOpen, onClose, onSwitchToSignUp }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Por favor, completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('¡Bienvenido de nuevo!');
      onClose();
      setEmail('');
      setPassword('');
    } catch (error: any) {
      toast.error('Error al iniciar sesión', {
        description: error.message || 'Verifica tus credenciales',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden">
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2.5 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-110"
        >
          <X className="h-5 w-5 text-stone-700" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Panel Izquierdo - Imagen de Fondo */}
          <div className="hidden md:block md:w-1/2 relative overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: 'url(/login-background.png)',
                backgroundPosition: 'center',
              }}
            />
            {/* Overlay sutil con gradiente */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFC1CC]/20 via-transparent to-[#E0F7FA]/20" />
            
            {/* Contenido sobre la imagen */}
            <div className="absolute inset-0 flex flex-col justify-end p-12 text-white">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-[#FFC1CC] to-[#FFB3C1] rounded-full">
                    <Heart className="h-6 w-6 text-white fill-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#2d3748]">
                    Baby Products
                  </h3>
                </div>
                <p className="text-[#718096] leading-relaxed">
                  Todo lo que necesitas para el cuidado de tu bebé, con amor y calidad premium
                </p>
              </div>
            </div>
          </div>

          {/* Panel Derecho - Formulario */}
          <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-gradient-to-br from-white to-[#FFF9F9]">
            <div className="max-w-md mx-auto w-full">
              {/* Header */}
              <div className="mb-8 text-center md:text-left">
                <h2 className="text-3xl lg:text-4xl font-bold mb-3 bg-gradient-to-r from-[#FFC1CC] to-[#83b5b6] bg-clip-text text-transparent">
                  Bienvenido de nuevo
                </h2>
                <p className="text-[#718096] text-lg">
                  Accede a tu cuenta para continuar
                </p>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#2d3748] mb-2">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#FFC1CC]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFC1CC] focus:border-transparent transition-all text-[#2d3748] placeholder:text-[#CBD5E0]"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#2d3748] mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#FFC1CC]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-14 py-3.5 bg-white border-2 border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFC1CC] focus:border-transparent transition-all text-[#2d3748] placeholder:text-[#CBD5E0]"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#CBD5E0] hover:text-[#FFC1CC] transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#FFC1CC] to-[#FFB3C1] hover:from-[#FFB3C1] hover:to-[#FFA3B1] text-white py-4 rounded-xl font-semibold hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  style={{ boxShadow: '0 4px 20px rgba(255, 193, 204, 0.4)' }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Iniciando sesión...
                    </span>
                  ) : (
                    'Iniciar sesión'
                  )}
                </button>
              </form>

              {/* Footer */}
              {onSwitchToSignUp && (
                <div className="mt-8 text-center">
                  <p className="text-[#718096]">
                    ¿No tienes cuenta?{' '}
                    <button
                      onClick={onSwitchToSignUp}
                      className="text-[#FFC1CC] font-semibold hover:text-[#FFB3C1] transition-colors"
                    >
                      Regístrate gratis
                    </button>
                  </p>
                </div>
              )}

              {/* Trust badges */}
              <div className="mt-8 pt-6 border-t border-[#E2E8F0]">
                <div className="flex items-center justify-center gap-4 text-xs text-[#CBD5E0]">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    Seguro
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                    Encriptado
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-[#FFC1CC] rounded-full" />
                    Confiable
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

