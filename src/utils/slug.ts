/**
 * Convierte un texto en un slug URL-friendly
 * Ejemplo: "Cuna de Bebé Premium" -> "cuna-de-bebe-premium"
 */
export function createSlug(text: string): string {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Normalizar caracteres acentuados
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar diacríticos
    // Reemplazar espacios y guiones múltiples con un solo guion
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    // Eliminar caracteres especiales, mantener solo letras, números y guiones
    .replace(/[^a-z0-9-]/g, '')
    // Eliminar guiones al inicio y final
    .replace(/^-+|-+$/g, '');
}

/**
 * Genera un slug único para un producto
 * Si hay colisiones, añade el ID al final
 */
export function createProductSlug(product: { name: string; id: number }): string {
  const baseSlug = createSlug(product.name);
  // Si el slug está vacío, usar el ID como fallback
  return baseSlug || `producto-${product.id}`;
}
