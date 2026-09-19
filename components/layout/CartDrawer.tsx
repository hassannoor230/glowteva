'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/utils';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-forest/30 backdrop-blur-sm" onClick={closeCart} />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 bottom-0 z-[80] w-full max-w-md bg-cream shadow-elegant flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-soft-border">
              <h2 className="font-serif text-xl text-forest">Your Ritual</h2>
              <button onClick={closeCart} className="p-2 text-soft-green hover:text-forest" aria-label="Close cart">
                <X size={20} />
              </button>
            </div>
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <p className="font-serif text-2xl text-forest mb-2">Your cart is empty</p>
                <p className="text-soft-green text-sm mb-8">Discover our botanical collection</p>
                <Link href="/shop" onClick={closeCart} className="btn-primary">Explore Collection</Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {items.map((item) => (
                    <div key={item.product._id + (item.variant?._id ?? '')} className="flex gap-4">
                      <div className="relative w-20 h-24 bg-muted-cream flex-shrink-0 overflow-hidden">
                        <Image src={item.variant?.image || item.variant?.images?.[0] || item.product.thumbnail} alt={item.product.name} fill className="object-cover" sizes="80px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.product.slug}`} onClick={closeCart}
                          className="font-medium text-forest text-sm hover:text-gold transition-colors line-clamp-2">
                          {item.product.name}
                        </Link>
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <p className="text-[11px] text-soft-green mt-1 uppercase tracking-wide">
                            {Object.entries(item.selectedOptions).map(([key, value]) => `${key}: ${value}`).join(' / ')}
                          </p>
                        )}
                        <p className="text-soft-green text-sm mt-1">{formatPrice(item.variant?.price ?? item.product.price)}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center border border-soft-border">
                            <button onClick={() => updateQuantity(item.product._id, item.quantity - 1, item.variant?._id)}
                              className="p-1.5 text-soft-green hover:text-forest" aria-label="Decrease"><Minus size={14} /></button>
                            <span className="px-3 text-sm text-forest">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.product._id, item.quantity + 1, item.variant?._id)}
                              className="p-1.5 text-soft-green hover:text-forest" aria-label="Increase"><Plus size={14} /></button>
                          </div>
                          <button onClick={() => removeItem(item.product._id, item.variant?._id)}
                            className="p-1.5 text-soft-green hover:text-red-600" aria-label="Remove"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-6 border-t border-soft-border space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-soft-green">Subtotal</span>
                    <span className="font-medium text-forest">{formatPrice(subtotal)}</span>
                  </div>
                  <p className="text-xs text-soft-green">Shipping calculated at checkout</p>
                  <Link href="/checkout" onClick={closeCart} className="btn-primary w-full text-center">Proceed to Checkout</Link>
                  <button onClick={closeCart} className="btn-ghost w-full text-center text-sm">Continue Shopping</button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
