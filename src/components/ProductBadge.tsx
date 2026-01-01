import { Star, Zap, TrendingUp, Sparkles } from 'lucide-react';

interface ProductBadgeProps {
  mlScore?: number;
  className?: string;
}

const ML_SCORE_THRESHOLD_DESTACADO = 70;
const ML_SCORE_THRESHOLD_POPULAR = 50;

export function ProductBadge({ mlScore, className = '' }: ProductBadgeProps) {
  if (!mlScore || mlScore < ML_SCORE_THRESHOLD_POPULAR) {
    return null;
  }

  const isDestacado = mlScore >= ML_SCORE_THRESHOLD_DESTACADO;
  const isPopular = mlScore >= ML_SCORE_THRESHOLD_POPULAR && mlScore < ML_SCORE_THRESHOLD_DESTACADO;

  const badgeConfig = isDestacado
    ? {
        text: 'Destacado',
        icon: <Zap className="h-3 w-3" />,
        gradient: 'from-yellow-400 to-yellow-600',
        bgGradient: 'from-yellow-500/20 to-yellow-600/20',
      }
    : isPopular
      ? {
          text: 'Popular',
          icon: <TrendingUp className="h-3 w-3" />,
          gradient: 'from-blue-400 to-blue-600',
          bgGradient: 'from-blue-500/20 to-blue-600/20',
        }
      : {
          text: 'Recomendado',
          icon: <Star className="h-3 w-3" />,
          gradient: 'from-stone-400 to-stone-600',
          bgGradient: 'from-stone-500/20 to-stone-600/20',
        };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r ${badgeConfig.gradient} text-white text-xs font-medium rounded-full shadow-lg ${className}`}
    >
      {badgeConfig.icon}
      <span>{badgeConfig.text}</span>
    </div>
  );
}

