import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface FilterSection {
  title: string;
  items: string[];
}

interface CategoryFiltersProps {
  categoryTitle: string;
  filters: FilterSection[];
}

export function CategoryFilters({ categoryTitle, filters }: CategoryFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0, 1]));

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <aside className="w-64 flex-shrink-0 pr-8 border-r border-stone-200">
      <h2 className="mb-6 text-stone-900">{categoryTitle}</h2>
      
      {filters.map((section, sectionIndex) => (
        <div key={sectionIndex} className="mb-6">
          <button
            onClick={() => toggleSection(sectionIndex)}
            className="flex items-center justify-between w-full mb-3 text-stone-900 hover:text-stone-700 transition-colors"
          >
            <span className="text-sm">{section.title}</span>
            {expandedSections.has(sectionIndex) ? (
              <ChevronUp className="h-4 w-4 text-stone-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-stone-400" />
            )}
          </button>
          
          {expandedSections.has(sectionIndex) && (
            <ul className="space-y-2">
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <button className="text-sm text-stone-600 hover:text-stone-900 transition-colors text-left">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
      
      {/* View more button for colors */}
      <button className="text-sm text-stone-500 hover:text-stone-900 flex items-center gap-1 mt-2">
        9 view more
        <ChevronDown className="h-3 w-3" />
      </button>
    </aside>
  );
}
