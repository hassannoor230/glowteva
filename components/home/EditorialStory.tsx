'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function EditorialStory() {
  return (
    <section className="relative min-h-[70vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src=" /editorial.png"
          alt="Editorial beauty story"
          fill className="object-cover" sizes="90vw"
        />
        <div className="absolute inset-0 bg-forest/55" />
      </div>
      <div className="relative z-10 container-luxury py-24 text-center">
        <p className="eyebrow text-gold mb-4">EDITORIAL</p>
        <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl text-cream max-w-3xl mx-auto leading-tight text-balance mb-6">
          A softer, slower approach to everyday beauty.
        </h2>
        <p className="text-cream/80 text-lg max-w-xl mx-auto mb-10">
          Discover the rituals, ingredients, and philosophy that define GlowTeva.
        </p>
        <Link href="/journal" className="btn-gold">Read the Journal</Link>
      </div>
    </section>
  );
}
