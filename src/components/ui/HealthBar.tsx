import { cn, healthColor } from '@/lib/utils';

export function HealthBar({ score, showLabel = true }: { score: number; showLabel?: boolean }) {
  const color = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : score >= 40 ? 'bg-orange-500' : 'bg-rose-500';
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-20 overflow-hidden rounded-full bg-steel-200 dark:bg-steel-700">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${score}%` }} />
      </div>
      {showLabel && <span className={cn('text-sm font-semibold tabular-nums', healthColor(score))}>{score}</span>}
    </div>
  );
}
