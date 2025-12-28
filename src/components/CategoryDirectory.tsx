import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react';

interface CategoryDirectoryProps {
  onCategoryClick: () => void;
}

const categories = [
  {
    id: 1,
    name: 'Juguetes sensoriales',
    description: 'Desarrollo y diversión',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80',
    count: '147 productos',
    badge: 'Popular',
    gradient: 'from-[#8da399]/90 to-[#7a8f85]/90', // Sage
  },
  {
    id: 2,
    name: 'Textiles orgánicos',
    description: 'Suavidad premium',
    image: 'https://images.unsplash.com/photo-1519689373023-dd07c7988603?w=600&q=80',
    count: '89 productos',
    badge: 'Nuevo',
    gradient: 'from-[#c5a5a5]/90 to-[#b08e8e]/90', // Dusty Pink / Mauve
  },
  {
    id: 3,
    name: 'Ropa de bebé',
    description: 'Algodón 100% orgánico',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80',
    count: '234 productos',
    badge: 'Best Seller',
    gradient: 'from-[#9d8e80]/90 to-[#8d7f71]/90', // Taupe / Brown
  },
  {
    id: 4,
    name: 'Accesorios',
    description: 'Todo lo esencial',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80',
    count: '156 productos',
    gradient: 'from-[#9cadb3]/90 to-[#8a9ca3]/90', // Dusty Blue / Slate
  },
  {
    id: 5,
    name: 'Mobiliario',
    description: 'Diseño y seguridad',
    image: 'https://images.unsplash.com/photo-1519689373023-dd07c7988603?w=600&q=80',
    count: '67 productos',
    gradient: 'from-[#b0a396]/90 to-[#a09386]/90', // Warm Beige
  },
  {
    id: 6,
    name: 'Alimentación',
    description: 'Vajillas y biberones',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80',
    count: '98 productos',
    gradient: 'from-[#8da399]/80 to-[#9d8e80]/80', // Light Sage Mix
  },
];

export function CategoryDirectory({ onCategoryClick }: CategoryDirectoryProps) {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-secondary/20 to-primary/20 px-4 py-2 rounded-full mb-6 border border-secondary/30">
            <Sparkles className="h-4 w-4 text-secondary" />
            <span className="text-sm text-foreground">Explora por categoría</span>
          </div>
          <h2 className="text-4xl sm:text-5xl text-foreground mb-4 font-medium">
            Encuentra lo que necesitas
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Navega por nuestras colecciones cuidadosamente organizadas
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.map((category, index) => (
            <div
              key={category.id}
              onClick={onCategoryClick}
              className={`group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl shadow-primary/20 ${
                index === 0 ? 'sm:col-span-2 lg:col-span-1 lg:row-span-2' : 'aspect-[4/3]'
              }`}
              style={{ height: index === 0 ? '600px' : 'auto' }}
            >
              {/* Image */}
              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
 
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} transition-opacity duration-300 group-hover:opacity-90 opacity-80`} />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                {/* Badge */}
                {category.badge && (
                  <div className="inline-block w-fit px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs mb-4 border border-white/30">
                    {category.badge}
                  </div>
                )}

                {/* Title & Description */}
                <div className="mb-4 transition-transform duration-300 group-hover:translate-x-2">
                  <div className="text-sm text-white/90 mb-2 uppercase tracking-wider font-medium">
                    {category.description}
                  </div>
                  <h3 className={`text-white mb-2 font-medium ${index === 0 ? 'text-4xl sm:text-5xl' : 'text-2xl sm:text-3xl'}`}>
                    {category.name}
                  </h3>
                  <div className="text-sm text-white/80">
                    {category.count}
                  </div>
                </div>

                {/* CTA */}
                <button className="inline-flex items-center gap-2 text-white font-medium group-hover:gap-4 transition-all duration-300">
                  <span>Explorar</span>
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all group-hover:bg-white/30">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </button>
              </div>

              {/* Decorative element */}
              <div className="absolute top-6 right-6 w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-500 rotate-12 group-hover:rotate-0 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <button
            onClick={onCategoryClick}
            className="group relative px-8 py-4 bg-primary text-primary-foreground rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 hover:shadow-primary/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-2">
              <span className="font-medium">Ver todas las categorías</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
