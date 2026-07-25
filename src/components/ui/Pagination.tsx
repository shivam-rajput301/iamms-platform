import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  total: number;
  pageSize: number;
}

export function Pagination({ page, totalPages, onPageChange, total, pageSize }: PaginationProps) {
  if (total === 0) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return (
    <div className="flex items-center justify-between px-1 py-3">
      <p className="text-sm text-steel-500 dark:text-steel-400">
        Showing <span className="font-medium text-steel-700 dark:text-steel-200">{start}</span>–
        <span className="font-medium text-steel-700 dark:text-steel-200">{end}</span> of{' '}
        <span className="font-medium text-steel-700 dark:text-steel-200">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" /> Prev
        </Button>
        <span className="px-2 text-sm text-steel-600 dark:text-steel-300">
          {page} / {Math.max(totalPages, 1)}
        </span>
        <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
