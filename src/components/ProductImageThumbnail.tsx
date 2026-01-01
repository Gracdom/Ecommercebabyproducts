import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProductImageThumbnailProps {
  imageUrl: string | null | undefined;
  alt?: string;
  size?: number;
  className?: string;
}

export function ProductImageThumbnail({ 
  imageUrl, 
  alt = 'Product', 
  size = 60,
  className = '' 
}: ProductImageThumbnailProps) {
  if (!imageUrl) {
    return (
      <div 
        className={`bg-stone-100 rounded flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-xs text-stone-400">No img</span>
      </div>
    );
  }

  return (
    <div 
      className={`rounded overflow-hidden bg-stone-50 ${className}`}
      style={{ width: size, height: size }}
    >
      <ImageWithFallback
        src={imageUrl}
        alt={alt}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

