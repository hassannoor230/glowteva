import Link from 'next/link';
import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'Shipping & Returns | GlowTeva Organics',
  description: 'GlowTeva Organics shipping and returns policy. Carefully prepared orders, easy returns.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'GlowTeva Organics',
    title: 'Shipping & Returns | GlowTeva Organics',
    description: 'GlowTeva Organics shipping and returns policy.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shipping & Returns | GlowTeva Organics',
    description: 'GlowTeva Organics shipping and returns policy.',
  },
};

export default function ShippingPage() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://glowteva.com';
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'Shipping & Returns', url: `${base}/shipping`, description: 'GlowTeva Organics shipping and returns policy.' }} />
      <BreadcrumbJsonLd items={[{ name: 'Home', url: '/' }, { name: 'Shipping & Returns', url: '/shipping' }]} />
      <main className="pt-32 pb-24">
        <div className="container-luxury max-w-3xl">
          <p className="eyebrow mb-3">CARE & DELIVERY</p>
          <h1 className="heading-section mb-8">Shipping & Returns</h1>
          <div className="space-y-8 text-soft-green leading-relaxed">
            <section>
              <h2 className="font-serif text-2xl text-forest mb-3">Shipping</h2>
              <p>Orders are carefully prepared within 1-2 business days. Delivery times and shipping options are shown at checkout based on your address.</p>
            </section>
            <section>
              <h2 className="font-serif text-2xl text-forest mb-3">Returns</h2>
              <p>Unused, unopened products may be returned within 30 days of delivery. Please contact us before sending an item back so we can guide you through the process.</p>
            </section>
            <section>
              <h2 className="font-serif text-2xl text-forest mb-3">Need help?</h2>
              <p>For order support, visit our <Link href="/contact" className="text-gold hover:text-forest">Contact</Link> page.</p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
