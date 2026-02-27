import { useState } from 'react';
import { Baby, ChevronRight, ChevronLeft, Mail, User, Phone, Calendar, Upload, Image, Sparkles, CheckCircle2, FileImage, ShieldCheck } from 'lucide-react';
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
    'bg-white/95 backdrop-blur-xl rounded-3xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.12)] relative overflow-hidden transition-all';

  const inputClass =
    'w-full px-4 py-3.5 rounded-xl border-2 bg-stone-50 border-stone-200 focus:border-[#83b5b6] focus:bg-white focus:ring-4 focus:ring-[#83b5b6]/15 outline-none transition-all text-stone-800 placeholder-stone-400 font-medium shadow-sm';

  const labelClass = 'flex items-center text-sm font-semibold text-stone-700 mb-2 tracking-wide';

  const renderBackground = () => (
    <>
      <div 
        className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay z-0" 
        style={{ 
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)
          `, 
          backgroundSize: '40px 40px' 
        }} 
      />
      <div className="absolute inset-0 opacity-40 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#83b5b6] rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute top-1/2 -right-20 w-[400px] h-[400px] bg-[#FFC1CC] rounded-full blur-[120px] mix-blend-screen opacity-60" />
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-[#cbe3e4] rounded-full blur-[150px] mix-blend-screen" />
      </div>
    </>
  );

  // Success: mensaje final
  if (step === 'success') {
    return (
      <div 
        className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-12"
        style={{ background: 'linear-gradient(to bottom right, #1a3839, #3a6869, #83b5b6)' }}
      >
        {renderBackground()}
        <div className={`${cardClass} p-8 sm:p-12 max-w-lg w-full text-center relative z-10 animate-in fade-in zoom-in duration-500`}>
          <div className="relative inline-flex items-center justify-center mb-8">
            <div className="absolute inset-0 bg-green-400 blur-xl opacity-20 rounded-full" />
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl shadow-xl shadow-green-500/20 text-white relative z-10">
              <CheckCircle2 className="h-12 w-12" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-4 tracking-tight">
            ¡Ecografía recibida!
          </h2>
          <p className="text-stone-600 mb-8 leading-relaxed text-lg">
            Nuestra IA y equipo médico están analizando las imágenes. Recibirás el resultado muy pronto en <strong className="text-stone-900 bg-[#83b5b6]/10 px-2 py-0.5 rounded-md">{email}</strong>.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-2xl bg-stone-900 text-white font-semibold shadow-lg hover:bg-stone-800 transition-all hover:-translate-y-0.5 active:translate-y-0"
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
      <div 
        className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(to bottom right, #1a3839, #3a6869, #83b5b6)' }}
      >
        {renderBackground()}
        <div className="text-center relative z-10 flex flex-col items-center">
          <div className="relative mb-8">
            {/* Anillos de radar/pulso en blanco para contrastar con el fondo oscuro */}
            <div className="absolute inset-0 rounded-full border-2 border-white animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-40" />
            <div className="absolute inset-0 rounded-full border-2 border-white animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-40" style={{ animationDelay: '0.5s' }} />
            
            <div className="inline-flex items-center justify-center w-28 h-28 bg-white/20 backdrop-blur-md rounded-3xl shadow-[0_0_40px_rgba(255,255,255,0.2)] relative z-10 border border-white/40">
              <Sparkles className="h-12 w-12 text-white animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">Analizando ecografía</h2>
          <p className="text-white/80 font-medium max-w-xs mx-auto animate-pulse">
            Procesando datos y aplicando modelos predictivos...
          </p>
        </div>
      </div>
    );
  }

  // Form steps
  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(to bottom right, #1a3839, #3a6869, #83b5b6)' }}
    >
      {renderBackground()}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        <button
          type="button"
          onClick={onBack}
          className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-white font-medium shadow-sm border border-white/20 hover:bg-white/20 transition-all hover:-translate-x-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver
        </button>

        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
          <div className="flex items-center gap-5 w-full md:w-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-lg text-white shrink-0">
              <Baby className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-sm">Predicción de Género</h1>
              <p className="text-white/80 font-medium mt-1">Con Inteligencia Artificial y expertos médicos</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 shadow-sm">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step === 1 ? 'bg-white text-[#3a6869] shadow-md' : 'bg-white/20 text-white/70'}`}>1</div>
            <div className="w-8 h-1 bg-white/20 rounded-full overflow-hidden">
              <div className={`h-full bg-white transition-all duration-500 ${step === 2 ? 'w-full' : 'w-0'}`} />
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step === 2 ? 'bg-white text-[#3a6869] shadow-md' : 'bg-white/20 text-white/70'}`}>2</div>
          </div>
        </div>

        <div className={cardClass + ' p-6 sm:p-10'}>
          {/* Adorno tecnológico */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#83b5b6]/20 to-transparent blur-2xl rounded-full pointer-events-none" />
          
          {step === 1 && (
            <div className="animate-in slide-in-from-right-4 fade-in duration-500 relative z-10">
              <div className="mb-8 pb-6 border-b border-stone-100">
                <h3 className="text-xl font-bold text-stone-800">Tus datos</h3>
                <p className="text-stone-500 text-sm mt-1">Necesitamos algunos datos para contactarte con el resultado.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={labelClass}>
                    <User className="h-4 w-4 mr-2 text-[#83b5b6]" />
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. María García"
                    className={inputClass + (validationErrors.name ? ' border-red-400 focus:border-red-400 focus:ring-red-400/20' : '')}
                    required
                  />
                  {validationErrors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{validationErrors.name}</p>}
                </div>

                <div>
                  <label className={labelClass}>
                    <Mail className="h-4 w-4 mr-2 text-[#83b5b6]" />
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className={inputClass + (validationErrors.email ? ' border-red-400 focus:border-red-400 focus:ring-red-400/20' : '')}
                    required
                  />
                  {validationErrors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{validationErrors.email}</p>}
                </div>

                <div>
                  <label className={labelClass}>
                    <Phone className="h-4 w-4 mr-2 text-[#83b5b6]" />
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+34 600 000 000"
                    className={inputClass + (validationErrors.phone ? ' border-red-400 focus:border-red-400 focus:ring-red-400/20' : '')}
                    required
                  />
                  {validationErrors.phone && <p className="text-red-500 text-xs mt-1.5 font-medium">{validationErrors.phone}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>
                    <Calendar className="h-4 w-4 mr-2 text-[#83b5b6]" />
                    Semanas de embarazo
                  </label>
                  <div className="relative">
                    <select
                      value={pregnancyWeeks}
                      onChange={(e) => setPregnancyWeeks(Number(e.target.value))}
                      className={inputClass + " appearance-none"}
                      required
                    >
                      {PREGNANCY_WEEKS.map((w) => (
                        <option key={w} value={w}>Semana {w}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-stone-400">
                      <ChevronRight className="h-4 w-4 rotate-90" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex flex-col-reverse sm:flex-row items-center justify-between pt-6 border-t border-stone-100 gap-4">
                <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
                  <ShieldCheck className="h-4 w-4 text-[#83b5b6]" />
                  <span>Datos cifrados de extremo a extremo</span>
                </div>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl bg-stone-900 text-white text-lg font-semibold shadow-lg shadow-stone-900/20 hover:bg-stone-800 transition-all hover:scale-[1.02] active:scale-95"
                >
                  Continuar
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in slide-in-from-right-4 fade-in duration-500 relative z-10">
              <div className="mb-8 pb-6 border-b border-stone-100">
                <h3 className="text-xl font-bold text-stone-800">Ecografía</h3>
                <p className="text-stone-500 text-sm mt-1">Sube la imagen de tu ecografía para el análisis predictivo.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className={labelClass}>
                    <FileImage className="h-4 w-4 mr-2 text-[#83b5b6]" />
                    Tipo de ecografía
                  </label>
                  <div className="relative">
                    <select
                      value={ultrasoundType}
                      onChange={(e) => setUltrasoundType(e.target.value)}
                      className={inputClass + " appearance-none " + (validationErrors.ultrasoundType ? ' border-red-400' : '')}
                      required
                    >
                      <option value="">Seleccionar tipo...</option>
                      {ULTRASOUND_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-stone-400">
                      <ChevronRight className="h-4 w-4 rotate-90" />
                    </div>
                  </div>
                  {validationErrors.ultrasoundType && <p className="text-red-500 text-xs mt-1.5 font-medium">{validationErrors.ultrasoundType}</p>}
                </div>

                <div>
                  <label className={labelClass}>
                    <Upload className="h-4 w-4 mr-2 text-[#83b5b6]" />
                    Archivo de imagen
                  </label>
                  
                  {/* File Dropzone Area */}
                  <div className="relative group mt-2">
                    <div className={`flex flex-col items-center justify-center w-full h-40 px-4 transition-all bg-stone-50/80 border-2 border-dashed rounded-2xl ${validationErrors.ultrasoundFile ? 'border-red-300 bg-red-50/50' : 'border-[#83b5b6]/30 group-hover:border-[#83b5b6] group-hover:bg-[#83b5b6]/5'} relative overflow-hidden`}>
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform duration-300">
                        <Upload className="w-5 h-5 text-[#83b5b6]" />
                      </div>
                      <p className="text-sm text-stone-700 font-semibold">Haz clic para subir imagen</p>
                      <p className="text-xs text-stone-400 mt-1.5 font-medium">PNG, JPG o WEBP (máx. 5MB)</p>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={(e) => {
                          setUltrasoundFile(e.target.files?.[0] ?? null);
                          if (e.target.files?.[0]) {
                            const newErrs = { ...validationErrors };
                            delete newErrs.ultrasoundFile;
                            setValidationErrors(newErrs);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    
                    {ultrasoundFile && (
                      <div className="absolute inset-0 flex items-center justify-between p-4 bg-white/95 backdrop-blur border-2 border-[#83b5b6] rounded-2xl shadow-lg shadow-[#83b5b6]/10 z-10 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className="w-12 h-12 bg-[#83b5b6]/10 rounded-xl flex items-center justify-center shrink-0">
                            <Image className="w-6 h-6 text-[#83b5b6]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-stone-800 truncate pr-4">{ultrasoundFile.name}</p>
                            <p className="text-xs text-stone-500 font-medium mt-0.5">{(ultrasoundFile.size / 1024 / 1024).toFixed(2)} MB • Lista para subir</p>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setUltrasoundFile(null)} 
                          className="p-2.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                          title="Cambiar imagen"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    )}
                  </div>
                  {validationErrors.ultrasoundFile && <p className="text-red-500 text-xs mt-1.5 font-medium">{validationErrors.ultrasoundFile}</p>}
                </div>
              </div>

              {submitError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                  <div className="text-red-500 shrink-0 mt-0.5">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <p className="text-red-700 text-sm font-medium">{submitError}</p>
                </div>
              )}

              <div className="mt-10 flex flex-col-reverse sm:flex-row gap-4 justify-between items-center pt-6 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-xl border-2 border-stone-200 bg-white/50 text-stone-700 font-bold hover:bg-stone-50 hover:border-stone-300 transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Volver atrás
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-[190px] px-10 py-4 rounded-2xl bg-stone-900 text-white text-lg font-bold shadow-xl shadow-stone-900/30 hover:bg-stone-800 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Sparkles className="h-5 w-5" />
                  Analizar imagen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
