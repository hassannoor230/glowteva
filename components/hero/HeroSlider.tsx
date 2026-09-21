'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import gsap from 'gsap';

const slides = [
  {
    id: 1,
    eyebrow: 'THE HAIR MILK RITUAL',
    headline: 'Silky Hair. Naturally.',
    description: 'A luminous daily serum for softer, smoother, beautifully nourished hair.',
    cta: 'Shop Hair Milk Serum',
    href: '/shop',
    image: '/hero/banner.jpg',
    productImage: '/hero/product.png',
    showProduct: true,
  },
  {
    id: 2,
    eyebrow: 'PURE INGREDIENTS',
    headline: 'Nature, Refined.',
    description: 'Pure botanical ingredients, elevated into modern beauty rituals.',
    cta: 'Discover the Ritual',
    href: '/story',
    image: '/hero/slide2.jpg',
    productImage: '/hero/slide2-product.png',
    showProduct: true,
  },
  {
    id: 3,
    eyebrow: 'YOUR DAILY RITUAL',
    headline: 'Your Skin. Your Ritual.',
    description: 'A softer, slower approach to everyday beauty.',
    cta: 'Shop GlowTeva',
    href: '/shop',
    image: '/hero/slide3.jpg',
    productImage: '/hero/slide3-product.png',
    showProduct: true,
  },
  {
    id: 4,
    eyebrow: 'SIGNATURE COLLECTION',
    headline: 'The GlowTeva Collection',
    description: "Nature's finest ingredients, beautifully transformed.",
    cta: 'View Collection',
    href: '/collections',
    image: '/hero/slide4.jpg',
    productImage: '/hero/slide4-product.png',
    showProduct: true,
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const productRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const autoplayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const goTo = useCallback((index: number) => {
    if (index === current || reducedMotion.current) {
      setCurrent(index);
      return;
    }

    const outgoing = slideRefs.current[current];
    const incoming = slideRefs.current[index];
    const outContent = contentRefs.current[current];
    const inContent = contentRefs.current[index];
    const outProduct = productRefs.current[current];
    const inProduct = productRefs.current[index];

    if (!outgoing || !incoming) {
      setCurrent(index);
      return;
    }

    tlRef.current?.kill();
    const tl = gsap.timeline({
      onComplete: () => setCurrent(index),
    });
    tlRef.current = tl;

    // Outgoing: depth increase, rotateY, scale, fade
    tl.to(outgoing, {
      scale: 1.08,
      rotateY: -8,
      z: -100,
      opacity: 0,
      duration: 0.9,
      ease: 'power2.inOut',
    }, 0);
    if (outContent) {
      tl.to(outContent, { opacity: 0, y: -30, duration: 0.5, ease: 'power2.in' }, 0);
    }
    if (outProduct) {
      tl.to(outProduct, { opacity: 0, scale: 0.9, rotateY: 15, duration: 0.6, ease: 'power2.in' }, 0);
    }

    // Incoming: from depth
    gsap.set(incoming, { scale: 1.1, rotateY: 8, z: -80, opacity: 0 });
    if (inContent) gsap.set(inContent, { opacity: 0, y: 40 });
    if (inProduct) gsap.set(inProduct, { opacity: 0, scale: 0.85, rotateY: -12 });

    tl.to(incoming, {
      scale: 1,
      rotateY: 0,
      z: 0,
      opacity: 1,
      duration: 1,
      ease: 'power2.out',
    }, 0.3);
    if (inContent) {
      tl.to(inContent, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.5);
    }
    if (inProduct) {
      tl.to(inProduct, { opacity: 1, scale: 1, rotateY: 0, duration: 0.8, ease: 'power2.out' }, 0.4);
    }
  }, [current]);

  const next = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length);
  }, [current, goTo]);

  // Autoplay
  useEffect(() => {
    if (isPaused || reducedMotion.current) return;
    autoplayRef.current = setTimeout(next, 6000);
    return () => {
      if (autoplayRef.current) clearTimeout(autoplayRef.current);
    };
  }, [current, isPaused, next]);

  // Progress bar
  useEffect(() => {
    if (!progressRef.current || isPaused || reducedMotion.current) return;
    gsap.fromTo(progressRef.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 6, ease: 'none' }
    );
  }, [current, isPaused]);

  // Mouse parallax
  useEffect(() => {
    if (reducedMotion.current) return;
    const container = containerRef.current;
    if (!container) return;

    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 15;
      const product = productRefs.current[current];
      if (product) {
        gsap.to(product, { x: x * 0.5, y: y * 0.3, duration: 0.8, ease: 'power2.out' });
      }
    };

    container.addEventListener('mousemove', onMove);
    return () => container.removeEventListener('mousemove', onMove);
  }, [current]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  // Touch
  const touchStart = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative h-[100vh] min-h-[600px] max-h-[1100px] overflow-hidden bg-forest perspective-1000"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          ref={(el) => { slideRefs.current[i] = el; }}
          className="absolute inset-0 preserve-3d"
          style={{
            opacity: i === current ? 1 : 0,
            pointerEvents: i === current ? 'auto' : 'none',
            zIndex: i === current ? 10 : 1,
          }}
        >
          {/* Background */}
          <div className="absolute inset-0">
            <img
              src={slide.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-forest/70 via-forest/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-forest/50 via-transparent to-forest/20" />
          </div>

          {/* Content */}
          <div className="relative z-20 h-full container-luxury flex items-center">
            <div
              ref={(el) => { contentRefs.current[i] = el; }}
              className="max-w-xl pt-20"
            >
              <p className="eyebrow text-gold mb-4">{slide.eyebrow}</p>
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-cream leading-[1.1] mb-6 text-balance">
                {slide.headline}
              </h1>
              <p className="text-cream/80 text-base md:text-lg leading-relaxed mb-8 max-w-md">
                {slide.description}
              </p>
              <Link href={slide.href} className="btn-gold">
                {slide.cta}
              </Link>
            </div>
          </div>

          {/* Floating product */}
          {slide.showProduct && (
            <div
              ref={(el) => { productRefs.current[i] = el; }}
              className="absolute right-[8%] top-1/2 -translate-y-1/2 z-20 hidden lg:block w-[280px] xl:w-[340px]"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="relative aspect-[3/4] rounded-sm overflow-hidden shadow-2xl">
                <img
                  src={slide.productImage}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ objectFit: 'cover', objectPosition: 'center' }}
                  draggable={false}
                />
              </div>
              <div className="absolute -left-8 top-1/4 w-px h-1/2 bg-gradient-to-b from-transparent via-gold to-transparent" />
            </div>
          )}
        </div>
      ))}

      {/* Controls */}
      <div className="absolute bottom-8 left-0 right-0 z-30 container-luxury">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`text-xs tracking-widest transition-colors duration-300 ${
                  i === current ? 'text-gold' : 'text-cream/50 hover:text-cream'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              >
                {String(i + 1).padStart(2, '0')}
              </button>
            ))}
          </div>

          {/* Progress */}
          <div className="hidden sm:block flex-1 mx-8 max-w-xs">
            <div className="h-px bg-cream/20 overflow-hidden">
              <div
                ref={progressRef}
                className="h-full bg-gold origin-left"
                style={{ transform: 'scaleX(0)' }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={prev}
              className="w-10 h-10 border border-cream/30 text-cream flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
              aria-label="Previous slide"
            >
              ←
            </button>
            <button
              onClick={next}
              className="w-10 h-10 border border-cream/30 text-cream flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
              aria-label="Next slide"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
