'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
  const params = useSearchParams();
  const order = params.get('order');

  return (
    <div className="pt-28 pb-20 min-h-[60vh] flex items-center">
      <div className="container-luxury text-center max-w-lg mx-auto">
        <div className="w-16 h-16 border-2 border-gold rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-gold text-2xl">✓</span>
        </div>
        <h1 className="heading-section mb-4">Thank You</h1>
        <p className="body-elegant mb-2">Your order has been received.</p>
        {order && <p className="text-sm text-soft-green mb-8">Order number: <span className="text-forest font-medium">{order}</span></p>}
        <p className="text-soft-green text-sm mb-10">
          A confirmation will be sent to your email. We are preparing your ritual with care.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/account" className="btn-primary">View Orders</Link>
          <Link href="/shop" className="btn-secondary">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
