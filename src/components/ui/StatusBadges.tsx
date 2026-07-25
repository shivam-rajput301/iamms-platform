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
  const m = ASSET_STATUS_META[status];
  return (
    <Badge className={`${m.color} bg-${m.color.replace("text-", "")}/10`}>
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
  const m = CRITICALITY_META[criticality];
  return <Badge className={`${m.color} ${m.bg}`}>{m.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const m = PRIORITY_META[priority];
  return (
    <Badge className={`${m.color} ${m.bg} border ${m.border}`}>{m.label}</Badge>
  );
}

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const m = REQUEST_STATUS_META[status];
  return (
    <Badge className={`${m.color} ${m.bg}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </Badge>
  );
}

export function NotificationTypeBadge({ type }: { type: string }) {
  const m = NOTIFICATION_TYPE_META[type] ?? {
    label: type,
    color: "text-steel-600",
  };
  return (
    <Badge className={`${m.color} bg-steel-100 dark:bg-steel-800`}>
      {m.label}
    </Badge>
  );
}
