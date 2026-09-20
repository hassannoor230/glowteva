import JsonLd from './JsonLd';

export default function OrganizationJsonLd() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://glowteva.com';
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GlowTeva Organics',
    url: base,
    logo: `${base}/favicon.svg`,
    description: 'Botanical rituals crafted for beautifully luminous skin. Premium organic skincare with pure ingredients and editorial luxury.',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-123-4567',
      contactType: 'customer service',
      areaServed: 'PK',
      availableLanguage: 'English',
    },
    sameAs: [
      'https://instagram.com/glowteva',
      'https://facebook.com/glowteva',
      'https://twitter.com/glowteva',
      'https://pinterest.com/glowteva',
    ],
  };
  return <JsonLd data={data} />;
}
