import { Badge } from "./Badge";
import {
  ASSET_STATUS_META,
  CRITICALITY_META,
  PRIORITY_META,
  REQUEST_STATUS_META,
  NOTIFICATION_TYPE_META,
} from "@/lib/constants";
import type {
  AssetStatus,
  Criticality,
  Priority,
  RequestStatus,
} from "@/lib/types";

export function AssetStatusBadge({ status }: { status: AssetStatus }) {
  const m = ASSET_STATUS_META[status] ?? { label: status, color: "text-steel-600", dot: "bg-steel-400" };
  const variant =
    status === "operational" || status === "active"
      ? "success"
      : status === "under_maintenance"
        ? "warning"
        : status === "breakdown"
          ? "danger"
          : status === "idle"
            ? "info"
            : "neutral";
  return (
    <Badge variant={variant}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </Badge>
  );
}

export function CriticalityBadge({
  criticality,
}: {
  criticality: Criticality;
}) {
  const m = CRITICALITY_META[criticality] ?? { label: criticality };
  const variant =
    criticality === "critical"
      ? "danger"
      : criticality === "high"
        ? "warning"
        : criticality === "medium"
          ? "info"
          : "neutral";
  return <Badge variant={variant}>{m.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const m = PRIORITY_META[priority] ?? { label: priority };
  const variant =
    priority === "critical"
      ? "danger"
      : priority === "high"
        ? "warning"
        : priority === "medium"
          ? "info"
          : "neutral";
  return <Badge variant={variant}>{m.label}</Badge>;
}

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const m = REQUEST_STATUS_META[status] ?? { label: status, dot: "bg-steel-400" };
  const variant =
    status === "completed" || status === "closed"
      ? "success"
      : status === "in_progress"
        ? "warning"
        : status === "pending"
          ? "info"
          : "neutral";
  return (
    <Badge variant={variant}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </Badge>
  );
}

export function NotificationTypeBadge({ type }: { type: string }) {
  const m = NOTIFICATION_TYPE_META[type] ?? {
    label: type,
  };
  return (
    <Badge variant="neutral">
      {m.label}
    </Badge>
  );
}
