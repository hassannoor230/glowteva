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

export const metadata: Metadata = {
  title: 'GlowTeva Organics | Pure by Nature. Luxury by Choice.',
  description: 'Botanical rituals crafted for beautifully luminous skin. Discover premium organic skincare.',
};

export default function HomePage() {
  return (
    <>
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
