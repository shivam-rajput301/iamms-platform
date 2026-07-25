import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: ReactNode;
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'input',
          error && 'border-rose-500/80 focus:ring-rose-500/30 text-rose-300',
          className
        )}
        {...props}
      />
      {hint && !error && <p className="mt-1 text-[11px] text-steel-400">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-rose-400">{error}</p>}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export function Select({ label, error, className, id, children, ...props }: SelectProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          'input cursor-pointer appearance-none bg-no-repeat bg-[right_0.75rem_center] bg-[length:1em_1em]',
          error && 'border-rose-500/80 text-rose-300',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs font-medium text-rose-400">{error}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="label">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          'input min-h-[90px]',
          error && 'border-rose-500/80 text-rose-300',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs font-medium text-rose-400">{error}</p>}
    </div>
  );
}
