import Link from 'next/link';
import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'Terms of Service | GlowTeva Organics',
  description: 'GlowTeva Organics terms of service. Please read before using our website and services.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'GlowTeva Organics',
    title: 'Terms of Service | GlowTeva Organics',
    description: 'GlowTeva Organics terms of service.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service | GlowTeva Organics',
    description: 'GlowTeva Organics terms of service.',
  },
};

export default function TermsPage() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://glowteva.com';
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'Terms of Service', url: `${base}/terms`, description: 'GlowTeva Organics terms of service.' }} />
      <BreadcrumbJsonLd items={[{ name: 'Home', url: '/' }, { name: 'Terms of Service', url: '/terms' }]} />
      <main className="pt-32 pb-24">
        <div className="container-luxury max-w-3xl">
          <p className="eyebrow mb-3">GLOWTEVA ORGANICS</p>
          <h1 className="heading-section mb-8">Terms of Service</h1>
          <div className="space-y-8 text-soft-green leading-relaxed">
            <section>
              <h2 className="font-serif text-2xl text-forest mb-3">Using our website</h2>
              <p>By using GlowTeva Organics, you agree to provide accurate information and use the website lawfully. Product availability and pricing may change without notice.</p>
            </section>
            <section>
              <h2 className="font-serif text-2xl text-forest mb-3">Orders</h2>
              <p>Orders are subject to confirmation and availability. We reserve the right to correct errors and cancel orders where necessary, with a full refund for any cancelled payment.</p>
            </section>
            <section>
              <h2 className="font-serif text-2xl text-forest mb-3">Support</h2>
              <p>Questions about these terms can be sent through our Contact page.</p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
