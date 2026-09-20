import type { Metadata } from 'next';
import HeroSlider from '@/components/hero/HeroSlider';
import BrandPhilosophy from '@/components/home/BrandPhilosophy';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import BestSellers from '@/components/home/BestSellers';
import BotanicalIngredients from '@/components/home/BotanicalIngredients';
import EditorialStory from '@/components/home/EditorialStory';
import RitualSection from '@/components/home/RitualSection';
import Testimonials from '@/components/home/Testimonials';
import JournalPreview from '@/components/home/JournalPreview';
import SustainabilityTeaser from '@/components/home/SustainabilityTeaser';
import NewsletterSection from '@/components/home/NewsletterSection';
import JsonLd from '@/components/seo/JsonLd';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import LocalBusinessJsonLd from '@/components/seo/LocalBusinessJsonLd';
import ServiceJsonLd from '@/components/seo/ServiceJsonLd';

export const metadata: Metadata = {
  title: 'GlowTeva Organics | Pure by Nature. Luxury by Choice.',
  description: 'Botanical rituals crafted for beautifully luminous skin. Discover premium organic skincare.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'GlowTeva Organics',
    title: 'GlowTeva Organics | Pure by Nature. Luxury by Choice.',
    description: 'Botanical rituals crafted for beautifully luminous skin. Discover premium organic skincare.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GlowTeva Organics',
    description: 'Pure by Nature. Luxury by Choice.',
  },
};

export default function HomePage() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://glowteva.com';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'GlowTeva Organics Home',
    url: base,
    description: 'Botanical rituals crafted for beautifully luminous skin. Premium organic skincare with pure ingredients and editorial luxury.',
    isAccessibleForFree: true,
  };
  return (
    <>
      <JsonLd data={jsonLd} />
      <BreadcrumbJsonLd items={[{ name: 'Home', url: '/' }]} />
      <LocalBusinessJsonLd />
      <ServiceJsonLd
        serviceName="Organic Skincare"
        serviceDescription="Premium organic skincare products with pure botanical ingredients, crafted for luminous, healthy skin."
        serviceUrl={`${base}/shop`}
      />
      <ServiceJsonLd
        serviceName="Facial Oils"
        serviceDescription="Nourishing botanical facial oils for radiant, hydrated skin."
        serviceUrl={`${base}/shop?category=facial-oils`}
      />
      <ServiceJsonLd
        serviceName="Serums"
        serviceDescription="Targeted hydrating and treatment serums for a healthy glow."
        serviceUrl={`${base}/shop?category=serums`}
      />
      <HeroSlider />
      <BrandPhilosophy />
      <FeaturedProducts />
      <BestSellers />
      <BotanicalIngredients />
      <EditorialStory />
      <RitualSection />
      <Testimonials />
      <JournalPreview />
      <SustainabilityTeaser />
      <NewsletterSection />
    </>
  );
}
