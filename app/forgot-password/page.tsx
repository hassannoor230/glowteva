'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import JsonLd from '@/components/seo/JsonLd';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';

const schema = z.object({ email: z.string().email() });

type ForgotPasswordData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [msg, setMsg] = useState('');
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<ForgotPasswordData>({ resolver: zodResolver(schema) });
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://glowteva.com';

  const onSubmit = async (data: ForgotPasswordData) => {
    try {
      const res = await api.post<{ message: string }>('/auth/forgot-password', data);
      setMsg(res.message || 'If that email exists, a reset link has been sent');
    } catch (err: any) {
      setMsg(err.message);
    }
  };

  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebPage', name: 'Reset Password', url: `${base}/forgot-password`, description: 'Reset your GlowTeva Organics account password.' }} />
      <BreadcrumbJsonLd items={[{ name: 'Home', url: '/' }, { name: 'Reset Password', url: '/forgot-password' }]} />
      <div className="pt-28 pb-20 min-h-screen flex items-center">
        <div className="container-luxury max-w-md mx-auto">
          <div className="text-center mb-10">
            <p className="eyebrow mb-3">ACCOUNT</p>
            <h1 className="heading-section">Reset Password</h1>
            <p className="text-soft-green text-sm mt-3">Enter your email and we will send a reset link.</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
            </div>
            {msg && <p className="text-soft-green text-sm">{msg}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-soft-green">
            <Link href="/login" className="text-forest hover:text-gold">Back to Sign In</Link>
          </p>
        </div>
      </div>
    </>
  );
}
