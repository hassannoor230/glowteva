import JsonLd from './JsonLd';

type ServiceJsonLdProps = {
  serviceName: string;
  serviceDescription: string;
  serviceUrl: string;
  providerName?: string;
  areaServed?: string;
};

export default function ServiceJsonLd({
  serviceName,
  serviceDescription,
  serviceUrl,
  providerName = 'GlowTeva Organics',
  areaServed = 'PK',
}: ServiceJsonLdProps) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://glowteva.com';
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: serviceName,
    name: serviceName,
    description: serviceDescription,
    provider: {
      '@type': 'Organization',
      name: providerName,
      url: base,
    },
    areaServed: {
      '@type': 'GeoShape',
      name: areaServed,
    },
    url: serviceUrl,
  };
  return <JsonLd data={data} />;
}
