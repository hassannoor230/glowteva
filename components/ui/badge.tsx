import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'gold' | 'forest' | 'outline';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 text-xs tracking-wide font-medium',
        variant === 'default' && 'bg-muted-cream text-forest',
        variant === 'gold' && 'bg-gold/20 text-forest',
        variant === 'forest' && 'bg-forest text-cream',
        variant === 'outline' && 'border border-soft-border text-soft-green',
        className
      )}
      {...props}
    />
  );
}
