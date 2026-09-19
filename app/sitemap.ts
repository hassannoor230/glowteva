import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://glowteva.com';
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/collections`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/story`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/sustainability`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/journal`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];
}
