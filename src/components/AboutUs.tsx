import { Heart, Award, Leaf, Shield, Users, TrendingUp } from 'lucide-react';

export function AboutUs() {
  return (
    <section className="py-10 lg:py-20 bg-gradient-to-br from-[#fcfbf9] via-[#83b5b6]/20 to-[#e6dfd9]/20 relative overflow-hidden">
      {/* Background decoration - móvil: más pequeños; escritorio: igual */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-8 left-4 w-48 h-48 lg:top-20 lg:left-10 lg:w-96 lg:h-96 bg-gradient-to-br from-[#83b5b6] to-[#7a8f85] rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-8 right-4 w-48 h-48 lg:bottom-20 lg:right-10 lg:w-96 lg:h-96 bg-gradient-to-br from-[#e6dfd9] to-[#d6ccc2] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header - móvil: compacto */}
        <div className="text-center mb-8 lg:mb-16">
          <div className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full mb-4 lg:mb-6 lg:gap-2 lg:px-4 lg:py-2 border border-stone-200">
            <Heart className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-accent fill-accent" />
            <span className="text-xs lg:text-sm text-stone-900">Nuestra historia</span>
          </div>
          <h2 className="text-2xl sm:text-3xl mb-4 lg:text-5xl lg:mb-6 font-bold" style={{ color: '#83b5b6' }}>
            Por qué elegir e-baby
          </h2>
          <p className="text-sm sm:text-base max-w-none leading-relaxed lg:text-xl lg:max-w-3xl lg:mx-auto text-stone-600">
            Somos una empresa familiar comprometida con la calidad, sostenibilidad y el bienestar de tu bebé. Cada producto es seleccionado con amor y cuidado.
          </p>
        </div>

        {/* Main Content Grid - móvil: gap y márgenes reducidos */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10 lg:gap-12 lg:items-center lg:mb-20">
          {/* Image - móvil: tarjetas flotantes más pequeñas */}
          <div className="relative order-2 lg:order-1">
            <div className="aspect-[4/3] rounded-xl lg:rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="/img/5.webp"
                alt="Sobre nosotros"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating stats - móvil: más compactos; montados sobre la imagen */}
            <div className="absolute bottom-4 right-2 bg-white rounded-xl p-3 shadow-xl border border-stone-200 lg:bottom-8 lg:right-4 lg:rounded-2xl lg:p-6">
              <div className="flex items-center gap-2 lg:gap-4">
                <div className="w-10 h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg lg:rounded-xl flex items-center justify-center">
                  <Award className="h-5 w-5 lg:h-7 lg:w-7 text-white" />
                </div>
                <div>
                  <div className="text-lg lg:text-2xl text-stone-900 font-bold">GOTS</div>
                  <div className="text-xs lg:text-sm text-stone-600">Certificado</div>
                </div>
              </div>
            </div>
            <div className="absolute top-4 left-2 bg-white rounded-xl p-2.5 shadow-xl border border-stone-200 lg:top-8 lg:left-4 lg:rounded-2xl lg:p-4">
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-primary to-[#7a8f85] rounded-lg lg:rounded-xl flex items-center justify-center">
                  <Users className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <div>
                  <div className="text-base lg:text-xl text-stone-900 font-bold">15K+</div>
                  <div className="text-[10px] lg:text-xs text-stone-600">Familias</div>
                </div>
              </div>
            </div>
          </div>

          {/* Text Content - móvil: tipografía y espaciado reducidos */}
          <div className="space-y-4 order-1 lg:order-2 lg:space-y-6">
            <h3 className="text-xl sm:text-2xl lg:text-3xl text-stone-900">
              Comprometidos con el futuro de tu bebé
            </h3>
            <p className="text-sm sm:text-base lg:text-lg text-stone-700 leading-relaxed">
              Desde 2015, nos dedicamos a ofrecer productos premium de algodón orgánico certificado. Creemos que los bebés merecen lo mejor, por eso seleccionamos cuidadosamente cada artículo en nuestro catálogo.
            </p>
            <p className="text-sm sm:text-base lg:text-lg text-stone-700 leading-relaxed">
              Trabajamos directamente con fabricantes que comparten nuestros valores de sostenibilidad, seguridad y calidad excepcional. Cada producto pasa por rigurosos controles antes de llegar a tu hogar.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 sm:gap-4 sm:grid-cols-2 lg:gap-4 lg:pt-4">
              <div className="flex items-start gap-2 lg:gap-3">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Leaf className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-stone-900 mb-0.5 text-xs sm:text-sm lg:text-base lg:mb-1">100% Orgánico</div>
                  <div className="text-[10px] sm:text-xs lg:text-sm text-stone-600">Certificado GOTS</div>
                </div>
              </div>

              <div className="flex items-start gap-2 lg:gap-3">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-stone-900 mb-0.5 text-xs sm:text-sm lg:text-base lg:mb-1">100% Seguro</div>
                  <div className="text-[10px] sm:text-xs lg:text-sm text-stone-600">Testado y certificado</div>
                </div>
              </div>

              <div className="flex items-start gap-2 lg:gap-3">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[#e6dfd9] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart className="h-4 w-4 lg:h-5 lg:w-5 text-accent" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-stone-900 mb-0.5 text-xs sm:text-sm lg:text-base lg:mb-1">Con amor</div>
                  <div className="text-[10px] sm:text-xs lg:text-sm text-stone-600">Empresa familiar</div>
                </div>
              </div>

              <div className="flex items-start gap-2 lg:gap-3">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-stone-900 mb-0.5 text-xs sm:text-sm lg:text-base lg:mb-1">En crecimiento</div>
                  <div className="text-[10px] sm:text-xs lg:text-sm text-stone-600">Innovación constante</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats - móvil: grid 2x2, padding y texto más pequeños */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-8">
          <div className="text-center p-4 rounded-xl border border-stone-200 bg-white/80 backdrop-blur-sm lg:p-8 lg:rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="text-2xl sm:text-3xl lg:text-5xl text-stone-900 font-bold mb-1 lg:mb-2">15K+</div>
            <div className="text-xs sm:text-sm lg:text-base text-stone-600 mb-0.5 lg:mb-2">Clientes satisfechos</div>
            <div className="text-[10px] lg:text-xs text-stone-500">Y contando...</div>
          </div>

          <div className="text-center p-4 rounded-xl border border-stone-200 bg-white/80 backdrop-blur-sm lg:p-8 lg:rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="text-2xl sm:text-3xl lg:text-5xl text-stone-900 font-bold mb-1 lg:mb-2">98%</div>
            <div className="text-xs sm:text-sm lg:text-base text-stone-600 mb-0.5 lg:mb-2">Tasa de satisfacción</div>
            <div className="text-[10px] lg:text-xs text-stone-500">Reseñas verificadas</div>
          </div>

          <div className="text-center p-4 rounded-xl border border-stone-200 bg-white/80 backdrop-blur-sm lg:p-8 lg:rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="text-2xl sm:text-3xl lg:text-5xl text-stone-900 font-bold mb-1 lg:mb-2">500+</div>
            <div className="text-xs sm:text-sm lg:text-base text-stone-600 mb-0.5 lg:mb-2">Productos premium</div>
            <div className="text-[10px] lg:text-xs text-stone-500">Cuidadosamente seleccionados</div>
          </div>

          <div className="text-center p-4 rounded-xl border border-stone-200 bg-white/80 backdrop-blur-sm lg:p-8 lg:rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="text-2xl sm:text-3xl lg:text-5xl text-stone-900 font-bold mb-1 lg:mb-2">24h</div>
            <div className="text-xs sm:text-sm lg:text-base text-stone-600 mb-0.5 lg:mb-2">Envío express</div>
            <div className="text-[10px] lg:text-xs text-stone-500">A toda España</div>
          </div>
        </div>

        {/* CTA - móvil: botón más compacto */}
        <div className="text-center mt-8 lg:mt-16">
          <button 
            className="group relative px-5 py-3 rounded-lg lg:px-8 lg:py-4 lg:rounded-xl bg-[#FFC1CC] text-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 hover:bg-[#83b5b6]"
            style={{ backgroundColor: '#FFC1CC' }}
          >
            <div className="relative flex items-center gap-1.5 lg:gap-2">
              <span className="font-medium text-sm lg:text-base">Conoce más sobre nosotros</span>
              <Heart className="h-4 w-4 lg:h-5 lg:w-5" />
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
