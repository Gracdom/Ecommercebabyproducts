import { Ruler } from 'lucide-react';
import { useState } from 'react';

export function SizeGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-stone-700 hover:text-stone-900 transition-colors"
      >
        <Ruler className="h-4 w-4" />
        <span className="underline">Size & Age Guide</span>
      </button>

      {isOpen && (
        <div className="mt-4 border border-stone-200 rounded-lg p-6 bg-stone-50">
          <h4 className="text-stone-900 mb-4">Age & Size Recommendations</h4>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-300">
                  <th className="text-left py-2 pr-4 text-stone-700">Age</th>
                  <th className="text-left py-2 pr-4 text-stone-700">Size</th>
                  <th className="text-left py-2 text-stone-700">Recommended</th>
                </tr>
              </thead>
              <tbody className="text-stone-600">
                <tr className="border-b border-stone-200">
                  <td className="py-3 pr-4">0-3 months</td>
                  <td className="py-3 pr-4">50-62 cm</td>
                  <td className="py-3">✓</td>
                </tr>
                <tr className="border-b border-stone-200">
                  <td className="py-3 pr-4">3-6 months</td>
                  <td className="py-3 pr-4">62-68 cm</td>
                  <td className="py-3">✓</td>
                </tr>
                <tr className="border-b border-stone-200">
                  <td className="py-3 pr-4">6-12 months</td>
                  <td className="py-3 pr-4">68-80 cm</td>
                  <td className="py-3">✓</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">12-18 months</td>
                  <td className="py-3 pr-4">80-86 cm</td>
                  <td className="py-3">✓</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
            <strong>Note:</strong> This toy is suitable from 0 months and grows with your baby. The activity cube measures 12x12x12 cm.
          </div>
        </div>
      )}
    </div>
  );
}
