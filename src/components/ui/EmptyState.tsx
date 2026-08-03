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
        "flex flex-col items-center justify-center rounded-xl p-8 text-center",
        className,
      )}
      style={{
        border: "1px dashed rgba(23,199,232,0.15)",
        backgroundColor: "rgba(9,17,31,0.4)",
      }}
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl"
        style={{
          background: "rgba(23,199,232,0.08)",
          border: "1px solid rgba(23,199,232,0.15)",
          color: "rgba(23,199,232,0.7)",
        }}
      >
        <Icon className="h-6 w-6" />
      </div>
      <h3
        className="mt-3 text-sm font-semibold"
        style={{ color: "#E2E8F0" }}
      >
        {title}
      </h3>
      {description && (
        <p
          className="mt-1 max-w-sm text-xs"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
