'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await api.post<{ message: string }>('/newsletter', { email });
      setStatus('success');
      setMsg(res.message || 'Welcome to GlowTeva');
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setMsg(err.message || 'Something went wrong');
    }
  };

  return (
    <section className="py-20 md:py-28 bg-muted-cream/60">
      <div className="container-luxury text-center max-w-xl mx-auto">
        <p className="eyebrow mb-4">STAY CONNECTED</p>
        <h2 className="heading-section mb-4">A Little More Glow in Your Inbox</h2>
        <p className="body-elegant mb-8">
          Rituals, ingredients, and exclusive offers—delivered with care.
        </p>
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address" required
            className="flex-1 input-luxury"
          />
          <button type="submit" disabled={status === 'loading'} className="btn-primary whitespace-nowrap">
            {status === 'loading' ? 'Joining...' : 'Join GlowTeva'}
          </button>
        </form>
        {msg && <p className={`mt-4 text-sm ${status === 'success' ? 'text-soft-green' : 'text-red-600'}`}>{msg}</p>}
      </div>
    </section>
  );
}
