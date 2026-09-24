'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ingredients = [
  { name: 'Hair Oil', desc: 'Essential fatty acids for radiant softness', image: '/Philosphy.png' },
  { name: 'Clenser Plus', desc: 'Nature’s closest match to skin’s own oils', image: '/ingredent 2.png' },
  { name: 'Vitamin C Serum', desc: 'Calming botanical for balanced skin', image: '/ingrediant 3.jpg' },
  { name: 'Moisturizer', desc: 'Deep nourishment and lasting comfort', image: '/ingrdiant r.jfif' },
];

export default function BotanicalIngredients() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.ing-card', {
        scrollTrigger: { trigger: ref.current, start: 'top 75%' },
        y: 50, opacity: 0, duration: 0.8, stagger: 0.12, ease: 'power2.out',
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="section-padding bg-muted-cream/40">
      <div className="container-luxury">
        <div className="text-center mb-14">
          <p className="eyebrow mb-3">FROM THE EARTH</p>
          <h2 className="heading-section">Botanical Ingredients</h2>
          <p className="body-elegant mt-4 max-w-lg mx-auto">
            Every formula begins with carefully selected botanicals—chosen for purity, performance, and the quiet luxury of nature.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {ingredients.map((ing) => (
            <div key={ing.name} className="ing-card text-center group">
              <div className="relative aspect-square overflow-hidden mb-5 bg-cream">
                <Image src={ing.image} alt={ing.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="25vw" />
              </div>
              <h3 className="font-serif text-lg text-forest mb-1">{ing.name}</h3>
              <p className="text-sm text-soft-green">{ing.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
