'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
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

interface Stats {
  totalRevenue: number;
  ordersToday: number;
  newCustomers: number;
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  lowStock: { name: string; stock: number; sku: string }[];
  recentOrders: any[];
  topProducts: { name: string; totalSold: number; revenue: number }[];
  revenueByMonth: { _id: { year: number; month: number }; revenue: number; orders: number }[];
  ordersByStatus: { _id: string; count: number }[];
  revenueByCategory: { _id: string; revenue: number; count: number }[];
}

const statCards = [
  { label: 'Total Revenue', key: 'totalRevenue', icon: TrendingUp, format: 'currency', color: 'text-forest' },
  { label: 'Orders Today', key: 'ordersToday', icon: ShoppingBag, format: 'number', color: 'text-forest' },
  { label: 'Total Orders', key: 'totalOrders', icon: Package, format: 'number', color: 'text-forest' },
  { label: 'Customers', key: 'totalCustomers', icon: Users, format: 'number', color: 'text-forest' },
  { label: 'Products', key: 'totalProducts', icon: Package, format: 'number', color: 'text-forest' },
  { label: 'New Customers', key: 'newCustomers', icon: Users, format: 'number', color: 'text-forest' },
];

const COLORS = ['#C5A46E', '#4A5D4E', '#2C3E2D', '#DED7CC', '#F8F5F0'];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    if (user && user.role !== 'admin') { router.push('/account'); return; }
    api.get<{ data: Stats }>('/admin/stats', { token })
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, user, router]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="pt-28 pb-20 min-h-screen bg-muted-cream/30">
        <div className="container-luxury text-center py-32">
          <p className="font-serif text-2xl text-forest mb-4">Access Restricted</p>
          <p className="text-soft-green mb-6">Please login as an admin to access the dashboard.</p>
          <button onClick={() => router.push('/login')} className="btn-primary">Go to Login</button>
        </div>
      </div>
    );
  }

  const formatValue = (value: number, format: string) => {
    if (format === 'currency') return formatPrice(value);
    return value.toLocaleString();
  };

  const getMonthName = (month: number) => {
    return new Date(2024, month - 1).toLocaleString('default', { month: 'short' });
  };

  const chartData = stats?.revenueByMonth?.map((item) => ({
    month: getMonthName(item._id.month),
    revenue: item.revenue,
    orders: item.orders,
  })) || [];

  const statusData = stats?.ordersByStatus?.map((item) => ({
    status: item._id,
    count: item.count,
  })) || [];

  const categoryData = stats?.revenueByCategory?.map((item, i) => ({
    category: item._id,
    revenue: item.revenue,
    count: item.count,
    color: COLORS[i % COLORS.length],
  })) || [];

  return (
    <div className="pt-4 pb-20 min-h-screen bg-muted-cream/30">
      <div className="container-luxury">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <p className="eyebrow mb-2">ADMIN</p>
            <h1 className="heading-section">Dashboard</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/shop" className="btn-ghost text-sm">View Store</Link>
            <button onClick={async () => { await logout(); router.push('/'); }} className="btn-outline text-sm px-4 py-2 border border-soft-border">
              Sign Out
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 md:gap-6 mb-10">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card-luxury p-6 animate-pulse">
                <div className="h-4 bg-muted-cream rounded w-3/4 mb-4" />
                <div className="h-8 bg-muted-cream rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : stats ? (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 md:gap-6 mb-10">
              {statCards.map((s) => (
                <div key={s.key} className="card-luxury p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs tracking-wide uppercase text-soft-green mb-2">{s.label}</p>
                      <p className="text-2xl font-serif {s.color}">{formatValue(stats[s.key as keyof Stats] as number, s.format)}</p>
                    </div>
                    <div className="p-3 bg-gold/10 rounded-xl text-gold">
                      <s.icon size={24} aria-hidden="true" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              {/* Revenue Chart */}
              <div className="card-luxury p-6">
                <h2 className="font-serif text-lg text-forest mb-6">Revenue Overview (Last 6 Months)</h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C5A46E" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#C5A46E" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#DED7CC" />
                      <XAxis dataKey="month" stroke="#4A5D4E" fontSize={12} />
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
                <div className="h-72">
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
                <div className="h-72">
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
                <h2 className="font-serif text-lg text-forest mb-6">Orders Trend (Last 6 Months)</h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#DED7CC" />
                      <XAxis dataKey="month" stroke="#4A5D4E" fontSize={12} />
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

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Orders */}
              <div className="card-luxury p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif text-lg text-forest">Recent Orders</h2>
                  <Link href="/admin/orders" className="btn-ghost text-sm">View All</Link>
                </div>
                {stats.recentOrders?.length === 0 ? (
                  <p className="text-soft-green text-sm">No orders yet</p>
                ) : (
                  <div className="space-y-3">
                    {stats.recentOrders?.slice(0, 8).map((o: any) => (
                      <div key={o._id} className="flex justify-between items-center py-2 border-b border-soft-border last:border-0">
                        <div>
                          <p className="text-sm font-medium text-forest">{o.orderNumber}</p>
                          <p className="text-xs text-soft-green">{o.user?.name || 'Guest'} · {o.orderStatus}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-forest">{formatPrice(o.total)}</p>
                          <p className="text-xs text-soft-green">{formatDate(o.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Low Stock & Top Products */}
              <div className="card-luxury p-6">
                <h2 className="font-serif text-lg text-forest mb-6">Low Stock Alert</h2>
                {stats.lowStock?.length === 0 ? (
                  <p className="text-soft-green text-sm">All products well stocked</p>
                ) : (
                  <div className="space-y-3 mb-8">
                    {stats.lowStock?.slice(0, 5).map((p) => (
                      <div key={p.sku} className="flex justify-between items-center py-2 border-b border-soft-border last:border-0">
                        <div>
                          <p className="text-sm font-medium text-forest">{p.name}</p>
                          <p className="text-xs text-soft-green">{p.sku}</p>
                        </div>
                        <p className={`text-sm font-medium ${p.stock <= 5 ? 'text-red-600' : 'text-gold'}`}>{p.stock} left</p>
                      </div>
                    ))}
                  </div>
                )}

                {stats.topProducts?.length > 0 && (
                  <div className="border-t border-soft-border pt-6">
                    <h2 className="font-serif text-lg text-forest mb-4">Top Products</h2>
                    <div className="space-y-3">
                      {stats.topProducts.slice(0, 5).map((p, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-soft-border last:border-0">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-gold/20 text-gold text-xs font-medium flex items-center justify-center">{i + 1}</span>
                            <div>
                              <p className="text-sm font-medium text-forest line-clamp-1">{p.name}</p>
                              <p className="text-xs text-soft-green">{p.totalSold} sold</p>
                            </div>
                          </div>
                          <p className="text-sm text-gold">{formatPrice(p.revenue)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <p className="text-soft-green">Unable to load dashboard data. Ensure the API is running and you are logged in as admin.</p>
        )}
      </div>
    </div>
  );
}