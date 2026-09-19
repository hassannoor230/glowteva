'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Payment { _id: string; method: string; amount: number; status: string; transactionId?: string; receiptUrl?: string; adminNote?: string; createdAt: string; user?: { name: string; email: string }; order?: { _id: string; orderNumber: string; total: number }; }
interface History { _id: string; status: string; note?: string; createdAt: string; updatedBy?: { name: string }; }

export default function PaymentReviewPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user, token } = useAuthStore();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [history, setHistory] = useState<History[]>([]);
  const [status, setStatus] = useState('PENDING');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    api.get<{ data: { payment: Payment; history: History[] } }>(`/admin/payments/${params.id}`, { token }).then((response) => {
      setPayment(response.data.payment); setHistory(response.data.history); setStatus(response.data.payment.status); setNote(response.data.payment.adminNote || '');
    }).finally(() => setLoading(false));
  }, [params.id, router, token]);

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/payments/${params.id}/status`, { status, note }, { token });
      const response = await api.get<{ data: { payment: Payment; history: History[] } }>(`/admin/payments/${params.id}`, { token });
      setPayment(response.data.payment); setHistory(response.data.history);
    } finally { setSaving(false); }
  };

  if (!user || user.role !== 'admin') return null;
  if (loading) return <div className="text-soft-green">Loading payment...</div>;
  if (!payment) return <p className="text-red-600">Payment not found.</p>;

  return <div className="space-y-8 pb-12">
    <div><Link href="/admin/payments" className="inline-flex items-center gap-2 text-sm text-soft-green hover:text-forest mb-3"><ArrowLeft size={16} /> Back to payments</Link><p className="eyebrow mb-2">PAYMENT REVIEW</p><h1 className="heading-section">{payment.order?.orderNumber || 'Payment'}</h1></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 card-luxury p-6 space-y-5"><div className="grid grid-cols-2 gap-5 text-sm"><div><p className="text-xs uppercase tracking-wider text-soft-green">Customer</p><p className="text-forest mt-1">{payment.user?.name}</p><p className="text-soft-green">{payment.user?.email}</p></div><div><p className="text-xs uppercase tracking-wider text-soft-green">Method</p><p className="text-forest mt-1">{payment.method}</p><p className="text-soft-green">{formatPrice(payment.amount)}</p></div><div><p className="text-xs uppercase tracking-wider text-soft-green">Transaction ID</p><p className="text-forest mt-1 break-all">{payment.transactionId || '—'}</p></div><div><p className="text-xs uppercase tracking-wider text-soft-green">Submitted</p><p className="text-forest mt-1">{formatDate(payment.createdAt)}</p></div></div>
        <div className="border-t border-soft-border pt-5"><p className="text-xs uppercase tracking-wider text-soft-green mb-3">Payment receipt</p>{payment.receiptUrl ? <><img src={payment.receiptUrl} alt="Payment receipt" className="max-h-[520px] w-auto max-w-full object-contain border border-soft-border" /><a href={payment.receiptUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-forest hover:text-gold mt-3">Open receipt <ExternalLink size={14} /></a></> : <p className="text-soft-green">No receipt uploaded.</p>}</div>
      </div>
      <div className="card-luxury p-6 space-y-5 h-fit"><h2 className="font-serif text-xl text-forest">Verification</h2><div><p className="text-xs uppercase tracking-wider text-soft-green mb-2">Status</p><Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['PENDING', 'CONFIRMED', 'RECEIVED', 'NOT_RECEIVED', 'REJECTED'].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div><Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Admin note" rows={5} /><Button onClick={save} disabled={saving} className="w-full">{saving ? <Loader2 className="animate-spin" size={17} /> : 'Save verification'}</Button><div className="border-t border-soft-border pt-4 space-y-3"><p className="text-xs uppercase tracking-wider text-soft-green">History</p>{history.map((entry) => <div key={entry._id} className="text-xs"><p className="font-medium text-forest">{entry.status}</p><p className="text-soft-green">{formatDate(entry.createdAt)}{entry.note ? ` · ${entry.note}` : ''}</p></div>)}</div></div>
    </div>
  </div>;
}
