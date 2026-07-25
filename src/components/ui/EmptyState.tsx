import type { ReactNode } from "react";
import { LucideIcon, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-steel-300 dark:border-steel-800 bg-steel-50/50 dark:bg-steel-900/60 p-8 text-center",
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-steel-100 dark:bg-steel-800 text-steel-600 dark:text-steel-300 border border-steel-200 dark:border-steel-700">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-steel-900 dark:text-steel-100">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-steel-500 dark:text-steel-400">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
