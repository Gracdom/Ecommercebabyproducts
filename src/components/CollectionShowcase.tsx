import { ArrowRight, Sparkles } from 'lucide-react';

interface Collection {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  gradient: string;
  itemCount: number;
}

const collections: Collection[] = [
  {
    id: 1,
    title: 'Colección Orgánica',
    subtitle: 'Certificado GOTS',
    description: 'Algodón 100% orgánico para la piel más delicada',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80',
    gradient: 'from-[#8da399]/90 to-[#7a8f85]/90',
    itemCount: 45,
  },
  {
    id: 2,
    title: 'Recién Nacido',
    subtitle: '0-3 meses',
    description: 'Todo lo esencial para los primeros días de tu bebé',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
    gradient: 'from-[#e6dfd9]/90 to-[#d6ccc2]/90',
    itemCount: 38,
  },
  {
    id: 3,
    title: 'Juguetes Premium',
    subtitle: 'Montessori',
    description: 'Desarrollo sensorial y motor con juguetes de madera',
    image: 'https://images.unsplash.com/photo-1519689373023-dd07c7988603?w=800&q=80',
    gradient: 'from-[#dcbaba]/90 to-[#c8a8a8]/90',
    itemCount: 52,
  },
];

export function CollectionShowcase() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-secondary/50 to-accent/50 px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-accent animate-pulse" />
            <span className="text-sm text-stone-900">Colecciones destacadas</span>
          </div>
          <h2 className="text-4xl sm:text-5xl text-stone-900 mb-4">
            Explora nuestras colecciones
          </h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            Cuidadosamente curadas para cada etapa del crecimiento
          </p>
        </div>

        {/* Large Featured Collection */}
        <div className="mb-8 group relative rounded-3xl overflow-hidden h-[500px] cursor-pointer">
          <img
            src={collections[0].image}
            alt={collections[0].title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${collections[0].gradient} transition-opacity duration-300 group-hover:opacity-80`} />
          
          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-12 text-white">
            <div className="max-w-2xl">
              <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm mb-4 border border-white/30">
                {collections[0].itemCount} productos
              </div>
              <div className="mb-3 text-sm sm:text-base text-white/90 uppercase tracking-wider">
                {collections[0].subtitle}
              </div>
              <h3 className="text-4xl sm:text-6xl mb-4 transition-transform duration-300 group-hover:translate-x-2">
                {collections[0].title}
              </h3>
              <p className="text-lg sm:text-xl text-white/90 mb-6 max-w-xl">
                {collections[0].description}
              </p>
              <button className="inline-flex items-center gap-3 bg-white text-stone-900 px-8 py-4 rounded-xl hover:bg-stone-100 transition-all duration-300 group-hover:shadow-2xl">
                <span className="font-medium">Explorar colección</span>
                <div className="w-6 h-6 bg-stone-900 text-white rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </button>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-8 right-8 w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 rotate-12 group-hover:rotate-0">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Two Column Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {collections.slice(1).map((collection) => (
            <div
              key={collection.id}
              className="group relative rounded-3xl overflow-hidden h-[400px] cursor-pointer"
            >
              <img
                src={collection.image}
                alt={collection.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${collection.gradient} transition-opacity duration-300 group-hover:opacity-80`} />
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                <div className="inline-block w-fit px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-sm mb-3 border border-white/30">
                  {collection.itemCount} productos
                </div>
                <div className="mb-2 text-sm text-white/90 uppercase tracking-wider">
                  {collection.subtitle}
                </div>
                <h3 className="text-3xl sm:text-4xl mb-3 transition-transform duration-300 group-hover:translate-x-2">
                  {collection.title}
                </h3>
                <p className="text-base text-white/90 mb-4">
                  {collection.description}
                </p>
                <button className="inline-flex items-center gap-2 text-white font-medium group-hover:gap-4 transition-all duration-300">
                  <span>Ver más</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              {/* Hover effect border */}
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${collection.gradient} rounded-3xl opacity-0 group-hover:opacity-50 blur transition-opacity duration-500 -z-10`} />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <button className="group relative px-8 py-4 bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-2">
              <span className="font-medium">Ver todas las colecciones</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
