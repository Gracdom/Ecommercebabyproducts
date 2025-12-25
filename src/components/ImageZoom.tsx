import { useState, useRef, MouseEvent, TouchEvent } from 'react';
import { ZoomIn } from 'lucide-react';

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageZoom({ src, alt, className = '' }: ImageZoomProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setPosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  // Mobile pinch-to-zoom handling
  const [scale, setScale] = useState(1);
  const [lastDistance, setLastDistance] = useState(0);

  const getDistance = (touches: TouchList) => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const distance = getDistance(e.touches);
      setLastDistance(distance);
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const distance = getDistance(e.touches);
      const newScale = scale * (distance / lastDistance);
      setScale(Math.min(Math.max(newScale, 1), 3));
      setLastDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    if (scale === 1) return;
    // Reset scale after a delay
    setTimeout(() => setScale(1), 300);
  };

  return (
    <div className="relative overflow-hidden group">
      <div
        ref={imgRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative ${className} cursor-zoom-in`}
        style={{
          transform: `scale(${scale})`,
          transition: scale === 1 ? 'transform 0.3s ease' : 'none',
        }}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          style={{
            transformOrigin: isZoomed ? `${position.x}% ${position.y}%` : 'center',
            transform: isZoomed ? 'scale(2)' : 'scale(1)',
            transition: 'transform 0.3s ease',
          }}
        />
        
        {/* Zoom indicator */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center gap-2">
          <ZoomIn className="h-4 w-4 text-stone-700" />
          <span className="text-xs text-stone-700">Hover to zoom</span>
        </div>

        {/* Mobile pinch indicator */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg md:hidden flex items-center gap-2">
          <ZoomIn className="h-4 w-4 text-stone-700" />
          <span className="text-xs text-stone-700">Pinch to zoom</span>
        </div>
      </div>

      {/* Magnifier lens - only on desktop */}
      {isZoomed && (
        <div
          className="hidden lg:block absolute pointer-events-none border-2 border-stone-300 rounded-full shadow-xl overflow-hidden"
          style={{
            width: '200px',
            height: '200px',
            left: `${position.x}%`,
            top: `${position.y}%`,
            transform: 'translate(-50%, -50%)',
            backgroundImage: `url(${src})`,
            backgroundSize: '400%',
            backgroundPosition: `${position.x}% ${position.y}%`,
          }}
        />
      )}
    </div>
  );
}
