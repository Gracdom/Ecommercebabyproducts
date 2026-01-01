import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, RefreshCw, Save, Download, Search, Trash2, RotateCcw, CheckSquare, Square, BarChart3, FileText, Settings, ArrowUpDown, ArrowUp, ArrowDown, User, ChevronRight, ChevronDown } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ProductImageThumbnail } from './ProductImageThumbnail';
import {
  adminGetConfig,
  adminGetTaxonomies,
  adminSetConfig,
  adminSync,
  adminSyncStock,
  adminSyncFull,
  adminListProducts,
  adminDeleteProducts,
  adminRestoreProducts,
  adminGetStats,
  adminGetSyncLogs,
  createAdminUser,
} from '../utils/bigbuy/edge';
import { AdminProduct, ProductStats, SyncLog, ProductFilters } from '@/types';
import * as Tabs from '@radix-ui/react-tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AnalyticsDashboard } from './AnalyticsDashboard';

type Taxonomy = {
  id: number;
  name: string;
  parentTaxonomy?: number | null;
  url?: string;
  isoCode?: string;
};

interface BigBuyAdminProps {
  onBack: () => void;
}

export function BigBuyAdmin({ onBack }: BigBuyAdminProps) {
  const DEFAULT_SYNC_SECRET = '41f4208c52491c360620360a0ae4a9b2c12d37ad2cc53f1f';
  const [syncSecret, setSyncSecret] = useState(() => sessionStorage.getItem('bigbuySyncSecret') || DEFAULT_SYNC_SECRET);
  const [activeTab, setActiveTab] = useState('sync');
  const [productLimit, setProductLimit] = useState(100);
  const [selectedTaxonomyIds, setSelectedTaxonomyIds] = useState<number[]>([]);
  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);
  const [search, setSearch] = useState('');

  // Sync state
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncingStock, setSyncingStock] = useState(false);
  const [syncingFull, setSyncingFull] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  // Products state
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set());
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set());
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsPage, setProductsPage] = useState(1);
  const [productsTotalPages, setProductsTotalPages] = useState(1);
  const [productsFilters, setProductsFilters] = useState<ProductFilters>({
    page: 1,
    pageSize: 50,
    hasStock: undefined,
    deleted: false,
  });
  const [productsSearch, setProductsSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [availableCategories, setAvailableCategories] = useState<Array<{ id: number; name: string; parentId?: number; parentName?: string }>>([]);
  const [groupByCategory, setGroupByCategory] = useState(false);
  const [sortBy, setSortBy] = useState<string>('ml_score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Stats state
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Logs state
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    if (!syncSecret) return;
    sessionStorage.setItem('bigbuySyncSecret', syncSecret);
  }, [syncSecret]);

  useEffect(() => {
    if (activeTab === 'products' && syncSecret) {
      loadProducts();
    }
  }, [activeTab, productsPage, productsFilters.hasStock, productsFilters.deleted, productsSearch, selectedCategoryId, sortBy, sortOrder, syncSecret]);

  useEffect(() => {
    if (activeTab === 'stats' && syncSecret) {
      loadStats();
    }
  }, [activeTab, syncSecret]);

  useEffect(() => {
    if (activeTab === 'logs' && syncSecret) {
      loadLogs();
    }
  }, [activeTab, syncSecret]);

  const filteredTaxonomies = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return taxonomies;
    return taxonomies.filter(
      (t) =>
        String(t.name).toLowerCase().includes(q) ||
        String(t.id).includes(q) ||
        String(t.url ?? '').toLowerCase().includes(q)
    );
  }, [taxonomies, search]);

  const toggleTaxonomy = (id: number) => {
    setSelectedTaxonomyIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const loadConfig = async () => {
    if (!syncSecret) {
      toast.error('Introduce el BIGBUY_SYNC_SECRET');
      return;
    }
    setLoading(true);
    try {
      const res = await adminGetConfig(syncSecret);
      const cfg = res?.config ?? {};
      setSelectedTaxonomyIds((cfg.taxonomy_ids ?? []) as number[]);
      setProductLimit(Number(cfg.product_limit ?? 100));
      toast.success('Config cargada');
    } catch (e: any) {
      toast.error('No se pudo cargar la config', { description: e?.message });
    } finally {
      setLoading(false);
    }
  };

  const loadTaxonomies = async () => {
    if (!syncSecret) {
      toast.error('Introduce el BIGBUY_SYNC_SECRET');
      return;
    }
    setLoading(true);
    try {
      const res = await adminGetTaxonomies(syncSecret, { isoCode: 'es', firstLevel: true });
      setTaxonomies((res.taxonomies ?? []) as Taxonomy[]);
      const count = (res.taxonomies ?? []).length;
      toast.success(`Taxonomías cargadas: ${count} taxonomías de nivel 1`);
    } catch (e: any) {
      toast.error('No se pudieron cargar taxonomías', { description: e?.message });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!syncSecret) {
      toast.error('Introduce el BIGBUY_SYNC_SECRET');
      return;
    }
    setLoading(true);
    try {
      await adminSetConfig(syncSecret, {
        taxonomyIds: selectedTaxonomyIds,
        productLimit,
      });
      toast.success('Config guardada');
    } catch (e: any) {
      toast.error('No se pudo guardar la config', { description: e?.message });
    } finally {
      setLoading(false);
    }
  };

  const runSync = async () => {
    if (!syncSecret) {
      toast.error('Introduce el BIGBUY_SYNC_SECRET');
      return;
    }
    if (selectedTaxonomyIds.length === 0) {
      toast.error('Selecciona al menos una taxonomía');
      return;
    }
    const invalidTaxonomies = taxonomies.filter(
      (t) => selectedTaxonomyIds.includes(t.id) && t.parentTaxonomy !== 0 && t.parentTaxonomy !== null
    );
    if (invalidTaxonomies.length > 0) {
      toast.error(
        `Solo se pueden usar taxonomías de nivel 1. Las siguientes no son válidas: ${invalidTaxonomies.map((t) => t.name).join(', ')}`,
        { duration: 8000 }
      );
      return;
    }
    setSyncing(true);
    try {
      const res = await adminSync(syncSecret);
      const message =
        res.importedProducts > 0
          ? `${res.importedProducts} productos · ${res.importedVariants} variantes`
          : `0 productos importados. ${res.skippedNoStock || 0} productos sin stock fueron omitidos.`;
      toast.success('Sync completada', {
        description: message,
        duration: 6000,
      });
      // Refresh stats and products if on those tabs
      if (activeTab === 'stats') loadStats();
      if (activeTab === 'products') loadProducts();
    } catch (e: any) {
      const errorMsg = e?.message || 'Error desconocido';
      toast.error('Sync fallida', { description: errorMsg, duration: 8000 });
    } finally {
      setSyncing(false);
    }
  };

  const runSyncFull = async () => {
    if (!syncSecret) {
      toast.error('Introduce el BIGBUY_SYNC_SECRET');
      return;
    }
    if (selectedTaxonomyIds.length === 0) {
      toast.error('Selecciona al menos una taxonomía');
      return;
    }
    setSyncingFull(true);
    try {
      const res = await adminSyncFull(syncSecret);
      toast.success('Sync completo finalizado', {
        description: `${res.importedProducts} nuevos · ${res.updatedProducts} actualizados · ${res.importedVariants} variantes`,
        duration: 8000,
      });
      // Refresh stats, products, and logs
      if (activeTab === 'stats') loadStats();
      if (activeTab === 'products') loadProducts();
      if (activeTab === 'logs') loadLogs();
    } catch (e: any) {
      toast.error('Sync completo fallido', { description: e?.message, duration: 8000 });
    } finally {
      setSyncingFull(false);
    }
  };

  const runSyncStock = async () => {
    if (!syncSecret) {
      toast.error('Introduce el BIGBUY_SYNC_SECRET');
      return;
    }
    setSyncingStock(true);
    try {
      const res = await adminSyncStock(syncSecret);
      toast.success('Stock actualizado', { description: `${res.updatedVariants} variantes`, duration: 6000 });
      if (activeTab === 'products') loadProducts();
      if (activeTab === 'stats') loadStats();
    } catch (e: any) {
      toast.error('Stock sync fallida', { description: e?.message, duration: 6000 });
    } finally {
      setSyncingStock(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!syncSecret) {
      toast.error('Introduce el BIGBUY_SYNC_SECRET');
      return;
    }
    if (!adminEmail || !adminPassword) {
      toast.error('Introduce email y contraseña');
      return;
    }
    if (adminPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setCreatingAdmin(true);
    try {
      const res = await createAdminUser(syncSecret, adminEmail, adminPassword);
      toast.success('Usuario admin creado', {
        description: `Usuario ${res.email} creado con éxito. Ya puedes iniciar sesión.`,
        duration: 8000,
      });
      setShowCreateAdmin(false);
      setAdminEmail('');
      setAdminPassword('');
    } catch (e: any) {
      toast.error('Error creando usuario admin', {
        description: e?.message || 'Intenta de nuevo',
        duration: 8000,
      });
    } finally {
      setCreatingAdmin(false);
    }
  };


  const loadProducts = async () => {
    if (!syncSecret) return;
    setProductsLoading(true);
    try {
      const filters: ProductFilters & { sortBy?: string; sortOrder?: 'asc' | 'desc'; categoryId?: number } = {
        page: productsPage,
        pageSize: productsFilters.pageSize || 50,
        hasStock: productsFilters.hasStock,
        deleted: productsFilters.deleted,
        search: productsSearch || undefined,
        sortBy,
        sortOrder,
        categoryId: selectedCategoryId || undefined,
      };
      const res = await adminListProducts(syncSecret, filters);
      setProducts(res.products);
      setAvailableCategories(res.categories || []);
      setProductsTotalPages(res.pagination.totalPages);
    } catch (e: any) {
      toast.error('Error al cargar productos', { description: e?.message });
    } finally {
      setProductsLoading(false);
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="h-3 w-3 inline ml-1 text-stone-400" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-3 w-3 inline ml-1 text-stone-900" />
    ) : (
      <ArrowDown className="h-3 w-3 inline ml-1 text-stone-900" />
    );
  };

  const handleDeleteProducts = async () => {
    if (selectedProductIds.size === 0) {
      toast.error('Selecciona al menos un producto');
      return;
    }
    if (!syncSecret) return;
    if (!confirm(`¿Eliminar ${selectedProductIds.size} producto(s)?`)) return;

    try {
      await adminDeleteProducts(syncSecret, Array.from(selectedProductIds));
      toast.success(`${selectedProductIds.size} producto(s) eliminado(s)`);
      setSelectedProductIds(new Set());
      loadProducts();
      if (activeTab === 'stats') loadStats();
    } catch (e: any) {
      toast.error('Error al eliminar productos', { description: e?.message });
    }
  };

  const handleRestoreProducts = async () => {
    if (selectedProductIds.size === 0) {
      toast.error('Selecciona al menos un producto');
      return;
    }
    if (!syncSecret) return;

    try {
      await adminRestoreProducts(syncSecret, Array.from(selectedProductIds));
      toast.success(`${selectedProductIds.size} producto(s) restaurado(s)`);
      setSelectedProductIds(new Set());
      loadProducts();
      if (activeTab === 'stats') loadStats();
    } catch (e: any) {
      toast.error('Error al restaurar productos', { description: e?.message });
    }
  };

  const loadStats = async () => {
    if (!syncSecret) return;
    setStatsLoading(true);
    try {
      const res = await adminGetStats(syncSecret);
      setStats(res);
    } catch (e: any) {
      toast.error('Error al cargar estadísticas', { description: e?.message });
    } finally {
      setStatsLoading(false);
    }
  };

  const loadLogs = async () => {
    if (!syncSecret) return;
    setLogsLoading(true);
    try {
      const res = await adminGetSyncLogs(syncSecret, 50);
      setLogs(res.logs);
    } catch (e: any) {
      toast.error('Error al cargar logs', { description: e?.message });
    } finally {
      setLogsLoading(false);
    }
  };

  const toggleProductSelection = (id: number) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleProductExpansion = (id: number) => {
    setExpandedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAllProducts = () => {
    if (selectedProductIds.size === products.length) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(products.map((p) => p.id)));
    }
  };

  const chartData = useMemo(() => {
    return logs
      .filter((log) => log.status === 'completed')
      .slice(0, 10)
      .reverse()
      .map((log) => ({
        date: new Date(log.completed_at || log.started_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        productos: log.imported_products + log.updated_products,
      }));
  }, [logs]);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-stone-600 hover:text-stone-900">
            <ArrowLeft className="h-5 w-5" />
            Volver
          </button>
          <div className="text-center">
            <div className="text-lg text-stone-900 font-medium">Admin BigBuy</div>
            <div className="text-xs text-stone-500">Gestión completa de productos y sincronización</div>
          </div>
          <div className="w-24" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!syncSecret && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 mb-6">
            <div className="text-red-600 font-bold text-lg">!</div>
            <div className="flex-1">
              <div className="text-red-900 font-medium">Introduce el BIGBUY_SYNC_SECRET</div>
              <div className="text-sm text-red-700 mt-1">
                Necesitas introducir el sync secret para poder usar las funciones de administración.
              </div>
            </div>
          </div>
        )}

        <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <Tabs.List className="flex gap-2 border-b border-stone-200">
            <Tabs.Trigger
              value="sync"
              className="px-4 py-2 text-sm font-medium text-stone-600 border-b-2 border-transparent data-[state=active]:border-stone-900 data-[state=active]:text-stone-900 hover:text-stone-900 transition-colors"
            >
              <Settings className="h-4 w-4 inline mr-2" />
              Sincronización
            </Tabs.Trigger>
            <Tabs.Trigger
              value="products"
              className="px-4 py-2 text-sm font-medium text-stone-600 border-b-2 border-transparent data-[state=active]:border-stone-900 data-[state=active]:text-stone-900 hover:text-stone-900 transition-colors"
            >
              <FileText className="h-4 w-4 inline mr-2" />
              Productos
            </Tabs.Trigger>
            <Tabs.Trigger
              value="analytics"
              className="px-4 py-2 text-sm font-medium text-stone-600 border-b-2 border-transparent data-[state=active]:border-stone-900 data-[state=active]:text-stone-900 hover:text-stone-900 transition-colors"
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Analytics
            </Tabs.Trigger>
            <Tabs.Trigger
              value="stats"
              className="px-4 py-2 text-sm font-medium text-stone-600 border-b-2 border-transparent data-[state=active]:border-stone-900 data-[state=active]:text-stone-900 hover:text-stone-900 transition-colors"
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Estadísticas
            </Tabs.Trigger>
            <Tabs.Trigger
              value="logs"
              className="px-4 py-2 text-sm font-medium text-stone-600 border-b-2 border-transparent data-[state=active]:border-stone-900 data-[state=active]:text-stone-900 hover:text-stone-900 transition-colors"
            >
              <FileText className="h-4 w-4 inline mr-2" />
              Logs
            </Tabs.Trigger>
            <Tabs.Trigger
              value="admin-user"
              className="px-4 py-2 text-sm font-medium text-stone-600 border-b-2 border-transparent data-[state=active]:border-stone-900 data-[state=active]:text-stone-900 hover:text-stone-900 transition-colors"
            >
              <User className="h-4 w-4 inline mr-2" />
              Crear Admin
            </Tabs.Trigger>
          </Tabs.List>

          {/* Sync Tab */}
          <Tabs.Content value="sync" className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-stone-200 space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm text-stone-700 mb-2">BIGBUY_SYNC_SECRET</label>
                  <input
                    type="text"
                    value={syncSecret}
                    onChange={(e) => setSyncSecret(e.target.value)}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono text-sm"
                    placeholder="Pega aquí el secreto"
                  />
                  <p className="text-xs text-stone-500 mt-1">
                    Se envía en el header <code>x-bigbuy-sync-secret</code>.
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-stone-700 mb-2">Límite productos (MVP)</label>
                  <input
                    type="number"
                    min={1}
                    max={5000}
                    value={productLimit}
                    onChange={(e) => setProductLimit(parseInt(e.target.value || '100', 10))}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={loadConfig}
                  disabled={loading}
                  className="px-4 py-2.5 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 disabled:opacity-60"
                >
                  <Download className="h-4 w-4 inline mr-2" />
                  Cargar config
                </button>
                <button
                  onClick={saveConfig}
                  disabled={loading}
                  className="px-4 py-2.5 bg-stone-900 text-white rounded-lg hover:bg-stone-800 disabled:opacity-60"
                >
                  <Save className="h-4 w-4 inline mr-2" />
                  Guardar config
                </button>
                <button
                  onClick={loadTaxonomies}
                  disabled={loading}
                  className="px-4 py-2.5 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 disabled:opacity-60"
                >
                  <RefreshCw className="h-4 w-4 inline mr-2" />
                  Cargar taxonomías
                </button>
                <button
                  onClick={runSync}
                  disabled={syncing}
                  className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-60"
                >
                  <RefreshCw className={`h-4 w-4 inline mr-2 ${syncing ? 'animate-spin' : ''}`} />
                  Sync catálogo
                </button>
                <button
                  onClick={runSyncFull}
                  disabled={syncingFull}
                  className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
                >
                  <RefreshCw className={`h-4 w-4 inline mr-2 ${syncingFull ? 'animate-spin' : ''}`} />
                  Sync completo
                </button>
                <button
                  onClick={runSyncStock}
                  disabled={syncingStock}
                  className="px-4 py-2.5 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 disabled:opacity-60"
                >
                  <RefreshCw className={`h-4 w-4 inline mr-2 ${syncingStock ? 'animate-spin' : ''}`} />
                  Sync stock
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              <div className="p-4 border-b border-stone-200 flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                    placeholder="Buscar taxonomías por nombre, id o url…"
                  />
                </div>
                <div className="text-sm text-stone-600 whitespace-nowrap">
                  Seleccionadas: <span className="font-medium text-stone-900">{selectedTaxonomyIds.length}</span>
                </div>
              </div>

              <div className="max-h-[520px] overflow-y-auto divide-y divide-stone-100">
                {filteredTaxonomies.map((t) => {
                  const checked = selectedTaxonomyIds.includes(t.id);
                  const isParentTaxonomy = t.parentTaxonomy === 0 || t.parentTaxonomy === null;
                  return (
                    <label
                      key={t.id}
                      className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-stone-50 ${
                        !isParentTaxonomy ? 'opacity-60' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleTaxonomy(t.id)}
                        disabled={!isParentTaxonomy}
                        className="mt-1 w-5 h-5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-stone-900 truncate">{t.name}</div>
                          <div className="text-xs text-stone-500">#{t.id}</div>
                          {isParentTaxonomy && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Nivel 1</span>
                          )}
                          {!isParentTaxonomy && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                              No válida (subtaxonomía)
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-stone-500 mt-1">
                          parent: {t.parentTaxonomy ?? '—'} · {t.url ?? ''}
                        </div>
                      </div>
                    </label>
                  );
                })}

                {filteredTaxonomies.length === 0 && (
                  <div className="p-8 text-center text-stone-600">
                    No hay taxonomías cargadas (o no coinciden con la búsqueda).
                  </div>
                )}
              </div>
            </div>
          </Tabs.Content>

          {/* Products Tab */}
          <Tabs.Content value="products" className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-stone-200">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    value={productsSearch}
                    onChange={(e) => {
                      setProductsSearch(e.target.value);
                      setProductsPage(1);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setProductsPage(1);
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                    placeholder="Buscar por SKU o nombre…"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setProductsFilters({ ...productsFilters, hasStock: undefined, deleted: false });
                      setProductsPage(1);
                    }}
                    className={`px-4 py-2.5 rounded-lg text-sm ${
                      productsFilters.hasStock === undefined && !productsFilters.deleted
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => {
                      setProductsFilters({ ...productsFilters, hasStock: true, deleted: false });
                      setProductsPage(1);
                    }}
                    className={`px-4 py-2.5 rounded-lg text-sm ${
                      productsFilters.hasStock === true
                        ? 'bg-green-600 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    Con stock
                  </button>
                  <button
                    onClick={() => {
                      setProductsFilters({ ...productsFilters, hasStock: false, deleted: false });
                      setProductsPage(1);
                    }}
                    className={`px-4 py-2.5 rounded-lg text-sm ${
                      productsFilters.hasStock === false && !productsFilters.deleted
                        ? 'bg-red-600 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    Sin stock
                  </button>
                  <button
                    onClick={() => {
                      setProductsFilters({ ...productsFilters, deleted: true });
                      setProductsPage(1);
                    }}
                    className={`px-4 py-2.5 rounded-lg text-sm ${
                      productsFilters.deleted
                        ? 'bg-orange-600 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    Eliminados
                  </button>
                </div>
                <div className="flex gap-2 items-center">
                  <select
                    value={selectedCategoryId || ''}
                    onChange={(e) => {
                      setSelectedCategoryId(e.target.value ? Number(e.target.value) : null);
                      setProductsPage(1);
                    }}
                    className="px-4 py-2.5 rounded-lg text-sm border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-stone-500 min-w-[250px]"
                  >
                    <option value="">Todas las categorías</option>
                    {availableCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.parentName ? `${cat.parentName} > ` : ''}{cat.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      setGroupByCategory(!groupByCategory);
                    }}
                    className={`px-4 py-2.5 rounded-lg text-sm ${
                      groupByCategory
                        ? 'bg-blue-600 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {groupByCategory ? '✓ ' : ''}Agrupar por categoría
                  </button>
                </div>
              </div>

              {selectedProductIds.size > 0 && (
                <div className="mb-4 p-3 bg-stone-100 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-stone-700">
                    {selectedProductIds.size} producto(s) seleccionado(s)
                  </span>
                  <div className="flex gap-2">
                    {productsFilters.deleted ? (
                      <button
                        onClick={handleRestoreProducts}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        <RotateCcw className="h-4 w-4 inline mr-1" />
                        Restaurar
                      </button>
                    ) : (
                      <button
                        onClick={handleDeleteProducts}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                      >
                        <Trash2 className="h-4 w-4 inline mr-1" />
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stone-200">
                      <th className="text-left p-3">
                        <button onClick={toggleAllProducts} className="text-stone-600 hover:text-stone-900">
                          {selectedProductIds.size === products.length && products.length > 0 ? (
                            <CheckSquare className="h-5 w-5" />
                          ) : (
                            <Square className="h-5 w-5" />
                          )}
                        </button>
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-stone-700">Imagen</th>
                      <th className="text-left p-3 text-sm font-medium text-stone-700">SKU</th>
                      <th className="text-left p-3 text-sm font-medium text-stone-700">Nombre</th>
                      <th className="text-left p-3 text-sm font-medium text-stone-700">Categoría</th>
                      <th className="text-left p-3 text-sm font-medium text-stone-700">Precio</th>
                      <th className="text-left p-3 text-sm font-medium text-stone-700">Stock</th>
                      <th className="text-left p-3 text-sm font-medium text-stone-700 cursor-pointer hover:text-stone-900" onClick={() => handleSort('views')}>
                        Views <SortIcon column="views" />
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-stone-700 cursor-pointer hover:text-stone-900" onClick={() => handleSort('clicks')}>
                        Clicks <SortIcon column="clicks" />
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-stone-700 cursor-pointer hover:text-stone-900" onClick={() => handleSort('ctr')}>
                        CTR <SortIcon column="ctr" />
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-stone-700 cursor-pointer hover:text-stone-900" onClick={() => handleSort('conversion_rate')}>
                        Conversión <SortIcon column="conversion_rate" />
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-stone-700 cursor-pointer hover:text-stone-900" onClick={() => handleSort('ml_score')}>
                        Score ML <SortIcon column="ml_score" />
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-stone-700">Estado</th>
                      <th className="text-left p-3 text-sm font-medium text-stone-700">Actualizado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsLoading ? (
                      <tr>
                        <td colSpan={14} className="p-8 text-center text-stone-500">
                          Cargando productos…
                        </td>
                      </tr>
                    ) : products.length === 0 ? (
                      <tr>
                        <td colSpan={14} className="p-8 text-center text-stone-500">
                          No hay productos que mostrar
                        </td>
                      </tr>
                    ) : (() => {
                      // Group products by category if enabled
                      const productsToRender = groupByCategory
                        ? (() => {
                            const grouped = new Map<string, AdminProduct[]>();
                            for (const product of products) {
                              const categoryKey = product.categoryName || 'Sin categoría';
                              if (!grouped.has(categoryKey)) {
                                grouped.set(categoryKey, []);
                              }
                              grouped.get(categoryKey)!.push(product);
                            }
                            // Flatten grouped products with category headers
                            const result: Array<{ type: 'header' | 'product'; category?: string; product?: AdminProduct }> = [];
                            for (const [category, prods] of Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
                              result.push({ type: 'header', category });
                              for (const prod of prods) {
                                result.push({ type: 'product', product: prod });
                              }
                            }
                            return result;
                          })()
                        : products.map(p => ({ type: 'product' as const, product: p }));

                      return productsToRender.map((item, idx) => {
                        if (item.type === 'header') {
                          return (
                            <tr key={`category-${item.category}`} className="bg-stone-100 border-b-2 border-stone-300">
                              <td colSpan={14} className="p-4">
                                <h3 className="text-lg font-semibold text-stone-900">
                                  {item.category}
                                  <span className="ml-2 text-sm font-normal text-stone-600">
                                    ({products.filter(p => p.categoryName === item.category).length} productos)
                                  </span>
                                </h3>
                              </td>
                            </tr>
                          );
                        }

                        const product = item.product!;
                        const analytics = product.analytics || {
                          views: 0,
                          clicks: 0,
                          cartAdds: 0,
                          purchases: 0,
                          conversionRate: 0,
                          ctr: 0,
                          mlScore: 0,
                          avgTimeOnPage: 0,
                        };
                        const hasVariants = product.variants && product.variants.length > 0;
                        const isExpanded = expandedProducts.has(product.id);
                        return (
                          <React.Fragment key={product.id}>
                            <tr
                              className="border-b border-stone-100 hover:bg-stone-50"
                            >
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleProductSelection(product.id);
                                    }}
                                  >
                                    {selectedProductIds.has(product.id) ? (
                                      <CheckSquare className="h-5 w-5 text-stone-900" />
                                    ) : (
                                      <Square className="h-5 w-5 text-stone-400" />
                                    )}
                                  </button>
                                  {hasVariants && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleProductExpansion(product.id);
                                      }}
                                      className="text-stone-500 hover:text-stone-900"
                                    >
                                      {isExpanded ? (
                                        <ChevronDown className="h-4 w-4" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4" />
                                      )}
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="p-3">
                                <ProductImageThumbnail imageUrl={product.image} alt={product.name} size={60} />
                              </td>
                              <td className="p-3 text-sm font-mono">{product.sku}</td>
                              <td className="p-3 text-sm">{product.name}</td>
                              <td className="p-3 text-sm text-stone-600">
                                {product.parentCategoryName && (
                                  <div className="text-xs text-stone-400">{product.parentCategoryName}</div>
                                )}
                                <div>{product.categoryName || 'Sin categoría'}</div>
                              </td>
                              <td className="p-3 text-sm">€{product.price.toFixed(2)}</td>
                              <td className="p-3 text-sm">
                                {hasVariants ? (
                                  <span className="text-stone-600">
                                    {product.stock} <span className="text-xs text-stone-500">({product.variants!.length} variantes)</span>
                                  </span>
                                ) : (
                                  product.stock
                                )}
                              </td>
                              <td className="p-3 text-sm text-stone-600">{analytics.views.toLocaleString()}</td>
                              <td className="p-3 text-sm text-stone-600">{analytics.clicks.toLocaleString()}</td>
                              <td className="p-3 text-sm text-stone-600">{analytics.ctr.toFixed(1)}%</td>
                              <td className="p-3 text-sm text-stone-600">{analytics.conversionRate.toFixed(2)}%</td>
                              <td className="p-3 text-sm">
                                <span className={`font-medium ${analytics.mlScore > 50 ? 'text-green-600' : analytics.mlScore > 25 ? 'text-yellow-600' : 'text-stone-400'}`}>
                                  {analytics.mlScore.toFixed(1)}
                                </span>
                              </td>
                              <td className="p-3">
                                {product.deletedAt ? (
                                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Eliminado</span>
                                ) : product.hasStock ? (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Con stock</span>
                                ) : (
                                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Sin stock</span>
                                )}
                              </td>
                              <td className="p-3 text-xs text-stone-500">
                                {new Date(product.updatedAt).toLocaleDateString('es-ES')}
                              </td>
                            </tr>
                            {isExpanded && hasVariants && (
                              <tr key={`${product.id}-variants`} className="bg-stone-50">
                                <td colSpan={14} className="p-4">
                                  <div className="space-y-2">
                                    <div className="text-sm font-medium text-stone-700 mb-2">
                                      Variantes ({product.variants!.length}):
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                      {product.variants!.map((variant) => (
                                        <div
                                          key={variant.id}
                                          className="bg-white border border-stone-200 rounded-lg p-3 text-sm"
                                        >
                                          <div className="font-mono text-xs text-stone-600">{variant.sku}</div>
                                          <div className="mt-1 flex items-center justify-between">
                                            <span className="text-stone-700">
                                              {variant.price ? `€${variant.price.toFixed(2)}` : 'N/A'}
                                            </span>
                                            <span className={`px-2 py-1 rounded text-xs ${
                                              variant.stock > 0 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-red-100 text-red-700'
                                            }`}>
                                              Stock: {variant.stock}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>

              {productsTotalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setProductsPage((p) => Math.max(1, p - 1));
                    }}
                    disabled={productsPage === 1}
                    className="px-4 py-2 border border-stone-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-stone-600">
                    Página {productsPage} de {productsTotalPages}
                  </span>
                  <button
                    onClick={() => {
                      setProductsPage((p) => Math.min(productsTotalPages, p + 1));
                    }}
                    disabled={productsPage === productsTotalPages}
                    className="px-4 py-2 border border-stone-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          </Tabs.Content>

          {/* Analytics Tab */}
          <Tabs.Content value="analytics" className="space-y-6">
            {syncSecret ? (
              <AnalyticsDashboard syncSecret={syncSecret} />
            ) : (
              <div className="bg-white rounded-xl p-8 border border-stone-200 text-center text-stone-500">
                Introduce el BIGBUY_SYNC_SECRET para ver analytics
              </div>
            )}
          </Tabs.Content>

          {/* Stats Tab */}
          <Tabs.Content value="stats" className="space-y-6">
            {statsLoading ? (
              <div className="bg-white rounded-xl p-8 border border-stone-200 text-center text-stone-500">
                Cargando estadísticas…
              </div>
            ) : stats ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-6 border border-stone-200">
                    <div className="text-sm text-stone-600 mb-1">Total Productos</div>
                    <div className="text-3xl font-bold text-stone-900">{stats.totalProducts}</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 border border-stone-200">
                    <div className="text-sm text-stone-600 mb-1">Con Stock</div>
                    <div className="text-3xl font-bold text-green-600">{stats.productsWithStock}</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 border border-stone-200">
                    <div className="text-sm text-stone-600 mb-1">Sin Stock</div>
                    <div className="text-3xl font-bold text-red-600">{stats.productsWithoutStock}</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 border border-stone-200">
                    <div className="text-sm text-stone-600 mb-1">Eliminados</div>
                    <div className="text-3xl font-bold text-orange-600">{stats.deletedProducts}</div>
                  </div>
                </div>

                {stats.lastSync && (
                  <div className="bg-white rounded-xl p-6 border border-stone-200">
                    <h3 className="text-lg font-medium text-stone-900 mb-4">Última Sincronización</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <div className="text-stone-600">Fecha</div>
                        <div className="font-medium">
                          {new Date(stats.lastSync.completedAt).toLocaleString('es-ES')}
                        </div>
                      </div>
                      <div>
                        <div className="text-stone-600">Importados</div>
                        <div className="font-medium">{stats.lastSync.importedProducts}</div>
                      </div>
                      <div>
                        <div className="text-stone-600">Actualizados</div>
                        <div className="font-medium">{stats.lastSync.updatedProducts}</div>
                      </div>
                      <div>
                        <div className="text-stone-600">Variantes</div>
                        <div className="font-medium">{stats.lastSync.importedVariants}</div>
                      </div>
                      <div>
                        <div className="text-stone-600">Duración</div>
                        <div className="font-medium">{(stats.lastSync.durationMs / 1000).toFixed(1)}s</div>
                      </div>
                    </div>
                  </div>
                )}

                {chartData.length > 0 && (
                  <div className="bg-white rounded-xl p-6 border border-stone-200">
                    <h3 className="text-lg font-medium text-stone-900 mb-4">Sincronizaciones Recientes</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="productos" stroke="#059669" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl p-8 border border-stone-200 text-center text-stone-500">
                No hay estadísticas disponibles
              </div>
            )}
          </Tabs.Content>

          {/* Logs Tab */}
          <Tabs.Content value="logs" className="space-y-6">
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              {logsLoading ? (
                <div className="p-8 text-center text-stone-500">Cargando logs…</div>
              ) : logs.length === 0 ? (
                <div className="p-8 text-center text-stone-500">No hay logs disponibles</div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {logs.map((log) => (
                    <div key={log.id} className="p-4 hover:bg-stone-50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                log.status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : log.status === 'failed'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {log.status === 'completed' ? 'Completado' : log.status === 'failed' ? 'Fallido' : 'En curso'}
                            </span>
                            <span className="text-sm text-stone-600">
                              {new Date(log.started_at).toLocaleString('es-ES')}
                            </span>
                          </div>
                        </div>
                        {log.duration_ms && (
                          <span className="text-xs text-stone-500">{(log.duration_ms / 1000).toFixed(1)}s</span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-stone-600">
                        <div>
                          <span className="font-medium">Importados:</span> {log.imported_products}
                        </div>
                        <div>
                          <span className="font-medium">Actualizados:</span> {log.updated_products}
                        </div>
                        <div>
                          <span className="font-medium">Variantes:</span> {log.imported_variants}
                        </div>
                        <div>
                          <span className="font-medium">Sin stock:</span> {log.skipped_no_stock}
                        </div>
                        <div>
                          <span className="font-medium">Eliminados:</span> {log.deleted_products}
                        </div>
                      </div>
                      {log.error_message && (
                        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                          {log.error_message}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Tabs.Content>

          {/* Create Admin User Tab */}
          <Tabs.Content value="admin-user" className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-stone-200">
              <h3 className="text-lg font-semibold text-stone-900 mb-4">Crear Usuario Administrador</h3>
              <p className="text-sm text-stone-600 mb-6">
                Crea un nuevo usuario con permisos de administrador. Este usuario podrá acceder al panel de administración.
              </p>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                    placeholder="admin@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-900"
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                  />
                </div>

                <button
                  onClick={handleCreateAdmin}
                  disabled={creatingAdmin || !syncSecret || !adminEmail || !adminPassword}
                  className="w-full px-4 py-3 bg-stone-900 text-white rounded-lg hover:bg-stone-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {creatingAdmin ? 'Creando usuario...' : 'Crear Usuario Admin'}
                </button>

                {!syncSecret && (
                  <p className="text-sm text-red-600">
                    ⚠️ Necesitas configurar el BIGBUY_SYNC_SECRET primero
                  </p>
                )}
              </div>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}
