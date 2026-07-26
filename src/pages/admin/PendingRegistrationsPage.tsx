import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search, RefreshCw, Eye, CheckCircle, XCircle,
  ChevronUp, ChevronDown, ChevronsUpDown,
  User, Mail, Phone, MapPin, Layers, Briefcase,
  Building2, CreditCard, Calendar, FileText, ClipboardCheck,
  Clock, Users, ShieldCheck,
} from 'lucide-react';
import { adminApi, getApiToken, type AdminUser, type PendingStats } from '@/lib/api';
import { DEPARTMENTS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  Table, TableHeader, TableBody, TableRow,
  TableHead, TableCell,
} from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageLoader } from '@/components/ui/Spinner';

/* ── Constants ───────────────────────────────────────────────── */
const PLANTS = [
  'Head Office', 'Plant A', 'Plant B', 'Plant C',
  'Smelter Complex', 'Rolling Unit',
];

const ROLE_OPTIONS = ['employee', 'engineer', 'manager'] as const;
type AssignableRole = typeof ROLE_OPTIONS[number];

const PAGE_SIZE = 15;

type SortKey = keyof Pick<
  AdminUser,
  'employeeId' | 'name' | 'email' | 'phone' | 'plant' |
  'department' | 'role' | 'createdAt' | 'status'
>;

type SortDir = 'asc' | 'desc';

/* ── Status Badge ─────────────────────────────────────────────── */
function RegistrationStatusBadge({ status }: { status: AdminUser['status'] }) {
  const map: Record<AdminUser['status'], { variant: 'warning' | 'success' | 'danger' | 'neutral'; label: string; dot: string }> = {
    pending:  { variant: 'warning',  label: 'Pending',  dot: 'bg-amber-500' },
    approved: { variant: 'success',  label: 'Approved', dot: 'bg-emerald-500' },
    rejected: { variant: 'danger',   label: 'Rejected', dot: 'bg-rose-500' },
    blocked:  { variant: 'neutral',  label: 'Blocked',  dot: 'bg-steel-400' },
  };
  const { variant, label, dot } = map[status] ?? map.blocked;
  return <Badge variant={variant} dot={dot}>{label}</Badge>;
}

/* ── Sortable Column Header ───────────────────────────────────── */
function SortableHead({
  label, sortKey, currentKey, currentDir, onSort,
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  currentDir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const active = currentKey === sortKey;
  return (
    <TableHead>
      <button
        className="flex items-center gap-1 transition-colors hover:text-steel-700 dark:hover:text-steel-200 font-semibold uppercase tracking-wider text-xs"
        onClick={() => onSort(sortKey)}
      >
        {label}
        {active ? (
          currentDir === 'asc'
            ? <ChevronUp className="h-3 w-3 text-brand-500" />
            : <ChevronDown className="h-3 w-3 text-brand-500" />
        ) : (
          <ChevronsUpDown className="h-3 w-3 opacity-40" />
        )}
      </button>
    </TableHead>
  );
}

/* ── Detail Row (View Modal) ──────────────────────────────────── */
function DetailRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string | null }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-steel-200 dark:border-steel-800/60 last:border-0">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 border border-brand-500/15">
        <Icon className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-steel-500 dark:text-steel-400">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-steel-900 dark:text-steel-100">{value || '—'}</p>
      </div>
    </div>
  );
}

/* ── KPI Stat Card ────────────────────────────────────────────── */
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Users;
  label: string;
  value: number | null;
  color: 'amber' | 'emerald' | 'rose' | 'blue';
}) {
  const colors = {
    amber:   { icon: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',   val: 'text-amber-700 dark:text-amber-300' },
    emerald: { icon: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', val: 'text-emerald-700 dark:text-emerald-300' },
    rose:    { icon: 'text-rose-600 dark:text-rose-400',     bg: 'bg-rose-500/10 border-rose-500/20',     val: 'text-rose-700 dark:text-rose-300' },
    blue:    { icon: 'text-blue-600 dark:text-blue-400',     bg: 'bg-blue-500/10 border-blue-500/20',     val: 'text-blue-700 dark:text-blue-300' },
  };
  const c = colors[color];
  return (
    <Card>
      <CardBody className="flex items-center gap-4 py-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${c.bg}`}>
          <Icon className={`h-5 w-5 ${c.icon}`} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-steel-500 dark:text-steel-400 truncate">{label}</p>
          <p className={`mt-0.5 text-2xl font-bold tabular-nums ${value === null ? 'text-steel-400' : c.val}`}>
            {value === null ? '—' : value}
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

/* ══════════════════════════════════════════════════════════════
   PENDING REGISTRATIONS PAGE
══════════════════════════════════════════════════════════════ */
export function PendingRegistrationsPage() {
  /* ── Data ── */
  const [allUsers, setAllUsers]         = useState<AdminUser[]>([]);
  const [stats, setStats]               = useState<PendingStats | null>(null);
  const [loading, setLoading]           = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [toast, setToast]               = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  /* ── Filters ── */
  const [search, setSearch]               = useState('');
  const [filterPlant, setFilterPlant]     = useState('');
  const [filterDept, setFilterDept]       = useState('');
  const [filterRole, setFilterRole]       = useState('');
  const [filterStatus, setFilterStatus]   = useState('');
  const [filterDate, setFilterDate]       = useState('');

  /* ── Sort & Pagination ── */
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage]       = useState(1);

  /* ── Modals ── */
  const [viewUser, setViewUser]             = useState<AdminUser | null>(null);
  const [approveUser, setApproveUser]       = useState<AdminUser | null>(null);
  const [approveRole, setApproveRole]       = useState<AssignableRole>('employee');
  const [approveLoading, setApproveLoading] = useState(false);
  const [setupLink, setSetupLink]           = useState<string | null>(null);
  const [rejectUser, setRejectUser]         = useState<AdminUser | null>(null);
  const [rejectReason, setRejectReason]     = useState('');
  const [rejectLoading, setRejectLoading]   = useState(false);

  /* ── Toast ── */
  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }

  /* ── Fetch stats ── */
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      if (!getApiToken()) return;
      const data = await adminApi.getPendingStats();
      setStats(data);
    } catch {
      /* non-critical */
    } finally {
      setStatsLoading(false);
    }
  }, []);

  /* ── Fetch users ── */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!getApiToken()) throw new Error('Admin session not found. Please log in again.');
      const data = await adminApi.getPendingUsers();
      setAllUsers(data.users);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load registrations.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    fetchUsers();
    fetchStats();
  }, [fetchUsers, fetchStats]);

  useEffect(() => { handleRefresh(); }, [handleRefresh]);

  /* ── Sort ── */
  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  }

  /* ── Reset filters ── */
  function resetFilters() {
    setSearch('');
    setFilterPlant('');
    setFilterDept('');
    setFilterRole('');
    setFilterStatus('');
    setFilterDate('');
    setPage(1);
  }

  const hasActiveFilters = !!(search || filterPlant || filterDept || filterRole || filterStatus || filterDate);

  /* ── Client-side filter + sort + paginate ── */
  const filtered = useMemo(() => {
    let rows = [...allUsers];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.employeeId ?? '').toLowerCase().includes(q) ||
          (u.phone ?? '').toLowerCase().includes(q),
      );
    }

    if (filterPlant)  rows = rows.filter((u) => u.plant === filterPlant);
    if (filterDept)   rows = rows.filter((u) => u.department === filterDept);
    if (filterRole)   rows = rows.filter((u) => u.role === filterRole);
    if (filterStatus) rows = rows.filter((u) => u.status === filterStatus);

    if (filterDate) {
      const dStart = new Date(filterDate);
      dStart.setHours(0, 0, 0, 0);
      const dEnd = new Date(filterDate);
      dEnd.setHours(23, 59, 59, 999);
      rows = rows.filter((u) => {
        const t = new Date(u.createdAt);
        return t >= dStart && t <= dEnd;
      });
    }

    rows.sort((a, b) => {
      const av = (a[sortKey] ?? '') as string;
      const bv = (b[sortKey] ?? '') as string;
      const cmp = av.localeCompare(bv, undefined, { sensitivity: 'base' });
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return rows;
  }, [allUsers, search, filterPlant, filterDept, filterRole, filterStatus, filterDate, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ── Approve ── */
  async function handleApprove() {
    if (!approveUser) return;
    setApproveLoading(true);
    try {
      const res = await adminApi.approve(approveUser._id, approveRole);
      setSetupLink(res.setupLink);
      setAllUsers((prev) => prev.filter((u) => u._id !== approveUser._id));
      fetchStats();
      showToast('success', `${approveUser.name} approved as ${approveRole}.`);
      if (!res.setupLink) setApproveUser(null);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Approval failed.');
    } finally {
      setApproveLoading(false);
    }
  }

  /* ── Reject ── */
  async function handleReject() {
    if (!rejectUser || !rejectReason.trim()) return;
    setRejectLoading(true);
    try {
      await adminApi.reject(rejectUser._id, rejectReason.trim());
      setAllUsers((prev) => prev.filter((u) => u._id !== rejectUser._id));
      fetchStats();
      showToast('success', `${rejectUser.name}'s registration rejected.`);
      setRejectUser(null);
      setRejectReason('');
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Rejection failed.');
    } finally {
      setRejectLoading(false);
    }
  }

  function openApproveFromView(user: AdminUser) {
    setViewUser(null);
    setApproveUser(user);
    setApproveRole('employee');
    setSetupLink(null);
  }

  function openRejectFromView(user: AdminUser) {
    setViewUser(null);
    setRejectUser(user);
    setRejectReason('');
  }

  /* ─────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-5">

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[70] flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-semibold shadow-xl
            ${toast.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/80 dark:text-emerald-300'
              : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/80 dark:text-rose-300'
            }`}
        >
          {toast.type === 'success'
            ? <CheckCircle className="h-4 w-4 shrink-0" />
            : <XCircle className="h-4 w-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Pending Registrations"
        description="Review and approve newly registered employees before granting system access."
        actions={
          <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Clock}        label="Pending"        value={statsLoading ? null : (stats?.pending ?? 0)}       color="amber"   />
        <StatCard icon={CheckCircle}  label="Approved Today" value={statsLoading ? null : (stats?.approvedToday ?? 0)} color="emerald" />
        <StatCard icon={XCircle}      label="Rejected Today" value={statsLoading ? null : (stats?.rejectedToday ?? 0)} color="rose"    />
        <StatCard icon={Users}        label="Total Waiting"  value={statsLoading ? null : (stats?.totalWaiting ?? 0)}  color="blue"    />
      </div>

      {/* Filter Bar */}
      <Card>
        <CardBody className="py-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-steel-400" />
              <Input
                id="reg-search"
                placeholder="Search name, email, employee ID…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="h-9 pl-8 text-sm"
              />
            </div>

            <div className="w-[140px]">
              <Select
                id="reg-plant"
                value={filterPlant}
                onChange={(e) => { setFilterPlant(e.target.value); setPage(1); }}
                className="h-9 text-sm"
              >
                <option value="">All Plants</option>
                {PLANTS.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
            </div>

            <div className="w-[160px]">
              <Select
                id="reg-dept"
                value={filterDept}
                onChange={(e) => { setFilterDept(e.target.value); setPage(1); }}
                className="h-9 text-sm"
              >
                <option value="">All Departments</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </Select>
            </div>

            <div className="w-[130px]">
              <Select
                id="reg-role"
                value={filterRole}
                onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
                className="h-9 text-sm"
              >
                <option value="">All Roles</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </Select>
            </div>

            <div className="w-[130px]">
              <Select
                id="reg-status"
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                className="h-9 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Select>
            </div>

            <div className="w-[150px]">
              <Input
                id="reg-date"
                type="date"
                value={filterDate}
                onChange={(e) => { setFilterDate(e.target.value); setPage(1); }}
                className="h-9 text-sm"
              />
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="h-9 shrink-0">
                <XCircle className="h-3.5 w-3.5" />
                Reset
              </Button>
            )}

            {!loading && (
              <p className="ml-auto shrink-0 self-center text-xs text-steel-500 dark:text-steel-400">
                <span className="font-semibold text-steel-700 dark:text-steel-200">{filtered.length}</span>
                {' '}result{filtered.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Table */}
      {loading ? (
        <PageLoader />
      ) : error ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-rose-500">
          <XCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title={hasActiveFilters ? 'No matching registrations' : 'No pending registrations'}
          description={
            hasActiveFilters
              ? 'Try adjusting your filters to find what you are looking for.'
              : 'All access requests have been processed.'
          }
          action={
            hasActiveFilters ? (
              <Button variant="secondary" size="sm" onClick={resetFilters}>
                Reset Filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHead label="Employee ID"    sortKey="employeeId"  currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                <SortableHead label="Full Name"      sortKey="name"        currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                <SortableHead label="Email"          sortKey="email"       currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                <SortableHead label="Phone"          sortKey="phone"       currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                <SortableHead label="Plant"          sortKey="plant"       currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                <SortableHead label="Department"     sortKey="department"  currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                <SortableHead label="Role Requested" sortKey="role"        currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                <SortableHead label="Reg. Date"      sortKey="createdAt"   currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                <SortableHead label="Status"         sortKey="status"      currentKey={sortKey} currentDir={sortDir} onSort={handleSort} />
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <code className="font-mono text-xs text-brand-600 dark:text-brand-400">
                      {user.employeeId || '—'}
                    </code>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="whitespace-nowrap font-medium text-steel-900 dark:text-steel-100">
                        {user.name}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-steel-600 dark:text-steel-400">
                    {user.email}
                  </TableCell>

                  <TableCell className="whitespace-nowrap text-steel-600 dark:text-steel-400">
                    {user.phone || '—'}
                  </TableCell>

                  <TableCell className="text-steel-600 dark:text-steel-400">
                    {user.plant || '—'}
                  </TableCell>

                  <TableCell className="text-steel-600 dark:text-steel-400">
                    {user.department || '—'}
                  </TableCell>

                  <TableCell>
                    <span className="inline-flex items-center rounded border border-steel-200 bg-steel-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-steel-700 dark:border-steel-700 dark:bg-steel-800 dark:text-steel-300">
                      {user.role}
                    </span>
                  </TableCell>

                  <TableCell className="whitespace-nowrap text-xs text-steel-500 dark:text-steel-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 shrink-0" />
                      {formatDate(user.createdAt)}
                    </span>
                  </TableCell>

                  <TableCell>
                    <RegistrationStatusBadge status={user.status} />
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewUser(user)}
                        className="h-7 px-2 text-xs"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Button>
                      {user.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setApproveUser(user); setApproveRole('employee'); setSetupLink(null); }}
                            className="h-7 px-2 text-xs text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setRejectUser(user); setRejectReason(''); }}
                            className="h-7 px-2 text-xs text-rose-600 hover:bg-rose-500/10 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              total={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          )}
        </div>
      )}

      {/* ══ VIEW DETAIL MODAL ══ */}
      <Modal
        open={!!viewUser}
        onClose={() => setViewUser(null)}
        title="Registration Details"
        description="Full registration information submitted by the employee."
        size="xl"
        footer={
          viewUser ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setViewUser(null)}>
                Close
              </Button>
              {viewUser.status === 'pending' && (
                <>
                  <Button variant="danger" size="sm" onClick={() => openRejectFromView(viewUser)}>
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => openApproveFromView(viewUser)}>
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </Button>
                </>
              )}
            </>
          ) : undefined
        }
      >
        {viewUser && (
          <div className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
            {/* Personal */}
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-steel-400 dark:text-steel-500">
                Personal Information
              </p>
              <DetailRow icon={CreditCard} label="Employee ID" value={viewUser.employeeId} />
              <DetailRow icon={User}       label="Full Name"   value={viewUser.name} />
              <DetailRow icon={Mail}       label="Email"       value={viewUser.email} />
              <DetailRow icon={Phone}      label="Phone"       value={viewUser.phone} />
            </div>

            {/* Organization */}
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-steel-400 dark:text-steel-500">
                Organization
              </p>
              <DetailRow icon={ShieldCheck} label="Requested Role" value={viewUser.role ? viewUser.role.charAt(0).toUpperCase() + viewUser.role.slice(1) : null} />
              <DetailRow icon={MapPin}      label="Plant"          value={viewUser.plant} />
              <DetailRow icon={Building2}   label="Department"     value={viewUser.department} />
              <DetailRow icon={Briefcase}   label="Designation"    value={viewUser.designation} />
              <DetailRow icon={Layers}      label="Area"           value={viewUser.area} />
            </div>

            {/* Registration */}
            <div className="mt-4 sm:col-span-2">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-steel-400 dark:text-steel-500">
                Registration
              </p>
              <div className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
                <DetailRow icon={Calendar} label="Registration Date" value={formatDate(viewUser.createdAt)} />
                <div className="flex items-start gap-3 border-b border-steel-200 py-2.5 last:border-0 dark:border-steel-800/60">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-brand-500/15 bg-brand-500/10">
                    <ClipboardCheck className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-steel-500 dark:text-steel-400">Current Status</p>
                    <div className="mt-1">
                      <RegistrationStatusBadge status={viewUser.status} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents placeholder */}
            <div className="mt-4 sm:col-span-2">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-steel-400 dark:text-steel-500">
                Documents
              </p>
              <div className="flex items-center gap-2.5 rounded-lg border border-dashed border-steel-300 px-4 py-3 text-xs text-steel-500 dark:border-steel-700 dark:text-steel-400">
                <FileText className="h-4 w-4 shrink-0" />
                No documents uploaded. Document upload is not yet enabled for this registration.
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ══ APPROVE MODAL ══ */}
      <Modal
        open={!!approveUser}
        onClose={() => { if (!approveLoading) { setApproveUser(null); setSetupLink(null); } }}
        title={setupLink ? 'Registration Approved' : 'Approve Registration'}
        description={
          setupLink
            ? 'Share the password setup link below with the employee.'
            : `Assign a system role to ${approveUser?.name ?? ''} before activating their account.`
        }
        size="sm"
        footer={
          !setupLink ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setApproveUser(null)} disabled={approveLoading}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleApprove} disabled={approveLoading}>
                {approveLoading ? (
                  <><RefreshCw className="h-4 w-4 animate-spin" /> Approving…</>
                ) : (
                  <><CheckCircle className="h-4 w-4" /> Approve</>
                )}
              </Button>
            </>
          ) : (
            <Button variant="primary" size="sm" onClick={() => { setApproveUser(null); setSetupLink(null); }}>
              Done
            </Button>
          )
        }
      >
        {!setupLink ? (
          <div className="space-y-3">
            <p className="text-xs text-steel-500 dark:text-steel-400">
              Approve this registration and activate this employee account? Select the role to assign:
            </p>
            <div className="space-y-2">
              {ROLE_OPTIONS.map((r) => (
                <label
                  key={r}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-2.5 transition-colors
                    ${approveRole === r
                      ? 'border-brand-500/40 bg-brand-500/8 dark:border-brand-500/30 dark:bg-brand-500/10'
                      : 'border-steel-200 bg-steel-50 hover:bg-steel-100 dark:border-steel-700 dark:bg-steel-800/40 dark:hover:bg-steel-800'
                    }`}
                >
                  <input
                    type="radio"
                    name="approveRole"
                    value={r}
                    checked={approveRole === r}
                    onChange={() => setApproveRole(r)}
                    className="accent-brand-600"
                  />
                  <span className="text-sm font-medium capitalize text-steel-800 dark:text-steel-200">{r}</span>
                </label>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 dark:border-emerald-800/60 dark:bg-emerald-950/40">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                User approved successfully. Share the setup link below so they can set their password.
              </p>
            </div>
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-steel-400">Password Setup Link</p>
              <div className="flex items-center gap-2 rounded-lg border border-steel-200 bg-steel-50 px-3 py-2 dark:border-steel-700 dark:bg-steel-900">
                <code className="flex-1 break-all text-xs text-brand-600 dark:text-brand-400">{setupLink}</code>
                <button
                  onClick={() => navigator.clipboard.writeText(setupLink!)}
                  className="shrink-0 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-600 hover:bg-brand-500/10 dark:text-brand-400"
                >
                  Copy
                </button>
              </div>
              <p className="mt-1.5 text-[10px] text-steel-400 dark:text-steel-500">
                ⚠ This link expires. Share it promptly with the employee.
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* ══ REJECT MODAL ══ */}
      <Modal
        open={!!rejectUser}
        onClose={() => { if (!rejectLoading) { setRejectUser(null); setRejectReason(''); } }}
        title="Reject Registration"
        description={`Provide a mandatory reason for rejecting ${rejectUser?.name ?? ''}'s registration request.`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setRejectUser(null)} disabled={rejectLoading}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleReject} disabled={rejectLoading || !rejectReason.trim()}>
              {rejectLoading ? (
                <><RefreshCw className="h-4 w-4 animate-spin" /> Rejecting…</>
              ) : (
                <><XCircle className="h-4 w-4" /> Reject Registration</>
              )}
            </Button>
          </>
        }
      >
        <Textarea
          id="reject-reason"
          label="Rejection Reason *"
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="e.g. Employee ID not found in HR records. Please contact the HR department."
          error={rejectReason.length > 0 && rejectReason.trim().length < 10 ? 'Reason must be at least 10 characters.' : undefined}
        />
        <p className="mt-1.5 text-[10px] text-steel-400 dark:text-steel-500">
          This message will be shown to the employee when they check their registration status.
        </p>
      </Modal>

    </div>
  );
}
