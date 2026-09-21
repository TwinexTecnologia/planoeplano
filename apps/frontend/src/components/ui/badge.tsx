import * as React from 'react';
import { cn } from '@/lib/utils';

function Badge({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warn';
}) {
  const variants: Record<string, string> = {
    default: 'bg-brand-500 text-white hover:bg-brand-600',
    secondary: 'bg-secondary text-secondary-foreground',
    outline: 'border border-border text-foreground',
    destructive: 'cb-var-badge-neg',
    success: 'cb-var-badge-pos',
    warn: 'bg-amber-500/10 text-amber-700',
  };
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
