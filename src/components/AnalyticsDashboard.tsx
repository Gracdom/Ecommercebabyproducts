import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { adminGetAnalyticsSummary } from '@/utils/bigbuy/edge';
import { Loader2 } from 'lucide-react';

interface AnalyticsDashboardProps {
  syncSecret: string;
  dateRange?: 'day' | 'week' | 'month';
}

const COLORS = ['#059669', '#dc2626', '#ea580c', '#ca8a04', '#2563eb'];

export function AnalyticsDashboard({ syncSecret, dateRange = 'week' }: AnalyticsDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [eventDistribution, setEventDistribution] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [syncSecret, dateRange]);

  const loadAnalytics = async () => {
    if (!syncSecret) return;
    setLoading(true);
    try {
      const res = await adminGetAnalyticsSummary(syncSecret, { limit: 100 });
      const summaries = res.summaries || [];
      
      setSummaryData(summaries);
      
      // Top 10 by conversion rate
      const top = summaries
        .filter((s: any) => s.conversion_rate > 0)
        .sort((a: any, b: any) => b.conversion_rate - a.conversion_rate)
        .slice(0, 10);
      setTopProducts(top);
      
      // Event distribution
      const totalViews = summaries.reduce((sum: number, s: any) => sum + (s.total_views || 0), 0);
      const totalClicks = summaries.reduce((sum: number, s: any) => sum + (s.total_clicks || 0), 0);
      const totalCartAdds = summaries.reduce((sum: number, s: any) => sum + (s.total_cart_adds || 0), 0);
      const totalPurchases = summaries.reduce((sum: number, s: any) => sum + (s.total_purchases || 0), 0);
      
      setEventDistribution([
        { name: 'Views', value: totalViews },
        { name: 'Clicks', value: totalClicks },
        { name: 'Cart Adds', value: totalCartAdds },
        { name: 'Purchases', value: totalPurchases },
      ]);
    } catch (error: any) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
      </div>
    );
  }

  // Prepare time series data (last 7 days)
  const timeSeriesData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      views: Math.floor(Math.random() * 100) + 50, // Placeholder - would come from actual time-series query
      clicks: Math.floor(Math.random() * 50) + 20,
      purchases: Math.floor(Math.random() * 10) + 2,
    };
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-stone-200">
          <div className="text-sm text-stone-600 mb-1">Total Views</div>
          <div className="text-3xl font-bold text-stone-900">
            {summaryData.reduce((sum: number, s: any) => sum + (s.total_views || 0), 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-stone-200">
          <div className="text-sm text-stone-600 mb-1">Total Clicks</div>
          <div className="text-3xl font-bold text-blue-600">
            {summaryData.reduce((sum: number, s: any) => sum + (s.total_clicks || 0), 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-stone-200">
          <div className="text-sm text-stone-600 mb-1">Total Purchases</div>
          <div className="text-3xl font-bold text-green-600">
            {summaryData.reduce((sum: number, s: any) => sum + (s.total_purchases || 0), 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-stone-200">
          <div className="text-sm text-stone-600 mb-1">Avg Conversion Rate</div>
          <div className="text-3xl font-bold text-purple-600">
            {summaryData.length > 0
              ? (
                  summaryData.reduce((sum: number, s: any) => sum + (s.conversion_rate || 0), 0) /
                  summaryData.length
                ).toFixed(2)
              : '0.00'}
            %
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Series Chart */}
        <div className="bg-white rounded-xl p-6 border border-stone-200">
          <h3 className="text-lg font-medium text-stone-900 mb-4">Evolución de Métricas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="views" stroke="#059669" strokeWidth={2} name="Views" />
              <Line type="monotone" dataKey="clicks" stroke="#2563eb" strokeWidth={2} name="Clicks" />
              <Line type="monotone" dataKey="purchases" stroke="#dc2626" strokeWidth={2} name="Purchases" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Event Distribution Pie Chart */}
        <div className="bg-white rounded-xl p-6 border border-stone-200">
          <h3 className="text-lg font-medium text-stone-900 mb-4">Distribución de Eventos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={eventDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {eventDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products by Conversion */}
      <div className="bg-white rounded-xl p-6 border border-stone-200">
        <h3 className="text-lg font-medium text-stone-900 mb-4">Top 10 Productos por Conversión</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topProducts}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="product_id" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="conversion_rate" fill="#059669" name="Tasa de Conversión (%)" />
            <Bar dataKey="total_purchases" fill="#2563eb" name="Compras" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

