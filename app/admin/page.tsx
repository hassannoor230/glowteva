'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';

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
}

export default function AdminPage() {
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

  return (
    <div className="pt-28 pb-20 min-h-screen bg-muted-cream/30">
      <div className="container-luxury">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
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
          <p className="text-soft-green">Loading dashboard...</p>
        ) : stats ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
              {[
                { label: 'Total Revenue', value: formatPrice(stats.totalRevenue) },
                { label: 'Orders Today', value: stats.ordersToday },
                { label: 'Total Orders', value: stats.totalOrders },
                { label: 'Customers', value: stats.totalCustomers },
                { label: 'Products', value: stats.totalProducts },
                { label: 'New Customers', value: stats.newCustomers },
              ].map((s) => (
                <div key={s.label} className="card-luxury p-6">
                  <p className="text-xs tracking-wide uppercase text-soft-green mb-2">{s.label}</p>
                  <p className="text-2xl font-serif text-forest">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card-luxury p-6">
                <h2 className="font-serif text-lg text-forest mb-6">Recent Orders</h2>
                {stats.recentOrders?.length === 0 ? (
                  <p className="text-soft-green text-sm">No orders yet</p>
                ) : (
                  <div className="space-y-3">
                    {stats.recentOrders?.slice(0, 6).map((o: any) => (
                      <div key={o._id} className="flex justify-between items-center py-2 border-b border-soft-border last:border-0">
                        <div>
                          <p className="text-sm font-medium text-forest">{o.orderNumber}</p>
                          <p className="text-xs text-soft-green">{o.user?.name || 'Guest'} · {o.orderStatus}</p>
                        </div>
                        <p className="text-sm text-forest">{formatPrice(o.total)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card-luxury p-6">
                <h2 className="font-serif text-lg text-forest mb-6">Low Stock</h2>
                {stats.lowStock?.length === 0 ? (
                  <p className="text-soft-green text-sm">All products well stocked</p>
                ) : (
                  <div className="space-y-3">
                    {stats.lowStock?.map((p) => (
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
              </div>

              {stats.topProducts?.length > 0 && (
                <div className="card-luxury p-6 lg:col-span-2">
                  <h2 className="font-serif text-lg text-forest mb-6">Top Products</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {stats.topProducts.map((p, i) => (
                      <div key={i} className="text-center p-4 bg-muted-cream/50">
                        <p className="text-sm font-medium text-forest line-clamp-1">{p.name}</p>
                        <p className="text-xs text-soft-green mt-1">{p.totalSold} sold</p>
                        <p className="text-sm text-gold mt-1">{formatPrice(p.revenue)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="text-soft-green">Unable to load dashboard data. Ensure the API is running and you are logged in as admin.</p>
        )}
      </div>
    </div>
  );
}
