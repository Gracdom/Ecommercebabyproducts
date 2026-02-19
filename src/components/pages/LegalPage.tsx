import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

interface LegalPageProps {
  title: string;
  onBack: () => void;
  children: ReactNode;
}

export function LegalPage({ title, onBack, children }: LegalPageProps) {
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

        <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-8">{title}</h1>

        <div className="prose prose-stone max-w-none text-stone-700 space-y-6 text-sm sm:text-base leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
