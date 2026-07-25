import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Wrench,
  Download,
  User,
  Clock,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  PriorityBadge,
  RequestStatusBadge,
} from "@/components/ui/StatusBadges";
import { useRequests } from "@/lib/hooks";
import { useAuth } from "@/lib/auth";
import {
  PRIORITIES,
  PRIORITY_META,
  REQUEST_STATUSES,
  REQUEST_STATUS_META,
} from "@/lib/constants";
import { cn, timeAgo, downloadBlob } from "@/lib/utils";
import * as XLSX from "xlsx";

const PAGE_SIZE = 10;

export function RequestsPage() {
  const navigate = useNavigate();
  const { profile, can } = useAuth();
  const [searchParams] = useSearchParams();
  const { data: requests = [], isLoading } = useRequests();

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [priority, setPriority] = useState("");

  const isEmployee = profile?.role === "employee";

  const baseRequests = useMemo(() => {
    if (isEmployee && profile?.id) {
      return requests.filter((r) => r.requested_by === profile.id || r.requester?.id === profile.id);
    }
    return requests;
  }, [requests, profile, isEmployee]);

  const filtered = useMemo(() => {
    return baseRequests.filter((r) => {
      if (query) {
        const q = query.toLowerCase();
        if (
          !r.title.toLowerCase().includes(q) &&
          !r.request_code.toLowerCase().includes(q) &&
          !(r.asset?.name ?? "").toLowerCase().includes(q)
        )
          return false;
      }
      if (status && r.status !== status) return false;
      if (priority && r.priority !== priority) return false;
      return true;
    });
  }, [baseRequests, query, status, priority]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function exportExcel() {
    const rows = filtered.map((r) => ({
      Code: r.request_code,
      Asset: r.asset?.name ?? "",
      Title: r.title,
      Priority: PRIORITY_META[r.priority].label,
      Status: REQUEST_STATUS_META[r.status].label,
      Engineer: r.engineer?.full_name ?? "Unassigned",
      "Downtime (h)": r.downtime_hours ?? 0,
      "Cost (₹)": r.maintenance_cost ?? 0,
      Created: new Date(r.created_at).toLocaleString(),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Requests");
    const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    downloadBlob(new Blob([buf]), "maintenance-requests.xlsx");
  }

  if (isLoading) return <PageLoader />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Maintenance Requests"
        description={`${filtered.length} work orders across the plant`}
        actions={
          <>
            <Button variant="secondary" onClick={exportExcel}>
              <Download className="h-4 w-4" /> Export
            </Button>
            {can("requests:create") && (
              <Link to="/requests/new">
                <Button>
                  <Plus className="h-4 w-4" /> Raise Request
                </Button>
              </Link>
            )}
          </>
        }
      />

      <Card className="mb-4">
        <CardBody className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400" />
            <input
              className="input pl-9"
              placeholder="Search requests…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            {REQUEST_STATUSES.map((s) => (
              <option key={s} value={s}>
                {REQUEST_STATUS_META[s].label}
              </option>
            ))}
          </Select>
          <Select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_META[p].label}
              </option>
            ))}
          </Select>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-0">
          {paged.length === 0 ? (
            <EmptyState
              title="No requests found"
              description="Adjust filters or raise a new maintenance request."
              icon={Wrench}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-steel-200 dark:border-steel-800">
                    <th className="table-header">Code</th>
                    <th className="table-header">Asset</th>
                    <th className="table-header">Title</th>
                    <th className="table-header">Priority</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Engineer</th>
                    <th className="table-header">Raised</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-steel-100 dark:divide-steel-800/60">
                  {paged.map((r) => (
                    <tr
                      key={r.id}
                      className="cursor-pointer transition-colors hover:bg-steel-50 dark:hover:bg-steel-800/40"
                      onClick={() => navigate(`/requests/${r.id}`)}
                    >
                      <td className="table-cell">
                        <Link
                          to={`/requests/${r.id}`}
                          className="font-medium text-brand-600"
                        >
                          {r.request_code}
                        </Link>
                      </td>
                      <td className="table-cell">{r.asset?.name ?? "—"}</td>
                      <td className="table-cell max-w-xs truncate">
                        {r.title}
                      </td>
                      <td className="table-cell">
                        <PriorityBadge priority={r.priority} />
                      </td>
                      <td className="table-cell">
                        <RequestStatusBadge status={r.status} />
                      </td>
                      <td className="table-cell">
                        {r.engineer ? (
                          <span className="flex items-center gap-1.5">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-600/20 dark:text-brand-400">
                              {r.engineer.full_name.charAt(0)}
                            </span>
                            <span className="text-sm">
                              {r.engineer.full_name}
                            </span>
                          </span>
                        ) : (
                          <span className="text-sm text-steel-400">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="table-cell text-steel-500">
                        {timeAgo(r.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        total={filtered.length}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
