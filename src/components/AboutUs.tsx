import { Heart, Award, Leaf, Shield, Users, TrendingUp } from 'lucide-react';

export function AboutUs() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#fcfbf9] via-[#83b5b6]/20 to-[#e6dfd9]/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-[#83b5b6] to-[#7a8f85] rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-[#e6dfd9] to-[#d6ccc2] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-stone-200">
            <Heart className="h-4 w-4 text-accent fill-accent" />
            <span className="text-sm text-stone-900">Nuestra historia</span>
          </div>
          <h2 className="text-4xl sm:text-5xl text-stone-900 mb-6">
            Por qué elegir e-baby
          </h2>
          <p className="text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed">
            Somos una empresa familiar comprometida con la calidad, sostenibilidad y el bienestar de tu bebé. Cada producto es seleccionado con amor y cuidado.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Image */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80"
                alt="Sobre nosotros"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating stats */}
            <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-6 shadow-xl border border-stone-200">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Award className="h-7 w-7 text-white" />
                </div>
                <div>
                  <div className="text-2xl text-stone-900 font-bold">GOTS</div>
                  <div className="text-sm text-stone-600">Certificado</div>
                </div>
              </div>
            </div>
            <div className="absolute -top-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-stone-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-[#7a8f85] rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-xl text-stone-900 font-bold">15K+</div>
                  <div className="text-xs text-stone-600">Familias</div>
                </div>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-6">
            <h3 className="text-3xl text-stone-900">
              Comprometidos con el futuro de tu bebé
            </h3>
            <p className="text-lg text-stone-700 leading-relaxed">
              Desde 2015, nos dedicamos a ofrecer productos premium de algodón orgánico certificado. Creemos que los bebés merecen lo mejor, por eso seleccionamos cuidadosamente cada artículo en nuestro catálogo.
            </p>
            <p className="text-lg text-stone-700 leading-relaxed">
              Trabajamos directamente con fabricantes que comparten nuestros valores de sostenibilidad, seguridad y calidad excepcional. Cada producto pasa por rigurosos controles antes de llegar a tu hogar.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Leaf className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-stone-900 mb-1">100% Orgánico</div>
                  <div className="text-sm text-stone-600">Certificado GOTS</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-stone-900 mb-1">100% Seguro</div>
                  <div className="text-sm text-stone-600">Testado y certificado</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#e6dfd9] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="font-medium text-stone-900 mb-1">Con amor</div>
                  <div className="text-sm text-stone-600">Empresa familiar</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <div className="font-medium text-stone-900 mb-1">En crecimiento</div>
                  <div className="text-sm text-stone-600">Innovación constante</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-stone-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="text-5xl text-stone-900 font-bold mb-2">15K+</div>
            <div className="text-stone-600 mb-2">Clientes satisfechos</div>
            <div className="text-xs text-stone-500">Y contando...</div>
          </div>

          <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-stone-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="text-5xl text-stone-900 font-bold mb-2">98%</div>
            <div className="text-stone-600 mb-2">Tasa de satisfacción</div>
            <div className="text-xs text-stone-500">Reseñas verificadas</div>
          </div>

          <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-stone-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="text-5xl text-stone-900 font-bold mb-2">500+</div>
            <div className="text-stone-600 mb-2">Productos premium</div>
            <div className="text-xs text-stone-500">Cuidadosamente seleccionados</div>
          </div>

          <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-stone-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="text-5xl text-stone-900 font-bold mb-2">24h</div>
            <div className="text-stone-600 mb-2">Envío express</div>
            <div className="text-xs text-stone-500">A toda España</div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <button className="group relative px-8 py-4 bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-[#7a8f85] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-2">
              <span className="font-medium">Conoce más sobre nosotros</span>
              <Heart className="h-5 w-5" />
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
