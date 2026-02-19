import { ArrowLeft, Mail, MessageCircle } from 'lucide-react';

interface ContactPageProps {
  onBack: () => void;
}

export function ContactPage({ onBack }: ContactPageProps) {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          Volver
        </button>

        <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-2">Contacto</h1>
        <p className="text-stone-600 mb-10">
          ¿Tienes dudas? Estamos aquí para ayudarte. Escríbenos por WhatsApp o por email.
        </p>

        <div className="space-y-6">
          <a
            href="https://wa.me/34910202911"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:border-[#83b5b6]/50 transition-all group"
          >
            <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
              <MessageCircle className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900">WhatsApp</h2>
              <p className="text-stone-600">+34 910 202 911</p>
              <p className="text-sm text-stone-500 mt-1">Respuesta rápida, normalmente en minutos</p>
            </div>
          </a>

          <a
            href="mailto:info@ebaby-shop.com"
            className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:border-[#83b5b6]/50 transition-all group"
          >
            <div className="w-14 h-14 rounded-full bg-[#83b5b6]/10 flex items-center justify-center group-hover:bg-[#83b5b6]/20 transition-colors">
              <Mail className="h-7 w-7 text-[#83b5b6]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900">Email</h2>
              <p className="text-stone-600">info@ebaby-shop.com</p>
              <p className="text-sm text-stone-500 mt-1">Para consultas más detalladas</p>
            </div>
          </a>
        </div>

        <div className="mt-12 p-6 bg-[#83b5b6]/5 rounded-2xl border border-[#83b5b6]/20">
          <p className="text-sm text-stone-700">
            <strong>Horario de atención:</strong> Respondemos a WhatsApp y email en días laborables. 
            Para urgencias con tu pedido, te recomendamos contactar por WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
}
