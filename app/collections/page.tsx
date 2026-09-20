'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'Collections | Browse by Category',
  description: 'Explore our thoughtfully organized botanical collections — from skincare rituals to wellness essentials.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'GlowTeva Organics',
    title: 'Collections | Browse by Category',
    description: 'Explore our thoughtfully organized botanical collections — from skincare rituals to wellness essentials.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Collections',
    description: 'Explore our thoughtfully organized botanical collections.',
  },
};

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  order: number;
  children?: Category[];
}

export default function CollectionsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://glowteva.com';

  useEffect(() => {
    api.get<{ data: Category[] }>('/categories/tree')
      .then((res) => setCategories(res.data || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'ItemList', name: 'Collections', itemListElement: categories.map((c, i) => ({ '@type': 'Thing', position: i + 1, name: c.name, url: `${base}/shop?category=${encodeURIComponent(c.slug)}` })) }} />
      <BreadcrumbJsonLd items={[{ name: 'Home', url: '/' }, { name: 'Collections', url: '/collections' }]} />
      <div className="pt-28 pb-20">
        <div className="container-luxury">
          <div className="text-center mb-16">
            <p className="eyebrow mb-3">CURATED</p>
            <h1 className="heading-section">Collections</h1>
            <p className="body-elegant mt-4 max-w-2xl mx-auto">Explore our thoughtfully organized botanical collections — from skincare rituals to wellness essentials.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4"><Skeleton className="aspect-[4/5] w-full" /><Skeleton className="h-5 w-1/2" /><Skeleton className="h-3 w-full" /></div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-serif text-2xl text-forest mb-2">No collections yet</p>
              <p className="text-soft-green text-sm">Check back soon for new collections.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((c) => (
                <Link key={c._id} href={`/shop?category=${encodeURIComponent(c.slug)}`} className="group">
                  <div className="relative aspect-[4/5] overflow-hidden bg-muted-cream">
                    {c.image ? (
                      <Image src={c.image} alt={c.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted-cream">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-soft-green/30">
                          <path d="M21 8.5V6a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 6v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" />
                          <path d="M3.31 16.06 12 12.06l8.69 4" />
                          <path d="M5 12.19V16" />
                          <path d="M19 12.19V16" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-forest/20 group-hover:bg-forest/30 transition-colors" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h2 className="font-serif text-2xl text-cream">{c.name}</h2>
                      {c.description && <p className="text-cream/70 text-sm mt-1 line-clamp-2">{c.description}</p>}
                      {c.children && c.children.length > 0 && (
                        <p className="text-cream/50 text-xs mt-2 tracking-wide">{c.children.length} subcategories</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
