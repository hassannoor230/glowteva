'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, Plus } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import type { Product } from '@/types';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();
  const { user, token, setUser } = useAuthStore();
  const isWishlisted = Boolean(user?.wishlist?.some((item) => item._id === product._id));

  const toggleWishlist = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (!token || !user) {
      router.push('/login');
      return;
    }
    try {
      if (isWishlisted) {
        await api.delete(`/users/wishlist/${product._id}`, { token });
      } else {
        await api.post('/users/wishlist', { productId: product._id }, { token });
      }
      await useAuthStore.getState().fetchMe();
      setUser(useAuthStore.getState().user);
    } catch {
      // The product card remains usable if a wishlist request fails.
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    cardRef.current.style.transform = `perspective(800px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) translateZ(4px)`;
  };

  const handleMouseLeave = () => {
    setHovered(false);
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(800px) rotateY(0) rotateX(0) translateZ(0)';
    }
  };

  return (
    <div
      ref={cardRef}
      className={cn('group relative transition-transform duration-300 ease-elegant', className)}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-muted-cream">
          <Image
            src={product.thumbnail}
            alt={product.name}
            fill
            className={cn(
              'object-cover transition-transform duration-700 ease-elegant',
              hovered && 'scale-105'
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="absolute top-3 left-3 bg-gold text-forest text-[10px] tracking-wider uppercase px-2 py-1 font-medium">
              Save {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
            </span>
          )}
          {product.newArrival && (
            <span className="absolute top-3 right-3 bg-forest text-cream text-[10px] tracking-wider uppercase px-2 py-1 font-medium">
              New
            </span>
          )}
        </div>
      </Link>

      <div className="mt-4 space-y-1">
        <p className="text-[11px] tracking-[0.15em] uppercase text-soft-green">{product.category}</p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium text-forest text-sm md:text-base hover:text-gold transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-soft-green line-clamp-1">{product.shortDescription}</p>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-forest font-medium text-sm">{formatPrice(product.price)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-soft-green/60 text-sm line-through">{formatPrice(product.compareAtPrice)}</span>
          )}
        </div>
        {product.rating > 0 && (
          <div className="flex items-center gap-1 pt-0.5">
            <span className="text-gold text-xs">{'★'.repeat(Math.round(product.rating))}</span>
            <span className="text-soft-green text-xs">({product.reviewCount})</span>
          </div>
        )}
      </div>

      <div className={cn(
        'absolute bottom-24 right-3 flex flex-col gap-2 transition-all duration-300',
        hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      )}>
        <button
          onClick={(e) => { e.preventDefault(); addItem(product); }}
          className="w-10 h-10 bg-forest text-cream flex items-center justify-center hover:bg-soft-green transition-colors shadow-elegant"
          aria-label="Add to cart"
        >
          <Plus size={16} />
        </button>
        <button
          onClick={toggleWishlist}
          className="w-10 h-10 bg-white text-forest flex items-center justify-center hover:text-gold transition-colors shadow-soft border border-soft-border"
          aria-label="Add to wishlist"
        >
          <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} className={isWishlisted ? 'text-gold' : ''} />
        </button>
      </div>
    </div>
  );
}
