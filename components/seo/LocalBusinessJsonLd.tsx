import JsonLd from './JsonLd';

export default function LocalBusinessJsonLd() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://glowteva.com';
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    name: 'GlowTeva Organics',
    url: base,
    telephone: '+1-555-123-4567',
    email: 'hello@glowteva.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Botanical Lane',
      addressLocality: 'Green Valley',
      addressRegion: 'CA',
      postalCode: '90210',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 34.0522,
      longitude: -118.2437,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '10:00',
        closes: '16:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Sunday',
        closes: '00:00',
        opens: '00:00',
      },
    ],
    image: `${base}/favicon.svg`,
    description: 'Botanical rituals crafted for beautifully luminous skin. Premium organic skincare with pure ingredients and editorial luxury.',
    priceRange: '$$',
  };
  return <JsonLd data={data} />;
}
