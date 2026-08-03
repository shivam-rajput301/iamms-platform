import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover }: CardProps) {
  return (
    <div className={cn('card', hover && 'card-hover', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn('px-5 py-4 flex items-center justify-between', className)}
      style={{ borderBottom: '1px solid rgba(23,199,232,0.08)' }}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3
      className={cn('text-sm font-semibold tracking-tight', className)}
      style={{ color: '#E2E8F0' }}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn('text-xs mt-0.5', className)}
      style={{ color: 'rgba(255,255,255,0.4)' }}
    >
      {children}
    </p>
  );
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn('px-5 py-3 rounded-b-xl flex items-center justify-between', className)}
      style={{
        borderTop: '1px solid rgba(23,199,232,0.08)',
        backgroundColor: 'rgba(9,17,31,0.4)',
      }}
    >
      {children}
    </div>
  );
}
