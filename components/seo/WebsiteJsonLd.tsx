import JsonLd from './JsonLd';

export default function WebsiteJsonLd() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://glowteva.com';
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'GlowTeva Organics',
    url: base,
    description: 'Botanical rituals crafted for beautifully luminous skin. Premium organic skincare with pure ingredients and editorial luxury.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${base}/shop?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
  return <JsonLd data={data} />;
}
