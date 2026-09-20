'use client';

import { Suspense } from 'react';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/types';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Check, RotateCcw, SlidersHorizontal } from 'lucide-react';
import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import ServiceJsonLd from '@/components/seo/ServiceJsonLd';

export const metadata: Metadata = {
  title: 'Shop GlowTeva | Premium Organic Skincare',
  description: 'Browse our full collection of premium organic skincare. Pure botanical ingredients, elegant formulations, and luxury rituals for luminous skin.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'GlowTeva Organics',
    title: 'Shop GlowTeva | Premium Organic Skincare',
    description: 'Browse our full collection of premium organic skincare. Pure botanical ingredients for luminous skin.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop GlowTeva',
    description: 'Browse our full collection of premium organic skincare.',
  },
};

const sorts = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'name', label: 'Name' },
];

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string; slug: string; parent?: string | null }[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const featured = searchParams.get('featured') || '';
  const bestSeller = searchParams.get('bestSeller') || '';
  const newArrival = searchParams.get('newArrival') || '';
  const tags = searchParams.get('tags') || '';
  const onSale = searchParams.get('onSale') || '';
  const skinConcern = searchParams.get('skinConcern') || '';

  const updateParams = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    if (!updates.page) params.delete('page');
    router.push(`/shop?${params.toString()}`);
  }, [searchParams, router]);

  useEffect(() => {
    api.get<{ data: { _id: string; name: string; slug: string }[] }>('/categories')
      .then((res) => setCategories((res.data || []).filter((category, index, all) => all.findIndex(item => item.name === category.name) === index)))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort);
    if (search) params.set('search', search);
    if (page > 1) params.set('page', String(page));
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (featured) params.set('featured', featured);
    if (bestSeller) params.set('bestSeller', bestSeller);
    if (newArrival) params.set('newArrival', newArrival);
    if (tags) params.set('tags', tags);
    if (onSale) params.set('onSale', onSale);
    if (skinConcern) params.set('skinConcern', skinConcern);
    params.set('limit', '12');

    api.get<{ data: { products: Product[]; pagination: any } }>(`/products?${params}`)
      .then((res) => {
        setProducts(res.data?.products || []);
        setPagination(res.data?.pagination || { page: 1, pages: 1, total: 0 });
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category, sort, search, page, minPrice, maxPrice, featured, bestSeller, newArrival, tags, onSale, skinConcern]);

  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://glowteva.com';
  const title = search ? `Search: "${search}" | GlowTeva Organics` : 'Shop GlowTeva | Premium Organic Skincare';
  const description = search
    ? `Search results for "${search}" at GlowTeva Organics. Premium organic skincare with pure botanical ingredients.`
    : 'Browse our full collection of premium organic skincare. Pure botanical ingredients, elegant formulations, and luxury rituals for luminous skin.';

  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'ItemList', name: 'Shop GlowTeva', itemListElement: products.slice(0, 10).map((p, i) => ({ '@type': 'Product', position: i + 1, name: p.name, url: `${base}/products/${p.slug}` })) }} />
      <BreadcrumbJsonLd items={[{ name: 'Home', url: '/' }, { name: 'Shop', url: '/shop' }]} />
      <ServiceJsonLd serviceName="Organic Skincare Shopping" serviceDescription="Browse and shop premium organic skincare products at GlowTeva Organics." serviceUrl={`${base}/shop`} />
      <div className="pt-28 pb-20">
        <div className="container-luxury">
          <div className="mb-12 text-center">
            <p className="eyebrow mb-3">THE COLLECTION</p>
            <h1 className="heading-section">Shop GlowTeva</h1>
            {search && <p className="mt-4 text-soft-green">Results for &ldquo;{search}&rdquo;</p>}
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            <aside className={cn('lg:w-64 flex-shrink-0', filtersOpen ? 'block' : 'hidden lg:block')}>
              <div className="border border-soft-border/80 bg-white/70 p-5 shadow-soft lg:sticky lg:top-28">
                <div className="flex items-start justify-between gap-4 border-b border-soft-border/70 pb-5">
                  <div>
                    <div className="flex items-center gap-2 text-forest">
                      <SlidersHorizontal size={16} strokeWidth={1.7} />
                      <h2 className="font-serif text-lg">Refine selection</h2>
                    </div>
                    <p className="mt-1 text-xs tracking-wide text-soft-green">{categories.length} categories</p>
                  </div>
                  {(category || minPrice || maxPrice) && (
                    <button type="button" onClick={() => router.push('/shop')} className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.12em] text-soft-green transition-colors hover:text-gold">
                      <RotateCcw size={12} /> Clear
                    </button>
                  )}
                </div>

                <div className="border-b border-soft-border/70 py-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-[11px] font-medium uppercase tracking-[0.18em] text-forest">Categories</h3>
                    <span className="text-[11px] text-soft-green">{category ? '1 selected' : 'All'}</span>
                  </div>
                  <ul className="max-h-72 space-y-1 overflow-y-auto pr-2">
                    <li>
                      <button type="button" onClick={() => updateParams({ category: '' })} aria-pressed={!category} className={cn('flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors', !category ? 'bg-forest text-cream' : 'text-soft-green hover:bg-muted-cream/70 hover:text-forest')}>
                        <span>All categories</span> {!category && <Check size={15} />}
                      </button>
                    </li>
                    {categories.map((c) => {
                      const selected = category === c.name;
                      return (
                        <li key={c._id}>
                          <button type="button" onClick={() => updateParams({ category: c.name })} aria-pressed={selected} className={cn('flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors', selected ? 'bg-forest text-cream' : 'text-soft-green hover:bg-muted-cream/70 hover:text-forest')}>
                            <span className="truncate">{c.name}</span> {selected && <Check size={15} />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="pt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-[11px] font-medium uppercase tracking-[0.18em] text-forest">Price range</h3>
                    {(minPrice || maxPrice) && <span className="text-[11px] text-gold">Active</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="relative">
                      <span className="sr-only">Minimum price</span>
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-soft-green">$</span>
                      <input type="number" placeholder="Min" defaultValue={minPrice} className="input-luxury w-full py-2.5 pl-7 text-sm" onBlur={(e) => updateParams({ minPrice: e.target.value })} />
                    </label>
                    <label className="relative">
                      <span className="sr-only">Maximum price</span>
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-soft-green">$</span>
                      <input type="number" placeholder="Max" defaultValue={maxPrice} className="input-luxury w-full py-2.5 pl-7 text-sm" onBlur={(e) => updateParams({ maxPrice: e.target.value })} />
                    </label>
                  </div>
                </div>
              </div>
            </aside>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-8">
                <button onClick={() => setFiltersOpen(!filtersOpen)} className="lg:hidden text-sm text-forest">{filtersOpen ? 'Hide Filters' : 'Show Filters'}</button>
                <p className="text-sm text-soft-green">{pagination.total} products</p>
                <select value={sort} onChange={(e) => updateParams({ sort: e.target.value })} className="input-luxury text-sm py-2 w-auto">
                  {sorts.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                  {[...Array(6)].map((_, i) => <div key={i}><Skeleton className="aspect-[4/5]" /><Skeleton className="h-4 w-2/3 mt-4" /></div>)}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20">
                  <p className="font-serif text-2xl text-forest mb-2">No products found</p>
                  <p className="text-soft-green text-sm mb-6">Try adjusting your filters</p>
                  <button onClick={() => router.push('/shop')} className="btn-secondary">Clear Filters</button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                    {products.map((p) => <ProductCard key={p._id} product={p} />)}
                  </div>
                  {pagination.pages > 1 && (
                    <div className="flex justify-center gap-2 mt-12">
                      {[...Array(pagination.pages)].map((_, i) => (
                        <button key={i} onClick={() => updateParams({ page: String(i + 1) })} className={cn('w-10 h-10 text-sm transition-colors', page === i + 1 ? 'bg-forest text-cream' : 'border border-soft-border text-forest hover:border-gold')}>{i + 1}</button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="pt-28 container-luxury"><Skeleton className="h-96 w-full" /></div>}>
      <ShopContent />
    </Suspense>
  );
}
