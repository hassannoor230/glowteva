import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import SmoothScroll from '@/components/layout/SmoothScroll';
import SiteShell from '@/components/layout/SiteShell';
import OrganizationJsonLd from '@/components/seo/OrganizationJsonLd';
import WebsiteJsonLd from '@/components/seo/WebsiteJsonLd';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'GlowTeva Organics | Pure by Nature. Luxury by Choice.',
    template: '%s | GlowTeva Organics',
  },
  description:
    'Botanical rituals crafted for beautifully luminous skin. Premium organic skincare with pure ingredients and editorial luxury.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'GlowTeva Organics',
    title: 'GlowTeva Organics | Pure by Nature. Luxury by Choice.',
    description: 'Botanical rituals crafted for beautifully luminous skin. Premium organic skincare with pure ingredients and editorial luxury.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GlowTeva Organics',
    description: 'Pure by Nature. Luxury by Choice.',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <OrganizationJsonLd />
        <WebsiteJsonLd />
      </head>
      <body className="min-h-screen flex flex-col">
        <SmoothScroll>
          <SiteShell>{children}</SiteShell>
        </SmoothScroll>
      </body>
    </html>
  );
}
