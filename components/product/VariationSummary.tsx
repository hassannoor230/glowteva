'use client';

import type { ProductVariant } from '@/types';
import { formatPrice, cn } from '@/lib/utils';

interface VariationSummaryProps {
  product: {
    name: string;
    price: number;
    compareAtPrice?: number;
    stock: number;
    sku: string;
    variants?: ProductVariant[];
  };
  variant: ProductVariant | null;
  selectedOptions: Record<string, string>;
}

export default function VariationSummary({ product, variant, selectedOptions }: VariationSummaryProps) {
  const hasSelected = Object.keys(selectedOptions).some((k) => selectedOptions[k]);
  const price = variant?.price ?? product.price;
  const compareAtPrice = variant?.compareAtPrice ?? product.compareAtPrice;
  const stock = variant ? variant.stock : product.stock;
  const sku = variant ? variant.sku : product.sku;

  if (!hasSelected && product.variants && product.variants.length > 0) {
    return (
      <div className="bg-muted-cream/50 border border-soft-border p-4 mt-4">
        <p className="text-sm text-soft-green">
          Please select a variation to continue.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 p-4 border border-soft-border bg-muted-cream/30 transition-all duration-300">
      <p className="text-xs tracking-[0.15em] uppercase text-soft-green mb-2">Selected</p>
      <div className="space-y-1">
        {Object.entries(selectedOptions).map(([name, value]) => (
          value && (
            <div key={name} className="flex items-center gap-2 text-sm">
              <span className="text-soft-green">{name}:</span>
              <span className="text-forest font-medium">{value}</span>
            </div>
          )
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-soft-border space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-soft-green">SKU:</span>
          <span className="text-sm text-forest font-mono">{sku}</span>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xl font-medium text-forest">{formatPrice(price)}</span>
          {compareAtPrice && compareAtPrice > price && (
            <span className="text-sm text-soft-green/60 line-through">{formatPrice(compareAtPrice)}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className={cn('text-xs font-medium', stock === 0 ? 'text-red-600' : stock <= 5 ? 'text-gold' : 'text-soft-green')}>
            {stock === 0 ? 'Out of Stock' : stock <= 5 ? `Only ${stock} left` : 'In Stock'}
          </span>
        </div>
      </div>
    </div>
  );
}