'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn('peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-soft-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:cursor-not-allowed disabled:opacity-50', checked && 'bg-forest', className)}
      {...props}
    >
      <span className={cn('pointer-events-none block h-5 w-5 rounded-full bg-white shadow transition-transform', checked && 'translate-x-5')} />
    </button>
));
Switch.displayName = 'Switch';

export { Switch };