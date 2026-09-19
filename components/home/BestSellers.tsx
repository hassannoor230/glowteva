'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/types';
import { api } from '@/lib/api';

export default function BestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: Product[] }>('/products/best-sellers')
      .then((res) => setProducts(res.data || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section-padding bg-cream">
      <div className="container-luxury">
        <div className="text-center mb-12">
          <p className="eyebrow mb-3">MOST LOVED</p>
          <h2 className="heading-section">Best Sellers</h2>
          <div className="gold-line mx-auto mt-6" />
        </div>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[4/5] w-full" />
                <Skeleton className="h-4 w-2/3 mt-4" />
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
        <div className="text-center mt-12">
          <Link href="/shop?bestSeller=true" className="btn-secondary">Shop Best Sellers</Link>
        </div>
      </div>
    </section>
  );
}
