'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Check, Clock, Package, Truck } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/utils';

const statuses = ['CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export default function OrderTrackingPage() {
  const router = useRouter();
  const params = useParams<{ orderId: string }>();
  const { user, token } = useAuthStore();
  const [order, setOrder] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    Promise.all([
      api.get<{ data: any }>(`/orders/${params.orderId}`, { token }),
      api.get<{ data: any[] }>('/payments/mine', { token }).catch(() => ({ data: [] })),
    ]).then(([orderResponse, paymentsResponse]) => {
      setOrder(orderResponse.data);
      setPayment(paymentsResponse.data.find((item: any) => item.order?._id === params.orderId || item.order === params.orderId));
    }).finally(() => setLoading(false));
  }, [params.orderId, router, token]);

  if (!user) return null;
  if (loading) return <div className="pt-28 container-luxury text-soft-green">Loading order tracking...</div>;
  if (!order) return <div className="pt-28 container-luxury text-red-600">Order not found.</div>;

  const currentIndex = statuses.indexOf(order.orderStatus);
  const paymentLabel = payment?.status === 'CONFIRMED' || payment?.status === 'RECEIVED' || order.paymentStatus === 'paid' ? 'Payment confirmed' : 'Payment pending verification';

  return <div className="pt-28 pb-20"><div className="container-luxury max-w-4xl space-y-8"><Link href="/account?tab=orders" className="inline-flex items-center gap-2 text-sm text-soft-green hover:text-forest"><ArrowLeft size={16} /> Back to orders</Link><div><p className="eyebrow mb-2">ORDER TRACKING</p><h1 className="heading-section">{order.orderNumber}</h1><p className="text-sm text-soft-green mt-2">Placed {formatDate(order.createdAt)} · {formatPrice(order.total)}</p></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="card-luxury p-6"><p className="text-xs uppercase tracking-wider text-soft-green">Payment status</p><p className="font-serif text-xl text-forest mt-2">{paymentLabel}</p><p className="text-sm text-soft-green mt-2">Method: {order.paymentMethod || 'COD'}</p>{payment?.transactionId && <p className="text-sm text-soft-green mt-1">Transaction: {payment.transactionId}</p>}</div><div className="card-luxury p-6"><p className="text-xs uppercase tracking-wider text-soft-green">Delivery</p><p className="font-serif text-xl text-forest mt-2">{order.orderStatus}</p><p className="text-sm text-soft-green mt-2">{order.tracking?.courier ? `${order.tracking.courier} · ${order.tracking.trackingNumber || 'Tracking pending'}` : 'Tracking information will appear after dispatch.'}</p></div></div><div className="card-luxury p-6 md:p-8"><h2 className="font-serif text-xl text-forest mb-8">Order timeline</h2><div className="space-y-6">{statuses.map((status, index) => { const done = currentIndex >= index; return <div key={status} className="flex gap-4 items-start"><div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-forest text-cream' : 'bg-muted-cream text-soft-green'}`}>{done ? <Check size={16} /> : <Clock size={16} />}</div><div><p className={`font-medium ${done ? 'text-forest' : 'text-soft-green'}`}>{status.replaceAll('_', ' ')}</p>{order.statusHistory?.filter((entry: any) => entry.status === status).slice(-1).map((entry: any) => <p key={entry.createdAt} className="text-xs text-soft-green mt-1">{formatDate(entry.createdAt)}{entry.note ? ` · ${entry.note}` : ''}</p>)}</div></div>; })}</div></div><div className="card-luxury p-6 flex gap-3 text-sm text-soft-green"><Truck size={18} className="text-gold flex-shrink-0" /> {order.tracking?.lastUpdate || 'We will update your tracking timeline as your order moves.'}</div></div></div>;
}
