'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';

export const metadata: Metadata = {
  title: 'Checkout | GlowTeva Organics',
  description: 'Complete your order. Secure checkout with multiple payment options.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'GlowTeva Organics',
    title: 'Checkout | GlowTeva Organics',
    description: 'Complete your order. Secure checkout with multiple payment options.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Checkout | GlowTeva Organics',
    description: 'Complete your order.',
  },
};

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.literal('Pakistan'),
  phone: z.string().optional(),
  couponCode: z.string().optional(),
});

type FormData = z.infer<typeof schema>;
type CheckoutPaymentMethod = 'COD' | 'BANK_TRANSFER' | 'JAZZCASH' | 'EASYPAISA';

interface PaymentSettings {
  codEnabled: boolean;
  bankTransferEnabled: boolean;
  jazzcashEnabled: boolean;
  easypaisaEnabled: boolean;
  bankTransfer: { bankName: string; accountTitle: string; accountNumber: string; iban: string; branch: string; instructions: string };
  jazzcash: { accountName: string; accountNumber: string; instructions: string };
  easypaisa: { accountName: string; accountNumber: string; instructions: string };
  generalInstructions: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { user, token } = useAuthStore();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>('COD');
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const subtotal = getSubtotal();
  const shipping = subtotal >= 75 ? 0 : 8.5;
  const total = Math.max(0, subtotal + shipping - discount);

  useEffect(() => {
    if (!token) return;
    api.get<{ data: PaymentSettings }>('/payments/settings', { token })
      .then((res) => setPaymentSettings(res.data))
      .catch(() => setPaymentSettings(null));
  }, [token]);

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { country: 'Pakistan', email: user?.email || '' },
  });

  if (items.length === 0) {
    return (
      <>
        <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'Checkout', url: 'https://glowteva.com/checkout', description: 'Complete your order.' }} />
        <BreadcrumbJsonLd items={[{ name: 'Home', url: '/' }, { name: 'Checkout', url: '/checkout' }]} />
        <div className="pt-28 container-luxury text-center py-32">
          <p className="font-serif text-2xl text-forest mb-4">Your cart is empty</p>
          <Link href="/shop" className="btn-primary">Continue Shopping</Link>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'Checkout', url: 'https://glowteva.com/checkout', description: 'Complete your order.' }} />
        <BreadcrumbJsonLd items={[{ name: 'Home', url: '/' }, { name: 'Checkout', url: '/checkout' }]} />
        <div className="pt-28 container-luxury text-center py-32">
          <p className="font-serif text-2xl text-forest mb-4">Please sign in to checkout</p>
          <Link href="/login" className="btn-primary">Sign In</Link>
        </div>
      </>
    );
  }

  const applyCoupon = async () => {
    const code = getValues('couponCode');
    if (!code) return;
    try {
      const res = await api.post<{ data: { discount: number } }>('/coupon/validate', { code, subtotal });
      setDiscount(res.data.discount);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReceiptChange = (file: File | undefined) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Receipt must be a JPG, PNG, or WEBP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Receipt file must be smaller than 5 MB.');
      return;
    }
    setError('');
    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: FormData) => {
    const isManual = ['BANK_TRANSFER', 'JAZZCASH', 'EASYPAISA'].includes(paymentMethod);
    if (isManual && !transactionId.trim()) {
      setError('Please enter your transaction ID.');
      return;
    }
    if (isManual && !receiptFile) {
      setError('Please upload your payment receipt.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const orderRes = await api.post<{ data: { _id: string; orderNumber: string } }>('/orders', {
        items: items.map((i) => ({
          productId: i.product._id,
          variantId: i.variant?._id,
          selectedOptions: i.selectedOptions,
          quantity: i.quantity,
        })),
        shippingAddress: {
          firstName: data.firstName,
          lastName: data.lastName,
          street: data.street,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
          phone: data.phone,
        },
        couponCode: data.couponCode || undefined,
        paymentMethod,
      }, { token: token || undefined });

      const order = orderRes.data;

      if (paymentMethod === 'COD') {
        clearCart();
        router.push(`/checkout/success?order=${order.orderNumber}&payment=cod`);
        return;
      }

      if (isManual) {
        const uploadData = new FormData();
        uploadData.append('receipt', receiptFile as File);
        const receiptRes = await api.post<{ data: { url: string } }>('/payments/receipt', uploadData, { token: token || undefined });
        await api.post('/payments/manual', {
          orderId: order._id,
          method: paymentMethod,
          transactionId: transactionId.trim(),
          receiptUrl: receiptRes.data.url,
        }, { token: token || undefined });
        clearCart();
        router.push(`/checkout/success?order=${order.orderNumber}&payment=pending`);
        return;
      }

      try {
        const payRes = await api.post<{ data: { url: string } }>('/payments/create-checkout-session', {
          orderId: order._id,
        }, { token: token || undefined });

        if (payRes.data?.url) {
          clearCart();
          window.location.href = payRes.data.url;
          return;
        }

        clearCart();
        router.push(`/checkout/success?order=${order.orderNumber}`);
        return;
      } catch {
        clearCart();
        router.push(`/checkout/success?order=${order.orderNumber}`);
        return;
      }
    } catch (err: any) {
      setError(err.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://glowteva.com';

  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'Checkout', url: `${base}/checkout`, description: 'Complete your order. Secure checkout with multiple payment options.' }} />
      <BreadcrumbJsonLd items={[{ name: 'Home', url: '/' }, { name: 'Checkout', url: '/checkout' }]} />
      <div className="pt-28 pb-20">
        <div className="container-luxury max-w-5xl">
          <h1 className="heading-section text-center mb-12">Checkout</h1>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-3 space-y-6">
              <h2 className="font-serif text-xl text-forest">Shipping Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input {...register('firstName')} />
                  {errors.firstName && <p className="text-red-600 text-xs mt-1">Required</p>}
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input {...register('lastName')} />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" {...register('email')} />
              </div>
              <div>
                <Label>Street Address</Label>
                <Input {...register('street')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>City</Label>
                  <Input {...register('city')} />
                </div>
                <div>
                  <Label>State</Label>
                  <Input {...register('state')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Postal Code</Label>
                  <Input {...register('postalCode')} />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input {...register('country')} readOnly />
                  <p className="text-xs text-soft-green mt-1">We currently deliver within Pakistan only.</p>
                </div>
              </div>
              <div>
                <Label>Phone (optional)</Label>
                <Input {...register('phone')} />
              </div>
              <div className="border border-soft-border p-5 space-y-5">
                <div>
                  <p className="eyebrow mb-2">PAYMENT</p>
                  <h2 className="font-serif text-xl text-forest">Choose how to pay</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    ...(paymentSettings?.codEnabled !== false ? [{ value: 'COD' as const, label: 'Cash on Delivery' }] : []),
                    ...(paymentSettings?.bankTransferEnabled ? [{ value: 'BANK_TRANSFER' as const, label: 'Bank Transfer' }] : []),
                    ...(paymentSettings?.jazzcashEnabled ? [{ value: 'JAZZCASH' as const, label: 'JazzCash' }] : []),
                    ...(paymentSettings?.easypaisaEnabled ? [{ value: 'EASYPAISA' as const, label: 'Easypaisa' }] : []),
                  ].map((option) => (
                    <button key={option.value} type="button" onClick={() => setPaymentMethod(option.value)} className={`border px-3 py-3 text-left text-sm transition-colors ${paymentMethod === option.value ? 'border-gold bg-gold/10 text-forest' : 'border-soft-border text-soft-green hover:border-gold'}`}>
                      <span className="block font-medium">{option.label}</span>
                      <span className="text-xs">{option.value === 'COD' ? 'Pay when delivered' : 'Manual verification'}</span>
                    </button>
                  ))}
                </div>
                {paymentMethod === 'COD' && <p className="text-sm text-soft-green">Your payment will remain pending until the order is delivered.</p>}
                {['BANK_TRANSFER', 'JAZZCASH', 'EASYPAISA'].includes(paymentMethod) && paymentSettings && (
                  <div className="space-y-4 bg-muted-cream/50 p-4 text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-forest">
                      {paymentMethod === 'BANK_TRANSFER' ? (
                        <>
                          <p>Bank: <strong>{paymentSettings.bankTransfer.bankName || 'Not configured'}</strong></p>
                          <p>Account title: <strong>{paymentSettings.bankTransfer.accountTitle || 'Not configured'}</strong></p>
                          <p>Account number: <strong>{paymentSettings.bankTransfer.accountNumber || 'Not configured'}</strong></p>
                          <p>IBAN: <strong>{paymentSettings.bankTransfer.iban || 'Not configured'}</strong></p>
                        </>
                      ) : (
                        <>
                          <p>Account name: <strong>{paymentMethod === 'JAZZCASH' ? paymentSettings.jazzcash.accountName : paymentSettings.easypaisa.accountName}</strong></p>
                          <p>Number: <strong>{paymentMethod === 'JAZZCASH' ? paymentSettings.jazzcash.accountNumber : paymentSettings.easypaisa.accountNumber}</strong></p>
                        </>
                      )}
                    </div>
                    <p className="text-soft-green">{paymentSettings.generalInstructions || 'Transfer the exact amount, then submit your transaction ID and receipt.'}</p>
                    <Input value={transactionId} onChange={(event) => setTransactionId(event.target.value)} placeholder="Transaction ID / payment reference" />
                    <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => handleReceiptChange(event.target.files?.[0])} />
                    {receiptFile && <div className="flex items-center gap-3"><img src={receiptPreview} alt="Receipt preview" className="h-16 w-16 object-cover border border-soft-border" /><div className="flex-1"><p className="text-xs text-soft-green">Ready: {receiptFile.name}</p><button type="button" className="text-xs text-red-600" onClick={() => { setReceiptFile(null); setReceiptPreview(''); }}>Remove receipt</button></div></div>}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <Input placeholder="Coupon code" {...register('couponCode')} />
                <Button type="button" variant="outline" onClick={applyCoupon}>Apply</Button>
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Processing...' : `Pay ${formatPrice(total)}`}
              </Button>
            </form>

            <div className="lg:col-span-2">
              <div className="card-luxury p-6 sticky top-28">
                <h3 className="font-serif text-lg text-forest mb-6">Order Summary</h3>
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.product._id + (item.variant?._id ?? '')} className="flex gap-3">
                      <div className="relative w-14 h-16 bg-muted-cream flex-shrink-0">
                        <Image src={item.variant?.image || item.variant?.images?.[0] || item.product.thumbnail} alt="" fill className="object-cover" sizes="56px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-forest line-clamp-1">{item.product.name}</p>
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <p className="text-[10px] text-soft-green uppercase tracking-wide">
                            {Object.entries(item.selectedOptions).map(([key, value]) => `${key}: ${value}`).join(' / ')}
                          </p>
                        )}
                        <p className="text-xs text-soft-green">Qty {item.quantity}</p>
                      </div>
                      <p className="text-sm text-forest">{formatPrice((item.variant?.price ?? item.product.price) * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 text-sm border-t border-soft-border pt-4">
                  <div className="flex justify-between"><span className="text-soft-green">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-soft-green">Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
                  {discount > 0 && <div className="flex justify-between text-gold"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
                  <div className="flex justify-between font-medium text-forest text-base pt-2 border-t border-soft-border">
                    <span>Total</span><span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
