'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { JournalArticle } from '@/types';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'Journal Article | GlowTeva Organics',
  description: 'Discover articles about botanical skincare, rituals, and ingredients from the GlowTeva Journal.',
  openGraph: {
    type: 'article',
    locale: 'en_US',
    siteName: 'GlowTeva Organics',
    title: 'Journal Article | GlowTeva Organics',
    description: 'Discover articles about botanical skincare, rituals, and ingredients.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Journal Article | GlowTeva Organics',
    description: 'Discover articles about botanical skincare, rituals, and ingredients.',
  },
};

export default function JournalArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<JournalArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://glowteva.com';

  useEffect(() => {
    if (!slug) return;
    api.get<{ data: JournalArticle }>(`/journal/${slug}`)
      .then((res) => setArticle(res.data))
      .catch(() => setArticle(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="pt-28 container-luxury"><Skeleton className="h-96 w-full" /></div>;
  if (!article) {
    return (
      <div className="pt-28 container-luxury text-center py-32">
        <p className="font-serif text-2xl text-forest mb-4">Article not found</p>
        <Link href="/journal" className="btn-primary">Back to Journal</Link>
      </div>
    );
  }

  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Article', headline: article.title, description: article.excerpt, author: { '@type': 'Person', name: article.author }, datePublished: article.publishedAt, image: article.coverImage, url: `${base}/journal/${article.slug}` }} />
      <BreadcrumbJsonLd items={[{ name: 'Home', url: '/' }, { name: 'Journal', url: '/journal' }, { name: article.title, url: `/journal/${article.slug}` }]} />
      <article className="pt-28 pb-20">
        <div className="container-luxury max-w-3xl mx-auto">
          <nav className="text-xs text-soft-green mb-8">
            <Link href="/journal" className="hover:text-forest">Journal</Link>
            <span className="mx-2">/</span>
            <span className="text-forest">{article.title}</span>
          </nav>
          <p className="eyebrow mb-4">{article.category}</p>
          <h1 className="font-serif text-3xl md:text-5xl text-forest leading-tight mb-4">{article.title}</h1>
          <p className="text-sm text-soft-green mb-8">
            {article.author} · {article.readingTime} min read
            {article.publishedAt && ` · ${formatDate(article.publishedAt)}`}
          </p>
          <div className="relative aspect-[21/9] overflow-hidden mb-12">
            <Image src={article.coverImage} alt={article.title} fill className="object-cover" priority sizes="800px" />
          </div>
          <div className="prose prose-lg max-w-none">
            {article.content.split('\n\n').map((para, i) => (
              <p key={i} className="text-soft-green leading-relaxed mb-6 text-base md:text-lg">{para}</p>
            ))}
          </div>
          <div className="mt-16 pt-8 border-t border-soft-border">
            <Link href="/journal" className="link-underline text-sm text-forest">← Back to Journal</Link>
          </div>
        </div>
      </article>
    </>
  );
}
