import { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff, Heart, Sparkles, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner@2.0.3';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

export function SignUpModal({ isOpen, onClose, onSwitchToLogin }: SignUpModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      toast.error('Por favor, completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
      toast.success('¡Cuenta creada! Revisa tu email para confirmar tu cuenta.');
      onClose();
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error('Error al crear la cuenta', {
        description: error.message || 'Intenta de nuevo',
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
            <div className="absolute inset-0 bg-gradient-to-br from-[#E0F7FA]/30 via-transparent to-[#FFC1CC]/20" />
            
            {/* Contenido sobre la imagen */}
            <div className="absolute inset-0 flex flex-col justify-end p-12 text-white">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-xl space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-[#83b5b6] to-[#6fa3a5] rounded-full">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#2d3748]">
                    Únete a nuestra familia
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-[#718096]">
                    <div className="p-2 bg-[#FFF9C4] rounded-lg">
                      <Heart className="h-5 w-5 text-[#FFC1CC]" />
                    </div>
                    <span>Productos premium para tu bebé</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#718096]">
                    <div className="p-2 bg-[#E0F7FA] rounded-lg">
                      <Shield className="h-5 w-5 text-[#83b5b6]" />
                    </div>
                    <span>Compra segura y confiable</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#718096]">
                    <div className="p-2 bg-[#FFE5E5] rounded-lg">
                      <Sparkles className="h-5 w-5 text-[#FFC1CC]" />
                    </div>
                    <span>Ofertas exclusivas para miembros</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel Derecho - Formulario */}
          <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-gradient-to-br from-white to-[#F9FFFE]">
            <div className="max-w-md mx-auto w-full">
              {/* Header */}
              <div className="mb-8 text-center md:text-left">
                <h2 className="text-3xl lg:text-4xl font-bold mb-3 bg-gradient-to-r from-[#83b5b6] to-[#FFC1CC] bg-clip-text text-transparent">
                  Crea tu cuenta
                </h2>
                <p className="text-[#718096] text-lg">
                  Regístrate y comienza tu experiencia
                </p>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#2d3748] mb-2">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#83b5b6]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#83b5b6] focus:border-transparent transition-all text-[#2d3748] placeholder:text-[#CBD5E0]"
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
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#83b5b6]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-14 py-3.5 bg-white border-2 border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#83b5b6] focus:border-transparent transition-all text-[#2d3748] placeholder:text-[#CBD5E0]"
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#CBD5E0] hover:text-[#83b5b6] transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#2d3748] mb-2">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#83b5b6]" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-14 py-3.5 bg-white border-2 border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#83b5b6] focus:border-transparent transition-all text-[#2d3748] placeholder:text-[#CBD5E0]"
                      placeholder="Repite tu contraseña"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#CBD5E0] hover:text-[#83b5b6] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 bg-gradient-to-r from-[#83b5b6] to-[#6fa3a5] hover:from-[#6fa3a5] hover:to-[#5d9194] text-white py-4 rounded-xl font-semibold hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  style={{ boxShadow: '0 4px 20px rgba(131, 181, 182, 0.4)' }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creando cuenta...
                    </span>
                  ) : (
                    'Crear cuenta gratis'
                  )}
                </button>
              </form>

              {/* Footer */}
              {onSwitchToLogin && (
                <div className="mt-6 text-center">
                  <p className="text-[#718096]">
                    ¿Ya tienes cuenta?{' '}
                    <button
                      onClick={onSwitchToLogin}
                      className="text-[#83b5b6] font-semibold hover:text-[#6fa3a5] transition-colors"
                    >
                      Inicia sesión
                    </button>
                  </p>
                </div>
              )}

              {/* Trust badges */}
              <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
                <p className="text-xs text-center text-[#CBD5E0]">
                  Al registrarte, aceptas nuestros{' '}
                  <span className="text-[#83b5b6]">Términos y Condiciones</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

