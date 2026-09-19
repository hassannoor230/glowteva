'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, Loader2, Search } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Payment {
  _id: string;
  method: string;
  amount: number;
  status: string;
  transactionId?: string;
  receiptUrl?: string;
  createdAt: string;
  user?: { name: string; email: string };
  order?: { orderNumber: string; total: number };
}

export default function AdminPaymentsPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [method, setMethod] = useState('all');

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, status, method });
      const response = await api.get<{ data: { data: Payment[] } }>(`/admin/payments?${params}`, { token });
      setPayments(response.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    if (user && user.role !== 'admin') { router.push('/account'); return; }
    load().catch(() => setPayments([]));
  }, [token, user, router, status, method]);

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="space-y-8 pb-12">
      <div>
        <p className="eyebrow mb-2">ADMIN / PAYMENTS</p>
        <h1 className="heading-section">Payment Verification</h1>
      </div>
      <div className="card-luxury p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-soft-green" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && load()} placeholder="Search transaction ID" className="pl-9" />
        </div>
        <Select value={status} onValueChange={setStatus}><SelectTrigger className="md:w-48"><SelectValue placeholder="Payment status" /></SelectTrigger><SelectContent>{['all', 'PENDING', 'CONFIRMED', 'RECEIVED', 'NOT_RECEIVED', 'REJECTED'].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select>
        <Select value={method} onValueChange={setMethod}><SelectTrigger className="md:w-48"><SelectValue placeholder="Method" /></SelectTrigger><SelectContent>{['all', 'COD', 'BANK_TRANSFER', 'JAZZCASH', 'EASYPAISA', 'STRIPE'].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select>
      </div>
      <div className="card-luxury overflow-x-auto">
        {loading ? <div className="p-10 text-soft-green"><Loader2 className="animate-spin" /></div> : (
          <table className="w-full min-w-[760px]"><thead><tr className="border-b border-soft-border bg-muted-cream/50">{['Order', 'Customer', 'Method', 'Amount', 'Transaction', 'Status', 'Date', ''].map((heading) => <th key={heading} className="px-5 py-4 text-left text-xs uppercase tracking-wider text-soft-green">{heading}</th>)}</tr></thead>
            <tbody className="divide-y divide-soft-border">{payments.map((payment) => <tr key={payment._id} className="hover:bg-muted-cream/30">
              <td className="px-5 py-4"><Link href={`/admin/orders/${(payment.order as any)?._id || ''}`} className="font-medium text-forest hover:text-gold">{payment.order?.orderNumber || 'Order'}</Link></td>
              <td className="px-5 py-4"><p className="text-sm text-forest">{payment.user?.name || 'Customer'}</p><p className="text-xs text-soft-green">{payment.user?.email}</p></td>
              <td className="px-5 py-4 text-sm text-forest">{payment.method}</td><td className="px-5 py-4 text-sm text-forest">{formatPrice(payment.amount)}</td>
              <td className="px-5 py-4 text-sm text-soft-green">{payment.transactionId || '—'}</td><td className="px-5 py-4"><span className="text-xs px-2 py-1 rounded-full bg-muted-cream text-forest">{payment.status}</span></td><td className="px-5 py-4 text-sm text-soft-green">{formatDate(payment.createdAt)}</td>
              <td className="px-5 py-4 text-right"><Link href={`/admin/payments/${payment._id}`} className="p-2 inline-flex text-soft-green hover:text-forest" title="Review payment"><Eye size={17} /></Link></td>
            </tr>)}</tbody></table>
        )}
        {!loading && payments.length === 0 && <p className="p-10 text-center text-soft-green">No payments found.</p>}
      </div>
    </div>
  );
}
