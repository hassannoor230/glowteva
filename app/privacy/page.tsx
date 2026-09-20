import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'Privacy Policy | GlowTeva Organics',
  description: 'GlowTeva Organics privacy policy. Learn how we collect, use, and protect your information.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'GlowTeva Organics',
    title: 'Privacy Policy | GlowTeva Organics',
    description: 'GlowTeva Organics privacy policy. Learn how we collect, use, and protect your information.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | GlowTeva Organics',
    description: 'GlowTeva Organics privacy policy.',
  },
};

export default function PrivacyPage() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://glowteva.com';
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'Privacy Policy', url: `${base}/privacy`, description: 'GlowTeva Organics privacy policy.' }} />
      <BreadcrumbJsonLd items={[{ name: 'Home', url: '/' }, { name: 'Privacy Policy', url: '/privacy' }]} />
      <main className="pt-32 pb-24">
        <div className="container-luxury max-w-3xl">
          <p className="eyebrow mb-3">YOUR TRUST</p>
          <h1 className="heading-section mb-8">Privacy Policy</h1>
          <div className="space-y-8 text-soft-green leading-relaxed">
            <section>
              <h2 className="font-serif text-2xl text-forest mb-3">Information we collect</h2>
              <p>We collect the information needed to process orders, provide support, and improve your GlowTeva experience. This may include contact, delivery, and account details.</p>
            </section>
            <section>
              <h2 className="font-serif text-2xl text-forest mb-3">How we use it</h2>
              <p>Your information is used to fulfill purchases, communicate about your account, and maintain the security of our services. We do not sell personal information.</p>
            </section>
            <section>
              <h2 className="font-serif text-2xl text-forest mb-3">Questions</h2>
              <p>For privacy requests or questions, please contact our team through the Contact page.</p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
