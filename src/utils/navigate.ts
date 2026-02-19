/**
 * Navegación path-based para la SPA.
 * Usa pushState + dispatchEvent para que App reaccione sin recargar.
 */
export function navigate(path: string): void {
  const url = path.startsWith('/') ? path : `/${path}`;
  window.history.pushState(null, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
