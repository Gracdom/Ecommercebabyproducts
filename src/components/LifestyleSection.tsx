export function LifestyleSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-[#e6dfd9]/20 via-[#83b5b6]/10 to-[#fcfbf9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* First row - 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Large image left */}
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-stone-100 group cursor-pointer">
            <div className="aspect-[4/5]">
              <img
                src="/img/5.webp"
                alt="Colección tejidos"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 lg:bottom-8 lg:left-8 text-white">
              <p className="text-xs sm:text-sm mb-1 sm:mb-2 text-white/90">Nueva Colección</p>
              <h3 className="text-xl sm:text-2xl lg:text-3xl mb-2 sm:mb-3">Tejidos a Mano</h3>
              <button className="bg-white text-stone-900 px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg hover:bg-stone-100 active:bg-stone-200 transition-colors text-sm sm:text-base min-h-[44px]">
                Descubrir
              </button>
            </div>
          </div>

          {/* Right side content */}
          <div className="space-y-4 sm:space-y-6">
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-stone-100 group cursor-pointer">
              <div className="aspect-[16/9]">
                <img
                  src="/img/6.webp"
                  alt="Habitación bebé"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-white">
                <p className="text-xs sm:text-sm mb-1 text-white/90">Habitación</p>
                <h4 className="text-base sm:text-xl mb-2">Espacios Acogedores</h4>
                <button className="text-xs sm:text-sm text-white/90 hover:text-white underline py-2 min-h-[44px] flex items-center">
                  Ver más →
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-stone-100 group cursor-pointer">
              <div className="aspect-[16/9] min-h-0">
                <img
                  src="/img/7.webp"
                  alt="Decoración minimalista"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-white">
                <p className="text-xs sm:text-sm mb-1 text-white/90">Estilo</p>
                <h4 className="text-base sm:text-xl mb-2">Diseño Minimalista</h4>
                <button className="text-xs sm:text-sm text-white/90 hover:text-white underline py-2 min-h-[44px] flex items-center">
                  Ver más →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Second row - 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-stone-100 group cursor-pointer">
            <div className="aspect-square">
              <img
                src="/img/8.webp"
                alt="Madera natural"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-white">
              <p className="text-xs sm:text-sm mb-1 text-white/90">Materiales</p>
              <h4 className="text-base sm:text-lg">Madera Natural</h4>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-stone-100 group cursor-pointer">
            <div className="aspect-square">
              <img
                src="/img/9.webp"
                alt="Algodón orgánico"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-white">
              <p className="text-xs sm:text-sm mb-1 text-white/90">Textil</p>
              <h4 className="text-base sm:text-lg">Algodón Orgánico</h4>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-stone-100 group cursor-pointer">
            <div className="aspect-square">
              <img
                src="/img/10.webp"
                alt="Cuidado natural"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-white">
              <p className="text-xs sm:text-sm mb-1 text-white/90">Lifestyle</p>
              <h4 className="text-base sm:text-lg">Cuidado Natural</h4>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
