'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Heart, Leaf, BookOpen, MessageSquare } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import VariationSelector from '@/components/product/VariationSelector';
import VariationSummary from '@/components/product/VariationSummary';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product, ProductVariant, Review } from '@/types';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import ServiceJsonLd from '@/components/seo/ServiceJsonLd';

export const metadata: Metadata = {
  title: 'Product | GlowTeva Organics',
  description: 'Discover GlowTeva Organics premium organic skincare products.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'GlowTeva Organics',
    title: 'Product | GlowTeva Organics',
    description: 'Discover GlowTeva Organics premium organic skincare products.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Product | GlowTeva Organics',
    description: 'Discover GlowTeva Organics premium organic skincare products.',
  },
};

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);

  const displayPrice = selectedVariant?.price ?? product?.price ?? 0;
  const displayCompareAtPrice = selectedVariant?.compareAtPrice ?? product?.compareAtPrice;
  const displayStock = selectedVariant ? selectedVariant.stock : product?.stock ?? 0;
  const requiresVariantSelection = Boolean(product?.options?.length);
  const canAddToCart = !requiresVariantSelection || Boolean(selectedVariant);

  const isWishlisted = Boolean(product && user?.wishlist?.some((item) => item._id === product._id));

  const handleVariantChange = (variant: ProductVariant | null, options: Record<string, string>) => {
    setSelectedVariant(variant);
    setSelectedOptions(options);
    setQty((prev) => Math.min(prev, variant ? variant.stock : product?.stock ?? prev));
  };

  const toggleWishlist = async () => {
    if (!product) return;
    if (!token || !user) { router.push('/login'); return; }
    if (isWishlisted) {
      await api.delete(`/users/wishlist/${product._id}`, { token });
    } else {
      await api.post('/users/wishlist', { productId: product._id }, { token });
    }
    await useAuthStore.getState().fetchMe();
  };

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.get<{ data: Product }>(`/products/slug/${slug}`)
      .then(async (res) => {
        const p = res.data;
        setProduct(p);
        setActiveImage(0);
        const [rel, revs] = await Promise.all([
          api.get<{ data: Product[] }>(`/products/${p._id}/related`).catch(() => ({ data: [] })),
          api.get<{ data: { reviews: Review[] } }>(`/reviews/product/${p._id}`).catch(() => ({ data: { reviews: [] } })),
        ]);
        setRelated(rel.data || []);
        setReviews((revs.data as any)?.reviews || []);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-28 container-luxury pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-[4/5]" />
          <div className="space-y-4"><Skeleton className="h-8 w-2/3" /><Skeleton className="h-4 w-1/3" /><Skeleton className="h-24 w-full" /></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-28 container-luxury pb-20 text-center py-32">
        <p className="font-serif text-2xl text-forest mb-4">Product not found</p>
        <Link href="/shop" className="btn-primary">Back to Shop</Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [product.thumbnail];
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://glowteva.com';

  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: product.name, url: `${base}/products/${product.slug}`, description: product.shortDescription }} />
      <BreadcrumbJsonLd items={[{ name: 'Home', url: '/' }, { name: 'Shop', url: '/shop' }, { name: product.name, url: `/products/${product.slug}` }]} />
      <ServiceJsonLd serviceName={product.name} serviceDescription={product.description} serviceUrl={`${base}/products/${product.slug}`} providerName="GlowTeva Organics" />
      <div className="pt-28 pb-20">
        <div className="container-luxury">
          <nav className="text-xs text-soft-green mb-8 flex gap-2">
            <Link href="/" className="hover:text-forest">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-forest">Shop</Link>
            <span>/</span>
            <span className="text-forest">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            <div>
              <div className="relative aspect-[4/5] overflow-hidden bg-muted-cream mb-4">
                <Image src={images[activeImage]} alt={product.name} fill className="object-cover" sizes="50vw" priority />
              </div>
              {images.length > 1 && (
                <div className="flex gap-3">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImage(i)} className={`relative w-20 h-24 overflow-hidden border-2 transition-colors ${i === activeImage ? 'border-gold' : 'border-transparent'}`}>
                      <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-[11px] tracking-[0.15em] uppercase text-soft-green mb-2">{product.category}</p>
              <h1 className="font-serif text-3xl md:text-4xl text-forest mb-3">{product.name}</h1>
              {product.rating > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-gold">{'★'.repeat(Math.round(product.rating))}</span>
                  <span className="text-sm text-soft-green">{product.rating} ({product.reviewCount} reviews)</span>
                </div>
              )}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl font-medium text-forest">{formatPrice(displayPrice)}</span>
                {displayCompareAtPrice && displayCompareAtPrice > displayPrice && (
                  <span className="text-lg text-soft-green/60 line-through">{formatPrice(displayCompareAtPrice)}</span>
                )}
              </div>
              <p className="text-soft-green leading-relaxed mb-8">{product.shortDescription}</p>

              {product.options?.length > 0 && (
                <div className="mb-8">
                  <VariationSelector product={product} onVariantChange={handleVariantChange} />
                </div>
              )}

              {product.options?.length > 0 && (
                <VariationSummary product={product} variant={selectedVariant} selectedOptions={selectedOptions} />
              )}

              <div className="flex items-center gap-4 mb-8 mt-8">
                <div className="flex items-center border border-soft-border">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 text-soft-green hover:text-forest" aria-label="Decrease"><Minus size={16} /></button>
                  <span className="px-4 text-forest">{qty}</span>
                  <button onClick={() => setQty(Math.min(displayStock, qty + 1))} className="p-3 text-soft-green hover:text-forest" aria-label="Increase"><Plus size={16} /></button>
                </div>
                <button onClick={() => { if (!canAddToCart) return; addItem(product, qty, selectedVariant ?? undefined, selectedOptions); }} className="btn-primary flex-1" disabled={!canAddToCart || displayStock === 0}>
                  {!canAddToCart ? 'Select Variation' : displayStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button onClick={toggleWishlist} className="p-3.5 border border-soft-border text-forest hover:text-gold transition-colors" aria-label="Wishlist"><Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} className={isWishlisted ? 'text-gold' : ''} /></button>
              </div>

              {product.benefits?.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xs tracking-[0.15em] uppercase text-forest font-medium mb-3">Benefits</h3>
                  <ul className="space-y-1">
                    {product.benefits.map((b) => (<li key={b} className="text-sm text-soft-green flex items-center gap-2"><span className="w-1 h-1 bg-gold rounded-full" />{b}</li>))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 border-t border-soft-border pt-10">
            <div className="card-luxury p-6 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gold" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center"><Leaf className="text-gold" size={18} /></div>
                <div>
                  <h3 className="font-serif text-lg text-forest">Ingredients</h3>
                  {product.ingredients?.length > 0 && <p className="text-[10px] tracking-wider uppercase text-soft-green">{product.ingredients.length} botanical sources</p>}
                </div>
              </div>
              {product.ingredients?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {product.ingredients.map((ing) => (<span key={ing} className="px-3 py-1.5 bg-muted-cream text-sm text-forest rounded-full border border-soft-border/50 hover:border-gold/50 transition-colors">{ing}</span>))}
                </div>
              ) : (<p className="text-soft-green text-sm">No ingredients listed</p>)}
            </div>

            <div className="card-luxury p-6 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-forest" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-forest/10 flex items-center justify-center"><BookOpen className="text-forest" size={18} /></div>
                <div>
                  <h3 className="font-serif text-lg text-forest">How to Use</h3>
                  <p className="text-[10px] tracking-wider uppercase text-soft-green">Application guide</p>
                </div>
              </div>
              {product.howToUse ? (<p className="text-soft-green text-sm leading-relaxed pl-2">{product.howToUse}</p>) : (<p className="text-soft-green text-sm pl-2">No usage instructions available</p>)}
            </div>

            <div className="card-luxury p-6 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gold" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center"><MessageSquare className="text-gold" size={18} /></div>
                <div>
                  <h3 className="font-serif text-lg text-forest">Reviews</h3>
                  {product.rating > 0 ? (<div className="flex items-center gap-1"><span className="text-gold text-xs">{'★'.repeat(Math.round(product.rating))}</span><span className="text-xs text-soft-green">{product.rating.toFixed(1)} ({product.reviewCount})</span></div>) : (<p className="text-xs text-soft-green">No ratings yet</p>)}
                </div>
              </div>
              {reviews.length === 0 ? (<p className="text-soft-green text-sm">No reviews yet. Be the first to share your experience.</p>) : (
                <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                  {reviews.map((r) => (
                    <div key={r._id} className="border-b border-soft-border pb-3 last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gold text-xs">{'★'.repeat(r.rating)}</span>
                        {r.verifiedPurchase && (<span className="text-[10px] tracking-wider uppercase text-gold bg-gold/10 px-1.5 py-0.5 rounded">Verified</span>)}
                      </div>
                      <h4 className="font-medium text-forest text-sm">{r.title}</h4>
                      <p className="text-soft-green text-sm mt-1 leading-relaxed">{r.text}</p>
                      <p className="text-xs text-soft-green/60 mt-2 italic">— {r.user?.name}</p>
                    </div>
                  ))}
                </div>
              )}
              {reviews.length > 0 && (<button className="text-xs text-gold hover:text-forest transition-colors font-medium tracking-wide">Read all reviews →</button>)}
            </div>
          </div>

          {related.length > 0 && (
            <div className="mt-24">
              <h2 className="heading-section text-center mb-12">Complete Your Ritual</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {related.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
