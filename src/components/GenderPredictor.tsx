import { useState } from 'react';
import { Baby, ChevronRight, ChevronLeft, Mail, User, Phone, Calendar, Upload, Image, Sparkles } from 'lucide-react';
import { submitGenderPredictor } from '@/utils/bigbuy/edge';

const PREGNANCY_WEEKS = Array.from({ length: 15 }, (_, i) => i + 6); // 6 a 20

const ULTRASOUND_TYPES = [
  { value: '2d', label: 'Ecografía 2D' },
  { value: '3d', label: 'Ecografía 3D' },
  { value: '4d', label: 'Ecografía 4D' },
  { value: 'transvaginal', label: 'Ecografía transvaginal' },
  { value: 'abdominal', label: 'Ecografía abdominal' },
  { value: 'otra', label: 'Otra' },
];

interface GenderPredictorProps {
  onComplete: (gender: 'boy' | 'girl') => void;
  onBack: () => void;
}

export function GenderPredictor({ onBack }: GenderPredictorProps) {
  const [step, setStep] = useState<'landing' | 1 | 2 | 'submitting' | 'success'>(1);
  const [pregnancyWeeks, setPregnancyWeeks] = useState<number>(12);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ultrasoundFile, setUltrasoundFile] = useState<File | null>(null);
  const [ultrasoundType, setUltrasoundType] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateStep1 = (): boolean => {
    const err: Record<string, string> = {};
    if (!name.trim()) err.name = 'El nombre es obligatorio';
    if (!email.trim()) err.email = 'El correo es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err.email = 'Correo no válido';
    if (!phone.trim()) err.phone = 'El teléfono es obligatorio';
    setValidationErrors(err);
    return Object.keys(err).length === 0;
  };

  const validateStep2 = (): boolean => {
    const err: Record<string, string> = {};
    if (!ultrasoundFile) err.ultrasoundFile = 'Debes subir la ecografía';
    if (!ultrasoundType) err.ultrasoundType = 'Selecciona el tipo de ecografía';
    setValidationErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
  };

  const handleSubmit = async () => {
    if (step !== 2 || !validateStep2() || !ultrasoundFile) return;
    setSubmitError('');
    setStep('submitting');

    try {
      const result = await submitGenderPredictor({
        pregnancy_weeks: pregnancyWeeks,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        ultrasound_type: ultrasoundType,
        file: ultrasoundFile,
      });
      if (result.error) throw new Error(result.error);
      setStep('success');
    } catch (e: any) {
      setSubmitError(e?.message ?? 'Error al enviar. Inténtalo de nuevo.');
      setStep(2);
    }
  };

  const cardClass =
    'bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl border-2 border-white/60 shadow-xl shadow-stone-200/50';

  const inputClass =
    'w-full px-4 py-3.5 rounded-xl border-2 bg-white/80 border-stone-200 focus:border-[#83b5b6] focus:ring-2 focus:ring-[#83b5b6]/20 outline-none transition-all text-stone-900 placeholder-stone-400';

  const labelClass = 'block text-sm font-semibold text-stone-700 mb-1.5';

  // Success: mensaje final
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fcfbf9] via-[#e6dfd9]/30 to-[#83b5b6]/10 relative overflow-hidden flex items-center justify-center px-4 py-12">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#FFC1CC] rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-[#83b5b6] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className={`${cardClass} p-8 sm:p-12 max-w-lg w-full text-center relative z-10`}>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#83b5b6] to-[#FFC1CC] rounded-2xl mb-6">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-3">
            Analizando, pronto recibirás el resultado...
          </h2>
          <p className="text-stone-600 mb-8">
            Hemos recibido tu ecografía y datos. Nuestro equipo revisará la información y te enviaremos el resultado a <strong>{email}</strong>.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#83b5b6] text-white font-semibold hover:bg-[#6a9a9b] transition-colors"
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
            Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  // Submitting
  if (step === 'submitting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fcfbf9] via-[#e6dfd9]/30 to-[#83b5b6]/10 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-2xl shadow-xl mb-6 animate-pulse">
            <Baby className="h-12 w-12 text-[#83b5b6]" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Enviando...</h2>
          <p className="text-stone-600">Analizando, pronto recibirás el resultado.</p>
        </div>
      </div>
    );
  }

  // Form steps
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fcfbf9] via-[#e6dfd9]/30 to-[#83b5b6]/10 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#FFC1CC] rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-[#83b5b6] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-[#e6dfd9] rounded-full blur-3xl opacity-60" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/90 text-stone-700 font-medium shadow-md border border-stone-200/80 hover:bg-white transition-colors"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          Volver a la tienda
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#83b5b6] to-[#FFC1CC] rounded-2xl mb-4 shadow-lg">
            <Baby className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">Predicción de género</h1>
          <p className="text-stone-600 mt-1">Paso {step} de 2</p>
          <div className="mt-3 h-1.5 bg-white/60 rounded-full overflow-hidden max-w-xs mx-auto">
            <div
              className="h-full bg-gradient-to-r from-[#83b5b6] to-[#FFC1CC] rounded-full transition-all duration-300"
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>
        </div>

        <div className={cardClass + ' p-6 sm:p-8'}>
          {step === 1 && (
            <>
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>
                    <Calendar className="inline h-4 w-4 mr-1.5 text-stone-500" />
                    Semanas de embarazo *
                  </label>
                  <select
                    value={pregnancyWeeks}
                    onChange={(e) => setPregnancyWeeks(Number(e.target.value))}
                    className={inputClass}
                    required
                  >
                    {PREGNANCY_WEEKS.map((w) => (
                      <option key={w} value={w}>Semana {w}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>
                    <User className="inline h-4 w-4 mr-1.5 text-stone-500" />
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    className={inputClass + (validationErrors.name ? ' border-red-400' : '')}
                    required
                  />
                  {validationErrors.name && <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>}
                </div>
                <div>
                  <label className={labelClass}>
                    <Mail className="inline h-4 w-4 mr-1.5 text-stone-500" />
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className={inputClass + (validationErrors.email ? ' border-red-400' : '')}
                    required
                  />
                  {validationErrors.email && <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>}
                </div>
                <div>
                  <label className={labelClass}>
                    <Phone className="inline h-4 w-4 mr-1.5 text-stone-500" />
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+34 600 000 000"
                    className={inputClass + (validationErrors.phone ? ' border-red-400' : '')}
                    required
                  />
                  {validationErrors.phone && <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>}
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#83b5b6] to-[#6a9a9b] text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
                >
                  Siguiente
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>
                    <Image className="inline h-4 w-4 mr-1.5 text-stone-500" />
                    Tipo de ecografía *
                  </label>
                  <select
                    value={ultrasoundType}
                    onChange={(e) => setUltrasoundType(e.target.value)}
                    className={inputClass + (validationErrors.ultrasoundType ? ' border-red-400' : '')}
                    required
                  >
                    <option value="">Selecciona el tipo</option>
                    {ULTRASOUND_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  {validationErrors.ultrasoundType && <p className="text-red-500 text-sm mt-1">{validationErrors.ultrasoundType}</p>}
                </div>
                <div>
                  <label className={labelClass}>
                    <Upload className="inline h-4 w-4 mr-1.5 text-stone-500" />
                    Subir ecografía *
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(e) => setUltrasoundFile(e.target.files?.[0] ?? null)}
                      className="block w-full text-sm text-stone-600 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:bg-[#83b5b6]/20 file:text-[#83b5b6] file:font-semibold hover:file:bg-[#83b5b6]/30 file:transition-colors"
                    />
                    {ultrasoundFile && <p className="text-sm text-stone-500 mt-2">Archivo: {ultrasoundFile.name}</p>}
                  </div>
                  {validationErrors.ultrasoundFile && <p className="text-red-500 text-sm mt-1">{validationErrors.ultrasoundFile}</p>}
                </div>
              </div>
              {submitError && <p className="text-red-500 text-sm mt-2">{submitError}</p>}
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-stone-200 text-stone-700 font-medium hover:bg-stone-50 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#83b5b6] to-[#FFC1CC] text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
                >
                  <Sparkles className="h-5 w-5" />
                  Enviar y recibir resultado
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-xs text-stone-500 text-center mt-6">
          * Todos los campos son obligatorios. Tus datos se guardan de forma segura.
        </p>
      </div>
    </div>
  );
}
