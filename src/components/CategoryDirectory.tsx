import { useState, useEffect, useMemo } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { fetchCategories } from '../utils/ebaby/catalog';
import type { CategoryInfo } from '../utils/ebaby/catalog';

interface CategoryDirectoryProps {
  onCategoryClick: (categoryName?: string) => void;
}

// Imágenes de fallback para las subcategorías
const FALLBACK_IMAGES = [
  '/img/5.webp',
  '/img/6.webp', 
  '/img/7.webp',
  '/img/8.webp',
  '/img/9.webp',
  '/img/10.webp',
  '/img/1.webp',
];

interface SubcategoryCard {
  id: string;
  name: string;
  parentCategory: string;
  productCount: number;
  image: string;
}

// Función para seleccionar 7 subcategorías aleatorias
function selectRandomSubcategories(categories: CategoryInfo[]): SubcategoryCard[] {
  const allSubcategories: SubcategoryCard[] = [];
  
  // Recopilar todas las subcategorías de todas las categorías
  categories.forEach(category => {
    if (category.subcategories && category.subcategories.length > 0) {
      category.subcategories.forEach(sub => {
        allSubcategories.push({
          id: sub.id,
          name: sub.name,
          parentCategory: category.name,
          productCount: sub.productCount,
          image: '', // Se asignará después
        });
      });
    }
  });

  // Mezclar y seleccionar 7
  const shuffled = allSubcategories.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 7);

  // Asignar imágenes
  return selected.map((sub, index) => ({
    ...sub,
    image: FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
  }));
}

export function CategoryDirectory({ onCategoryClick }: CategoryDirectoryProps) {
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('Todos');

  // Cargar categorías
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await fetchCategories();
        setCategories(data || []);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  // Seleccionar 7 subcategorías aleatorias (memo para que no cambien en cada render)
  const selectedSubcategories = useMemo(() => {
    if (categories.length === 0) return [];
    return selectRandomSubcategories(categories);
  }, [categories]);

  // Filtros únicos basados en las categorías padre
  const filters = useMemo(() => {
    const uniqueParents = new Set(selectedSubcategories.map(sub => sub.parentCategory));
    return ['Todos', ...Array.from(uniqueParents)];
  }, [selectedSubcategories]);

  // Subcategorías filtradas
  const filteredSubcategories = useMemo(() => {
    if (selectedFilter === 'Todos') return selectedSubcategories;
    return selectedSubcategories.filter(sub => sub.parentCategory === selectedFilter);
  }, [selectedFilter, selectedSubcategories]);

  if (loading) {
    return (
      <section className="py-32 lg:py-40 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-32 lg:py-40 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-secondary/20 to-primary/20 px-4 py-2 rounded-full mb-4 sm:mb-6 border border-secondary/30">
            <Sparkles className="h-4 w-4 text-secondary flex-shrink-0" />
            <span className="text-sm text-[#2d3748]">Explora por categoría</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl mb-3 sm:mb-4 font-medium" style={{ color: '#83b5b6' }}>
            Encuentra lo que necesitas
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-[#718096] max-w-2xl mx-auto px-2">
            Navega por nuestras colecciones cuidadosamente organizadas
          </p>
        </div>

        {/* Filtros tipo Pills con scroll horizontal */}
        <div className="mb-8 overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-2 min-w-max justify-center">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  selectedFilter === filter
                    ? 'bg-[#83b5b6] text-white shadow-lg shadow-[#83b5b6]/30 scale-105'
                    : 'bg-white text-[#718096] border border-[#E2E8F0] hover:border-[#83b5b6] hover:text-[#83b5b6]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Bento Grid - Nuevo Diseño */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredSubcategories.map((subcategory, index) => {
            // Lógica de layout Bento mejorado
            let gridClass = '';
            let heightClass = '';
            
            if (index === 0) {
              // Primera tarjeta: Alta (doble altura) y ancha en móvil
              gridClass = 'sm:col-span-2 lg:col-span-1 lg:row-span-2';
              heightClass = 'h-[600px]';
            } else if (index === filteredSubcategories.length - 1) {
              // Última tarjeta: Ancha para llenar espacio
              gridClass = 'sm:col-span-2';
              heightClass = 'aspect-[2/1]';
            } else {
              // Tarjetas intermedias: Aspecto estándar
              heightClass = 'aspect-[4/3]';
            }

            // Gradientes únicos para cada tarjeta
            const gradients = [
              'from-[#83b5b6]/90 to-[#7a8f85]/90',
              'from-[#c5a5a5]/90 to-[#b08e8e]/90',
              'from-[#9d8e80]/90 to-[#8d7f71]/90',
              'from-[#9cadb3]/90 to-[#8a9ca3]/90',
              'from-[#b0a396]/90 to-[#a09386]/90',
              'from-[#83b5b6]/80 to-[#9d8e80]/80',
              'from-[#7a8f85]/90 to-[#83b5b6]/80',
            ];

            return (
              <div
                key={subcategory.id}
                onClick={() => onCategoryClick(subcategory.name)}
                className={`group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl shadow-primary/20 ${gridClass} ${heightClass}`}
              >
                {/* Imagen */}
                <img
                  src={subcategory.image}
                  alt={subcategory.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index % gradients.length]} transition-opacity duration-300 group-hover:opacity-90 opacity-80`} />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 text-white">
                  {/* Badge de categoría padre */}
                  <div className="inline-block w-fit px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs mb-4 border border-white/30">
                    {subcategory.parentCategory}
                  </div>

                  {/* Título */}
                  <h3 className={`text-white mb-2 font-medium ${
                    index === 0 ? 'text-4xl sm:text-5xl' : 'text-2xl sm:text-3xl'
                  }`}>
                    {subcategory.name}
                  </h3>

                  {/* Contador de productos */}
                  <div className="text-sm text-white/80 mb-4">
                    {subcategory.productCount} producto{subcategory.productCount !== 1 ? 's' : ''}
                  </div>

                  {/* CTA Button */}
                  <button className="inline-flex items-center gap-2 text-white font-medium group-hover:gap-4 transition-all duration-300">
                    <span>Explorar</span>
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all group-hover:bg-white/30">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <button
            onClick={onCategoryClick}
            className="group relative px-8 py-4 bg-[#FFC1CC] text-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 hover:bg-[#83b5b6]"
            style={{ backgroundColor: '#FFC1CC' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-2">
              <span className="font-medium">Ver todas las categorías</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
