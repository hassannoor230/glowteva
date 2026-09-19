'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const res = await api.post<{ data: { user: any; accessToken: string } }>('/auth/login', data);
      setAuth(res.data.user, res.data.accessToken);
      router.push(res.data.user.role === 'admin' ? '/admin' : '/account');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-screen flex items-center">
      <div className="container-luxury max-w-md mx-auto">
        <div className="text-center mb-10">
          <p className="eyebrow mb-3">WELCOME BACK</p>
          <h1 className="heading-section">Sign In</h1>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        <div className="mt-6 text-center space-y-2">
          <Link href="/forgot-password" className="text-sm text-soft-green hover:text-gold block">Forgot password?</Link>
          <p className="text-sm text-soft-green">
            New to GlowTeva?{' '}
            <Link href="/register" className="text-forest hover:text-gold">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
