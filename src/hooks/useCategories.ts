import { useState, useEffect } from 'react';
import { fetchCategories, type CategoryInfo } from '@/utils/ebaby/catalog';

export function useCategories() {
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchCategories()
      .then((cats) => {
        if (!cancelled) {
          setCategories(cats);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, loading, error };
}

export function useSubcategories(categoryName: string | null) {
  const [subcategories, setSubcategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!categoryName) {
      setSubcategories([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    // Obtener todas las categorías y filtrar por la categoría padre
    fetchCategories()
      .then((allCats) => {
        if (!cancelled) {
          const parentCat = allCats.find(cat => cat.name === categoryName);
          if (parentCat && parentCat.subcategories) {
            // Convertir subcategorías al formato CategoryInfo
            const subs: CategoryInfo[] = parentCat.subcategories.map(sub => ({
              id: sub.id,
              name: sub.name,
              productCount: sub.productCount,
            }));
            setSubcategories(subs);
          } else {
            setSubcategories([]);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [categoryName]);

  return { subcategories, loading, error };
}

