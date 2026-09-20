import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'Sustainability | GlowTeva Organics',
  description: 'Our approach to responsible sourcing, packaging, and formulation. Beauty that respects the earth.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'GlowTeva Organics',
    title: 'Sustainability | GlowTeva Organics',
    description: 'Our approach to responsible sourcing, packaging, and formulation. Beauty that respects the earth.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sustainability | GlowTeva Organics',
    description: 'Our approach to responsible sourcing, packaging, and formulation.',
  },
};

export default function SustainabilityPage() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://glowteva.com';
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'Sustainability', url: base, description: 'Our approach to responsible sourcing, packaging, and formulation.' }} />
      <BreadcrumbJsonLd items={[{ name: 'Home', url: '/' }, { name: 'Sustainability', url: '/sustainability' }]} />
      <div className="pt-28">
        <section className="relative h-[50vh] min-h-[350px] flex items-center justify-center overflow-hidden">
          <Image src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1600&q=85" alt="" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-forest/50" />
          <div className="relative z-10 text-center px-6">
            <p className="eyebrow text-gold mb-4">OUR COMMITMENT</p>
            <h1 className="font-serif text-4xl md:text-5xl text-cream">Beauty that respects<br />the earth it comes from</h1>
          </div>
        </section>

        <section className="section-padding bg-cream">
          <div className="container-luxury max-w-3xl mx-auto">
            <p className="body-elegant text-center mb-16">
              At GlowTeva, sustainability is not a marketing claim—it is a practice woven into how we source,
              formulate, and package every product. We do not invent statistics or certifications we have not earned.
              We simply do the work, with intention.
            </p>

            <div className="space-y-16">
              {[
                { title: 'Responsible Sourcing', text: 'We seek botanical materials cultivated with respect for the land and the communities involved. Quality and care guide every supplier relationship.' },
                { title: 'Thoughtful Formulation', text: 'We formulate for efficacy and pleasure while avoiding unnecessary complexity. Fewer, better ingredients—chosen with purpose.' },
                { title: 'Recyclable Packaging', text: 'We design packaging with end-of-life in mind, favoring materials that can be recycled and reducing excess wherever possible.' },
                { title: 'Reduced Waste', text: 'From production to presentation, we work to minimize waste. It is an ongoing effort, not a finished claim.' },
                { title: 'Ingredient Transparency', text: 'We believe you deserve to know what is in every formula. Clear ingredient lists. No hidden complexity.' },
              ].map((item, i) => (
                <div key={item.title} className="flex gap-8 items-start">
                  <span className="font-serif text-3xl text-gold/50 flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h2 className="font-serif text-2xl text-forest mb-3">{item.title}</h2>
                    <p className="text-soft-green leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted-cream/50 text-center">
          <div className="container-luxury">
            <p className="font-serif text-2xl text-forest mb-6">Questions about our approach?</p>
            <Link href="/contact" className="btn-secondary">Get in Touch</Link>
          </div>
        </section>
      </div>
    </>
  );
}
