import { useState, useEffect } from 'react';
import { fetchCategories, fetchSubcategories, type CategoryInfo } from '@/utils/bigbuy/categories';

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

export function useSubcategories(parentCategoryId: number | null) {
  const [subcategories, setSubcategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!parentCategoryId) {
      setSubcategories([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchSubcategories(parentCategoryId)
      .then((subs) => {
        if (!cancelled) {
          setSubcategories(subs);
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
  }, [parentCategoryId]);

  return { subcategories, loading, error };
}

