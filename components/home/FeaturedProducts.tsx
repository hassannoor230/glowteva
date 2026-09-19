'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/types';
import { api } from '@/lib/api';

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: Product[] }>('/products/featured')
      .then((res) => setProducts(res.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section-padding bg-muted-cream/50">
      <div className="container-luxury">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <p className="eyebrow mb-3">FEATURED COLLECTION</p>
            <h2 className="heading-section">Curated for Glow</h2>
          </div>
          <Link href="/shop?featured=true" className="link-underline text-sm text-forest tracking-wide">
            View All
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[4/5] w-full" />
                <Skeleton className="h-4 w-2/3 mt-4" />
                <Skeleton className="h-3 w-1/2 mt-2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {products.slice(0, 4).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
