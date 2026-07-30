import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  if (!open) return null;
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-steel-950/60" onClick={onClose} />
      <div className={cn('relative w-full rounded-xl bg-white border border-steel-200 shadow-xl dark:bg-steel-900 dark:border-steel-800 animate-slide-up', sizes[size])}>
        <div className="flex items-start justify-between px-6 py-4 border-b border-steel-200 dark:border-steel-800">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-steel-900 dark:text-steel-100">{title}</h2>
            {description && <p className="mt-1 text-xs text-steel-500 dark:text-steel-400">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-steel-400 hover:bg-steel-100 hover:text-steel-600 dark:hover:bg-steel-800 dark:hover:text-steel-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto scrollbar-thin">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-steel-200 bg-steel-50/50 dark:bg-steel-950/40 dark:border-steel-800">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
