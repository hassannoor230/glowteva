'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, Loader2, Package, Truck } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Order {
  _id: string;
  orderNumber: string;
  user?: { name: string; email: string; phone?: string };
  items: Array<{
    name: string;
    thumbnail: string;
    price: number;
    quantity: number;
    product?: { _id: string; slug: string };
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  subtotal: number;
  shippingCost: number;
  discount: number;
  tax: number;
  total: number;
  paymentStatus: string;
  orderStatus: string;
  couponCode?: string;
  createdAt: string;
  tracking?: { courier?: string; trackingNumber?: string; estimatedDelivery?: string; lastUpdate?: string };
}

const statusOptions = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user, token } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tracking, setTracking] = useState({ courier: '', trackingNumber: '', estimatedDelivery: '', lastUpdate: '' });

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'admin') {
      router.push('/account');
      return;
    }

    api.get<{ data: Order }>(`/admin/orders/${params.id}`, { token })
      .then((response) => { setOrder(response.data); setTracking({ courier: response.data.tracking?.courier || '', trackingNumber: response.data.tracking?.trackingNumber || '', estimatedDelivery: response.data.tracking?.estimatedDelivery?.slice(0, 10) || '', lastUpdate: response.data.tracking?.lastUpdate || '' }); })
      .catch((requestError: Error) => setError(requestError.message || 'Order not found'))
      .finally(() => setLoading(false));
  }, [params.id, router, token, user]);

  const updateStatus = async (orderStatus: string) => {
    if (!order) return;
    setSaving(true);
    setError('');
    try {
      const response = await api.put<{ data: Order }>(
        `/admin/orders/${order._id}/status`,
        { orderStatus },
        { token }
      );
      setOrder(response.data);
    } catch (requestError: any) {
      setError(requestError.message || 'Unable to update order status');
    } finally {
      setSaving(false);
    }
  };

  const updateTracking = async () => {
    if (!order) return;
    setSaving(true);
    try {
      const response = await api.put<{ data: Order }>(`/admin/orders/${order._id}/tracking`, tracking, { token });
      setOrder(response.data);
    } catch (requestError: any) {
      setError(requestError.message || 'Unable to update tracking');
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.role !== 'admin') return null;
  if (loading) return <div className="text-soft-green">Loading order...</div>;
  if (!order) {
    return (
      <div className="space-y-4">
        <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm text-soft-green hover:text-forest">
          <ArrowLeft size={16} /> Back to orders
        </Link>
        <p className="text-red-600">{error || 'Order not found'}</p>
      </div>
    );
  }

  const address = order.shippingAddress;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm text-soft-green hover:text-forest mb-3">
            <ArrowLeft size={16} /> Back to orders
          </Link>
          <p className="eyebrow mb-2">ADMIN / ORDERS</p>
          <h1 className="heading-section">Order {order.orderNumber}</h1>
          <p className="text-sm text-soft-green mt-2">Placed {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusOptions.includes(order.orderStatus) ? order.orderStatus : 'Processing'}
            onChange={(event) => updateStatus(event.target.value)}
            disabled={saving}
            className="input-luxury text-sm py-2"
          >
            {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          {saving && <Loader2 size={18} className="animate-spin text-gold" />}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-luxury p-6">
          <div className="flex items-center justify-between border-b border-soft-border pb-4 mb-4">
            <h2 className="font-serif text-xl text-forest">Items</h2>
            <span className="text-sm text-soft-green">{order.items.length} products</span>
          </div>
          <div className="divide-y divide-soft-border">
            {order.items.map((item, index) => (
              <div key={`${item.name}-${index}`} className="flex items-center gap-4 py-4">
                <div className="w-16 h-16 bg-muted-cream flex-shrink-0 overflow-hidden">
                  {item.thumbnail ? <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" /> : <Package className="m-5 text-soft-green" size={24} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-forest">{item.name}</p>
                  <p className="text-sm text-soft-green">Qty {item.quantity} · {formatPrice(item.price)} each</p>
                </div>
                <p className="font-medium text-forest">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card-luxury p-6 h-fit">
          <h2 className="font-serif text-xl text-forest border-b border-soft-border pb-4 mb-4">Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-soft-green">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-soft-green">Shipping</span><span>{formatPrice(order.shippingCost)}</span></div>
            <div className="flex justify-between"><span className="text-soft-green">Discount</span><span>-{formatPrice(order.discount)}</span></div>
            <div className="flex justify-between"><span className="text-soft-green">Tax</span><span>{formatPrice(order.tax)}</span></div>
            <div className="flex justify-between border-t border-soft-border pt-3 text-base font-medium text-forest"><span>Total</span><span>{formatPrice(order.total)}</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-luxury p-6">
          <h2 className="font-serif text-xl text-forest mb-4">Customer</h2>
          <p className="font-medium text-forest">{order.user?.name || 'Guest customer'}</p>
          <p className="text-sm text-soft-green mt-1">{order.user?.email || 'No email available'}</p>
          {order.user?.phone && <p className="text-sm text-soft-green mt-1">{order.user.phone}</p>}
          <div className="flex items-center gap-2 mt-5 text-sm text-soft-green">
            <CheckCircle size={16} className="text-gold" /> Payment: {order.paymentStatus}
          </div>
        </div>

        <div className="card-luxury p-6">
          <h2 className="font-serif text-xl text-forest mb-4">Shipping Address</h2>
          <div className="flex gap-3 text-sm text-soft-green">
            <Truck size={18} className="text-gold flex-shrink-0 mt-0.5" />
            <address className="not-italic leading-6">
              {address.firstName} {address.lastName}<br />
              {address.street}<br />
              {address.city}, {address.state} {address.postalCode}<br />
              {address.country}
              {address.phone && <><br />{address.phone}</>}
            </address>
          </div>
        </div>
      </div>

      <div className="card-luxury p-6 space-y-4">
        <h2 className="font-serif text-xl text-forest">Delivery tracking</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input className="input-luxury" placeholder="Courier" value={tracking.courier} onChange={(event) => setTracking({ ...tracking, courier: event.target.value })} />
          <input className="input-luxury" placeholder="Tracking number" value={tracking.trackingNumber} onChange={(event) => setTracking({ ...tracking, trackingNumber: event.target.value })} />
          <input className="input-luxury" type="date" value={tracking.estimatedDelivery} onChange={(event) => setTracking({ ...tracking, estimatedDelivery: event.target.value })} />
        </div>
        <textarea className="input-luxury min-h-24" placeholder="Customer-facing tracking update" value={tracking.lastUpdate} onChange={(event) => setTracking({ ...tracking, lastUpdate: event.target.value })} />
        <Button variant="outline" onClick={updateTracking} disabled={saving}>Save tracking</Button>
      </div>

      <Button variant="outline" onClick={() => router.push('/admin/orders')}>
        <ArrowLeft size={16} /> Back to all orders
      </Button>
    </div>
  );
}
