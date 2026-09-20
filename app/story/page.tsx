import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'Our Story | GlowTeva Organics',
  description: 'The origin, philosophy, and promise of GlowTeva Organics. Pure by nature. Luxury by choice.',
  openGraph: {
    type: 'article',
    locale: 'en_US',
    siteName: 'GlowTeva Organics',
    title: 'Our Story | GlowTeva Organics',
    description: 'The origin, philosophy, and promise of GlowTeva Organics.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Our Story | GlowTeva Organics',
    description: 'The origin, philosophy, and promise of GlowTeva Organics.',
  },
};

export default function StoryPage() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://glowteva.com';
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'Our Story', url: base, description: 'The origin, philosophy, and promise of GlowTeva Organics.' }} />
      <BreadcrumbJsonLd items={[{ name: 'Home', url: '/' }, { name: 'Our Story', url: '/story' }]} />
      <div className="pt-28">
        <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
          <Image src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1600&q=85" alt="" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-forest/50" />
          <div className="relative z-10 text-center px-6">
            <p className="eyebrow text-gold mb-4">OUR STORY</p>
            <h1 className="font-serif text-4xl md:text-6xl text-cream">Pure by Nature.<br />Luxury by Choice.</h1>
          </div>
        </section>

        <section className="section-padding bg-cream">
          <div className="container-luxury max-w-3xl mx-auto text-center">
            <p className="eyebrow mb-4">BRAND ORIGIN</p>
            <h2 className="heading-section mb-8">Where it began</h2>
            <p className="body-elegant mb-6">
              GlowTeva was born from a simple belief: that the most beautiful skin comes from pure ingredients,
              thoughtful formulation, and a slower approach to beauty. We set out to create organic skincare
              that feels as luxurious as it is pure—without compromise.
            </p>
            <p className="body-elegant">
              Every product begins with botanical materials chosen for their integrity and performance.
              We refine them into rituals that honor both the skin and the person who uses them.
            </p>
          </div>
        </section>

        <section className="section-padding bg-muted-cream/40">
          <div className="container-luxury">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=900&q=85" alt="" fill className="object-cover" />
              </div>
              <div>
                <p className="eyebrow mb-4">PHILOSOPHY</p>
                <h2 className="heading-section mb-6">Beauty without compromise</h2>
                <p className="body-elegant mb-6">
                  We reject the false choice between pure and premium. Our formulas are rooted in nature
                  and elevated by modern understanding—designed to feel exquisite on the skin and
                  responsible in the world.
                </p>
                <p className="body-elegant">
                  Feminine does not mean frivolous. Organic does not mean unfinished.
                  Luxury does not require excess. These are the principles that guide every decision we make.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-padding bg-cream">
          <div className="container-luxury">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              {[
                { title: 'Ingredient Sourcing', text: 'We prioritize suppliers who share our commitment to quality and care for the land.' },
                { title: 'Formulation Approach', text: 'Each formula is refined for texture, absorption, and the quiet pleasure of daily use.' },
                { title: 'Brand Promise', text: 'Pure ingredients. Elevated experience. No unsupported claims. No compromise.' },
              ].map((item) => (
                <div key={item.title}>
                  <div className="gold-line mx-auto mb-6" />
                  <h3 className="font-serif text-xl text-forest mb-3">{item.title}</h3>
                  <p className="text-soft-green text-sm leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-forest text-center">
          <div className="container-luxury">
            <h2 className="font-serif text-3xl md:text-4xl text-cream mb-6">Begin your ritual</h2>
            <Link href="/shop" className="btn-gold">Explore the Collection</Link>
          </div>
        </section>
      </div>
    </>
  );
}
