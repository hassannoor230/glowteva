'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Order } from '@/types';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/product/ProductCard';
import JsonLd from '@/components/seo/JsonLd';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token, logout, fetchMe } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState(searchParams.get('tab') || 'overview');
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notifications, setNotifications] = useState<Array<{ _id: string; title: string; message: string; link?: string; isRead: boolean; createdAt: string }>>([]);

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    fetchMe();
    api.get<{ data: Order[] }>('/orders/my', { token })
      .then((res) => setOrders(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
    api.get<{ data: { count: number } }>('/notifications/unread-count', { token })
      .then((res) => setUnreadNotifications(res.data.count))
      .catch(() => {});
    api.get<{ data: { notifications: typeof notifications } }>('/notifications?limit=20', { token })
      .then((res) => setNotifications(res.data.notifications || []))
      .catch(() => {});
  }, [token, router, fetchMe]);

  if (!user) return null;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'orders', label: 'Orders' },
    { id: 'profile', label: 'Profile' },
    { id: 'wishlist', label: 'Wishlist' },
    { id: 'notifications', label: 'Notifications' },
  ];

  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://glowteva.com';

  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'My Account', url: `${base}/account`, description: 'Manage your GlowTeva Organics account.' }} />
      <BreadcrumbJsonLd items={[{ name: 'Home', url: '/' }, { name: 'My Account', url: '/account' }]} />
      <div className="pt-28 pb-20">
        <div className="container-luxury max-w-4xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
            <div>
              <p className="eyebrow mb-2">MY ACCOUNT</p>
              <h1 className="heading-section">Welcome, {user.name.split(' ')[0]}</h1>
            </div>
            <Button variant="outline" onClick={async () => { await logout(); router.push('/'); }}>Sign Out</Button>
          </div>

          <div className="flex gap-6 border-b border-soft-border mb-10 overflow-x-auto">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`pb-3 text-sm tracking-wide whitespace-nowrap border-b-2 transition-colors ${tab === t.id ? 'border-gold text-forest' : 'border-transparent text-soft-green hover:text-forest'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="card-luxury p-6 text-center"><p className="text-3xl font-serif text-forest">{orders.length}</p><p className="text-sm text-soft-green mt-1">Orders</p></div>
                <div className="card-luxury p-6 text-center"><p className="text-3xl font-serif text-forest">{user.wishlist?.length || 0}</p><p className="text-sm text-soft-green mt-1">Wishlist</p></div>
                <div className="card-luxury p-6 text-center"><p className="text-3xl font-serif text-forest">{user.addresses?.length || 0}</p><p className="text-sm text-soft-green mt-1">Addresses</p></div>
                <div className="card-luxury p-6 text-center"><p className="text-3xl font-serif text-forest">{unreadNotifications}</p><p className="text-sm text-soft-green mt-1">Notifications</p></div>
              </div>
              {orders.length > 0 && (
                <div>
                  <h2 className="font-serif text-xl text-forest mb-4">Recent Orders</h2>
                  {orders.slice(0, 3).map((o) => (
                    <div key={o._id} className="flex justify-between items-center py-4 border-b border-soft-border">
                      <div><p className="text-sm font-medium text-forest">{o.orderNumber}</p><p className="text-xs text-soft-green">{formatDate(o.createdAt)} · {o.orderStatus}</p></div>
                      <p className="text-sm text-forest">{formatPrice(o.total)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'orders' && (
            <div>
              {loading ? <p className="text-soft-green">Loading...</p> : orders.length === 0 ? (
                <div className="text-center py-16"><p className="font-serif text-xl text-forest mb-2">No orders yet</p><Link href="/shop" className="btn-primary mt-4 inline-flex">Start Shopping</Link></div>
              ) : (
                <div className="space-y-4">
                  {orders.map((o) => (
                    <div key={o._id} className="card-luxury p-6">
                      <div className="flex flex-wrap justify-between gap-4 mb-4">
                        <div><p className="font-medium text-forest">{o.orderNumber}</p><p className="text-xs text-soft-green">{formatDate(o.createdAt)}</p></div>
                        <div className="text-right"><p className="font-medium text-forest">{formatPrice(o.total)}</p><p className="text-xs text-soft-green">{o.orderStatus} · {o.paymentStatus}</p></div>
                        <Link href={`/account/orders/${o._id}/tracking`} className="text-sm text-forest hover:text-gold">Track order</Link>
                      </div>
                      <div className="space-y-2">
                        {o.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm"><span className="text-soft-green">{item.name} × {item.quantity}</span><span className="text-forest">{formatPrice(item.price * item.quantity)}</span></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'profile' && (
            <div className="card-luxury p-8 max-w-md">
              <h2 className="font-serif text-xl text-forest mb-6">Profile</h2>
              <div className="space-y-4">
                <div><p className="text-xs text-soft-green tracking-wide uppercase">Name</p><p className="text-forest">{user.name}</p></div>
                <div><p className="text-xs text-soft-green tracking-wide uppercase">Email</p><p className="text-forest">{user.email}</p></div>
                <div><p className="text-xs text-soft-green tracking-wide uppercase">Member since</p><p className="text-forest">{user.createdAt ? formatDate(user.createdAt) : '—'}</p></div>
              </div>
            </div>
          )}

          {tab === 'wishlist' && (
            user.wishlist?.length ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                {user.wishlist.map((product) => <ProductCard key={product._id} product={product} />)}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="font-serif text-xl text-forest mb-2">Your wishlist is empty</p>
                <p className="text-soft-green text-sm mb-6">Save products you love for later</p>
                <Link href="/shop" className="btn-secondary">Browse Collection</Link>
              </div>
            )
          )}

          {tab === 'notifications' && (
            <div className="space-y-3">
              {notifications.length === 0 ? <p className="text-soft-green py-12 text-center">No notifications yet.</p> : notifications.map((notification) => (
                <Link key={notification._id} href={notification.link || '#'} className={`block card-luxury p-5 ${!notification.isRead ? 'border-gold' : ''}`}>
                  <p className="font-medium text-forest">{notification.title}</p>
                  <p className="text-sm text-soft-green mt-1">{notification.message}</p>
                  <p className="text-xs text-soft-green/70 mt-3">{formatDate(notification.createdAt)}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function AccountPage() {
  return (
    <Suspense><AccountContent /></Suspense>
  );
}
