import { useState, useEffect, useCallback } from 'react';
import { Eye, CheckCircle, XCircle, RefreshCw, Calendar, User, Mail, Phone, MapPin, Layers, Briefcase, Building2, CreditCard } from 'lucide-react';
import { adminApi, getApiToken, type AdminUser } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';

/* ── Status badge ─────────────────────────────────────────────── */
const STATUS_META = {
  pending:  { label: 'Pending',  bg: 'rgba(249,115,22,0.12)', color: '#fb923c', border: 'rgba(249,115,22,0.3)' },
  approved: { label: 'Approved', bg: 'rgba(16,185,129,0.12)', color: '#34d399', border: 'rgba(16,185,129,0.3)' },
  rejected: { label: 'Rejected', bg: 'rgba(239,68,68,0.12)',  color: '#f87171', border: 'rgba(239,68,68,0.3)'  },
  blocked:  { label: 'Blocked',  bg: 'rgba(100,116,139,0.12)',color: '#94a3b8', border: 'rgba(100,116,139,0.3)' },
};

function StatusBadge({ status }: { status: AdminUser['status'] }) {
  const m = STATUS_META[status];
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}` }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.color }} />
      {m.label}
    </span>
  );
}

/* ── Detail row ───────────────────────────────────────────────── */
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

/* ══════════════════════════════════════════════════════════════
   PENDING REGISTRATIONS PAGE
══════════════════════════════════════════════════════════════ */
export function PendingRegistrationsPage() {
  const [users,      setUsers]      = useState<AdminUser[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [toast,      setToast]      = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  /* View modal */
  const [viewUser,   setViewUser]   = useState<AdminUser | null>(null);

  /* Approve modal */
  const [approveUser, setApproveUser] = useState<AdminUser | null>(null);
  const [approveRole, setApproveRole] = useState<'employee' | 'engineer' | 'manager'>('employee');
  const [approveLoading, setApproveLoading] = useState(false);
  const [setupLink, setSetupLink]   = useState<string | null>(null);

  /* Reject modal */
  const [rejectUser,   setRejectUser]   = useState<AdminUser | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!getApiToken()) throw new Error('Admin session not found. Please log in again.');
      const data = await adminApi.getPendingUsers();
      setUsers(data.users);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load pending registrations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  /* ── Approve ── */
  async function handleApprove() {
    if (!approveUser) return;
    setApproveLoading(true);
    try {
      const res = await adminApi.approve(approveUser._id, approveRole);
      setSetupLink(res.setupLink);
      setUsers((prev) => prev.filter((u) => u._id !== approveUser._id));
      showToast('success', `${approveUser.name} approved as ${approveRole}.`);
      if (!res.setupLink) {
        setApproveUser(null);
      }
      // If setupLink exists, keep modal open to show the link
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
      setUsers((prev) => prev.filter((u) => u._id !== rejectUser._id));
      showToast('success', `${rejectUser.name}'s request rejected.`);
      setRejectUser(null);
      setRejectReason('');
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Rejection failed.');
    } finally {
      setRejectLoading(false);
    }
  }

  /* ─────────────────────────────────────────────────────────── */
  const CARD: React.CSSProperties = {
    background: 'rgba(15,23,42,0.6)',
    border: '1px solid rgba(37,99,235,0.10)',
    borderRadius: 16,
    overflow: 'hidden',
  };

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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-steel-900 dark:text-steel-100">Pending Registrations</h1>
          <p className="mt-0.5 text-sm text-steel-500">
            Review and act on employee access requests.{' '}
            {!loading && <span className="font-semibold" style={{ color: '#f97316' }}>{users.length} pending</span>}
          </p>
        </div>
        <button onClick={fetchUsers}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all hover:opacity-80"
          style={{ background: 'rgba(37,99,235,0.10)', border: '1px solid rgba(37,99,235,0.2)', color: '#60a5fa' }}>
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Table card */}
      <div style={CARD}>
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
            <CheckCircle className="h-10 w-10 mb-3" style={{ color: '#10b981', opacity: 0.5 }} />
            <p className="font-semibold">No pending registrations</p>
            <p className="text-xs mt-1">All access requests have been processed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(37,99,235,0.08)', background: 'rgba(2,8,23,0.3)' }}>
                  {['Name', 'Employee ID', 'Email', 'Plant', 'Area', 'Department', 'Designation', 'Submitted', 'Status', 'Actions'].map((h) => (
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
                          style={{ background: 'linear-gradient(135deg, #2563eb, #1e40af)' }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-steel-100 whitespace-nowrap">{user.name}</span>
                      </div>
                    </td>
                    <td className={TD}><code className="text-xs" style={{ color: '#60a5fa' }}>{user.employeeId}</code></td>
                    <td className={TD} style={{ color: '#94a3b8' }}>{user.email}</td>
                    <td className={TD} style={{ color: '#94a3b8' }}>{user.plant || '—'}</td>
                    <td className={TD} style={{ color: '#94a3b8' }}>{user.area || '—'}</td>
                    <td className={TD} style={{ color: '#94a3b8' }}>{user.department || '—'}</td>
                    <td className={TD} style={{ color: '#94a3b8' }}>{user.designation || '—'}</td>
                    <td className={TD} style={{ color: '#64748b', whiteSpace: 'nowrap' }}>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(user.createdAt)}</span>
                    </td>
                    <td className={TD}><StatusBadge status={user.status} /></td>
                    <td className={TD}>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setViewUser(user)}
                          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all hover:opacity-80"
                          style={{ background: 'rgba(37,99,235,0.10)', color: '#60a5fa', border: '1px solid rgba(37,99,235,0.2)' }}>
                          <Eye className="h-3 w-3" /> View
                        </button>
                        <button
                          onClick={() => { setApproveUser(user); setApproveRole('employee'); setSetupLink(null); }}
                          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all hover:opacity-80"
                          style={{ background: 'rgba(16,185,129,0.10)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
                          <CheckCircle className="h-3 w-3" /> Approve
                        </button>
                        <button
                          onClick={() => { setRejectUser(user); setRejectReason(''); }}
                          className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all hover:opacity-80"
                          style={{ background: 'rgba(239,68,68,0.10)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                          <XCircle className="h-3 w-3" /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── View Modal ── */}
      <Modal
        open={!!viewUser}
        onClose={() => setViewUser(null)}
        title="Employee Details"
        description="Full registration details submitted by the employee."
        size="md"
      >
        {viewUser && (
          <div className="space-y-0">
            <DetailRow icon={User}      label="Full Name"   value={viewUser.name} />
            <DetailRow icon={CreditCard as typeof User}  label="Employee ID"  value={viewUser.employeeId} />
            <DetailRow icon={Mail}      label="Email"       value={viewUser.email} />
            <DetailRow icon={Phone}     label="Phone"       value={viewUser.phone} />
            <DetailRow icon={MapPin}    label="Plant"       value={viewUser.plant} />
            <DetailRow icon={Layers}    label="Area"        value={viewUser.area} />
            <DetailRow icon={Building2} label="Department"  value={viewUser.department} />
            <DetailRow icon={Briefcase} label="Designation" value={viewUser.designation} />
            <DetailRow icon={Calendar}  label="Submitted"   value={formatDate(viewUser.createdAt)} />
          </div>
        )}
      </Modal>

      {/* ── Approve Modal ── */}
      <Modal
        open={!!approveUser}
        onClose={() => { if (!approveLoading) { setApproveUser(null); setSetupLink(null); } }}
        title={setupLink ? 'User Approved ✓' : 'Approve Registration'}
        description={setupLink
          ? 'Share the password setup link below with the employee.'
          : `Assign a role to ${approveUser?.name ?? ''} before approving.`}
        size="sm"
        footer={!setupLink ? (
          <>
            <button onClick={() => setApproveUser(null)} disabled={approveLoading}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-steel-400 hover:text-steel-200 transition-colors">
              Cancel
            </button>
            <button onClick={handleApprove} disabled={approveLoading}
              className="flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              {approveLoading ? <><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" /></svg> Approving…</> : <><CheckCircle className="h-4 w-4" /> Approve</>}
            </button>
          </>
        ) : (
          <button onClick={() => { setApproveUser(null); setSetupLink(null); }}
            className="rounded-lg px-5 py-2 text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
            Done
          </button>
        )}
      >
        {!setupLink ? (
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-steel-400">Assign Role</label>
            <div className="space-y-2">
              {(['employee', 'engineer', 'manager'] as const).map((r) => (
                <label key={r} className="flex items-center gap-3 cursor-pointer rounded-xl p-3 transition-colors"
                  style={{ background: approveRole === r ? 'rgba(37,99,235,0.10)' : 'rgba(255,255,255,0.03)', border: `1px solid ${approveRole === r ? 'rgba(37,99,235,0.3)' : 'rgba(255,255,255,0.07)'}` }}>
                  <input type="radio" name="approveRole" value={r} checked={approveRole === r}
                    onChange={() => setApproveRole(r)} className="accent-blue-600" />
                  <span className="text-sm font-semibold capitalize text-steel-200">{r}</span>
                </label>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 rounded-xl p-3"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
              <p className="text-sm text-emerald-300">User approved successfully. Share the setup link below so they can set their password.</p>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-steel-400">Password Setup Link</p>
              <div className="flex items-center gap-2 rounded-lg p-3"
                style={{ background: 'rgba(2,8,23,0.6)', border: '1px solid rgba(37,99,235,0.15)' }}>
                <code className="flex-1 text-xs text-blue-300 break-all">{setupLink}</code>
                <button onClick={() => navigator.clipboard.writeText(setupLink!)}
                  className="shrink-0 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors"
                  style={{ background: 'rgba(37,99,235,0.15)', color: '#60a5fa' }}>
                  Copy
                </button>
              </div>
              <p className="mt-1.5 text-[10px] text-steel-500">⚠ This link expires. Share it promptly with the employee.</p>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Reject Modal ── */}
      <Modal
        open={!!rejectUser}
        onClose={() => { if (!rejectLoading) { setRejectUser(null); setRejectReason(''); } }}
        title="Reject Registration"
        description={`Provide a reason for rejecting ${rejectUser?.name ?? ''}'s request. They will see this reason.`}
        size="sm"
        footer={
          <>
            <button onClick={() => setRejectUser(null)} disabled={rejectLoading}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-steel-400 hover:text-steel-200 transition-colors">
              Cancel
            </button>
            <button onClick={handleReject} disabled={rejectLoading || !rejectReason.trim()}
              className="flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
              {rejectLoading ? <><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" /></svg> Rejecting…</> : <><XCircle className="h-4 w-4" /> Reject</>}
            </button>
          </>
        }
      >
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-steel-400">
            Rejection Reason <span className="text-red-400">*</span>
          </label>
          <textarea
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Employee ID not found in HR records. Please contact HR department."
            className="w-full resize-none rounded-xl p-3 text-sm outline-none transition-all"
            style={{
              background: 'rgba(2,8,23,0.6)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: '#e2e8f0',
              fontFamily: 'inherit',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.15)'; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; e.currentTarget.style.boxShadow = 'none'; }}
          />
          <p className="mt-1.5 text-[10px] text-steel-500">This message will be shown to the employee when they try to log in.</p>
        </div>
      </Modal>

      {/* Hidden import to suppress TS unused import */}
      <div style={{ display: 'none' }}><div className="CreditCard-placeholder" /></div>
    </div>
  );
}
