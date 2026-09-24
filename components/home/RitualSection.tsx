'use client';

import Image from 'next/image';
import Link from 'next/link';

const steps = [
  { num: '01', title: 'Cleanse', desc: 'Dissolve the day with a botanical oil cleanser that respects your skin’s balance.' },
  { num: '02', title: 'Prepare', desc: 'Mist or tone to hydrate and ready the skin for the next step.' },
  { num: '03', title: 'Nourish', desc: 'Press in facial oils and creams chosen for your skin’s unique needs.' },
];

export default function RitualSection() {
  return (
    <section className="section-padding bg-cream">
      <div className="container-luxury">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="eyebrow mb-4">THE RITUAL</p>
            <h2 className="heading-section mb-6">Three steps to luminous skin</h2>
            <div className="gold-line mb-10" />
            <div className="space-y-8">
              {steps.map((s) => (
                <div key={s.num} className="flex gap-6">
                  <span className="font-serif text-3xl text-gold/60">{s.num}</span>
                  <div>
                    <h3 className="font-medium text-forest text-lg mb-1">{s.title}</h3>
                    <p className="text-soft-green text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/shop" className="btn-primary mt-10 inline-flex">Begin Your Ritual</Link>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src="ingrdiant r.jfif"
              alt="Skincare ritual"
              fill className="object-cover" sizes="50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
