'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { JournalArticle } from '@/types';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'Journal | Stories & Rituals',
  description: 'Botanical skincare, rituals, ingredients, and the quieter side of beauty. Discover articles from the GlowTeva Journal.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'GlowTeva Organics',
    title: 'Journal | Stories & Rituals',
    description: 'Botanical skincare, rituals, ingredients, and the quieter side of beauty.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Journal | Stories & Rituals',
    description: 'Botanical skincare, rituals, ingredients, and the quieter side of beauty.',
  },
};

export default function JournalPage() {
  const [articles, setArticles] = useState<JournalArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://glowteva.com';

  useEffect(() => {
    api.get<{ data: JournalArticle[] }>('/journal')
      .then((res) => setArticles((res.data as any)?.journals || res.data as any || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'ItemList', name: 'Journal', itemListElement: articles.slice(0, 10).map((a, i) => ({ '@type': 'Article', position: i + 1, name: a.title, url: `${base}/journal/${a.slug}`, description: a.excerpt })) }} />
      <BreadcrumbJsonLd items={[{ name: 'Home', url: '/' }, { name: 'Journal', url: '/journal' }]} />
      <div className="pt-28 pb-20">
        <div className="container-luxury">
          <div className="text-center mb-16">
            <p className="eyebrow mb-3">THE JOURNAL</p>
            <h1 className="heading-section">Stories & Rituals</h1>
            <p className="body-elegant mt-4 max-w-lg mx-auto">Botanical skincare, rituals, ingredients, and the quieter side of beauty.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (<div key={i}><Skeleton className="aspect-[16/10]" /><Skeleton className="h-6 w-3/4 mt-4" /></div>))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {articles.map((a, i) => (
                <Link key={a._id} href={`/journal/${a.slug}`} className={`group ${i === 0 ? 'md:col-span-2 md:row-span-1' : ''}`}>
                  <div className={`relative overflow-hidden mb-5 bg-muted-cream ${i === 0 ? 'aspect-[21/9]' : 'aspect-[16/10]'}`}>
                    <Image src={a.coverImage} alt={a.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes={i === 0 ? '66vw' : '33vw'} />
                  </div>
                  <p className="text-[11px] tracking-[0.15em] uppercase text-soft-green mb-2">{a.category} · {a.readingTime} min read</p>
                  <h2 className={`font-serif text-forest group-hover:text-gold transition-colors ${i === 0 ? 'text-2xl md:text-3xl' : 'text-xl'}`}>{a.title}</h2>
                  <p className="text-sm text-soft-green mt-2 line-clamp-2">{a.excerpt}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
