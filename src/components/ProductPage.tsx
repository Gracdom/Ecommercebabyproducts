import { useEffect, useMemo, useState } from 'react';
import { Heart, ShoppingCart, Star, Truck, Shield, Share2, ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { useProductAnalytics } from '../hooks/useProductAnalytics';

interface ProductPageProps {
  product: Product | null;
  allProducts?: Product[];
  onAddToCart: (product: Product) => void;
  onBack: () => void;
  onToggleWishlist: (product: Product) => void;
  isInWishlist: (productId: number) => boolean;
  onProductClick?: (product: Product) => void;
}

export function ProductPage({ product, allProducts = [], onAddToCart, onBack, onToggleWishlist, isInWishlist, onProductClick }: ProductPageProps) {
  const { trackView, trackTimeOnPage, trackClick, trackCartAdd } = useProductAnalytics();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState<'description' | 'features' | 'reviews'>('description');
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const images = useMemo(() => {
    if (!product) return [];
    const list = (product.images && product.images.length ? product.images : [product.image]).filter(Boolean);
    return list;
  }, [product]);

  const variants = product?.variants ?? [];
  const optionGroups = useMemo(() => {
    const groups = new Map<string, Set<string>>();
    for (const v of variants) {
      for (const a of v.attributes ?? []) {
        if (!groups.has(a.group_name)) groups.set(a.group_name, new Set());
        groups.get(a.group_name)!.add(a.attribute_name);
      }
    }
    return Array.from(groups.entries()).map(([group, values]) => ({
      group,
      values: Array.from(values).sort(),
    }));
  }, [variants]);

  const selectedVariant = useMemo(() => {
    if (!variants.length) return null;
    return variants.find(v => v.id === selectedVariantId) ?? null;
  }, [variants, selectedVariantId]);

  // Track product view
  useEffect(() => {
    if (product?.id) {
      trackView(product.id);
    }
    return () => {
      // Track time on page when component unmounts
      if (product?.id) {
        trackTimeOnPage(product.id);
      }
    };
  }, [product?.id, trackView, trackTimeOnPage]);

  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
    setSelectedTab('description');

    if (!variants.length) {
      setSelectedVariantId(null);
      setSelectedOptions({});
      return;
    }
    const defaultVariant = variants.find(v => v.stock > 0) ?? variants[0];
    setSelectedVariantId(defaultVariant?.id ?? null);
    const next: Record<string, string> = {};
    for (const a of defaultVariant?.attributes ?? []) {
      next[a.group_name] = a.attribute_name;
    }
    setSelectedOptions(next);
  }, [product?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const displayedPrice = selectedVariant?.price ?? product?.price ?? 0;
  const displayedSku = selectedVariant?.sku ?? product?.sku;
  const displayedStock = selectedVariant?.stock ?? (product?.inStock ? 1 : 0);
  const displayedRating = (product.rating != null && product.rating > 0) ? product.rating : 5;
  const displayedReviews = product.reviews ?? 0;

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [allProducts, product]);

  const isValueAvailable = (group: string, value: string) => {
    if (!variants.length) return true;
    const next = { ...selectedOptions, [group]: value };
    const matches = variants.filter(v =>
      optionGroups.every(({ group }) => {
        const wanted = next[group];
        if (!wanted) return true;
        const got = v.attributes?.find(a => a.group_name === group)?.attribute_name;
        return got === wanted;
      })
    );
    return matches.some(v => v.stock > 0);
  };

  const setOption = (group: string, value: string) => {
    const next = { ...selectedOptions, [group]: value };
    setSelectedOptions(next);
    if (!variants.length) return;
    const matches = variants.filter(v =>
      optionGroups.every(({ group }) => {
        const wanted = next[group];
        if (!wanted) return true;
        const got = v.attributes?.find(a => a.group_name === group)?.attribute_name;
        return got === wanted;
      })
    );
    const best = matches.find(v => v.stock > 0) ?? matches[0];
    if (best) setSelectedVariantId(best.id);
  };

  const handleAddToCart = () => {
    if (!product) return;
    trackCartAdd(product.id);
    onAddToCart({
      ...product,
      quantity,
      price: displayedPrice,
      variantId: selectedVariant?.id,
      variantSku: selectedVariant?.sku,
    });
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-stone-200 sticky top-0 bg-white/95 backdrop-blur-md z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button onClick={onBack} className="text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              Volver
            </button>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center text-stone-600">
          Selecciona un producto para ver el detalle.
        </div>
      </div>
    );
  }

  const thumbStart = Math.max(0, Math.min(selectedImage - 2, images.length - 4));
  const visibleThumbs = images.slice(thumbStart, thumbStart + 4);

  return (
    <div className="min-h-screen bg-stone-50/30">
      {/* Solo migas de pan con fondo infantil azul (sin título "Ficha de producto") */}
      <div 
        className="bg-[#83b5b6]/20 border-b border-[#83b5b6]/30"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(131, 181, 182, 0.15) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <nav className="flex items-center gap-2 text-sm text-stone-700">
            <button onClick={onBack} className="hover:text-[#83b5b6] transition-colors font-medium">Inicio</button>
            <span className="text-stone-400">/</span>
            <span className="text-stone-600">{product.category}</span>
            <span className="text-stone-400">/</span>
            <span className="text-stone-900 font-semibold line-clamp-1 max-w-[200px] sm:max-w-none">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-14">
          {/* Left - Galería: imagen principal + carrusel de miniaturas con flechas */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm">
              <img
                src={images[selectedImage] || product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500"
              />
              {product.originalPrice && (
                <div className="absolute top-4 right-4 w-14 h-14 bg-[#83b5b6] text-white rounded-full flex items-center justify-center shadow-lg text-center leading-tight text-sm font-bold">
                  -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                </div>
              )}
            </div>

            {/* Miniaturas con flechas (estilo JADUSONA) */}
            {images.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))}
                  disabled={selectedImage === 0}
                  className="w-10 h-10 rounded-full bg-[#83b5b6]/20 text-[#83b5b6] hover:bg-[#83b5b6]/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex-1 flex gap-2 overflow-hidden">
                  {visibleThumbs.map((image, i) => {
                    const idx = thumbStart + i;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`flex-shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all ${
                          selectedImage === idx ? 'border-[#83b5b6] ring-2 ring-[#83b5b6]/30' : 'border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <img src={image} alt="" className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedImage(Math.min(images.length - 1, selectedImage + 1))}
                  disabled={selectedImage >= images.length - 1}
                  className="w-10 h-10 rounded-full bg-[#83b5b6]/20 text-[#83b5b6] hover:bg-[#83b5b6]/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Right - Detalles (sin borde) */}
          <div className="bg-white rounded-2xl shadow-sm pt-10 sm:pt-12 pb-6 sm:pb-8 px-6 sm:px-8 space-y-8">
            {/* Nombre — padding superior para que no pegue al borde */}
            <div className="pt-4 sm:pt-5">
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-700 leading-tight">
                {product.name}
              </h2>
            </div>

            {/* Siempre 5 estrellas visibles — SIEMPRE AMARILLAS y MÁS GRANDES */}
            <div className="flex items-center gap-2">
              <span className="flex gap-1 text-[2.5rem] sm:text-[3rem] leading-none" style={{ color: '#FBBF24' }} aria-label="5 de 5 estrellas">
                {'★'.repeat(5)}
              </span>
              <span className="text-sm text-stone-500">({displayedReviews} reseñas)</span>
            </div>

            {/* Precio encima de la descripción */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#83b5b6]">€{displayedPrice.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-lg text-stone-400 line-through">€{product.originalPrice.toFixed(2)}</span>
              )}
            </div>

            {/* Descripción corta */}
            {(product.shortDescription || product.description) && (
              <p className="text-stone-600 text-sm leading-relaxed">
                {product.shortDescription || product.description || "Descripción no disponible."}
              </p>
            )}

            {/* Disponibilidad — check más grande y en verde */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-stone-600">Disponibilidad</span>
              {displayedStock > 0 ? (
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-green-100 text-green-600">
                  <Check className="h-5 w-5 stroke-[2.5]" />
                </span>
              ) : (
                <span className="text-sm text-red-600 font-medium">Agotado</span>
              )}
            </div>

            {/* 3 características principales debajo de disponibilidad — cuadros más pequeños, menos padding */}
            {(() => {
              const features = (product.highlightFeatures && product.highlightFeatures.length >= 3)
                ? product.highlightFeatures.slice(0, 3)
                : ['Calidad y seguridad', 'Pensado para bebés', 'Diseño cuidado'].slice(0, 3);
              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded-lg bg-[#83b5b6]/10 border border-[#83b5b6]/25"
                    >
                      <span className="w-6 h-6 rounded-full bg-[#83b5b6]/25 flex items-center justify-center text-[#83b5b6] font-semibold text-xs flex-shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-xs text-stone-700">{feature}</span>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Variantes (ej. Color, Talla) */}
            {optionGroups.length > 0 && (
              <div className="space-y-3 pt-0">
                {optionGroups.map(({ group, values }) => (
                  <div key={group} className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-stone-700 w-16">{group}:</span>
                    <div className="flex flex-wrap gap-2">
                      {values.map((value) => {
                        const selected = selectedOptions[group] === value;
                        const available = isValueAvailable(group, value);
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setOption(group, value)}
                            disabled={!available}
                            className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${
                              selected
                                ? 'border-[#83b5b6] bg-[#83b5b6] text-white'
                                : available
                                  ? 'border-stone-300 text-stone-700 hover:border-[#83b5b6] hover:bg-[#83b5b6]/10'
                                  : 'border-stone-200 text-stone-400 cursor-not-allowed'
                            }`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Cantidad + Añadir al carrito — full width on mobile, touch-friendly */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 pt-1">
              <div className="flex items-center gap-0 border border-stone-200 rounded-xl overflow-hidden w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex-1 sm:flex-none w-12 sm:w-11 h-12 sm:h-11 flex items-center justify-center text-stone-600 hover:bg-stone-100 active:bg-stone-200 transition-colors min-h-[48px]"
                >
                  −
                </button>
                <span className="w-14 sm:w-12 h-12 sm:h-11 flex items-center justify-center text-stone-900 font-medium border-x border-stone-200 bg-stone-50/50 flex-shrink-0">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(Math.max(1, displayedStock), quantity + 1))}
                  className="flex-1 sm:flex-none w-12 sm:w-11 h-12 sm:h-11 flex items-center justify-center text-stone-600 hover:bg-stone-100 active:bg-stone-200 transition-colors min-h-[48px]"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={displayedStock <= 0}
                className="flex-1 min-w-0 w-full sm:min-w-[220px] bg-[#83b5b6] hover:bg-[#73a5a6] text-white py-4 px-6 sm:px-8 rounded-xl text-base font-semibold flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
              >
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                <span className="truncate">Añadir al carrito — €{(displayedPrice * quantity).toFixed(2)}</span>
              </button>
              <div className="flex gap-2 justify-end sm:justify-start">
                <button
                  onClick={() => onToggleWishlist(product)}
                  className={`w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                    isInWishlist(product.id)
                      ? 'border-[#83b5b6] bg-[#83b5b6] text-white'
                      : 'border-stone-200 text-stone-600 hover:border-[#83b5b6] hover:text-[#83b5b6]'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </button>
                <button className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl border-2 border-stone-200 text-stone-600 hover:border-[#83b5b6] hover:text-[#83b5b6] flex items-center justify-center transition-colors flex-shrink-0" aria-label="Compartir">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Categoría y SKU (sin Compartir) */}
            <div className="pt-6 border-t border-stone-100 flex flex-wrap items-center gap-4 text-sm text-stone-600">
              {product.category && (
                <span>
                  <span className="font-medium text-stone-700">Categoría:</span> {product.category}
                </span>
              )}
              {displayedSku && (
                <span>
                  <span className="font-medium text-stone-700">SKU:</span> {displayedSku}
                </span>
              )}
            </div>

            {/* Trust badges compactos */}
            <div className="grid grid-cols-2 gap-3 pt-5">
              <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                <Truck className="h-5 w-5 text-[#83b5b6]" />
                <div className="text-xs">
                  <div className="font-medium text-stone-900">Envío gratis</div>
                  <div className="text-stone-500">Pedidos +50€</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                <Shield className="h-5 w-5 text-[#83b5b6]" />
                <div className="text-xs">
                  <div className="font-medium text-stone-900">Pago seguro</div>
                  <div className="text-stone-500">100% protegido</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pestañas (estilo JADUSONA: subrayado color primario) */}
        <div className="mt-16 sm:mt-20 bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="flex gap-6 sm:gap-10 border-b border-stone-200 px-6 sm:px-8">
            {[
              { id: 'description', label: 'Más información' },
              { id: 'features', label: 'Ficha técnica' },
              { id: 'reviews', label: 'Reseñas' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setSelectedTab(id as any)}
                className={`py-5 text-sm font-medium transition-colors relative ${
                  selectedTab === id ? 'text-[#83b5b6]' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {label}
                {selectedTab === id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#83b5b6]" />
                )}
              </button>
            ))}
          </div>

          <div className="px-6 sm:px-8 py-10">
            {selectedTab === 'description' && (
              <div className="prose prose-stone max-w-none">
                <div className="text-stone-700 leading-relaxed whitespace-pre-line">
                  {product.description || 'Descripción no disponible.'}
                </div>
                <p className="text-stone-600 text-sm mt-6">
                  Este producto puede incluir variaciones (talla, color, etc.). Selecciona la combinación deseada antes de añadir al carrito.
                </p>
              </div>
            )}

            {selectedTab === 'features' && (
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  displayedSku ? `SKU: ${displayedSku}` : null,
                  `Precio: €${displayedPrice.toFixed(2)}`,
                  displayedStock > 0 ? 'Stock disponible' : 'Sin stock',
                  ...Object.entries(selectedOptions).map(([k, v]) => `${k}: ${v}`),
                ].filter(Boolean).map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-stone-50 rounded-xl">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-stone-900">{feature}</span>
                  </div>
                ))}
              </div>
            )}

            {selectedTab === 'reviews' && (
              <div className="space-y-6">
                {/* Review Summary */}
                <div className="flex items-center gap-12 p-8 bg-stone-50 rounded-2xl">
                  <div className="text-center">
                  <div className="text-6xl font-bold text-stone-900 mb-2">{displayedRating.toFixed(1)}</div>
                    <div className="flex items-center gap-1 justify-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-[#eab308] text-[#eab308]" />
                      ))}
                    </div>
                    <div className="text-sm text-stone-600">{displayedReviews} reseñas</div>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <div key={stars} className="flex items-center gap-3">
                        <span className="text-sm text-stone-600 w-8">{stars}★</span>
                        <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#eab308] rounded-full"
                            style={{ width: `${stars === 5 ? 85 : stars === 4 ? 12 : 3}%` }}
                          />
                        </div>
                        <span className="text-sm text-stone-600 w-12">
                          {stars === 5 ? '85%' : stars === 4 ? '12%' : '3%'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Individual Reviews */}
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border-b border-stone-200 pb-6 last:border-0">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-medium">
                          M{i}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-medium text-stone-900">María García</div>
                              <div className="flex items-center gap-1 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className="h-4 w-4 fill-[#eab308] text-[#eab308]" />
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-stone-500">Hace 2 semanas</span>
                          </div>
                          <p className="text-stone-700 leading-relaxed">
                            Excelente producto, mi bebé lo adora. La calidad es excepcional y se nota que está hecho con materiales de primera.
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Productos relacionados (estilo JADUSONA) */}
        <div className="mt-16 sm:mt-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-8">Productos relacionados</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.length > 0 ? relatedProducts.map((item) => (
              <div
                key={item.id}
                onClick={() => onProductClick?.(item)}
                role={onProductClick ? 'button' : undefined}
                className="group bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-[#83b5b6]/30 transition-all duration-300 cursor-pointer"
              >
                <div className="aspect-square bg-stone-50 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-stone-900 mb-2 line-clamp-2 group-hover:text-[#83b5b6] transition-colors">{item.name}</h3>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-3.5 w-3 fill-[#eab308] text-[#eab308]" />
                    ))}
                    <span className="text-xs text-stone-500 ml-1">{item.rating ?? 5}</span>
                  </div>
                  <div className="text-lg font-bold text-[#83b5b6]">€{item.price.toFixed(2)}</div>
                </div>
              </div>
            )) : (
              <p className="text-stone-500 col-span-full py-8 text-center">No hay productos relacionados por ahora.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
