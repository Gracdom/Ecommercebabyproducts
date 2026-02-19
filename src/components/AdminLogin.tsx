import { useState } from 'react';
import { Mail, Lock, ArrowLeft, LayoutDashboard, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner@2.0.3';
interface AdminLoginProps {
  onBack: () => void;
}

export function AdminLogin({ onBack }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Introduce email y contraseña');
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      toast.success('Sesión iniciada');
      // El hook useAuth actualizará isAdmin; la vista se re-renderizará
    } catch (error: any) {
      toast.error('Error al iniciar sesión', {
        description: error?.message || 'Credenciales incorrectas',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f0f0f1]">
      {/* Panel izquierdo - colores corporativos */}
      <div className="hidden lg:flex flex-col w-[400px] bg-[#008080] text-white p-12 justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#FFC1CC] flex items-center justify-center shadow-md">
              <LayoutDashboard className="h-6 w-6 text-[#2d3748]" />
            </div>
            <div>
              <h1 className="text-xl font-bold">eBaby</h1>
              <p className="text-sm text-white/60">Panel de administración</p>
            </div>
          </div>
          <p className="text-white/80 text-sm leading-relaxed">
            Accede con tu cuenta de administrador para gestionar productos, pedidos y sincronización.
          </p>
        </div>
        <div className="text-xs text-white/40">
          Solo usuarios con rol administrador pueden acceder.
        </div>
      </div>

      {/* Panel derecho - formulario */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl border border-[#c3c4c7] shadow-[0_1px_1px_rgba(0,0,0,.04)] p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-1">Iniciar sesión</h2>
            <p className="text-sm text-slate-500 mb-6">Introduce tus credenciales de administrador</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-[#8c8f94] rounded focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080]"
                    placeholder="admin@ejemplo.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-[#8c8f94] rounded focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-[#008080]"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#008080] text-white rounded-lg border-0 hover:bg-[#006666] disabled:opacity-60 font-medium transition-colors shadow-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verificando...
                  </span>
                ) : (
                  'Entrar al panel'
                )}
              </button>
            </form>

            <button
              onClick={onBack}
              className="mt-6 w-full flex items-center justify-center gap-2 py-2 text-slate-600 hover:text-slate-900 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al sitio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
