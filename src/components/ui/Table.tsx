import type { ReactNode, HTMLAttributes, TableHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Table({ children, className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto scrollbar-thin rounded-xl border border-steel-200 bg-white dark:border-steel-800 dark:bg-steel-900">
      <table className={cn('w-full border-collapse text-left text-sm text-steel-800 dark:text-steel-200', className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('bg-steel-50 dark:bg-steel-950/60 border-b border-steel-200 dark:border-steel-800', className)} {...props}>{children}</thead>;
}

export function TableBody({ children, className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('divide-y divide-steel-200/80 dark:divide-steel-800/60', className)} {...props}>{children}</tbody>;
}

export function TableRow({ children, className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn('transition-colors hover:bg-steel-50 dark:hover:bg-steel-800/40', className)} {...props}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={cn('px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-steel-500 dark:text-steel-400', className)} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ children, className, ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn('px-4 py-3 text-sm text-steel-800 dark:text-steel-200 align-middle', className)} {...props}>
      {children}
    </td>
  );
}
