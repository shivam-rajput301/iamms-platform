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
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
        onClick={onClose}
      />
      {/* Modal panel — Login Page card surface */}
      <div
        className={cn(
          'relative w-full rounded-xl shadow-2xl animate-slide-up',
          sizes[size],
        )}
        style={{
          backgroundColor: '#0E1628',
          border: '1px solid rgba(23,199,232,0.15)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(23,199,232,0.1)' }}
        >
          <div>
            <h2
              className="text-lg font-bold tracking-tight"
              style={{ color: '#E2E8F0' }}
            >
              {title}
            </h2>
            {description && (
              <p
                className="mt-1 text-xs"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')
            }
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto scrollbar-thin">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="flex items-center justify-end gap-3 px-6 py-4"
            style={{
              borderTop: '1px solid rgba(23,199,232,0.1)',
              backgroundColor: 'rgba(9,17,31,0.4)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
