import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: ReactNode;
  className?: string;
  dot?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export function Badge({ children, className, dot, variant = 'default' }: BadgeProps) {
  // All variants use Login Page design language:
  // success = green, warning = amber, danger = red, info = cyan (brand), neutral = slate
  const variantStyles = {
    default: 'bg-[rgba(100,116,139,0.15)] text-[#94a3b8] border-[rgba(100,116,139,0.2)]',
    success: 'bg-[rgba(16,185,129,0.12)] text-[#34d399] border-[rgba(16,185,129,0.2)]',
    warning: 'bg-[rgba(245,158,11,0.12)] text-[#fbbf24] border-[rgba(245,158,11,0.2)]',
    danger:  'bg-[rgba(239,68,68,0.12)]  text-[#f87171] border-[rgba(239,68,68,0.2)]',
    info:    'bg-[rgba(23,199,232,0.1)]  text-[#17C7E8] border-[rgba(23,199,232,0.2)]',
    neutral: 'bg-[rgba(100,116,139,0.12)] text-[#94a3b8] border-[rgba(100,116,139,0.18)]',
  };

  return (
    <span className={cn('badge', variantStyles[variant], className)}>
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dot)} />}
      {children}
    </span>
  );
}
