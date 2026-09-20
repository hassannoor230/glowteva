import JsonLd from './JsonLd';

type BreadcrumbItem = {
  name: string;
  url: string;
};

type BreadcrumbJsonLdProps = {
  items: BreadcrumbItem[];
};

export default function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://glowteva.com';
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${base}${item.url}`,
    })),
  };
  return <JsonLd data={data} />;
}
