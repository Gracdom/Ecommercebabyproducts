export function LifestyleSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#e6dfd9]/20 via-[#83b5b6]/10 to-[#fcfbf9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* First row - 2 columns */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Large image left */}
          <div className="relative overflow-hidden rounded-2xl bg-stone-100 group cursor-pointer">
            <div className="aspect-[4/5]">
              <img
                src="https://images.unsplash.com/photo-1761206887052-9abec0c38f03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrbml0dGVkJTIwYmFieSUyMGl0ZW1zfGVufDF8fHx8MTc2NjY1NTM0Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Colección tejidos"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 text-white">
              <p className="text-sm mb-2 text-white/90">Nueva Colección</p>
              <h3 className="text-3xl mb-3">Tejidos a Mano</h3>
              <button className="bg-white text-stone-900 px-6 py-2.5 rounded-lg hover:bg-stone-100 transition-colors">
                Descubrir
              </button>
            </div>
          </div>

          {/* Right side content */}
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl bg-stone-100 group cursor-pointer">
              <div className="aspect-[16/9]">
                <img
                  src="https://images.unsplash.com/photo-1753370241583-82d8c84f0c6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWJ5JTIwbnVyc2VyeSUyMHBhc3RlbHxlbnwxfHx8fDE3NjY2NTUzNDF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Habitación bebé"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-sm mb-1 text-white/90">Habitación</p>
                <h4 className="text-xl mb-2">Espacios Acogedores</h4>
                <button className="text-sm text-white/90 hover:text-white underline">
                  Ver más →
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-stone-100 group cursor-pointer">
              <div className="aspect-[16/9]">
                <img
                  src="https://images.unsplash.com/photo-1639751907353-3629fc00d2b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWJ5JTIwcm9vbSUyMG1pbmltYWxpc3R8ZW58MXx8fHwxNzY2NjU1MzQxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Decoración minimalista"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-sm mb-1 text-white/90">Estilo</p>
                <h4 className="text-xl mb-2">Diseño Minimalista</h4>
                <button className="text-sm text-white/90 hover:text-white underline">
                  Ver más →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Second row - 3 columns */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="relative overflow-hidden rounded-2xl bg-stone-100 group cursor-pointer">
            <div className="aspect-square">
              <img
                src="https://images.unsplash.com/photo-1655150795492-682679296e97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWJ5JTIwY3JpYiUyMG5hdHVyYWwlMjB3b29kfGVufDF8fHx8MTc2NjY1NTM0Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Madera natural"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <p className="text-sm mb-1 text-white/90">Materiales</p>
              <h4 className="text-lg">Madera Natural</h4>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-stone-100 group cursor-pointer">
            <div className="aspect-square">
              <img
                src="https://images.unsplash.com/photo-1761891927371-c9d094127f97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWJ5JTIwYWNjZXNzb3JpZXMlMjBiZWlnZXxlbnwxfHx8fDE3NjY2NTUzNDJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Algodón orgánico"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <p className="text-sm mb-1 text-white/90">Textil</p>
              <h4 className="text-lg">Algodón Orgánico</h4>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-stone-100 group cursor-pointer">
            <div className="aspect-square">
              <img
                src="https://images.unsplash.com/photo-1735583099365-cb68e4caea3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWJ5JTIwbGlmZXN0eWxlJTIwbmF0dXJhbHxlbnwxfHx8fDE3NjY2NTUzNDF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Cuidado natural"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <p className="text-sm mb-1 text-white/90">Lifestyle</p>
              <h4 className="text-lg">Cuidado Natural</h4>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
