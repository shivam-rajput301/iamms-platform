import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className,
}: ModalProps) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Dark backdrop with subtle blur */}
      <div
        className="fixed inset-0 transition-opacity backdrop-blur-md"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
        onClick={onClose}
      />

      {/* Modal panel — Deep Navy, 14px radius, cyan border */}
      <div
        className={cn(
          'relative w-full rounded-[14px] shadow-2xl animate-slide-up flex flex-col max-h-[90vh] z-10',
          sizes[size],
          className,
        )}
        style={{
          backgroundColor: '#0E1628',
          border: '1px solid rgba(23, 199, 232, 0.15)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(23, 199, 232, 0.08)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-6 py-5 shrink-0"
          style={{ borderBottom: '1px solid rgba(23, 199, 232, 0.12)' }}
        >
          <div className="pr-4">
            <h2 className="text-lg font-bold text-white tracking-tight">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-xs text-steel-400">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-steel-400 hover:text-white hover:bg-cyan-500/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body — scrollable when content exceeds viewport */}
        <div className="px-6 py-5 overflow-y-auto scrollbar-thin flex-1 text-sm text-steel-200">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="flex items-center justify-between gap-3 px-6 py-4 shrink-0 rounded-b-[14px]"
            style={{
              borderTop: '1px solid rgba(23, 199, 232, 0.12)',
              backgroundColor: 'rgba(9, 17, 31, 0.6)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  position?: 'right' | 'left';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  position = 'right',
  size = 'md',
  className,
}: DrawerProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const sizes = {
    sm: 'w-full sm:max-w-md',
    md: 'w-full sm:max-w-lg',
    lg: 'w-full sm:max-w-2xl',
    xl: 'w-full sm:max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 transition-opacity backdrop-blur-md"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
        onClick={onClose}
      />

      <div className={cn('fixed inset-y-0 flex max-w-full z-10', position === 'right' ? 'right-0' : 'left-0')}>
        <div
          className={cn(
            'relative w-screen shadow-2xl flex flex-col h-full animate-slide-left',
            sizes[size],
            className,
          )}
          style={{
            backgroundColor: '#0E1628',
            borderLeft: position === 'right' ? '1px solid rgba(23, 199, 232, 0.15)' : 'none',
            borderRight: position === 'left' ? '1px solid rgba(23, 199, 232, 0.15)' : 'none',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.85)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-start justify-between px-6 py-5 shrink-0"
            style={{ borderBottom: '1px solid rgba(23, 199, 232, 0.12)' }}
          >
            <div className="pr-4">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {title}
              </h2>
              {description && (
                <p className="mt-1 text-xs text-steel-400">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-steel-400 hover:text-white hover:bg-cyan-500/10 transition-colors"
              aria-label="Close drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 overflow-y-auto scrollbar-thin flex-1 text-sm text-steel-200">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div
              className="flex items-center justify-between gap-3 px-6 py-4 shrink-0"
              style={{
                borderTop: '1px solid rgba(23, 199, 232, 0.12)',
                backgroundColor: 'rgba(9, 17, 31, 0.6)',
              }}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ModalFooter({
  cancelText = 'Cancel',
  onCancel,
  confirmText = 'Confirm',
  onConfirm,
  confirmVariant = 'primary',
  loading = false,
  leftActions,
}: {
  cancelText?: string;
  onCancel?: () => void;
  confirmText?: string;
  onConfirm?: () => void;
  confirmVariant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  leftActions?: ReactNode;
}) {
  return (
    <div className="flex w-full items-center justify-between gap-3">
      <div>
        {leftActions ? (
          leftActions
        ) : onCancel ? (
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
        ) : null}
      </div>
      <div className="flex items-center gap-3 ml-auto">
        {leftActions && onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
        )}
        {onConfirm && (
          <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        )}
      </div>
    </div>
  );
}
