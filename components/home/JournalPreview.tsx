'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { JournalArticle } from '@/types';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function JournalPreview() {
  const [articles, setArticles] = useState<JournalArticle[]>([]);

  useEffect(() => {
    api.get<{ data: JournalArticle[] }>('/journal/featured')
      .then((res) => setArticles(res.data || []))
      .catch(() => {});
  }, []);

  return (
    <section className="section-padding bg-cream">
      <div className="container-luxury">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <p className="eyebrow mb-3">THE JOURNAL</p>
            <h2 className="heading-section">Stories & Rituals</h2>
          </div>
          <Link href="/journal" className="link-underline text-sm text-forest tracking-wide">All Articles</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.slice(0, 3).map((a) => (
            <Link key={a._id} href={`/journal/${a.slug}`} className="group">
              <div className="relative aspect-[16/10] overflow-hidden mb-5 bg-muted-cream">
                <Image src={a.coverImage} alt={a.title} fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="33vw" />
              </div>
              <p className="text-[11px] tracking-[0.15em] uppercase text-soft-green mb-2">
                {a.category} · {a.readingTime} min
              </p>
              <h3 className="font-serif text-xl text-forest group-hover:text-gold transition-colors mb-2">
                {a.title}
              </h3>
              <p className="text-sm text-soft-green line-clamp-2">{a.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
