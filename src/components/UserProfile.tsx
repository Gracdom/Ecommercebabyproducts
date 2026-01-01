import { useState } from 'react';
import { X, User, LogOut, Settings, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner@2.0.3';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminClick?: () => void;
}

export function UserProfile({ isOpen, onClose, onAdminClick }: UserProfileProps) {
  const { user, signOut, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      toast.success('Sesión cerrada');
      onClose();
    } catch (error: any) {
      toast.error('Error al cerrar sesión', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-stone-600" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 bg-stone-900 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900">Mi cuenta</h2>
              <p className="text-sm text-stone-600">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {isAdmin && onAdminClick && (
            <button
              onClick={() => {
                onClose();
                onAdminClick();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-lg transition-colors"
            >
              <Shield className="h-5 w-5" />
              <span className="font-medium">Panel de Administración</span>
            </button>
          )}

          <button
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-100 text-stone-700 rounded-lg transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span>Configuración</span>
          </button>

          <button
            onClick={handleSignOut}
            disabled={loading}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 rounded-lg transition-colors disabled:opacity-60"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">{loading ? 'Cerrando sesión...' : 'Cerrar sesión'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

