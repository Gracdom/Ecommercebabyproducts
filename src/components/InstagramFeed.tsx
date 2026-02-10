import { useState } from 'react';
import { Instagram, Heart, MessageCircle, ExternalLink } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface InstagramPost {
  id: number;
  image: string;
  likes: number;
  comments: number;
  caption: string;
}

const instagramPosts: InstagramPost[] = [
  {
    id: 1,
    image: '/img/5.webp',
    likes: 1243,
    comments: 45,
    caption: '¡Dulces sueños con nuestras mantas de muselina! 💕',
  },
  {
    id: 2,
    image: '/img/6.webp',
    likes: 2156,
    comments: 78,
    caption: 'Nuevos diseños en algodón orgánico 🌿',
  },
  {
    id: 3,
    image: '/img/7.webp',
    likes: 1876,
    comments: 52,
    caption: 'Momentos especiales con tu bebé ✨',
  },
  {
    id: 4,
    image: '/img/8.webp',
    likes: 1532,
    comments: 61,
    caption: 'Juguetes que inspiran desarrollo 🧸',
  },
  {
    id: 5,
    image: '/img/9.webp',
    likes: 2034,
    comments: 89,
    caption: 'Colección primavera ya disponible! 🌸',
  },
  {
    id: 6,
    image: '/img/10.webp',
    likes: 1698,
    comments: 43,
    caption: 'Calidad que se siente 💙',
  },
];

export function InstagramFeed() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#dcbaba]/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#fcfbf9] to-[#e6dfd9] px-4 py-2 rounded-full mb-6">
            <Instagram className="h-4 w-4 text-accent" />
            <span className="text-sm text-stone-900">Síguenos en Instagram</span>
          </div>
          <h2 className="text-4xl sm:text-5xl mb-4 font-bold" style={{ color: '#83b5b6' }}>
            #eBabyMoments
          </h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto mb-8">
            Comparte tus momentos especiales y forma parte de nuestra comunidad
          </p>
          <a
            href="https://instagram.com/ebaby"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--chart-1)] text-white rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 group"
          >
            <Instagram className="h-5 w-5" />
            <span>Seguir @ebaby</span>
            <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* Instagram Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {instagramPosts.map((post) => (
            <div
              key={post.id}
              className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer"
              onMouseEnter={() => setHoveredId(post.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Image */}
              <ImageWithFallback
                src={post.image}
                alt={post.caption}
                className={`w-full h-full object-cover transition-all duration-500 ${
                  hoveredId === post.id ? 'scale-110' : 'scale-100'
                }`}
              />

              {/* Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
                  hoveredId === post.id ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {/* Stats */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white p-4">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5 fill-white" />
                      <span className="font-medium">{post.likes.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      <span className="font-medium">{post.comments}</span>
                    </div>
                  </div>
                  <p className="text-xs text-center line-clamp-2">{post.caption}</p>
                </div>
              </div>

              {/* Instagram icon corner */}
              <div className="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Instagram className="h-4 w-4 text-white" />
              </div>

              {/* Gradient border effect on hover */}
              <div className={`absolute -inset-0.5 bg-gradient-to-br from-primary via-[#7a8f85] to-accent rounded-2xl opacity-0 group-hover:opacity-75 blur transition-opacity duration-500 -z-10`} />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-stone-600 mb-4">
            Etiquétanos en tus fotos para aparecer aquí
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-stone-100 to-stone-50 rounded-xl border border-stone-200">
            <Instagram className="h-5 w-5 text-accent" />
            <span className="text-stone-900 font-medium">#eBabyMoments</span>
          </div>
        </div>
      </div>
    </section>
  );
}
