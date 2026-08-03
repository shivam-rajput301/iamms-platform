import { useState, useCallback, useMemo } from 'react';
import {
  Search,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  CreditCard,
  Mail,
  Calendar,
  ClipboardCheck,
  SlidersHorizontal,
  ArrowDownUp,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import {
  adminApi,
  getApiToken,
  type AdminUser,
  type PendingStats,
} from '@/lib/api';
import { DEPARTMENTS } from '@/lib/constants';
import { formatDate, cn } from '@/lib/utils';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageLoader } from '@/components/ui/Spinner';

/* ── Constants ───────────────────────────────────────────────────── */
const PAGE_SIZE = 20;

const ROLE_OPTIONS = [
  { value: 'employee',  label: 'Employee' },
  { value: 'engineer',  label: 'Engineer' },
  { value: 'manager',   label: 'Manager' },
] as const;
type AssignableRole = 'employee' | 'engineer' | 'manager';

type StatusFilter = '' | 'pending' | 'approved' | 'rejected';
type SortOrder    = 'newest' | 'oldest';

/* ── Toast ───────────────────────────────────────────────────────── */
interface ToastState { type: 'success' | 'error'; msg: string }

/* ── Status Badge ────────────────────────────────────────────────── */
function RegistrationBadge({ status }: { status: AdminUser['status'] }) {
  const map: Record<AdminUser['status'], { variant: 'warning' | 'success' | 'danger' | 'neutral'; label: string; dot: string }> = {
    pending:  { variant: 'warning',  label: 'Pending',  dot: 'bg-amber-500' },
    approved: { variant: 'success',  label: 'Approved', dot: 'bg-emerald-500' },
    rejected: { variant: 'danger',   label: 'Rejected', dot: 'bg-rose-500' },
    blocked:  { variant: 'neutral',  label: 'Blocked',  dot: 'bg-slate-400' },
  };
  const { variant, label, dot } = map[status] ?? map.blocked;
  return <Badge variant={variant} dot={dot}>{label}</Badge>;
}

/* ── Stat Card ───────────────────────────────────────────────────── */
function StatCard({
  icon: Icon, label, value, color,
}: {
  icon: typeof Users;
  label: string;
  value: number | null;
  color: 'amber' | 'emerald' | 'rose' | 'cyan';
}) {
  const palette = {
    amber:   { icon: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)',  val: '#fbbf24' },
    emerald: { icon: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)',  val: '#34d399' },
    rose:    { icon: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)',   val: '#f87171' },
    cyan:    { icon: '#17C7E8', bg: 'rgba(23,199,232,0.1)',  border: 'rgba(23,199,232,0.2)',  val: '#17C7E8' },
  };
  const p = palette[color];
  return (
    <Card>
      <CardBody className="flex items-center gap-4 py-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ background: p.bg, border: `1px solid ${p.border}` }}
        >
          <Icon className="h-5 w-5" style={{ color: p.icon }} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {label}
          </p>
          <p className="mt-0.5 text-2xl font-bold tabular-nums" style={{ color: value === null ? 'rgba(255,255,255,0.25)' : p.val }}>
            {value === null ? '—' : value}
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

/* ── Detail Field Row ────────────────────────────────────────────── */
function DetailField({ label, value, mono = false }: { label: string; value: string | null | undefined; mono?: boolean }) {
  return (
    <div
      className="flex flex-col gap-0.5 py-3"
      style={{ borderBottom: '1px solid rgba(23,199,232,0.08)' }}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
        {label}
      </p>
      {mono ? (
        <code className="text-sm font-mono font-semibold" style={{ color: '#17C7E8' }}>
          {value || '—'}
        </code>
      ) : (
        <p className="text-sm font-medium" style={{ color: '#E2E8F0' }}>
          {value || '—'}
        </p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PENDING APPROVALS PAGE
══════════════════════════════════════════════════════════════════ */
export function PendingRegistrationsPage() {

  /* ── Data state ── */
  const [allUsers, setAllUsers]         = useState<AdminUser[]>([]);
  const [stats, setStats]               = useState<PendingStats | null>(null);
  const [loading, setLoading]           = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [toast, setToast]               = useState<ToastState | null>(null);

  /* ── Filter / sort state ── */
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [sortOrder, setSortOrder]       = useState<SortOrder>('newest');
  const [page, setPage]                 = useState(1);

  /* ── View drawer ── */
  const [viewUser, setViewUser]         = useState<AdminUser | null>(null);

  /* ── Approve modal ── */
  const [approveUser, setApproveUser]       = useState<AdminUser | null>(null);
  const [approveName, setApproveName]       = useState('');
  const [approveRole, setApproveRole]       = useState<AssignableRole>('employee');
  const [approveDept, setApproveDept]       = useState('');
  const [approveDesig, setApproveDesig]     = useState('');
  const [approveLoading, setApproveLoading] = useState(false);
  const [approveErrors, setApproveErrors]   = useState<Record<string, string>>({});
  const [setupLink, setSetupLink]           = useState<string | null>(null);
  const [linkCopied, setLinkCopied]         = useState(false);

  /* ── Reject modal ── */
  const [rejectUser, setRejectUser]         = useState<AdminUser | null>(null);
  const [rejectReason, setRejectReason]     = useState('');
  const [rejectLoading, setRejectLoading]   = useState(false);

  /* ── Toast helper ── */
  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4500);
  }

  /* ── Fetch stats ── */
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      if (!getApiToken()) return;
      const data = await adminApi.getPendingStats();
      setStats(data);
    } catch { /* non-critical */ }
    finally { setStatsLoading(false); }
  }, []);

  /* ── Fetch ALL registration users (pending + approved + rejected) ── */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!getApiToken()) throw new Error('Admin session not found. Please log in again.');
      // Fetch all registration requests (no status filter — we filter client-side)
      const data = await adminApi.getUsers({ limit: 500 });
      // Only include users who submitted a request (exclude super_admin themselves)
      const registrations = data.users.filter((u) => u.role !== 'super_admin');
      setAllUsers(registrations);
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

  // Initial load
  useMemo(() => { handleRefresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Client-side filter + sort + paginate ── */
  const filtered = useMemo(() => {
    let rows = [...allUsers];

    // Status filter
    if (statusFilter) {
      rows = rows.filter((u) => u.status === statusFilter);
    }

    // Search: Employee ID or Email
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (u) =>
          (u.employeeId ?? '').toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      );
    }

    // Sort by request date
    rows.sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? tb - ta : ta - tb;
    });

    return rows;
  }, [allUsers, statusFilter, search, sortOrder]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasActiveSearch = !!(search || statusFilter !== 'pending');

  /* ── Open approve modal ── */
  function openApprove(user: AdminUser) {
    setApproveUser(user);
    setApproveName(user.name || '');
    setApproveRole((user.role as AssignableRole) || 'employee');
    setApproveDept(user.department || '');
    setApproveDesig(user.designation || '');
    setApproveErrors({});
    setSetupLink(null);
    setLinkCopied(false);
    setViewUser(null);
  }

  /* ── Open reject modal ── */
  function openReject(user: AdminUser) {
    setRejectUser(user);
    setRejectReason('');
    setViewUser(null);
  }

  /* ── Approve handler ── */
  async function handleApprove() {
    if (!approveUser) return;

    // Validate
    const errs: Record<string, string> = {};
    if (!approveName.trim()) errs.name = 'Full name is required.';
    if (!approveRole) errs.role = 'Role is required.';
    if (!approveDept) errs.dept = 'Department is required.';
    if (!approveDesig.trim()) errs.desig = 'Designation is required.';
    if (Object.keys(errs).length > 0) { setApproveErrors(errs); return; }

    setApproveLoading(true);
    try {
      // Step 1: Update user metadata (name, department, designation)
      await adminApi.updateUser(approveUser._id, {
        name:        approveName.trim(),
        department:  approveDept,
        designation: approveDesig.trim(),
      });

      // Step 2: Approve with role → sets status=approved, isApproved=true
      const res = await adminApi.approve(approveUser._id, approveRole);
      setSetupLink(res.setupLink);

      // Optimistic update: refresh the row data locally
      setAllUsers((prev) =>
        prev.map((u) =>
          u._id === approveUser._id
            ? {
                ...u,
                name:        approveName.trim(),
                department:  approveDept,
                designation: approveDesig.trim(),
                role:        approveRole,
                status:      'approved',
                isApproved:  true,
              }
            : u,
        ),
      );

      fetchStats();
      showToast('success', `${approveName.trim()} approved as ${approveRole}.`);

      if (!res.setupLink) {
        setApproveUser(null);
      }
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Approval failed. Please try again.');
    } finally {
      setApproveLoading(false);
    }
  }

  /* ── Reject handler ── */
  async function handleReject() {
    if (!rejectUser || !rejectReason.trim()) return;
    setRejectLoading(true);
    try {
      await adminApi.reject(rejectUser._id, rejectReason.trim());

      // Optimistic update
      setAllUsers((prev) =>
        prev.map((u) =>
          u._id === rejectUser._id
            ? { ...u, status: 'rejected', rejectionReason: rejectReason.trim(), isApproved: false }
            : u,
        ),
      );

      fetchStats();
      showToast('success', `Registration request rejected.`);
      setRejectUser(null);
      setRejectReason('');
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Rejection failed. Please try again.');
    } finally {
      setRejectLoading(false);
    }
  }

  /* ── Copy setup link ── */
  async function copySetupLink() {
    if (!setupLink) return;
    await navigator.clipboard.writeText(setupLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  }

  /* ──────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-5">

      {/* ── Toast notification ── */}
      {toast && (
        <div
          className={cn(
            'fixed right-4 top-4 z-[70] flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold shadow-2xl animate-slide-up',
            toast.type === 'success'
              ? 'border border-emerald-500/30 bg-[rgba(14,22,40,0.98)] text-emerald-400'
              : 'border border-red-500/30 bg-[rgba(14,22,40,0.98)] text-red-400',
          )}
          style={{ backdropFilter: 'blur(12px)' }}
        >
          {toast.type === 'success'
            ? <CheckCircle className="h-4 w-4 shrink-0" />
            : <AlertCircle className="h-4 w-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* ── Page Header ── */}
      <PageHeader
        title="Pending Approvals"
        description="Review, approve, or reject employee registration requests."
        actions={
          <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
            Refresh
          </Button>
        }
      />

      {/* ── KPI Stats ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Clock}       label="Awaiting Review"  value={statsLoading ? null : (stats?.pending ?? 0)}       color="amber"   />
        <StatCard icon={CheckCircle} label="Approved Today"   value={statsLoading ? null : (stats?.approvedToday ?? 0)} color="emerald" />
        <StatCard icon={XCircle}     label="Rejected Today"   value={statsLoading ? null : (stats?.rejectedToday ?? 0)} color="rose"    />
        <StatCard icon={Users}       label="Total Processed"  value={statsLoading ? null : (allUsers.length)}           color="cyan"    />
      </div>

      {/* ── Filter + Search Bar ── */}
      <Card>
        <CardBody className="py-3.5">
          <div className="flex flex-wrap items-center gap-3">

            {/* Search */}
            <div className="relative min-w-[220px] flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              />
              <Input
                id="search-registrations"
                placeholder="Search by Employee ID or email…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="h-9 pl-8 text-sm"
              />
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" style={{ color: 'rgba(255,255,255,0.35)' }} />
              <div className="flex gap-1">
                {([
                  { val: '',         label: 'All'      },
                  { val: 'pending',  label: 'Pending'  },
                  { val: 'approved', label: 'Approved' },
                  { val: 'rejected', label: 'Rejected' },
                ] as { val: StatusFilter; label: string }[]).map(({ val, label }) => (
                  <button
                    key={val}
                    onClick={() => { setStatusFilter(val); setPage(1); }}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150',
                      statusFilter === val
                        ? 'bg-[rgba(23,199,232,0.15)] text-[#17C7E8] border border-[rgba(23,199,232,0.3)]'
                        : 'text-[rgba(255,255,255,0.45)] hover:text-[rgba(255,255,255,0.75)] border border-transparent hover:border-[rgba(23,199,232,0.1)]',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5 ml-auto">
              <ArrowDownUp className="h-3.5 w-3.5" style={{ color: 'rgba(255,255,255,0.35)' }} />
              <Select
                id="sort-order"
                value={sortOrder}
                onChange={(e) => { setSortOrder(e.target.value as SortOrder); setPage(1); }}
                className="h-9 text-xs w-[140px]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </Select>
            </div>

            {/* Result count */}
            {!loading && (
              <p className="text-xs shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }}>
                <span className="font-semibold" style={{ color: '#E2E8F0' }}>{filtered.length}</span>
                {' '}result{filtered.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </CardBody>
      </Card>

      {/* ── Table ── */}
      {loading ? (
        <PageLoader />
      ) : error ? (
        <div
          className="flex items-center justify-center gap-2.5 rounded-xl py-16 text-sm"
          style={{ color: '#f87171', border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.05)' }}
        >
          <XCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title={hasActiveSearch ? 'No matching requests' : 'No pending approvals'}
          description={
            hasActiveSearch
              ? 'Try adjusting your search or status filter.'
              : 'All registration requests have been processed.'
          }
          action={
            hasActiveSearch ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { setSearch(''); setStatusFilter('pending'); setPage(1); }}
              >
                Clear Filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Official Email</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Current Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((user) => (
                <TableRow key={user._id}>
                  {/* Employee ID */}
                  <TableCell>
                    <code
                      className="font-mono text-xs font-semibold"
                      style={{ color: '#17C7E8' }}
                    >
                      {user.employeeId || '—'}
                    </code>
                  </TableCell>

                  {/* Official Email */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                        style={{
                          background: 'linear-gradient(135deg, #17C7E8, #0da8c8)',
                          color: '#080F1E',
                        }}
                      >
                        {user.name?.charAt(0)?.toUpperCase() ?? user.email.charAt(0).toUpperCase()}
                      </div>
                      <span
                        className="text-xs font-medium"
                        style={{ color: '#CBD5E1' }}
                      >
                        {user.email}
                      </span>
                    </div>
                  </TableCell>

                  {/* Request Date */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      <Calendar className="h-3 w-3 shrink-0" />
                      {formatDate(user.createdAt)}
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <RegistrationBadge status={user.status} />
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {/* View Details */}
                      <button
                        onClick={() => setViewUser(user)}
                        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors"
                        style={{ color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(23,199,232,0.1)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#E2E8F0';
                          e.currentTarget.style.borderColor = 'rgba(23,199,232,0.25)';
                          e.currentTarget.style.backgroundColor = 'rgba(23,199,232,0.06)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                          e.currentTarget.style.borderColor = 'rgba(23,199,232,0.1)';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </button>

                      {/* Approve — only for pending */}
                      {user.status === 'pending' && (
                        <>
                          <button
                            onClick={() => openApprove(user)}
                            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors"
                            style={{
                              color: '#34d399',
                              border: '1px solid rgba(16,185,129,0.2)',
                              backgroundColor: 'rgba(16,185,129,0.07)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.14)';
                              e.currentTarget.style.borderColor = 'rgba(16,185,129,0.35)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.07)';
                              e.currentTarget.style.borderColor = 'rgba(16,185,129,0.2)';
                            }}
                          >
                            <CheckCircle className="h-3 w-3" />
                            Approve
                          </button>

                          <button
                            onClick={() => openReject(user)}
                            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors"
                            style={{
                              color: '#f87171',
                              border: '1px solid rgba(239,68,68,0.2)',
                              backgroundColor: 'rgba(239,68,68,0.07)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.14)';
                              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.07)';
                              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
                            }}
                          >
                            <XCircle className="h-3 w-3" />
                            Reject
                          </button>
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

      {/* ══════════════════════════════════════════════════════════
          VIEW DETAILS MODAL
      ══════════════════════════════════════════════════════════ */}
      <Modal
        open={!!viewUser}
        onClose={() => setViewUser(null)}
        title="Request Details"
        description="Full registration information submitted by the employee."
        size="md"
        footer={
          viewUser ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setViewUser(null)}>
                Close
              </Button>
              {viewUser.status === 'pending' && (
                <>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => openReject(viewUser)}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Reject
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => openApprove(viewUser)}
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Approve
                  </Button>
                </>
              )}
            </>
          ) : undefined
        }
      >
        {viewUser && (
          <div className="space-y-0">
            <DetailField label="Employee ID"    value={viewUser.employeeId} mono />
            <DetailField label="Official Email" value={viewUser.email} />
            <DetailField label="Full Name"      value={viewUser.name || '—'} />
            <DetailField
              label="Request Time"
              value={new Date(viewUser.createdAt).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            />
            <div
              className="flex flex-col gap-0.5 py-3"
              style={{ borderBottom: '1px solid rgba(23,199,232,0.08)' }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Current Status
              </p>
              <div className="mt-1">
                <RegistrationBadge status={viewUser.status} />
              </div>
            </div>
            {(viewUser.rejectionReason || viewUser.status === 'rejected') && (
              <div className="flex flex-col gap-0.5 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Notes / Rejection Reason
                </p>
                <p
                  className="mt-0.5 rounded-lg p-2.5 text-sm"
                  style={{
                    background: 'rgba(239,68,68,0.06)',
                    border: '1px solid rgba(239,68,68,0.15)',
                    color: '#fca5a5',
                  }}
                >
                  {viewUser.rejectionReason || '—'}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ══════════════════════════════════════════════════════════
          APPROVE MODAL
      ══════════════════════════════════════════════════════════ */}
      <Modal
        open={!!approveUser}
        onClose={() => { if (!approveLoading) { setApproveUser(null); setSetupLink(null); } }}
        title={setupLink ? 'Employee Approved' : 'Approve Registration'}
        description={
          setupLink
            ? 'The employee account has been activated.'
            : `Assign profile details for ${approveUser?.email ?? ''} before granting access.`
        }
        size="md"
        footer={
          !setupLink ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setApproveUser(null)}
                disabled={approveLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleApprove}
                disabled={approveLoading}
              >
                {approveLoading ? (
                  <><RefreshCw className="h-4 w-4 animate-spin" /> Approving…</>
                ) : (
                  <><CheckCircle className="h-4 w-4" /> Approve & Activate</>
                )}
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => { setApproveUser(null); setSetupLink(null); }}
            >
              Done
            </Button>
          )
        }
      >
        {!setupLink ? (
          <div className="space-y-4">
            {/* Context */}
            <div
              className="rounded-lg p-3"
              style={{
                background: 'rgba(23,199,232,0.06)',
                border: '1px solid rgba(23,199,232,0.12)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="h-3.5 w-3.5" style={{ color: '#17C7E8' }} />
                <code className="text-xs font-mono" style={{ color: '#17C7E8' }}>
                  {approveUser?.employeeId}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" style={{ color: 'rgba(255,255,255,0.35)' }} />
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {approveUser?.email}
                </p>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <Input
                id="approve-name"
                label="Full Name *"
                placeholder="e.g. Rajesh Kumar Sharma"
                value={approveName}
                onChange={(e) => { setApproveName(e.target.value); setApproveErrors((p) => ({ ...p, name: '' })); }}
                error={approveErrors.name}
              />
            </div>

            {/* Role */}
            <div>
              <p className="label">Role *</p>
              <div className="grid grid-cols-3 gap-2">
                {ROLE_OPTIONS.map((r) => (
                  <label
                    key={r.value}
                    className={cn(
                      'flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border px-3 py-3 transition-all duration-150',
                      approveRole === r.value
                        ? 'border-[rgba(23,199,232,0.4)] bg-[rgba(23,199,232,0.1)] text-[#17C7E8]'
                        : 'border-[rgba(23,199,232,0.08)] bg-[rgba(9,17,31,0.4)] text-[rgba(255,255,255,0.45)] hover:border-[rgba(23,199,232,0.2)] hover:text-[rgba(255,255,255,0.75)]',
                    )}
                  >
                    <input
                      type="radio"
                      name="approve-role"
                      value={r.value}
                      checked={approveRole === r.value}
                      onChange={() => { setApproveRole(r.value); setApproveErrors((p) => ({ ...p, role: '' })); }}
                      className="sr-only"
                    />
                    <span className="text-xs font-semibold">{r.label}</span>
                  </label>
                ))}
              </div>
              {approveErrors.role && (
                <p className="mt-1 text-xs text-red-400">{approveErrors.role}</p>
              )}
            </div>

            {/* Department */}
            <div>
              <Select
                id="approve-dept"
                label="Department *"
                value={approveDept}
                onChange={(e) => { setApproveDept(e.target.value); setApproveErrors((p) => ({ ...p, dept: '' })); }}
                error={approveErrors.dept}
              >
                <option value="">Select department…</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </Select>
            </div>

            {/* Designation */}
            <div>
              <Input
                id="approve-desig"
                label="Designation *"
                placeholder="e.g. Maintenance Engineer, Shift Supervisor"
                value={approveDesig}
                onChange={(e) => { setApproveDesig(e.target.value); setApproveErrors((p) => ({ ...p, desig: '' })); }}
                error={approveErrors.desig}
              />
            </div>
          </div>
        ) : (
          /* ── Success state ── */
          <div className="space-y-4">
            <div
              className="flex items-start gap-3 rounded-xl p-3.5"
              style={{
                background: 'rgba(16,185,129,0.07)',
                border: '1px solid rgba(16,185,129,0.2)',
              }}
            >
              <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" style={{ color: '#34d399' }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: '#34d399' }}>
                  Account Activated
                </p>
                <p className="mt-0.5 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {approveName} has been approved as <strong className="text-emerald-400 capitalize">{approveRole}</strong>.
                </p>
              </div>
            </div>

            {setupLink && (
              <div>
                <p className="label mb-2">Password Setup Link</p>
                <div
                  className="flex items-center gap-2 rounded-lg p-3"
                  style={{
                    background: 'rgba(9,17,31,0.6)',
                    border: '1px solid rgba(23,199,232,0.12)',
                  }}
                >
                  <code className="flex-1 break-all text-xs" style={{ color: '#17C7E8' }}>
                    {setupLink}
                  </code>
                  <button
                    onClick={copySetupLink}
                    className="flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors"
                    style={{ color: linkCopied ? '#34d399' : '#17C7E8', background: 'rgba(23,199,232,0.08)' }}
                  >
                    {linkCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {linkCopied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="mt-1.5 text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  ⚠ Share this link promptly. It may expire after a single use.
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ══════════════════════════════════════════════════════════
          REJECT MODAL
      ══════════════════════════════════════════════════════════ */}
      <Modal
        open={!!rejectUser}
        onClose={() => { if (!rejectLoading) { setRejectUser(null); setRejectReason(''); } }}
        title="Reject Registration"
        description={`Provide a reason for rejecting ${rejectUser?.email ?? ''}'s request. This will be visible to the employee.`}
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRejectUser(null)}
              disabled={rejectLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleReject}
              disabled={rejectLoading || rejectReason.trim().length < 10}
            >
              {rejectLoading ? (
                <><RefreshCw className="h-4 w-4 animate-spin" /> Rejecting…</>
              ) : (
                <><XCircle className="h-4 w-4" /> Reject Request</>
              )}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {/* Who is being rejected */}
          <div
            className="flex items-center gap-2.5 rounded-lg p-3"
            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
          >
            <AlertCircle className="h-4 w-4 shrink-0" style={{ color: '#f87171' }} />
            <div>
              <p className="text-xs font-semibold" style={{ color: '#f87171' }}>
                Rejecting request from:
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {rejectUser?.employeeId} · {rejectUser?.email}
              </p>
            </div>
          </div>

          <Textarea
            id="reject-reason"
            label="Rejection Reason *"
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Employee ID not found in HR records. Please contact the HR department and resubmit your request."
            error={rejectReason.length > 0 && rejectReason.trim().length < 10
              ? 'Reason must be at least 10 characters.'
              : undefined}
          />

          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            This message will be shown to the employee when they check their registration status.
          </p>
        </div>
      </Modal>

    </div>
  );
}
