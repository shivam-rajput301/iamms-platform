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
  const maxPages = Math.max(totalPages, 1);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-2 py-3.5 border-t border-steel-800/60 mt-2">
      <p className="text-xs font-medium text-steel-400">
        Showing <span className="font-semibold text-white">{start}</span>–
        <span className="font-semibold text-white">{end}</span> of{' '}
        <span className="font-semibold text-white">{total}</span> items
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="h-9 px-3 text-xs"
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </Button>
        <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-steel-900/60 border border-cyan-500/20 text-cyan-400">
          {page} / {maxPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-9 px-3 text-xs"
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
