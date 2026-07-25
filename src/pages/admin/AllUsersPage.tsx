import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, Filter, Eye, Pencil, Ban, Trash2, RefreshCw,
  CheckCircle, XCircle, Key, Users, ChevronLeft, ChevronRight,
  User, Mail, Phone, MapPin, Layers, Briefcase, Building2, Calendar,
} from 'lucide-react';
import { adminApi, getApiToken, type AdminUser } from '@/lib/api';
import { DEPARTMENTS } from '@/lib/constants';
import { formatDate, timeAgo } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';

/* ── Constants ─────────────────────────────────────────────── */
const PLANTS = ['Head Office', 'Plant A', 'Plant B', 'Plant C', 'Smelter Complex', 'Rolling Unit'];

const STATUS_META = {
  pending:  { label: 'Pending',  bg: 'rgba(249,115,22,0.12)', color: '#fb923c', border: 'rgba(249,115,22,0.3)' },
  approved: { label: 'Approved', bg: 'rgba(16,185,129,0.12)', color: '#34d399', border: 'rgba(16,185,129,0.3)' },
  rejected: { label: 'Rejected', bg: 'rgba(239,68,68,0.12)',  color: '#f87171', border: 'rgba(239,68,68,0.3)'  },
  blocked:  { label: 'Blocked',  bg: 'rgba(100,116,139,0.12)',color: '#94a3b8', border: 'rgba(100,116,139,0.3)' },
};

const ROLE_META: Record<string, { label: string; color: string }> = {
  super_admin: { label: 'Super Admin', color: '#a78bfa' },
  manager:     { label: 'Manager',     color: '#fbbf24' },
  engineer:    { label: 'Engineer',    color: '#60a5fa' },
  employee:    { label: 'Employee',    color: '#94a3b8' },
};

/* ── Reusable components ──────────────────────────────────── */
function StatusBadge({ status }: { status: AdminUser['status'] }) {
  const m = STATUS_META[status] ?? STATUS_META.blocked;
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}` }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.color }} />
      {m.label}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const m = ROLE_META[role] ?? { label: role, color: '#94a3b8' };
  return (
    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: `${m.color}18`, color: m.color, border: `1px solid ${m.color}30` }}>
      {m.label}
    </span>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string | null }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-steel-800/50 last:border-0">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
        style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)' }}>
        <Icon className="h-3.5 w-3.5" style={{ color: '#3b82f6' }} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#475569' }}>{label}</p>
        <p className="mt-0.5 text-sm font-medium" style={{ color: '#e2e8f0' }}>{value || '—'}</p>
      </div>
    </div>
  );
}

function FilterSelect({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg px-3 py-2 text-xs font-semibold outline-none transition-all"
      style={{
        background: value ? 'rgba(37,99,235,0.12)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${value ? 'rgba(37,99,235,0.3)' : 'rgba(255,255,255,0.08)'}`,
        color: value ? '#60a5fa' : '#64748b',
        fontFamily: 'inherit',
      }}
    >
      <option value="">{label}</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function ActionBtn({
  onClick, icon: Icon, label, color, bg, border,
}: {
  onClick: () => void;
  icon: typeof Eye;
  label: string;
  color: string;
  bg: string;
  border: string;
}) {
  return (
    <button onClick={onClick} title={label}
      className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-all hover:opacity-80"
      style={{ background: bg, color, border: `1px solid ${border}` }}>
      <Icon className="h-3 w-3" />
      <span className="hidden xl:inline">{label}</span>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════════
   ALL USERS PAGE
════════════════════════════════════════════════════════════════ */
export function AllUsersPage() {
  const [users,     setUsers]     = useState<AdminUser[]>([]);
  const [total,     setTotal]     = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [toast,     setToast]     = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Filters
  const [search,     setSearch]     = useState('');
  const [filterPlant, setFilterPlant] = useState('');
  const [filterDept,  setFilterDept]  = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRole,  setFilterRole]  = useState('');
  const [page,        setPage]        = useState(1);
  const PAGE_SIZE = 20;
  const searchRef = useRef<ReturnType<typeof setTimeout>>();

  // Modals
  const [viewUser,      setViewUser]       = useState<AdminUser | null>(null);
  const [changeRoleUser, setChangeRoleUser] = useState<AdminUser | null>(null);
  const [changeRoleVal,  setChangeRoleVal]  = useState<string>('employee');
  const [changeRoleLoading, setChangeRoleLoading] = useState(false);
  const [confirmDelete,  setConfirmDelete]  = useState<AdminUser | null>(null);
  const [deleteLoading,  setDeleteLoading]  = useState(false);
  const [resetPwUser,    setResetPwUser]    = useState<AdminUser | null>(null);
  const [resetPwLink,    setResetPwLink]    = useState<string | null>(null);
  const [resetPwLoading, setResetPwLoading] = useState(false);

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4500);
  }

  const fetchUsers = useCallback(async (overridePage?: number) => {
    setLoading(true);
    setError(null);
    try {
      if (!getApiToken()) throw new Error('Admin session not found. Please log in again.');
      const data = await adminApi.getUsers({
        search:     search || undefined,
        plant:      filterPlant || undefined,
        department: filterDept  || undefined,
        status:     filterStatus || undefined,
        role:       filterRole   || undefined,
        page:       overridePage ?? page,
        limit:      PAGE_SIZE,
      });
      setUsers(data.users);
      setTotal(data.total);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [search, filterPlant, filterDept, filterStatus, filterRole, page]);

  // Debounce search input
  function handleSearch(val: string) {
    setSearch(val);
    setPage(1);
    clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => fetchUsers(1), 400);
  }

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  /* ── Block/Unblock ── */
  async function handleBlock(user: AdminUser) {
    try {
      const res = await adminApi.block(user._id);
      showToast('success', res.message);
      setUsers((prev) => prev.map((u) => u._id === user._id ? res.user : u));
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Action failed.');
    }
  }

  /* ── Change Role ── */
  async function handleChangeRole() {
    if (!changeRoleUser) return;
    setChangeRoleLoading(true);
    try {
      const res = await adminApi.changeRole(changeRoleUser._id, changeRoleVal);
      showToast('success', res.message);
      setUsers((prev) => prev.map((u) => u._id === changeRoleUser._id ? res.user : u));
      setChangeRoleUser(null);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Role change failed.');
    } finally {
      setChangeRoleLoading(false);
    }
  }

  /* ── Delete ── */
  async function handleDelete() {
    if (!confirmDelete) return;
    setDeleteLoading(true);
    try {
      await adminApi.deleteUser(confirmDelete._id);
      showToast('success', `${confirmDelete.name} deleted.`);
      setUsers((prev) => prev.filter((u) => u._id !== confirmDelete._id));
      setTotal((t) => t - 1);
      setConfirmDelete(null);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setDeleteLoading(false);
    }
  }

  /* ── Reset Password ── */
  async function handleResetPw() {
    if (!resetPwUser) return;
    setResetPwLoading(true);
    try {
      const res = await adminApi.resetPassword(resetPwUser._id);
      setResetPwLink(res.resetLink);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Reset failed.');
      setResetPwUser(null);
    } finally {
      setResetPwLoading(false);
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const TH = 'px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em]';
  const TD = 'px-4 py-3.5 text-sm';

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[60] flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold shadow-xl
          ${toast.type === 'success' ? 'bg-emerald-900/90 text-emerald-300 border border-emerald-700/40' : 'bg-red-900/90 text-red-300 border border-red-700/40'}`}>
          {toast.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}

      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-steel-900 dark:text-steel-100">All Users</h1>
          <p className="mt-0.5 text-sm text-steel-500">
            {!loading && <><span className="font-semibold text-steel-300">{total}</span> total users</>}
          </p>
        </div>
        <button onClick={() => fetchUsers()}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all hover:opacity-80"
          style={{ background: 'rgba(37,99,235,0.10)', border: '1px solid rgba(37,99,235,0.2)', color: '#60a5fa' }}>
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none" style={{ color: '#475569' }} />
          <input
            type="text"
            placeholder="Search name, email, employee ID…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-lg py-2 pl-9 pr-4 text-sm outline-none transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0', fontFamily: 'inherit' }}
          />
        </div>
        <Filter className="h-4 w-4 shrink-0" style={{ color: '#475569' }} />
        <FilterSelect label="Plant"      value={filterPlant}  onChange={(v) => { setFilterPlant(v);  setPage(1); }} options={PLANTS.map((p) => ({ value: p, label: p }))} />
        <FilterSelect label="Department" value={filterDept}   onChange={(v) => { setFilterDept(v);   setPage(1); }} options={DEPARTMENTS.map((d) => ({ value: d, label: d }))} />
        <FilterSelect label="Status"     value={filterStatus} onChange={(v) => { setFilterStatus(v); setPage(1); }}
          options={[{ value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }, { value: 'blocked', label: 'Blocked' }]} />
        <FilterSelect label="Role"       value={filterRole}   onChange={(v) => { setFilterRole(v);   setPage(1); }}
          options={[{ value: 'super_admin', label: 'Super Admin' }, { value: 'manager', label: 'Manager' }, { value: 'engineer', label: 'Engineer' }, { value: 'employee', label: 'Employee' }]} />
        {(filterPlant || filterDept || filterStatus || filterRole || search) && (
          <button
            onClick={() => { setSearch(''); setFilterPlant(''); setFilterDept(''); setFilterStatus(''); setFilterRole(''); setPage(1); }}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors">
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(37,99,235,0.10)', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? (
          <div className="flex items-center justify-center py-20 text-steel-500">
            <svg className="h-6 w-6 animate-spin mr-2" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" strokeLinecap="round" />
            </svg>
            Loading…
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20 text-red-400 gap-2">
            <XCircle className="h-5 w-5" /> {error}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-steel-500">
            <Users className="h-10 w-10 mb-3 opacity-30" />
            <p className="font-semibold">No users found</p>
            <p className="text-xs mt-1">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(37,99,235,0.08)', background: 'rgba(2,8,23,0.3)' }}>
                  {['User', 'Employee ID', 'Department', 'Plant', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className={TH} style={{ color: '#334155' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr key={user._id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}
                    className="hover:bg-white/[0.02] transition-colors">
                    <td className={TD}>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                          style={{ background: user.isBlocked ? '#334155' : 'linear-gradient(135deg, #2563eb, #1e40af)' }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-steel-100 whitespace-nowrap">{user.name}</p>
                          <p className="text-[11px] truncate" style={{ color: '#475569' }}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className={TD}><code className="text-xs" style={{ color: '#60a5fa' }}>{user.employeeId}</code></td>
                    <td className={TD} style={{ color: '#94a3b8' }}>{user.department || '—'}</td>
                    <td className={TD} style={{ color: '#94a3b8' }}>{user.plant || '—'}</td>
                    <td className={TD}><RoleBadge role={user.role} /></td>
                    <td className={TD}><StatusBadge status={user.status} /></td>
                    <td className={TD} style={{ color: '#64748b', whiteSpace: 'nowrap' }}
                      title={formatDate(user.createdAt)}>{timeAgo(user.createdAt)}</td>
                    <td className={TD}>
                      <div className="flex items-center gap-1 flex-wrap">
                        <ActionBtn onClick={() => setViewUser(user)} icon={Eye} label="View"
                          color="#60a5fa" bg="rgba(37,99,235,0.10)" border="rgba(37,99,235,0.2)" />
                        {user.role !== 'super_admin' && (
                          <>
                            <ActionBtn
                              onClick={() => { setChangeRoleUser(user); setChangeRoleVal(user.role); }}
                              icon={Pencil} label="Role"
                              color="#fbbf24" bg="rgba(245,158,11,0.10)" border="rgba(245,158,11,0.2)" />
                            <ActionBtn
                              onClick={() => handleBlock(user)}
                              icon={user.isBlocked ? CheckCircle : Ban}
                              label={user.isBlocked ? 'Unblock' : 'Block'}
                              color={user.isBlocked ? '#34d399' : '#f87171'}
                              bg={user.isBlocked ? 'rgba(16,185,129,0.10)' : 'rgba(239,68,68,0.10)'}
                              border={user.isBlocked ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'} />
                            <ActionBtn
                              onClick={() => { setResetPwUser(user); setResetPwLink(null); }}
                              icon={Key} label="Reset PW"
                              color="#a78bfa" bg="rgba(139,92,246,0.10)" border="rgba(139,92,246,0.2)" />
                            <ActionBtn
                              onClick={() => setConfirmDelete(user)}
                              icon={Trash2} label="Delete"
                              color="#f87171" bg="rgba(239,68,68,0.08)" border="rgba(239,68,68,0.15)" />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid rgba(37,99,235,0.08)' }}>
            <p className="text-xs text-steel-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors disabled:opacity-30"
                style={{ background: 'rgba(37,99,235,0.10)', border: '1px solid rgba(37,99,235,0.2)', color: '#60a5fa' }}>
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-steel-400">{page} / {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}
                className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors disabled:opacity-30"
                style={{ background: 'rgba(37,99,235,0.10)', border: '1px solid rgba(37,99,235,0.2)', color: '#60a5fa' }}>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── View Modal ── */}
      <Modal open={!!viewUser} onClose={() => setViewUser(null)} title="User Details" size="md">
        {viewUser && (
          <div>
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-black text-white"
                style={{ background: 'linear-gradient(135deg, #2563eb, #1e40af)' }}>
                {viewUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-base font-bold text-steel-100">{viewUser.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <RoleBadge role={viewUser.role} />
                  <StatusBadge status={viewUser.status} />
                </div>
              </div>
            </div>
            <DetailRow icon={User}      label="Employee ID"  value={viewUser.employeeId} />
            <DetailRow icon={Mail}      label="Email"        value={viewUser.email} />
            <DetailRow icon={Phone}     label="Phone"        value={viewUser.phone} />
            <DetailRow icon={MapPin}    label="Plant"        value={viewUser.plant} />
            <DetailRow icon={Layers}    label="Area"         value={viewUser.area} />
            <DetailRow icon={Building2} label="Department"   value={viewUser.department} />
            <DetailRow icon={Briefcase} label="Designation"  value={viewUser.designation} />
            <DetailRow icon={Calendar}  label="Joined"       value={formatDate(viewUser.createdAt)} />
            {viewUser.rejectionReason && (
              <div className="mt-3 rounded-xl p-3 text-xs"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                <p className="font-semibold mb-1">Rejection Reason</p>
                <p>{viewUser.rejectionReason}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ── Change Role Modal ── */}
      <Modal
        open={!!changeRoleUser}
        onClose={() => !changeRoleLoading && setChangeRoleUser(null)}
        title="Change Role"
        description={`Update the role for ${changeRoleUser?.name ?? ''}.`}
        size="sm"
        footer={
          <>
            <button onClick={() => setChangeRoleUser(null)} disabled={changeRoleLoading}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-steel-400 hover:text-steel-200">
              Cancel
            </button>
            <button onClick={handleChangeRole} disabled={changeRoleLoading}
              className="flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
              {changeRoleLoading ? 'Saving…' : 'Save Role'}
            </button>
          </>
        }
      >
        <div className="space-y-2">
          {(['employee', 'engineer', 'manager'] as const).map((r) => (
            <label key={r} className="flex items-center gap-3 cursor-pointer rounded-xl p-3 transition-colors"
              style={{ background: changeRoleVal === r ? 'rgba(37,99,235,0.10)' : 'rgba(255,255,255,0.03)', border: `1px solid ${changeRoleVal === r ? 'rgba(37,99,235,0.3)' : 'rgba(255,255,255,0.07)'}` }}>
              <input type="radio" name="changeRole" value={r} checked={changeRoleVal === r}
                onChange={() => setChangeRoleVal(r)} className="accent-blue-600" />
              <span className="text-sm font-semibold capitalize text-steel-200">{r}</span>
            </label>
          ))}
        </div>
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal
        open={!!confirmDelete}
        onClose={() => !deleteLoading && setConfirmDelete(null)}
        title="Delete User"
        description={`Are you sure you want to permanently delete ${confirmDelete?.name ?? ''}? This action cannot be undone.`}
        size="sm"
        footer={
          <>
            <button onClick={() => setConfirmDelete(null)} disabled={deleteLoading}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-steel-400 hover:text-steel-200">
              Cancel
            </button>
            <button onClick={handleDelete} disabled={deleteLoading}
              className="flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
              {deleteLoading ? 'Deleting…' : <><Trash2 className="h-4 w-4" /> Delete Permanently</>}
            </button>
          </>
        }
      >
        <div className="flex items-center gap-3 rounded-xl p-3"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <XCircle className="h-5 w-5 shrink-0 text-red-400" />
          <p className="text-sm text-red-300">
            This will permanently remove the user from MongoDB. All their data will be lost.
          </p>
        </div>
      </Modal>

      {/* ── Reset Password Modal ── */}
      <Modal
        open={!!resetPwUser}
        onClose={() => { if (!resetPwLoading) { setResetPwUser(null); setResetPwLink(null); } }}
        title="Reset Password"
        description={resetPwLink ? 'Share the link below with the user.' : `Generate a password reset link for ${resetPwUser?.name ?? ''}.`}
        size="sm"
        footer={!resetPwLink ? (
          <>
            <button onClick={() => setResetPwUser(null)} disabled={resetPwLoading}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-steel-400 hover:text-steel-200">
              Cancel
            </button>
            <button onClick={handleResetPw} disabled={resetPwLoading}
              className="flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-bold text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
              {resetPwLoading ? 'Generating…' : <><Key className="h-4 w-4" /> Reset Password</>}
            </button>
          </>
        ) : (
          <button onClick={() => { setResetPwUser(null); setResetPwLink(null); }}
            className="rounded-lg px-5 py-2 text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
            Done
          </button>
        )}
      >
        {!resetPwLink ? (
          <p className="text-sm text-steel-400">The user password will be reset to default password: Password@123</p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg p-3"
              style={{ background: 'rgba(2,8,23,0.6)', border: '1px solid rgba(37,99,235,0.15)' }}>
              <code className="flex-1 text-xs text-blue-300 break-all">{resetPwLink}</code>
              <button onClick={() => navigator.clipboard.writeText(resetPwLink!)}
                className="shrink-0 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider"
                style={{ background: 'rgba(37,99,235,0.15)', color: '#60a5fa' }}>
                Copy
              </button>
            </div>
            <p className="text-[10px] text-steel-500">⚠ This link expires shortly. Share it with the user immediately.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
