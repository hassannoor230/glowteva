import JsonLd from './JsonLd';

type FAQItem = {
  question: string;
  answer: string;
};

type FAQJsonLdProps = {
  items: FAQItem[];
};

export default function FAQJsonLd({ items }: FAQJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
  return <JsonLd data={data} />;
}
