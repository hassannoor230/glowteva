'use client';

const testimonials = [
  { quote: 'The Radiance Facial Oil transformed my evening ritual. My skin has never felt so soft.', name: 'Amelia K.', location: 'New York' },
  { quote: 'Finally, organic skincare that feels truly luxurious. The textures are exquisite.', name: 'Sophie L.', location: 'London' },
  { quote: 'GlowTeva products have become the quiet anchors of my daily routine.', name: 'Maya R.', location: 'Los Angeles' },
];

export default function Testimonials() {
  return (
    <section className="section-padding bg-muted-cream/50">
      <div className="container-luxury">
        <div className="text-center mb-14">
          <p className="eyebrow mb-3">KIND WORDS</p>
          <h2 className="heading-section">From Our Community</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {testimonials.map((t, i) => (
            <blockquote key={i} className="text-center">
              <p className="font-serif text-xl md:text-2xl text-forest leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer>
                <cite className="not-italic text-sm text-soft-green tracking-wide">
                  — {t.name}, {t.location}
                </cite>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
