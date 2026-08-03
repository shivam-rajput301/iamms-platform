import type { HTMLAttributes, TableHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// Table Container — Deep Navy with soft cyan/slate border
export function Table({ children, className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div
      className="w-full overflow-x-auto scrollbar-thin rounded-xl shadow-md border border-[#1C2E4A]"
      style={{
        backgroundColor: '#0E1628',
      }}
    >
      <table
        className={cn('w-full border-collapse text-left text-xs font-medium', className)}
        style={{ color: '#E2E8F0' }}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHeader({
  children,
  className,
  sticky = true,
  ...props
}: HTMLAttributes<HTMLTableSectionElement> & { sticky?: boolean }) {
  return (
    <thead
      className={cn(
        sticky && 'sticky top-0 z-10 backdrop-blur-md',
        className,
      )}
      style={{
        backgroundColor: '#0B1528',
        borderBottom: '1px solid rgba(23,199,232,0.15)',
      }}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({ children, className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn('divide-y divide-[rgba(23,199,232,0.06)]', className)}
      {...props}
    >
      {children}
    </tbody>
  );
}

export function TableRow({ children, className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'h-[56px] min-h-[56px] transition-colors duration-150 border-b border-[rgba(23,199,232,0.08)] hover:bg-[rgba(23,199,232,0.04)]',
        className,
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider select-none border-b border-[rgba(23,199,232,0.12)]',
        className,
      )}
      style={{ color: 'rgba(255,255,255,0.5)' }}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn('px-4 py-3.5 text-xs font-medium align-middle text-steel-200', className)}
      {...props}
    >
      {children}
    </td>
  );
}

export function TableActions({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)} {...props}>
      {children}
    </div>
  );
}
