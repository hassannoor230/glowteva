import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/utils';
import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'Cart | GlowTeva Organics',
  description: 'Your shopping cart at GlowTeva Organics. Review your botanical ritual selections.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'GlowTeva Organics',
    title: 'Cart | GlowTeva Organics',
    description: 'Your shopping cart at GlowTeva Organics.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cart | GlowTeva Organics',
    description: 'Your shopping cart at GlowTeva Organics.',
  },
};

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();
  const shipping = subtotal >= 75 ? 0 : 8.5;
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://glowteva.com';

  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'Shopping Cart', url: `${base}/cart`, description: 'Your shopping cart at GlowTeva Organics.' }} />
      <BreadcrumbJsonLd items={[{ name: 'Home', url: '/' }, { name: 'Cart', url: '/cart' }]} />
      <main className="pt-28 pb-20">
        <div className="container-luxury max-w-4xl">
          <h1 className="heading-section text-center mb-12">Your Ritual</h1>
          {items.length === 0 ? (
            <div className="text-center py-32">
              <p className="font-serif text-2xl text-forest mb-2">Your cart is empty</p>
              <p className="text-soft-green text-sm mb-8">Discover our botanical collection</p>
              <Link href="/shop" className="btn-primary">Explore Collection</Link>
            </div>
          ) : (
            <>
              <div className="space-y-6 mb-12">
                {items.map((item) => (
                  <div key={item.product._id} className="flex gap-6 py-6 border-b border-soft-border">
                    <div className="relative w-24 h-28 bg-muted-cream flex-shrink-0">
                      <Image src={item.product.thumbnail} alt={item.product.name} fill className="object-cover" sizes="96px" />
                    </div>
                    <div className="flex-1">
                      <Link href={`/products/${item.product.slug}`} className="font-medium text-forest hover:text-gold">{item.product.name}</Link>
                      <p className="text-sm text-soft-green mt-1">{formatPrice(item.product.price)}</p>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center border border-soft-border">
                          <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)} className="p-2"><Minus size={14} /></button>
                          <span className="px-3 text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)} className="p-2"><Plus size={14} /></button>
                        </div>
                        <button onClick={() => removeItem(item.product._id)} className="text-soft-green hover:text-red-600"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <p className="font-medium text-forest">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="max-w-sm ml-auto space-y-3">
                <div className="flex justify-between text-sm"><span className="text-soft-green">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-soft-green">Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
                <div className="flex justify-between font-medium text-lg border-t border-soft-border pt-3"><span>Total</span><span>{formatPrice(subtotal + shipping)}</span></div>
                <Link href="/checkout" className="btn-primary w-full text-center mt-4">Proceed to Checkout</Link>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
