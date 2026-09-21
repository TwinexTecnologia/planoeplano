import * as React from 'react';
import { BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = { size?: 'sm' | 'md' | 'lg' };

export function AppLogo({ size = 'md' }: Props) {
  const sz = {
    sm: { icon: 'h-6 w-6', label: 'text-lg', sub: 'text-[10px]' },
    md: { icon: 'h-8 w-8', label: 'text-xl', sub: 'text-xs' },
    lg: { icon: 'h-10 w-10', label: 'text-2xl', sub: 'text-sm' },
  }[size];

  return (
    <div className="flex items-center gap-3 select-none">
      <div
        className={cn(
          sz.icon,
          'rounded-lg bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700',
          'flex items-center justify-center shadow-[0_0_20px_-4px_rgba(85,87,246,0.7)]',
        )}
      >
        <BarChart3 className="h-3/5 w-3/5 text-white" strokeWidth={2.25} />
      </div>
      <div className="leading-tight">
        <div
          className={cn(
            sz.label,
            'font-extrabold tracking-tight',
            'bg-clip-text text-transparent bg-gradient-to-r from-white via-brand-200 to-white',
          )}
        >
          CostBase
        </div>
        <div className={cn(sz.sub, 'text-sidebar-foreground/40 font-medium tracking-[0.15em] uppercase')}>
          Inteligência de Custos
        </div>
      </div>
    </div>
  );
}
