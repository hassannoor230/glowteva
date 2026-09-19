'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const emptySettings = { codEnabled: true, bankTransferEnabled: false, jazzcashEnabled: false, easypaisaEnabled: false, bankTransfer: { bankName: '', accountTitle: '', accountNumber: '', iban: '', branch: '', instructions: '' }, jazzcash: { accountName: '', accountNumber: '', instructions: '' }, easypaisa: { accountName: '', accountNumber: '', instructions: '' }, generalInstructions: '' };

export default function PaymentSettingsPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [settings, setSettings] = useState<any>(emptySettings);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (!token) { router.push('/login'); return; } api.get<{ data: any }>('/admin/settings/payment', { token }).then((response) => setSettings(response.data)); }, [router, token]);
  if (!user || user.role !== 'admin') return null;
  const update = (section: string, field: string, value: string | boolean) => setSettings((current: any) => section === 'root' ? { ...current, [field]: value } : { ...current, [section]: { ...current[section], [field]: value } });
  const save = async () => { setSaving(true); try { await api.put('/admin/settings/payment', settings, { token }); } finally { setSaving(false); } };
  return <div className="space-y-8 pb-12"><div><p className="eyebrow mb-2">ADMIN / SETTINGS</p><h1 className="heading-section">Payment Settings</h1><p className="text-soft-green mt-3">Configure the payment accounts shown at checkout.</p></div><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="card-luxury p-6 space-y-4"><h2 className="font-serif text-xl text-forest">Available methods</h2>{[['codEnabled','Cash on Delivery'],['bankTransferEnabled','Bank Transfer'],['jazzcashEnabled','JazzCash'],['easypaisaEnabled','Easypaisa']].map(([field, label]) => <label key={field} className="flex items-center justify-between border-b border-soft-border py-3 text-sm text-forest">{label}<input type="checkbox" checked={Boolean(settings[field])} onChange={(event) => update('root', field, event.target.checked)} className="h-4 w-4 accent-[#C5A46E]" /></label>)}<div><Label>General instructions</Label><Textarea value={settings.generalInstructions || ''} onChange={(event) => update('root', 'generalInstructions', event.target.value)} rows={4} /></div></div><div className="card-luxury p-6 space-y-4"><h2 className="font-serif text-xl text-forest">Bank transfer</h2>{[['bankName','Bank name'],['accountTitle','Account title'],['accountNumber','Account number'],['iban','IBAN'],['branch','Branch']].map(([field, label]) => <div key={field}><Label>{label}</Label><Input value={settings.bankTransfer?.[field] || ''} onChange={(event) => update('bankTransfer', field, event.target.value)} /></div>)}<Label>Instructions</Label><Textarea value={settings.bankTransfer?.instructions || ''} onChange={(event) => update('bankTransfer', 'instructions', event.target.value)} /></div><div className="card-luxury p-6 space-y-4"><h2 className="font-serif text-xl text-forest">JazzCash</h2><Label>Account name</Label><Input value={settings.jazzcash?.accountName || ''} onChange={(event) => update('jazzcash', 'accountName', event.target.value)} /><Label>Number</Label><Input value={settings.jazzcash?.accountNumber || ''} onChange={(event) => update('jazzcash', 'accountNumber', event.target.value)} /><Label>Instructions</Label><Textarea value={settings.jazzcash?.instructions || ''} onChange={(event) => update('jazzcash', 'instructions', event.target.value)} /></div><div className="card-luxury p-6 space-y-4"><h2 className="font-serif text-xl text-forest">Easypaisa</h2><Label>Account name</Label><Input value={settings.easypaisa?.accountName || ''} onChange={(event) => update('easypaisa', 'accountName', event.target.value)} /><Label>Number</Label><Input value={settings.easypaisa?.accountNumber || ''} onChange={(event) => update('easypaisa', 'accountNumber', event.target.value)} /><Label>Instructions</Label><Textarea value={settings.easypaisa?.instructions || ''} onChange={(event) => update('easypaisa', 'instructions', event.target.value)} /></div></div><Button onClick={save} disabled={saving}><Save size={17} /> {saving ? 'Saving...' : 'Save payment settings'}</Button></div>;
}
