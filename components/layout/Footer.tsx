'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await api.post<{ message: string }>('/newsletter', { email });
      setStatus('success');
      setMessage(res.message || 'Welcome to GlowTeva');
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong');
    }
  };

  return (
    <footer className="bg-forest text-cream">
      <div className="container-luxury section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          <div className="lg:col-span-1">
            <Link href="/" className="font-serif text-2xl tracking-[0.15em]">
              GLOWTEVA
            </Link>
            <p className="mt-4 text-cream/70 text-sm leading-relaxed max-w-xs">
              Pure by Nature. Luxury by Choice.
            </p>
            <p className="mt-6 text-cream/50 text-xs leading-relaxed">
              Botanical rituals crafted for beautifully luminous skin.
            </p>
          </div>
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-gold mb-6">Shop</h4>
            <ul className="space-y-3">
              {[
                { href: '/shop', label: 'All Products' },
                { href: '/shop?featured=true', label: 'Featured' },
                { href: '/shop?bestSeller=true', label: 'Best Sellers' },
                { href: '/shop?newArrival=true', label: 'New Arrivals' },
                { href: '/collections', label: 'Collections' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-cream/70 hover:text-cream transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-gold mb-6">Explore</h4>
            <ul className="space-y-3">
              {[
                { href: '/story', label: 'Our Story' },
                { href: '/sustainability', label: 'Sustainability' },
                { href: '/journal', label: 'Journal' },
                { href: '/contact', label: 'Contact' },
                { href: '/account', label: 'My Account' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-cream/70 hover:text-cream transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase text-gold mb-6">
              A Little More Glow
            </h4>
            <p className="text-sm text-cream/70 mb-4">
              Join our newsletter for rituals, ingredients, and exclusive offers.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="px-4 py-3 bg-transparent border border-cream/20 text-cream placeholder:text-cream/40 text-sm focus:outline-none focus:border-gold transition-colors"
                required
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-3 bg-gold text-forest text-sm tracking-wide font-medium hover:bg-gold/90 transition-colors disabled:opacity-50"
              >
                {status === 'loading' ? 'Joining...' : 'Join GlowTeva'}
              </button>
            </form>
            {message && (
              <p className={`mt-3 text-xs ${status === 'success' ? 'text-gold' : 'text-red-300'}`}>
                {message}
              </p>
            )}
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-cream/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-cream/40">
            © {new Date().getFullYear()} GlowTeva Organics. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-xs text-cream/40 hover:text-cream/70 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-cream/40 hover:text-cream/70 transition-colors">
              Terms
            </Link>
            <Link href="/shipping" className="text-xs text-cream/40 hover:text-cream/70 transition-colors">
              Shipping & Returns
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
