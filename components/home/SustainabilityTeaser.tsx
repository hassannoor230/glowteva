'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function SustainabilityTeaser() {
  return (
    <section className="section-padding bg-forest text-cream">
      <div className="container-luxury">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="eyebrow text-gold mb-4">OUR COMMITMENT</p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl leading-tight mb-6">
              Beauty that respects the earth it comes from.
            </h2>
            <p className="text-cream/70 leading-relaxed mb-8 max-w-md">
              Responsible sourcing, thoughtful formulation, and packaging designed with care.
              We believe luxury and consciousness can coexist.
            </p>
            <Link href="/sustainability" className="btn-gold">Our Approach</Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=900&q=85"
              alt="Natural botanical landscape"
              fill className="object-cover" sizes="50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
