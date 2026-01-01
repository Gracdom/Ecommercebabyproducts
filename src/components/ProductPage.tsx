import { useEffect, useMemo, useState } from 'react';
import { Heart, ShoppingCart, Star, Truck, Shield, RefreshCw, Share2, ChevronRight, Check, Info, Package, Award, ChevronLeft } from 'lucide-react';
import { Product } from '../types';
import { useProductAnalytics } from '../hooks/useProductAnalytics';

interface ProductPageProps {
  product: Product | null;
  allProducts?: Product[];
  onAddToCart: (product: Product) => void;
  onBack: () => void;
  onToggleWishlist: (product: Product) => void;
  isInWishlist: (productId: number) => boolean;
}

export function ProductPage({ product, allProducts = [], onAddToCart, onBack, onToggleWishlist, isInWishlist }: ProductPageProps) {
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
  const displayedRating = product.rating ?? 5;
  const displayedReviews = product.reviews ?? 0;

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 3);
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

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-stone-200 sticky top-0 bg-white/95 backdrop-blur-md z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={onBack} className="text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              Volver
            </button>
            <span className="text-stone-400">/</span>
            <span className="text-stone-600 hover:text-stone-900 cursor-pointer">Juguetes</span>
            <span className="text-stone-400">/</span>
            <span className="text-stone-900 font-medium line-clamp-1">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left - Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-stone-50 rounded-3xl overflow-hidden group">
              <img
                src={images[selectedImage] || product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Discount Badge */}
              {product.originalPrice && (
                <div className="absolute top-6 right-6 w-16 h-16 bg-gradient-to-br from-destructive to-accent text-white rounded-full flex items-center justify-center shadow-xl transform rotate-12">
                  <div className="text-center leading-tight transform -rotate-12">
                    <div className="text-sm font-bold">-{Math.round((1 - product.price / product.originalPrice) * 100)}%</div>
                    <div className="text-[10px]">OFF</div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                <button
                  onClick={() => onToggleWishlist(product)}
                  className={`w-12 h-12 rounded-full backdrop-blur-md shadow-lg transition-all duration-300 flex items-center justify-center ${
                    isInWishlist(product.id)
                      ? 'bg-accent text-white'
                      : 'bg-white/90 text-stone-900 hover:bg-accent hover:text-white'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-white' : ''}`} />
                </button>
                <button className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full hover:bg-white shadow-lg transition-all duration-300 flex items-center justify-center">
                  <Share2 className="h-5 w-5 text-stone-900" />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-3">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                    selectedImage === index
                      ? 'border-stone-900 shadow-lg scale-105'
                      : 'border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <img src={image} alt={`Vista ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right - Product Info */}
          <div className="space-y-6">
            {/* Category & SKU */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-600 uppercase tracking-wider">{product.category}</span>
              {displayedSku && <span className="text-sm text-stone-500">SKU: {displayedSku}</span>}
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl text-stone-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(displayedRating)
                        ? 'fill-[#dccf9d] text-[#dccf9d]'
                        : 'text-stone-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-stone-900 font-medium">{displayedRating.toFixed(1)}</span>
              <span className="text-stone-600">({displayedReviews} reseñas)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4 py-4 border-y border-stone-200">
              <span className="text-5xl text-stone-900 font-medium">
                €{displayedPrice.toFixed(2)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-2xl text-stone-400 line-through">
                    €{product.originalPrice.toFixed(2)}
                  </span>
                  <span className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
                    Ahorras €{(product.originalPrice - product.price).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              {displayedStock > 0 ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-green-700 font-medium">
                    En stock
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-sm text-red-700 font-medium">Agotado</span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-lg text-stone-700 leading-relaxed">
              {product.description || 'Descripción no disponible.'}
            </p>

            {/* Variant selector */}
            {optionGroups.length > 0 && (
              <div className="space-y-4">
                {optionGroups.map(({ group, values }) => (
                  <div key={group} className="space-y-2">
                    <label className="text-sm font-medium text-stone-900">{group}</label>
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
                            className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                              selected
                                ? 'border-stone-900 bg-stone-900 text-white'
                                : available
                                  ? 'border-stone-200 bg-white text-stone-900 hover:border-stone-400'
                                  : 'border-stone-200 bg-stone-50 text-stone-400 cursor-not-allowed'
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

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-900">Cantidad</label>
              <div className="inline-flex items-center gap-4 bg-stone-100 rounded-xl p-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg bg-white hover:bg-stone-900 hover:text-white transition-all duration-300 flex items-center justify-center"
                >
                  -
                </button>
                <span className="w-12 text-center text-lg font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(Math.max(1, displayedStock), quantity + 1))}
                  className="w-10 h-10 rounded-lg bg-white hover:bg-stone-900 hover:text-white transition-all duration-300 flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="space-y-3 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={displayedStock <= 0}
                className="w-full bg-stone-900 hover:bg-primary text-white py-5 rounded-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] flex items-center justify-center gap-3 group"
              >
                <ShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110" />
                <span className="text-lg font-medium">Añadir al carrito - €{(displayedPrice * quantity).toFixed(2)}</span>
              </button>
              
              <button className="w-full border-2 border-stone-900 text-stone-900 py-4 rounded-xl hover:bg-stone-900 hover:text-white transition-all duration-300">
                Comprar ahora
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-xl">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Truck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-stone-900">Envío gratis</div>
                  <div className="text-xs text-stone-600">En pedidos +50€</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-stone-900">Pago seguro</div>
                  <div className="text-xs text-stone-600">100% protegido</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-xl">
                <div className="w-10 h-10 bg-[#e6dfd9] rounded-lg flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="text-sm font-medium text-stone-900">Devolución</div>
                  <div className="text-xs text-stone-600">30 días gratis</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-xl">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-stone-900">Garantía</div>
                  <div className="text-xs text-stone-600">Calidad premium</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-20">
          {/* Tab Navigation */}
          <div className="flex gap-8 border-b border-stone-200">
            {['description', 'features', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab as any)}
                className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
                  selectedTab === tab
                    ? 'text-stone-900'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {tab === 'description' ? 'Descripción' : tab === 'features' ? 'Características' : 'Reseñas'}
                {selectedTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="py-12">
            {selectedTab === 'description' && (
              <div className="prose prose-lg max-w-none">
                <p className="text-stone-700 leading-relaxed text-lg">
                  {product.description || 'Descripción no disponible.'}
                </p>
                <p className="text-stone-700 leading-relaxed">
                  Este producto se sincroniza desde BigBuy y puede incluir variaciones (talla, color, etc.). Selecciona la combinación que quieras antes de añadir al carrito.
                </p>
                <p className="text-stone-700 leading-relaxed">
                  Si algún atributo aparece como no disponible, significa que esa combinación no tiene stock.
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
                        <Star key={i} className="h-5 w-5 fill-[#dccf9d] text-[#dccf9d]" />
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
                            className="h-full bg-[#dccf9d] rounded-full"
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
                                  <Star key={i} className="h-4 w-4 fill-[#dccf9d] text-[#dccf9d]" />
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

        {/* Related Products */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl text-stone-900">También te puede interesar</h2>
            <button className="text-stone-600 hover:text-stone-900 flex items-center gap-2 transition-colors">
              <span>Ver todo</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((item) => (
              <div key={item.id} className="group bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="aspect-square bg-stone-50 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-base text-stone-900 mb-2 line-clamp-2">{item.name}</h3>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-[#dccf9d] text-[#dccf9d]" />
                    ))}
                    <span className="text-xs text-stone-600 ml-1">{item.rating ?? 5}</span>
                  </div>
                  <div className="text-2xl text-stone-900 font-medium">€{item.price.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
