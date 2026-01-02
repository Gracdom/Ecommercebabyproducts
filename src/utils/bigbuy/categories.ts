import { supabase } from "@/utils/supabase/client";

export interface CategoryInfo {
  id: number;
  name: string;
  parentId?: number | null;
  parentName?: string | null;
  productCount: number;
  image?: string;
}

/**
 * Obtiene todas las categorías que tienen productos con stock
 */
export async function fetchCategories(): Promise<CategoryInfo[]> {
  // Obtener categorías únicas desde productos con stock
  const { data: products, error: productsError } = await supabase
    .from("bigbuy_products")
    .select("category_id")
    .eq("has_stock", true)
    .is("deleted_at", null)
    .not("category_id", "is", null);

  if (productsError) throw productsError;

  // Contar productos por categoría
  const categoryCounts = new Map<number, number>();
  for (const p of products || []) {
    const catId = Number(p.category_id);
    if (Number.isFinite(catId)) {
      categoryCounts.set(catId, (categoryCounts.get(catId) || 0) + 1);
    }
  }

  if (categoryCounts.size === 0) return [];

  // Obtener nombres de categorías desde bigbuy_taxonomies
  const categoryIds = Array.from(categoryCounts.keys());
  const { data: taxonomies, error: taxError } = await supabase
    .from("bigbuy_taxonomies")
    .select("id, name, parent_taxonomy_id")
    .in("id", categoryIds)
    .eq("iso_code", "es");

  if (taxError) throw taxError;

  // Crear mapa de taxonomías por ID
  const taxonomyMap = new Map<number, { name: string; parentId?: number | null }>();
  for (const tax of taxonomies || []) {
    const id = Number(tax.id);
    if (Number.isFinite(id)) {
      taxonomyMap.set(id, {
        name: String(tax.name || "").trim(),
        parentId: Number.isFinite(Number(tax.parent_taxonomy_id)) ? Number(tax.parent_taxonomy_id) : null,
      });
    }
  }

  // Obtener nombres de categorías padre
  const parentIds = Array.from(new Set(
    Array.from(taxonomyMap.values())
      .map(t => t.parentId)
      .filter((id): id is number => id !== null && id !== undefined)
  ));

  const parentTaxonomiesMap = new Map<number, string>();
  if (parentIds.length > 0) {
    const { data: parentTaxonomies } = await supabase
      .from("bigbuy_taxonomies")
      .select("id, name")
      .in("id", parentIds)
      .eq("iso_code", "es");

    for (const pt of parentTaxonomies || []) {
      const id = Number(pt.id);
      if (Number.isFinite(id)) {
        parentTaxonomiesMap.set(id, String(pt.name || "").trim());
      }
    }
  }

  // Construir lista de categorías con conteos
  const categories: CategoryInfo[] = [];
  for (const [categoryId, count] of categoryCounts.entries()) {
    const taxonomy = taxonomyMap.get(categoryId);
    if (taxonomy) {
      const parentName = taxonomy.parentId && parentTaxonomiesMap.has(taxonomy.parentId)
        ? parentTaxonomiesMap.get(taxonomy.parentId)!
        : null;

      categories.push({
        id: categoryId,
        name: taxonomy.name,
        parentId: taxonomy.parentId || null,
        parentName: parentName || null,
        productCount: count,
      });
    }
  }

  // Ordenar por nombre de categoría padre y luego por nombre
  categories.sort((a, b) => {
    const aKey = `${a.parentName || ""} ${a.name}`.trim().toLowerCase();
    const bKey = `${b.parentName || ""} ${b.name}`.trim().toLowerCase();
    return aKey.localeCompare(bKey);
  });

  return categories;
}

/**
 * Obtiene subcategorías de una categoría padre
 */
export async function fetchSubcategories(parentCategoryId: number): Promise<CategoryInfo[]> {
  // Obtener subcategorías desde taxonomías
  const { data: subcategories, error: subError } = await supabase
    .from("bigbuy_taxonomies")
    .select("id, name")
    .eq("parent_taxonomy_id", parentCategoryId)
    .eq("iso_code", "es");

  if (subError) throw subError;

  // Contar productos por subcategoría
  const subcategoryIds = (subcategories || []).map(s => Number(s.id)).filter(Number.isFinite);
  if (subcategoryIds.length === 0) return [];

  const { data: products, error: productsError } = await supabase
    .from("bigbuy_products")
    .select("category_id")
    .eq("has_stock", true)
    .is("deleted_at", null)
    .in("category_id", subcategoryIds);

  if (productsError) throw productsError;

  const subcategoryCounts = new Map<number, number>();
  for (const p of products || []) {
    const catId = Number(p.category_id);
    if (Number.isFinite(catId)) {
      subcategoryCounts.set(catId, (subcategoryCounts.get(catId) || 0) + 1);
    }
  }

  // Construir lista de subcategorías
  const result: CategoryInfo[] = [];
  for (const sub of subcategories || []) {
    const id = Number(sub.id);
    if (Number.isFinite(id) && subcategoryCounts.has(id)) {
      result.push({
        id,
        name: String(sub.name || "").trim(),
        parentId: parentCategoryId,
        productCount: subcategoryCounts.get(id) || 0,
      });
    }
  }

  return result.sort((a, b) => a.name.localeCompare(b.name));
}

