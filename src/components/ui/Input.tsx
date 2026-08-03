import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, Search } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: ReactNode;
  icon?: ReactNode;
  required?: boolean;
}

export function Input({ label, error, hint, icon, required, className, id, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="label">
          <span>
            {label}
            {required && <span className="text-rose-400 ml-1">*</span>}
          </span>
        </label>
      )}
      <div className="relative w-full">
        {icon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-steel-400">
            {icon}
          </div>
        )}
        <input
          id={id}
          className={cn(
            'input',
            icon && 'pl-9',
            error && 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20 text-rose-200',
            className
          )}
          {...props}
        />
      </div>
      {hint && !error && <p className="mt-1.5 text-[11px] text-steel-400">{hint}</p>}
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  children: ReactNode;
}

export function Select({ label, error, hint, required, className, id, children, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="label">
          <span>
            {label}
            {required && <span className="text-rose-400 ml-1">*</span>}
          </span>
        </label>
      )}
      <select
        id={id}
        className={cn(
          'input select',
          error && 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20 text-rose-200',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {hint && !error && <p className="mt-1.5 text-[11px] text-steel-400">{hint}</p>}
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
}

export function Textarea({ label, error, hint, required, className, id, ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="label">
          <span>
            {label}
            {required && <span className="text-rose-400 ml-1">*</span>}
          </span>
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          'input textarea',
          error && 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20 text-rose-200',
          className
        )}
        {...props}
      />
      {hint && !error && <p className="mt-1.5 text-[11px] text-steel-400">{hint}</p>}
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

export function Checkbox({
  label,
  error,
  className,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  return (
    <div>
      <label htmlFor={id} className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-steel-200">
        <input id={id} type="checkbox" className={cn('checkbox', className)} {...props} />
        {label && <span>{label}</span>}
      </label>
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-rose-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

export function Radio({
  label,
  error,
  className,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  return (
    <div>
      <label htmlFor={id} className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-steel-200">
        <input id={id} type="radio" className={cn('radio', className)} {...props} />
        {label && <span>{label}</span>}
      </label>
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-rose-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

export function SearchInput({
  placeholder = 'Search…',
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Input
      icon={<Search className="h-4 w-4" />}
      placeholder={placeholder}
      className={className}
      {...props}
    />
  );
}

