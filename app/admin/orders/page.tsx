'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Loader2,
  MoreHorizontal,
  Download,
} from 'lucide-react';

interface Order {
  _id: string;
  orderNumber: string;
  user: { _id: string; name: string; email: string } | null;
  items: Array<{
    product: string;
    name: string;
    slug: string;
    thumbnail: string;
    quantity: number;
    price: number;
    variant?: { size?: string; color?: string };
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  billingAddress?: any;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  couponCode?: string;
  notes?: string;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

const statusOptions = [
  { value: 'pending', label: 'Pending', icon: Clock },
  { value: 'processing', label: 'Processing', icon: Package },
  { value: 'shipped', label: 'Shipped', icon: Truck },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle },
  { value: 'refunded', label: 'Refunded', icon: XCircle },
];

export default function OrdersPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string>('');

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    if (user && user.role !== 'admin') { router.push('/account'); return; }
    fetchOrders();
  }, [token, user, router, page, search, statusFilter, paymentStatusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(paymentStatusFilter !== 'all' && { paymentStatus: paymentStatusFilter }),
      });
      const res = await api.get<{ data: PaginatedResponse<Order> }>(`/admin/orders?${params}`, { token });
      setOrders(res.data.data);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (order: Order, newStatus: string) => {
    setUpdatingId(order._id);
    setUpdatingStatus(newStatus);
    try {
      await api.put(`/admin/orders/${order._id}/status`, { orderStatus: newStatus }, { token });
      setOrders(orders.map(o => o._id === order._id ? { ...o, orderStatus: newStatus as any } : o));
      if (selectedOrder?._id === order._id) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus as any });
      }
    } catch (error) {
      alert('Failed to update order status');
    } finally {
      setUpdatingId(null);
      setUpdatingStatus('');
    }
  };

  const getNextStatuses = (currentStatus: string) => {
    const flow = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = flow.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === flow.length - 1) return [];
    return flow.slice(currentIndex + 1);
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

  return (
    <div className="pt-4 pb-20 min-h-screen bg-muted-cream/30">
      <div className="container-luxury">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <p className="eyebrow mb-2">ADMIN / ORDERS</p>
            <h1 className="heading-section">Orders</h1>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Download size={18} />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="card-luxury p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-soft-green/50" size={18} />
              <Input
                placeholder="Search order #, customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setPage(1)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Order Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statusOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="card-luxury overflow-hidden">
          {loading ? (
            <div className="p-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse border-b border-soft-border py-4">
                  <div className="flex items-center gap-4 px-6">
                    <div className="w-24 h-6 bg-muted-cream rounded" />
                    <div className="w-32 h-6 bg-muted-cream rounded" />
                    <div className="flex-1" />
                    <div className="w-28 h-6 bg-muted-cream rounded" />
                    <div className="w-24 h-6 bg-muted-cream rounded" />
                    <div className="w-24 h-6 bg-muted-cream rounded" />
                    <div className="w-32 h-6 bg-muted-cream rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <Package size={48} className="mx-auto text-soft-green/30 mb-4" />
              <p className="text-soft-green">No orders found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-soft-border bg-muted-cream/50">
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Order #</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Items</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Total</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Payment</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-soft-green">Date</th>
                      <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-soft-green">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-soft-border">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-muted-cream/30 transition-colors">
                        <td className="px-6 py-4">
                          <Link href={`/admin/orders/${order._id}`} className="font-medium text-forest hover:text-gold transition-colors">
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          {order.user ? (
                            <div>
                              <p className="font-medium text-dark-text">{order.user.name}</p>
                              <p className="text-xs text-soft-green">{order.user.email}</p>
                            </div>
                          ) : (
                            <p className="text-sm text-soft-green">Guest Customer</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {order.items.slice(0, 2).map((item, i) => (
                              <div key={i} className="w-10 h-10 bg-white border border-soft-border rounded-lg overflow-hidden flex-shrink-0">
                                {item.thumbnail ? (
                                  <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <Package className="w-full h-full text-soft-green/30 flex items-center justify-center" size={16} />
                                )}
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <span className="text-xs text-soft-green bg-muted-cream px-2 py-1 rounded">+{order.items.length - 2}</span>
                            )}
                            <span className="text-sm text-dark-text ml-1">{order.items.reduce((sum, i) => sum + i.quantity, 0)} items</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-forest">{formatPrice(order.total)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn('inline-flex px-2 py-1 text-xs font-medium rounded-full', paymentStatusColors[order.paymentStatus])}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.orderStatus}
                            onChange={(e) => handleStatusChange(order, e.target.value)}
                            disabled={updatingId === order._id}
                            className={cn('px-2 py-1 text-xs font-medium rounded-full border-0 appearance-none cursor-pointer', statusColors[order.orderStatus])}
                          >
                            <option value={order.orderStatus}>{order.orderStatus}</option>
                            {getNextStatuses(order.orderStatus).map(s => (
                              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                            {['cancelled', 'refunded'].includes(order.orderStatus) ? [] : (
                              <>
                                <option value="cancelled">Cancelled</option>
                                <option value="refunded">Refunded</option>
                              </>
                            )}
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm text-soft-green">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/orders/${order._id}`} className="p-2 text-soft-green hover:text-forest hover:bg-muted-cream rounded-lg transition-colors" title="View Details">
                              <Eye size={16} />
                            </Link>
                            <Link href={`/admin/orders/${order._id}`} className="p-2 text-soft-green hover:text-forest hover:bg-muted-cream rounded-lg transition-colors" title="Manage order">
                              <Edit size={16} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-soft-border flex items-center justify-between">
                  <p className="text-sm text-soft-green">
                    Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, total)} of {total} orders
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                      <ChevronLeft size={16} />
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (page <= 3) pageNum = i + 1;
                      else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = page - 2 + i;
                      
                      return (
                        <Button key={pageNum} variant={page === pageNum ? 'primary' : 'outline'} size="sm" onClick={() => setPage(pageNum)}>
                          {pageNum}
                        </Button>
                      );
                    })}
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}