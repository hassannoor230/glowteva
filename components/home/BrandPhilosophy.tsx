'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function BrandPhilosophy() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.philosophy-text', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        y: 40, opacity: 0, duration: 0.9, ease: 'power2.out', stagger: 0.15,
      });
      gsap.from('.philosophy-image', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        scale: 1.1, opacity: 0, duration: 1.2, ease: 'power2.out',
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="section-padding bg-cream overflow-hidden">
      <div className="container-luxury">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="philosophy-image relative aspect-[4/5] overflow-hidden rounded-[28px] bg-ivory/60 shadow-[0_20px_60px_rgba(76,52,24,0.10)]">
            <Image
              src="/Philosphy.png"
              alt="GlowTeva philosophy — serene beauty moment"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 border border-gold/40 hidden lg:block" />
          </div>
          <div>
            <p className="philosophy-text eyebrow mb-4">THE GLOWTEVA PHILOSOPHY</p>
            <div className="philosophy-text gold-line mb-8" />
            <h2 className="philosophy-text heading-section mb-6 text-balance">
              Beauty begins with what you choose to put close to your skin.
            </h2>
            <p className="philosophy-text body-elegant mb-6">
              We believe in a softer approach to beauty—one rooted in pure botanical ingredients,
              refined formulations, and rituals that honor both skin and self.
            </p>
            <p className="philosophy-text body-elegant mb-10">
              Every GlowTeva product is crafted to feel luxurious without compromise:
              pure by nature, elevated by design.
            </p>
            <Link href="/story" className="philosophy-text btn-secondary">
              Our Story
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
