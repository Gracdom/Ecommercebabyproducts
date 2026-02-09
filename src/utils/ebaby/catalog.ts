import type { Product } from "@/types";
import { supabase } from "@/utils/supabase/client";

type EbabyProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  category: string | null;
  sub_category: string | null;
  image_path: string | null;
  main_image_url: string | null;
  additional_images: string[] | null;
  stock: number | null;
  is_active: boolean | null;
  sizes: string[] | null;
  colors: string[] | null;
  brand: string | null;
  source_url: string | null;
  features: string | null;
  created_at: string;
  updated_at: string;
};

export interface CategoryInfo {
  id: string;
  name: string;
  parentId?: string | null;
  parentName?: string | null;
  productCount: number;
  subcategories?: SubcategoryInfo[];
}

export interface SubcategoryInfo {
  id: string;
  name: string;
  productCount: number;
}

/**
 * Obtiene productos de la tabla ebaby_productos
 */
export async function fetchCatalogProducts(options?: {
  limit?: number;
  offset?: number;
  category?: string;
  subCategory?: string;
}): Promise<Product[]> {
  let query = supabase
    .from("ebaby_productos")
    .select("*")
    .eq("is_active", true)
    .not("stock", "is", null)
    .gt("stock", 0);

  // Filtrar por categoría si se especifica
  if (options?.category) {
    query = query.eq("category", options.category);
  }

  // Filtrar por subcategoría si se especifica
  if (options?.subCategory) {
    query = query.eq("sub_category", options.subCategory);
  }

  // Ordenar por fecha de creación (más recientes primero)
  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) throw error;
  const rows = (data ?? []) as unknown as EbabyProduct[];

  let products = rows.map((p) => {
    // Usar main_image_url o image_path como imagen principal
    const mainImage = p.main_image_url || p.image_path || "";
    
    // Combinar imágenes adicionales
    const additionalImages = p.additional_images || [];
    const allImages = mainImage ? [mainImage, ...additionalImages] : additionalImages;

    // Convertir precio de céntimos a euros (si está en céntimos) o mantenerlo
    const price = p.price ? (p.price > 1000 ? p.price / 100 : p.price) : 0;

    // Convertir UUID a número para compatibilidad (usar hash simple del UUID)
    // Tomar los primeros 8 caracteres del UUID y convertirlos a número
    const uuidHash = p.id.replace(/-/g, '').substring(0, 8);
    const numericId = parseInt(uuidHash, 16) % 2147483647; // Limitar a int32 máximo

    return {
      id: numericId,
      name: p.name,
      price: price,
      originalPrice: undefined,
      image: mainImage || "",
      category: p.category || "Otros",
      description: p.description || undefined,
      images: allImages.length > 0 ? allImages : undefined,
      sku: p.source_url || p.id,
      inStock: (p.stock ?? 0) > 0,
      stock: p.stock ?? 0,
    } as Product;
  });

  // Aplicar paginación
  if (options?.offset !== undefined) {
    products = products.slice(options.offset);
  }
  if (options?.limit !== undefined) {
    products = products.slice(0, options.limit);
  }

  return products;
}

/**
 * Obtiene productos destacados
 */
export async function fetchFeaturedProducts(limit: number = 8): Promise<Product[]> {
  return fetchCatalogProducts({
    limit,
  });
}

/**
 * Obtiene todas las categorías con sus subcategorías desde ebaby_productos
 */
export async function fetchCategories(): Promise<CategoryInfo[]> {
  try {
    // Obtener todas las categorías únicas con sus subcategorías
    const { data: products, error: productsError } = await supabase
      .from("ebaby_productos")
      .select("category, sub_category")
      .eq("is_active", true)
      .not("stock", "is", null)
      .gt("stock", 0)
      .not("category", "is", null);

    if (productsError) {
      console.error("Error fetching product categories:", productsError);
      return [];
    }

    // Agrupar por categoría y subcategoría
    const categoryMap = new Map<string, {
      name: string;
      subcategories: Map<string, number>;
      totalCount: number;
    }>();

    for (const p of products || []) {
      const categoryName = p.category;
      if (!categoryName) continue;

      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, {
          name: categoryName,
          subcategories: new Map(),
          totalCount: 0,
        });
      }

      const category = categoryMap.get(categoryName)!;
      category.totalCount++;

      // Agregar subcategoría si existe
      if (p.sub_category) {
        const subCount = category.subcategories.get(p.sub_category) || 0;
        category.subcategories.set(p.sub_category, subCount + 1);
      }
    }

    // Convertir a formato CategoryInfo
    const categories: CategoryInfo[] = [];
    let categoryIndex = 1;

    for (const [categoryName, categoryData] of categoryMap.entries()) {
      const subcategories: SubcategoryInfo[] = [];
      let subIndex = 1;

      // Ordenar subcategorías por cantidad (descendente)
      const sortedSubs = Array.from(categoryData.subcategories.entries())
        .sort((a, b) => b[1] - a[1]);

      for (const [subName, count] of sortedSubs) {
        subcategories.push({
          id: `sub-${categoryIndex}-${subIndex}`,
          name: subName,
          productCount: count,
        });
        subIndex++;
      }

      categories.push({
        id: `cat-${categoryIndex}`,
        name: categoryData.name,
        productCount: categoryData.totalCount,
        subcategories: subcategories.length > 0 ? subcategories : undefined,
      });

      categoryIndex++;
    }

    // Ordenar categorías por cantidad de productos (descendente)
    categories.sort((a, b) => b.productCount - a.productCount);

    return categories;
  } catch (err) {
    console.error("Error in fetchCategories:", err);
    return [];
  }
}

/**
 * Obtiene productos por categoría
 */
export async function fetchProductsByCategory(
  category: string,
  subCategory?: string,
  limit?: number
): Promise<Product[]> {
  return fetchCatalogProducts({
    category,
    subCategory,
    limit,
  });
}
