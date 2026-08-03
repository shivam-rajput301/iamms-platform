import type { HTMLAttributes, TableHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// Table wrapper — dark navy surface with cyan-tinted border
export function Table({ children, className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div
      className="w-full overflow-x-auto scrollbar-thin rounded-lg"
      style={{
        backgroundColor: '#0A1626',
        border: '1px solid rgba(23,199,232,0.1)',
      }}
    >
      <table
        className={cn('w-full border-collapse text-left text-xs', className)}
        style={{ color: '#CBD5E1' }}
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
  sticky = false,
  ...props
}: HTMLAttributes<HTMLTableSectionElement> & { sticky?: boolean }) {
  return (
    <thead
      className={cn(
        sticky && 'sticky top-0 z-10 backdrop-blur-sm',
        className,
      )}
      style={{
        backgroundColor: 'rgba(9,17,31,0.7)',
        borderBottom: '1px solid rgba(23,199,232,0.1)',
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
      className={cn(className)}
      style={{ borderTop: 'none' }}
      {...props}
    >
      {children}
    </tbody>
  );
}

export function TableRow({ children, className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn('transition-colors', className)}
      style={{ borderBottom: '1px solid rgba(23,199,232,0.06)' }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'rgba(23,199,232,0.03)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent';
      }}
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
        'px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider',
        className,
      )}
      style={{ color: 'rgba(255,255,255,0.35)' }}
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
      className={cn('px-4 py-3 text-xs align-middle', className)}
      style={{ color: '#CBD5E1' }}
      {...props}
    >
      {children}
    </td>
  );
}
