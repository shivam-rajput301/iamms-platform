import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: ReactNode;
  className?: string;
  dot?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export function Badge({ children, className, dot, variant = 'default' }: BadgeProps) {
  const variantStyles = {
    default: 'bg-steel-100 text-steel-700 border-steel-200 dark:bg-steel-800 dark:text-steel-200 dark:border-steel-700',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60',
    warning: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60',
    danger:  'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60',
    info:    'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950/40 dark:text-brand-400 dark:border-brand-800/60',
    neutral: 'bg-steel-100 text-steel-700 border-steel-200 dark:bg-steel-800 dark:text-steel-300 dark:border-steel-700',
  };

  return (
    <span className={cn('badge', variantStyles[variant], className)}>
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dot)} />}
      {children}
    </span>
  );
}
