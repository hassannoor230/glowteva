'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 text-sm tracking-wide font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-forest text-cream hover:bg-soft-green',
        secondary: 'border border-forest text-forest hover:bg-forest hover:text-cream',
        gold: 'bg-gold text-forest hover:bg-gold/90',
        ghost: 'text-forest hover:text-gold',
        outline: 'border border-soft-border text-forest hover:border-gold hover:text-gold',
      },
      size: {
        default: 'px-8 py-3.5',
        sm: 'px-5 py-2.5 text-xs',
        lg: 'px-10 py-4 text-base',
        icon: 'p-2.5',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
