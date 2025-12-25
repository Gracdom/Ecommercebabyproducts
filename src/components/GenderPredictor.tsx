import { useState, useEffect } from 'react';
import { Baby, Heart, Sparkles, ArrowRight, Mail, Check, Star, TrendingUp, Users, Gift, ChevronRight } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: { text: string; value: 'boy' | 'girl'; emoji: string }[];
}

const questions: Question[] = [
  {
    id: 1,
    question: '¿Qué tipo de antojos tienes más?',
    options: [
      { text: 'Dulces y chocolate', value: 'girl', emoji: '🍫' },
      { text: 'Salados y carnes', value: 'boy', emoji: '🥓' },
    ],
  },
  {
    id: 2,
    question: '¿Cómo describirías tu energía durante el embarazo?',
    options: [
      { text: 'Más activa y enérgica', value: 'boy', emoji: '⚡' },
      { text: 'Más tranquila y relajada', value: 'girl', emoji: '🌸' },
    ],
  },
  {
    id: 3,
    question: '¿Qué color te atrae más en este momento?',
    options: [
      { text: 'Azules y verdes', value: 'boy', emoji: '💙' },
      { text: 'Rosas y morados', value: 'girl', emoji: '💗' },
    ],
  },
  {
    id: 4,
    question: '¿Cómo está tu piel durante el embarazo?',
    options: [
      { text: 'Más clara y radiante', value: 'boy', emoji: '✨' },
      { text: 'Con más imperfecciones', value: 'girl', emoji: '🌺' },
    ],
  },
  {
    id: 5,
    question: '¿Qué sensación tienes en tu intuición?',
    options: [
      { text: 'Siento que es niño', value: 'boy', emoji: '👦' },
      { text: 'Siento que es niña', value: 'girl', emoji: '👧' },
    ],
  },
];

interface GenderPredictorProps {
  onComplete: (gender: 'boy' | 'girl') => void;
  onBack: () => void;
}

export function GenderPredictor({ onComplete, onBack }: GenderPredictorProps) {
  const [step, setStep] = useState<'landing' | 'quiz' | 'email' | 'calculating' | 'result'>('landing');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<('boy' | 'girl')[]>([]);
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<'boy' | 'girl' | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (step === 'calculating') {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            // Calculate result
            const boyCount = answers.filter(a => a === 'boy').length;
            const girlCount = answers.filter(a => a === 'girl').length;
            const predictedGender = boyCount > girlCount ? 'boy' : 'girl';
            setResult(predictedGender);
            setTimeout(() => setStep('result'), 500);
            return 100;
          }
          return prev + 2;
        });
      }, 30);
      return () => clearInterval(timer);
    }
  }, [step, answers]);

  const handleAnswer = (value: 'boy' | 'girl') => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setStep('email');
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setStep('calculating');
    }
  };

  const handleViewProducts = () => {
    if (result) {
      onComplete(result);
    }
  };

  // Landing Page
  if (step === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-pink-300 to-rose-300 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          {/* Back button */}
          <button
            onClick={onBack}
            className="mb-8 text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-2"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            <span>Volver a la tienda</span>
          </button>

          <div className="text-center space-y-8">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-3xl shadow-2xl mb-6 animate-bounce">
              <Baby className="h-12 w-12 text-rose-500" />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-white/50 shadow-lg">
              <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
              <span className="text-sm text-stone-900 font-medium">+50,000 predicciones realizadas</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl text-stone-900 leading-tight">
              ¿Será niño o niña?
            </h1>

            <p className="text-2xl text-stone-700 max-w-3xl mx-auto leading-relaxed">
              Descubre el género de tu bebé con nuestro predictor basado en síntomas y tradiciones. ¡Es gratis y divertido!
            </p>

            {/* Benefits */}
            <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto pt-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:scale-105 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div className="text-lg font-medium text-stone-900 mb-2">85% Precisión</div>
                <div className="text-sm text-stone-600">Según nuestras mamás</div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:scale-105 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-lg font-medium text-stone-900 mb-2">5 Preguntas</div>
                <div className="text-sm text-stone-600">Rápido y divertido</div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:scale-105 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Gift className="h-6 w-6 text-white" />
                </div>
                <div className="text-lg font-medium text-stone-900 mb-2">Descuentos</div>
                <div className="text-sm text-stone-600">En productos baby</div>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => setStep('quiz')}
              className="group relative px-12 py-6 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white rounded-2xl text-xl font-medium overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 mt-8"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-3">
                <span>Comenzar predicción</span>
                <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
              </div>
            </button>

            <p className="text-sm text-stone-500">
              100% gratis • Sin registro • Resultado instantáneo
            </p>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-6 pt-12">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 border-4 border-white"
                  />
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="text-sm text-stone-700 font-medium">+50,000 mamás han predicho aquí</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz
  if (step === 'quiz') {
    const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;
    const currentQ = questions[currentQuestion];

    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-stone-600 font-medium">
                Pregunta {currentQuestion + 1} de {questions.length}
              </span>
              <span className="text-sm text-stone-600 font-medium">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="h-3 bg-white/50 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl border-2 border-white/50 animate-in fade-in slide-in-from-bottom duration-500">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl mb-6">
                <Baby className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl text-stone-900 mb-4">
                {currentQ.question}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-4">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option.value)}
                  className="w-full p-6 bg-stone-50 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 rounded-2xl border-2 border-stone-200 hover:border-purple-300 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{option.emoji}</div>
                    <div className="flex-1 text-left">
                      <div className="text-lg text-stone-900 font-medium group-hover:text-purple-700 transition-colors">
                        {option.text}
                      </div>
                    </div>
                    <ArrowRight className="h-6 w-6 text-stone-400 group-hover:text-purple-600 transition-all group-hover:translate-x-1" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Back button */}
          {currentQuestion > 0 && (
            <button
              onClick={() => {
                setCurrentQuestion(currentQuestion - 1);
                setAnswers(answers.slice(0, -1));
              }}
              className="mt-6 text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-2 mx-auto"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              <span>Pregunta anterior</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Email Capture
  if (step === 'email') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl border-2 border-white/50 animate-in fade-in slide-in-from-bottom duration-500">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl mb-6">
                <Mail className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl text-stone-900 mb-4">
                ¡Ya casi está!
              </h2>
              <p className="text-lg text-stone-600">
                Ingresa tu email para recibir el resultado y un <span className="text-purple-600 font-medium">15% de descuento</span> en productos para bebé
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-stone-50 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-4 focus:ring-purple-200 transition-all text-lg border-2 border-stone-200 focus:border-purple-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-5 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 text-white rounded-xl text-lg font-medium hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
              >
                <span>Ver mi resultado</span>
                <Sparkles className="h-5 w-5" />
              </button>

              <p className="text-xs text-stone-500 text-center">
                Al continuar, aceptas recibir emails promocionales. Puedes darte de baja en cualquier momento.
              </p>
            </form>

            {/* Benefits */}
            <div className="mt-8 pt-8 border-t border-stone-200 space-y-3">
              {['Resultado instantáneo personalizado', '15% descuento en tu primera compra', 'Consejos exclusivos para embarazo'].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-sm text-stone-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculating
  if (step === 'calculating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-white rounded-full shadow-2xl mb-8 animate-bounce">
            <Baby className="h-16 w-16 text-purple-500 animate-pulse" />
          </div>
          
          <h2 className="text-4xl text-stone-900 mb-6">
            Analizando tus respuestas...
          </h2>

          <div className="max-w-md mx-auto mb-8">
            <div className="h-3 bg-white/50 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-stone-600 mt-3">{progress}%</p>
          </div>

          <div className="space-y-2 text-stone-600">
            <p className="animate-pulse">🔮 Consultando tradiciones ancestrales...</p>
            <p className="animate-pulse" style={{ animationDelay: '0.5s' }}>📊 Analizando patrones de síntomas...</p>
            <p className="animate-pulse" style={{ animationDelay: '1s' }}>✨ Calculando probabilidades...</p>
          </div>
        </div>
      </div>
    );
  }

  // Result
  if (step === 'result' && result) {
    const isBoy = result === 'boy';
    
    return (
      <div className={`min-h-screen bg-gradient-to-br ${isBoy ? 'from-blue-50 via-cyan-50 to-sky-50' : 'from-pink-50 via-rose-50 to-purple-50'} relative overflow-hidden`}>
        {/* Animated confetti background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-3 h-3 ${isBoy ? 'bg-blue-400' : 'bg-pink-400'} rounded-full animate-ping`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom duration-700">
            {/* Icon */}
            <div className={`inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br ${isBoy ? 'from-blue-500 to-cyan-500' : 'from-pink-500 to-rose-500'} rounded-full shadow-2xl animate-bounce`}>
              <span className="text-6xl">{isBoy ? '👦' : '👧'}</span>
            </div>

            {/* Result */}
            <div>
              <h2 className="text-5xl sm:text-6xl lg:text-7xl text-stone-900 mb-4">
                ¡Es {isBoy ? 'niño' : 'niña'}! 🎉
              </h2>
              <p className="text-2xl text-stone-700">
                Según nuestro predictor, ¡vas a tener {isBoy ? 'un hermoso varón' : 'una hermosa niña'}!
              </p>
            </div>

            {/* Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/50 shadow-xl max-w-md mx-auto">
              <div className="text-lg text-stone-600 mb-4">Tu predicción:</div>
              <div className="text-6xl font-bold text-stone-900 mb-2">
                {isBoy ? '65%' : '72%'}
              </div>
              <div className="text-stone-600">Probabilidad de {isBoy ? 'niño' : 'niña'}</div>
            </div>

            {/* Email confirmation */}
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 max-w-md mx-auto">
              <div className="flex items-center gap-3 justify-center">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-sm text-green-900 font-medium">Resultado enviado a tu email</div>
                  <div className="text-xs text-green-700">{email}</div>
                </div>
              </div>
            </div>

            {/* Discount */}
            <div className={`bg-gradient-to-r ${isBoy ? 'from-blue-500 to-cyan-500' : 'from-pink-500 to-rose-500'} text-white rounded-2xl p-8 shadow-2xl max-w-md mx-auto`}>
              <div className="flex items-center justify-center gap-3 mb-4">
                <Gift className="h-8 w-8" />
                <span className="text-3xl font-bold">15% OFF</span>
              </div>
              <p className="text-lg mb-6">
                En productos para {isBoy ? 'niño' : 'niña'}
              </p>
              <div className="bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl px-6 py-3 inline-block">
                <div className="text-xs mb-1">Código de descuento:</div>
                <div className="text-2xl font-bold tracking-wider">BABY{isBoy ? 'BOY' : 'GIRL'}15</div>
              </div>
            </div>

            {/* CTA to products */}
            <button
              onClick={handleViewProducts}
              className={`group px-12 py-6 bg-gradient-to-r ${isBoy ? 'from-blue-600 to-cyan-600' : 'from-pink-600 to-rose-600'} text-white rounded-2xl text-xl font-medium transition-all duration-300 hover:shadow-2xl hover:scale-105`}
            >
              <div className="flex items-center gap-3">
                <span>Ver productos para {isBoy ? 'niño' : 'niña'}</span>
                <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
              </div>
            </button>

            {/* Social sharing */}
            <div className="pt-8">
              <p className="text-stone-600 mb-4">¡Comparte tu resultado!</p>
              <div className="flex items-center justify-center gap-4">
                <button className="w-12 h-12 bg-white/80 backdrop-blur-sm hover:bg-blue-600 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 border border-stone-200">
                  <Users className="h-5 w-5" />
                </button>
                <button className="w-12 h-12 bg-white/80 backdrop-blur-sm hover:bg-pink-600 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 border border-stone-200">
                  <Heart className="h-5 w-5" />
                </button>
                <button className="w-12 h-12 bg-white/80 backdrop-blur-sm hover:bg-purple-600 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 border border-stone-200">
                  <Star className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-stone-500 max-w-2xl mx-auto">
              * Este predictor es solo para entretenimiento y no sustituye el diagnóstico médico profesional. Consulta con tu médico para saber el género con certeza.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
