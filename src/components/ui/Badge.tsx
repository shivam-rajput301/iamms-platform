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
    default: 'bg-steel-100 text-steel-800 border-steel-200 dark:bg-steel-800 dark:text-steel-200 dark:border-steel-700',
    success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400 dark:border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400 dark:border-amber-500/20',
    danger:  'bg-rose-500/10 text-rose-600 border-rose-500/30 dark:text-rose-400 dark:border-rose-500/20',
    info:    'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400 dark:border-blue-500/20',
    neutral: 'bg-steel-100 text-steel-700 border-steel-200 dark:bg-steel-800 dark:text-steel-300 dark:border-steel-700',
  };

  return (
    <span className={cn('badge', variantStyles[variant], className)}>
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dot)} />}
      {children}
    </span>
  );
}
