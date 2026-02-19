import React, { useEffect, useState, useMemo } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminGetOrders, adminGetStats, adminGetSyncLogs } from '../utils/bigbuy/edge';
import { toast } from 'sonner@2.0.3';

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  email: string;
  first_name: string;
  last_name: string;
  total: number;
  created_at: string;
};

interface DashboardOverviewProps {
  syncSecret: string;
  onNavigateToOrders?: () => void;
  onNavigateToProducts?: () => void;
  onNavigateToSync?: () => void;
}

export function DashboardOverview({
  syncSecret,
  onNavigateToOrders,
  onNavigateToProducts,
  onNavigateToSync,
}: DashboardOverviewProps) {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [stats, setStats] = useState<{
    totalProducts: number;
    productsWithStock: number;
    productsWithoutStock: number;
  } | null>(null);
  const [logs, setLogs] = useState<Array<{ status: string; created_at: string; error_message?: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!syncSecret) {
      setLoading(false);
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const [ordersRes, statsRes, logsRes] = await Promise.all([
          adminGetOrders(syncSecret, { limit: 100 }),
          adminGetStats(syncSecret),
          adminGetSyncLogs(syncSecret, 20),
        ]);
        setOrders(ordersRes.orders ?? []);
        setStats(statsRes ?? null);
        setLogs(logsRes.logs ?? []);
      } catch (e: any) {
        toast.error('Error al cargar el dashboard', { description: e?.message });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [syncSecret]);

  // KPIs computed
  const completedOrders = useMemo(
    () => orders.filter((o) => o.status === 'completed'),
    [orders]
  );
  const pendingOrders = useMemo(
    () => orders.filter((o) => o.status === 'pending'),
    [orders]
  );
  const totalRevenue = useMemo(
    () => completedOrders.reduce((s, o) => s + Number(o.total || 0), 0),
    [completedOrders]
  );
  const uniqueEmails = useMemo(
    () => new Set(orders.map((o) => o.email)).size,
    [orders]
  );

  // Tendencias (mes actual vs mes anterior)
  const { revenueTrend } = useMemo(() => {
    const now = new Date();
    const thisMonth = completedOrders.filter(
      (o) => new Date(o.created_at).getMonth() === now.getMonth() &&
             new Date(o.created_at).getFullYear() === now.getFullYear()
    );
    const lastMonth = completedOrders.filter((o) => {
      const d = new Date(o.created_at);
      const prev = new Date(now.getFullYear(), now.getMonth() - 1);
      return d.getMonth() === prev.getMonth() && d.getFullYear() === prev.getFullYear();
    });
    const thisRevenue = thisMonth.reduce((s, o) => s + Number(o.total || 0), 0);
    const lastRevenue = lastMonth.reduce((s, o) => s + Number(o.total || 0), 0);
    const revPct = lastRevenue > 0 ? ((thisRevenue - lastRevenue) / lastRevenue) * 100 : 0;
    return {
      revenueTrend: revPct,
    };
  }, [completedOrders]);

  // Chart: ventas últimos 30 días
  const chartData = useMemo(() => {
    const now = new Date();
    const days: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days[key] = 0;
    }
    completedOrders.forEach((o) => {
      const key = o.created_at?.slice(0, 10);
      if (key && days[key] !== undefined) {
        days[key] += Number(o.total || 0);
      }
    });
    return Object.entries(days).map(([date, ventas]) => ({
      date: new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      ventas: Math.round(ventas * 100) / 100,
    }));
  }, [completedOrders]);

  // Alertas
  const alerts = useMemo(() => {
    const items: { id: string; type: 'warning' | 'error'; message: string; onClick?: () => void }[] = [];
    if (stats && stats.productsWithoutStock > 0) {
      items.push({
        id: 'low-stock',
        type: 'warning',
        message: `${stats.productsWithoutStock} producto(s) sin stock`,
        onClick: onNavigateToProducts,
      });
    }
    const lastFailed = logs.find((l) => l.status === 'failed');
    if (lastFailed) {
      const timeAgo = lastFailed.created_at
        ? `${Math.round((Date.now() - new Date(lastFailed.created_at).getTime()) / 3600000)} horas`
        : 'recientemente';
      items.push({
        id: 'sync-failed',
        type: 'error',
        message: `Sincronización fallida hace ${timeAgo}`,
        onClick: onNavigateToSync,
      });
    }
    return items;
  }, [stats, logs, onNavigateToProducts, onNavigateToSync]);

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 8),
    [orders]
  );

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-emerald-100 text-emerald-700',
      pending: 'bg-amber-100 text-amber-700',
      cancelled: 'bg-red-100 text-red-700',
      failed: 'bg-red-100 text-red-700',
    };
    const style = styles[status] ?? 'bg-slate-100 text-slate-600';
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
        {status === 'completed' ? 'Completado' : status === 'pending' ? 'Pendiente' : status === 'cancelled' ? 'Cancelado' : status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-10 w-10 text-[#008080] animate-spin" />
          <p className="text-slate-600 text-sm">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Ingresos Totales</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €
              </p>
              <p className={`text-xs mt-1 flex items-center gap-1 ${revenueTrend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {revenueTrend >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5 rotate-180" />}
                {revenueTrend !== 0
                  ? `${revenueTrend >= 0 ? '+' : ''}${revenueTrend.toFixed(1)}% vs mes anterior`
                  : `${completedOrders.length} pedidos completados`}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Pedidos Pendientes</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{pendingOrders.length}</p>
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                {pendingOrders.length > 0 ? (
                  <>
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Requieren atención
                  </>
                ) : (
                  <span className="text-slate-500">Sin pendientes</span>
                )}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Productos Activos</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {stats?.productsWithStock ?? 0}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                de {stats?.totalProducts ?? 0} total
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Clientes Únicos</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{uniqueEmails}</p>
              <p className="text-xs text-slate-500 mt-1">
                Emails en pedidos
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-violet-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart + Alerts layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Ventas últimos 30 días</h3>
          {chartData.some((d) => d.ventas > 0) ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `${v}€`} />
                  <Tooltip
                    formatter={(value: number) => [`${value.toFixed(2)} €`, 'Ventas']}
                    labelFormatter={(label) => `Fecha: ${label}`}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ventas"
                    stroke="#008080"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <div className="text-center text-slate-500">
                <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Sin datos de ventas en los últimos 30 días</p>
              </div>
            </div>
          )}
        </div>

        {/* Alerts panel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 h-fit">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Alertas</h3>
          {alerts.length === 0 ? (
            <div className="text-sm text-slate-500 py-4">
              <p className="flex items-center gap-2 text-emerald-600">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                Todo en orden
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {alerts.map((a) => (
                <li key={a.id}>
                  <button
                    onClick={a.onClick}
                    className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                      a.type === 'error'
                        ? 'bg-red-50 border border-red-100 hover:bg-red-100/80'
                        : 'bg-amber-50 border border-amber-100 hover:bg-amber-100/80'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <AlertTriangle
                        className={`h-4 w-4 flex-shrink-0 ${
                          a.type === 'error' ? 'text-red-600' : 'text-amber-600'
                        }`}
                      />
                      <span
                        className={
                          a.type === 'error' ? 'text-red-800' : 'text-amber-800'
                        }
                      >
                        {a.message}
                      </span>
                    </span>
                    {a.onClick && (
                      <span className="text-xs text-slate-500 mt-1 block">
                        Clic para ver →
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent orders table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Órdenes Recientes</h3>
          {onNavigateToOrders && (
            <button
              onClick={onNavigateToOrders}
              className="text-sm font-medium text-[#008080] hover:text-[#006666] transition-colors"
            >
              Ver todas →
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Pedido
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No hay pedidos recientes
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-slate-900">{order.order_number}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-slate-900 text-sm">
                          {order.first_name} {order.last_name}
                        </p>
                        <p className="text-xs text-slate-500 truncate max-w-[180px]">
                          {order.email}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {new Date(order.created_at).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {Number(order.total).toFixed(2)} €
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
