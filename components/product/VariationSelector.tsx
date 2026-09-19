'use client';

import { useMemo, useState } from 'react';
import type { Product, ProductVariant, ProductOption } from '@/types';
import { cn } from '@/lib/utils';

interface VariationSelectorProps {
  product: Product;
  onVariantChange: (variant: ProductVariant | null, selectedOptions: Record<string, string>) => void;
}

interface OptionConfig {
  name: string;
  values: string[];
  selected: string | null;
  disabled: Set<string>;
  available: Set<string>;
}

export default function VariationSelector({ product, onVariantChange }: VariationSelectorProps) {
  const [selected, setSelected] = useState<Record<string, string | null>>({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const options = useMemo(() => {
    if (!product.options?.length) return [];
    return product.options.map((opt: ProductOption) => {
      const availableValues = new Set<string>();
      const disabledValues = new Set<string>();
      const activeVariants = product.variants.filter((v) => v.status === 'active');
      for (const v of activeVariants) {
        const value = v.options[opt.name];
        if (v.stock > 0) availableValues.add(value);
        else disabledValues.add(value);
      }
      return {
        name: opt.name,
        values: opt.values,
        selected: selected[opt.name] || null,
        disabled: disabledValues,
        available: availableValues,
      };
    });
  }, [product.options, product.variants, selected]);

  const activeVariants = product.variants.filter((v) => v.status === 'active');

  const selectOption = (optionName: string, value: string) => {
    const newSelected = { ...selected, [optionName]: value };
    setSelected(newSelected);

    const variant = activeVariants.find((v) =>
      Object.entries(newSelected).every(([name, val]) => val && v.options[name] === val)
    );
    setSelectedVariant(variant || null);
    onVariantChange(variant || null, newSelected as Record<string, string>);
  };

  const isOptionDisabled = (optionName: string, value: string) => {
    const otherSelected = Object.entries(selected).filter(([name]) => name !== optionName);
    if (otherSelected.length === 0) {
      return !activeVariants.some((v) => v.options[optionName] === value && v.stock > 0);
    }
    return !activeVariants.some((v) =>
      v.options[optionName] === value &&
      otherSelected.every(([name, val]) => val && v.options[name] === val)
    );
  };

  const isColorOption = (name: string) => name.toLowerCase() === 'color';

  if (!product.options?.length) return null;

  return (
    <div className="space-y-6">
      {options.map((opt) => (
        <div key={opt.name}>
          <h3 className="text-xs tracking-[0.15em] uppercase text-forest font-medium mb-3">
            {opt.name}
          </h3>
          <div className="flex flex-wrap gap-2">
            {opt.values.map((value) => {
              const isSelected = selected[opt.name] === value;
              const isDisabled = isOptionDisabled(opt.name, value);
              const variantForValue = activeVariants.find((v) => v.options[opt.name] === value);
              const isOutOfStock = variantForValue && variantForValue.stock === 0;

              if (isColorOption(opt.name)) {
                return (
                  <button
                    key={value}
                    onClick={() => !isDisabled && selectOption(opt.name, value)}
                    disabled={isDisabled}
                    title={isOutOfStock ? 'Out of Stock' : value}
                    className={cn(
                      'w-10 h-10 rounded-full border-2 transition-all',
                      isSelected ? 'border-gold scale-110' : 'border-soft-border',
                      isDisabled && 'opacity-30 cursor-not-allowed line-through'
                    )}
                    style={{
                      background: getColorSwatch(value),
                    }}
                    aria-label={value}
                  />
                );
              }

              return (
                <button
                  key={value}
                  onClick={() => !isDisabled && selectOption(opt.name, value)}
                  disabled={isDisabled}
                  className={cn(
                    'px-4 py-2 text-sm border transition-all min-w-[60px]',
                    isSelected
                      ? 'border-gold bg-gold/10 text-forest'
                      : 'border-soft-border text-soft-green hover:border-gold',
                    isDisabled && 'opacity-40 cursor-not-allowed bg-muted-cream line-through'
                  )}
                >
                  {value}
                  {isOutOfStock && <span className="ml-1 text-[10px] text-red-500">(0)</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function getColorSwatch(value: string): string {
  const colors: Record<string, string> = {
    black: '#1a1a1a',
    white: '#f5f5f5',
    red: '#dc2626',
    blue: '#2563eb',
    green: '#16a34a',
    yellow: '#eab308',
    pink: '#ec4899',
    purple: '#9333ea',
    orange: '#ea580c',
    brown: '#78350f',
    gray: '#6b7280',
    grey: '#6b7280',
    gold: '#d4af37',
    silver: '#c0c0c0',
    beige: '#d2b48c',
    cream: '#fffdd0',
    navy: '#1e3a5f',
    burgundy: '#800020',
    ivory: '#fffff0',
    charcoal: '#36454f',
  };
  const key = value.toLowerCase().trim();
  return colors[key] || '#e5e7eb';
}