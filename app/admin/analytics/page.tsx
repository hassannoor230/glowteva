'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  ShoppingBag,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Filter,
  Download,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    avgOrderValue: number;
    conversionRate: number;
    revenueChange: number;
    ordersChange: number;
    customersChange: number;
    conversionChange: number;
  };
  revenueByPeriod: { period: string; revenue: number; orders: number; customers: number }[];
  ordersByStatus: { status: string; count: number }[];
  revenueByCategory: { category: string; revenue: number; orders: number }[];
  topProducts: { name: string; revenue: number; unitsSold: number }[];
  topCustomers: { name: string; email: string; orders: number; totalSpent: number }[];
  trafficSources: { source: string; visitors: number; conversions: number; revenue: number }[];
  deviceBreakdown: { device: string; visitors: number; percentage: number }[];
}

const COLORS = ['#C5A46E', '#4A5D4E', '#2C3E2D', '#DED7CC', '#8B7D6B', '#A6987A'];

const periodOptions = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '1y', label: 'Last Year' },
  { value: 'all', label: 'All Time' },
];

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [comparisonPeriod, setComparisonPeriod] = useState('previous');

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    if (user && user.role !== 'admin') { router.push('/account'); return; }
    fetchAnalytics();
  }, [token, user, router, period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: AnalyticsData }>(`/admin/analytics?period=${period}`, { token });
      setData(res.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodLabel = (value: string) => {
    return periodOptions.find(p => p.value === value)?.label || value;
  };

  const formatChange = (value: number) => {
    const prefix = value >= 0 ? '+' : '';
    return `${prefix}${value.toFixed(1)}%`;
  };

  const getChangeColor = (value: number) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="pt-28 pb-20 min-h-screen bg-muted-cream/30">
        <div className="container-luxury text-center py-32">
          <p className="font-serif text-2xl text-forest mb-4">Access Restricted</p>
          <p className="text-soft-green mb-6">Please login as an admin to access this page.</p>
          <button onClick={() => router.push('/login')} className="btn-primary">Go to Login</button>
        </div>
      </div>
    );
  }

  const overviewCards = [
    { label: 'Total Revenue', value: data?.overview.totalRevenue ? formatPrice(data.overview.totalRevenue) : '$0', change: data?.overview.revenueChange || 0, icon: DollarSign, color: 'text-forest', format: 'currency' },
    { label: 'Total Orders', value: data?.overview.totalOrders?.toLocaleString() || '0', change: data?.overview.ordersChange || 0, icon: ShoppingBag, color: 'text-forest', format: 'number' },
    { label: 'Customers', value: data?.overview.totalCustomers?.toLocaleString() || '0', change: data?.overview.customersChange || 0, icon: Users, color: 'text-forest', format: 'number' },
    { label: 'Conversion Rate', value: `${data?.overview.conversionRate?.toFixed(2) || '0'}%`, change: data?.overview.conversionChange || 0, icon: TrendingUp, color: 'text-gold', format: 'percent' },
  ];

  const revenueData = data?.revenueByPeriod?.map(item => ({
    period: item.period,
    revenue: item.revenue,
    orders: item.orders,
  })) || [];

  const statusData = data?.ordersByStatus?.map(item => {
    const status = item?.status;
    return {
      status: status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown',
      count: item.count,
    };
  }) || [];

  const categoryData = data?.revenueByCategory?.map((item, i) => ({
    category: item.category,
    revenue: item.revenue,
    orders: item.orders,
    color: COLORS[i % COLORS.length],
  })) || [];

  return (
    <div className="pt-4 pb-20 min-h-screen bg-muted-cream/30">
      <div className="container-luxury">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <p className="eyebrow mb-2">ADMIN / ANALYTICS</p>
            <h1 className="heading-section">Analytics</h1>
          </div>
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Download size={18} />
              Export Report
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card-luxury p-6 animate-pulse">
                <div className="h-4 bg-muted-cream rounded w-3/4 mb-4" />
                <div className="h-8 bg-muted-cream rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : data ? (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
              {overviewCards.map((stat) => (
                <div key={stat.label} className="card-luxury p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs tracking-wide uppercase text-soft-green mb-2">{stat.label}</p>
                      <p className="text-2xl font-serif {stat.color}">{stat.value}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className={cn('text-xs font-medium', getChangeColor(stat.change))}>
                          {stat.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {formatChange(stat.change)}
                        </span>
                        <span className="text-xs text-soft-green/70">vs last period</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gold/10 rounded-xl text-gold">
                      <stat.icon size={24} aria-hidden="true" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              {/* Revenue Trend */}
              <div className="card-luxury p-6">
                <h2 className="font-serif text-lg text-forest mb-6">Revenue Trend</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C5A46E" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#C5A46E" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#DED7CC" />
                      <XAxis dataKey="period" stroke="#4A5D4E" fontSize={12} />
                      <YAxis stroke="#4A5D4E" fontSize={12} tickFormatter={(val) => formatPrice(val)} />
                      <Tooltip
                        formatter={(value: number) => [formatPrice(value), 'Revenue']}
                        contentStyle={{ backgroundColor: '#2C3E2D', border: 'none', borderRadius: '8px' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#C5A46E"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Orders by Status */}
              <div className="card-luxury p-6">
                <h2 className="font-serif text-lg text-forest mb-6">Orders by Status</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData.length > 0 ? statusData : [{ status: 'No Data', count: 1 }]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="count"
                        nameKey="status"
                        label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {statusData.map((_, i) => (
                          <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [value.toString(), 'Orders']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              {/* Revenue by Category */}
              <div className="card-luxury p-6">
                <h2 className="font-serif text-lg text-forest mb-6">Revenue by Category</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData.length > 0 ? categoryData : [{ category: 'No Data', revenue: 0 }]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#DED7CC" />
                      <XAxis dataKey="category" stroke="#4A5D4E" fontSize={12} />
                      <YAxis stroke="#4A5D4E" fontSize={12} tickFormatter={(val) => formatPrice(val)} />
                      <Tooltip formatter={(value: number) => [formatPrice(value), 'Revenue']} />
                      <Bar dataKey="revenue">
                        {categoryData.map((_, i) => (
                          <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Orders Trend */}
              <div className="card-luxury p-6">
                <h2 className="font-serif text-lg text-forest mb-6">Orders Trend</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#DED7CC" />
                      <XAxis dataKey="period" stroke="#4A5D4E" fontSize={12} />
                      <YAxis stroke="#4A5D4E" fontSize={12} />
                      <Tooltip formatter={(value: number) => [value.toString(), 'Orders']} />
                      <Line
                        type="monotone"
                        dataKey="orders"
                        stroke="#4A5D4E"
                        strokeWidth={2}
                        dot={{ fill: '#C5A46E', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: '#C5A46E' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Charts Row 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              {/* Traffic Sources */}
              <div className="card-luxury p-6">
                <h2 className="font-serif text-lg text-forest mb-6">Traffic Sources</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data?.trafficSources?.length > 0 ? data.trafficSources : [{ source: 'No Data', visitors: 1 }]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="visitors"
                        nameKey="source"
                        label={({ source, percent }) => `${source} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {data?.trafficSources?.map((_, i) => (
                          <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [value.toString(), 'Visitors']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Device Breakdown */}
              <div className="card-luxury p-6">
                <h2 className="font-serif text-lg text-forest mb-6">Device Breakdown</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.deviceBreakdown?.length > 0 ? data.deviceBreakdown : [{ device: 'No Data', visitors: 0 }]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#DED7CC" />
                      <XAxis dataKey="device" stroke="#4A5D4E" fontSize={12} />
                      <YAxis stroke="#4A5D4E" fontSize={12} />
                      <Tooltip formatter={(value: number) => [value.toString(), 'Visitors']} />
                      <Bar dataKey="visitors" fill="#C5A46E" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Top Products & Customers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Products */}
              <div className="card-luxury p-6">
                <h2 className="font-serif text-lg text-forest mb-6">Top Products by Revenue</h2>
                <div className="space-y-4">
                  {data?.topProducts?.slice(0, 10).map((product, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-soft-border last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-gold/20 text-gold text-sm font-medium flex items-center justify-center">{i + 1}</span>
                        <div>
                          <p className="text-sm font-medium text-forest line-clamp-1">{product.name}</p>
                          <p className="text-xs text-soft-green">{product.unitsSold} units sold</p>
                        </div>
                      </div>
                      <p className="text-sm text-gold font-medium">{formatPrice(product.revenue)}</p>
                    </div>
                  ))}
                  {(!data?.topProducts || data.topProducts.length === 0) && (
                    <p className="text-soft-green text-center py-8">No product data available</p>
                  )}
                </div>
              </div>

              {/* Top Customers */}
              <div className="card-luxury p-6">
                <h2 className="font-serif text-lg text-forest mb-6">Top Customers by Spend</h2>
                <div className="space-y-4">
                  {data?.topCustomers?.slice(0, 10).map((customer, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-soft-border last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-gold/20 text-gold text-sm font-medium flex items-center justify-center">{i + 1}</span>
                        <div>
                          <p className="text-sm font-medium text-forest">{customer.name}</p>
                          <p className="text-xs text-soft-green">{customer.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gold font-medium">{formatPrice(customer.totalSpent)}</p>
                        <p className="text-xs text-soft-green">{customer.orders} orders</p>
                      </div>
                    </div>
                  ))}
                  {(!data?.topCustomers || data.topCustomers.length === 0) && (
                    <p className="text-soft-green text-center py-8">No customer data available</p>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-soft-green">Unable to load analytics data</p>
          </div>
        )}
      </div>
    </div>
  );
}