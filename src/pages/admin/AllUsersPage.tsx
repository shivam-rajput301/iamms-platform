import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, Eye, Pencil, Ban, Trash2, RefreshCw,
  CheckCircle, XCircle, Key, Users, ChevronLeft, ChevronRight,
  User as UserIcon, Building2, Plus,
  MoreVertical, ShieldCheck, UserX, AlertCircle, X, UserCheck,
  Save,
} from 'lucide-react';
import { adminApi, getApiToken, type AdminUser } from '@/lib/api';
import { DEPARTMENTS } from '@/lib/constants';
import { formatDate, timeAgo } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';

/* ── Master Options ───────────────────────────────────────── */
const PLANTS = ['Head Office', 'Plant A', 'Plant B', 'Plant C', 'Smelter Complex', 'Rolling Unit'];

const STATUS_META: Record<string, { label: string; bg: string; color: string; border: string }> = {
  approved: { label: 'Active', bg: 'rgba(16,185,129,0.12)', color: '#10b981', border: 'rgba(16,185,129,0.25)' },
  pending:  { label: 'Pending', bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
  rejected: { label: 'Rejected', bg: 'rgba(225,29,72,0.12)',  color: '#e11d48', border: 'rgba(225,29,72,0.25)' },
  blocked:  { label: 'Blocked',  bg: 'rgba(100,116,139,0.12)',color: '#64748b', border: 'rgba(100,116,139,0.25)' },
};

const ROLE_META: Record<string, { label: string; color: string; border: string }> = {
  super_admin: { label: 'Super Admin', color: '#D4A72C', border: 'rgba(212,167,44,0.3)' },
  manager:     { label: 'Manager',     color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  engineer:    { label: 'Engineer',    color: '#3b82f6', border: 'rgba(59,130,246,0.3)' },
  employee:    { label: 'Employee',    color: '#94a3b8', border: 'rgba(148,163,184,0.3)' },
};

/* ── Badges ────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: AdminUser['status'] }) {
  const m = STATUS_META[status] ?? STATUS_META.blocked;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.color }} />
      {m.label}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const m = ROLE_META[role] ?? { label: role, color: '#94a3b8', border: 'rgba(148,163,184,0.3)' };
  return (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: `${m.color}15`, color: m.color, border: `1px solid ${m.border}` }}
    >
      {m.label}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════════
   USER MANAGEMENT MODULE
════════════════════════════════════════════════════════════════ */
export function AllUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterPlant, setFilterPlant] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;
  const searchRef = useRef<ReturnType<typeof setTimeout>>();

  // Active Dropdown Row Index
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Drawers & Modals
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isEditingMode, setIsEditingMode] = useState(false);

  const [changeRoleUser, setChangeRoleUser] = useState<AdminUser | null>(null);
  const [changeRoleVal, setChangeRoleVal] = useState<string>('employee');
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null);
  const [resetPwUser, setResetPwUser] = useState<AdminUser | null>(null);
  const [resetPwLink, setResetPwLink] = useState<string | null>(null);

  // Add User Form State
  const [addForm, setAddForm] = useState({
    name: '',
    employeeId: '',
    email: '',
    phone: '',
    role: 'employee',
    plant: PLANTS[0],
    department: DEPARTMENTS[0],
    password: '',
    confirmPassword: '',
  });
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  // Edit User Form State inside Modal
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    role: 'employee',
    plant: '',
    department: '',
    status: 'approved',
  });
  const [editError, setEditError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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
        search: search || undefined,
        plant: filterPlant || undefined,
        department: filterDept || undefined,
        status: filterStatus || undefined,
        role: filterRole || undefined,
        page: overridePage ?? page,
        limit: PAGE_SIZE,
      });
      setUsers(data.users);
      setTotal(data.total);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [search, filterPlant, filterDept, filterStatus, filterRole, page]);

  function handleSearch(val: string) {
    setSearch(val);
    setPage(1);
    clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => fetchUsers(1), 400);
  }

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Open Modal in View Mode or Edit Mode
  function openUserModal(user: AdminUser, edit = false) {
    setSelectedUser(user);
    setIsEditingMode(edit);
    setEditForm({
      name: user.name,
      phone: user.phone || '',
      role: user.role,
      plant: user.plant || PLANTS[0],
      department: user.department || DEPARTMENTS[0],
      status: user.status === 'blocked' ? 'blocked' : 'approved',
    });
    setEditError(null);
    setActiveMenuId(null);
  }

  /* ── Add User Handler ── */
  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setAddError(null);

    if (!addForm.name.trim() || !addForm.employeeId.trim() || !addForm.email.trim() || !addForm.password) {
      setAddError('Please fill out all required fields.');
      return;
    }
    if (addForm.password !== addForm.confirmPassword) {
      setAddError('Passwords do not match.');
      return;
    }

    setAddLoading(true);
    try {
      const res = await adminApi.createUser({
        name: addForm.name.trim(),
        employeeId: addForm.employeeId.trim(),
        email: addForm.email.trim(),
        phone: addForm.phone.trim() || null,
        role: addForm.role as AdminUser['role'],
        plant: addForm.plant,
        department: addForm.department,
        password: addForm.password,
      });

      showToast('success', res.message || 'User created successfully.');
      setAddDrawerOpen(false);
      setAddForm({
        name: '',
        employeeId: '',
        email: '',
        phone: '',
        role: 'employee',
        plant: PLANTS[0],
        department: DEPARTMENTS[0],
        password: '',
        confirmPassword: '',
      });
      fetchUsers(1);
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : 'Failed to create user.');
    } finally {
      setAddLoading(false);
    }
  }

  /* ── Update User Handler inside Modal ── */
  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;
    setEditError(null);
    setEditLoading(true);

    try {
      const res = await adminApi.updateUser(selectedUser._id, {
        name: editForm.name.trim(),
        phone: editForm.phone.trim() || null,
        role: editForm.role as AdminUser['role'],
        plant: editForm.plant,
        department: editForm.department,
        status: editForm.status as AdminUser['status'],
      });

      showToast('success', res.message || 'User profile updated successfully.');
      setSelectedUser(res.user);
      setIsEditingMode(false);
      setUsers((prev) => prev.map((u) => (u._id === selectedUser._id ? res.user : u)));
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'Failed to update user.');
    } finally {
      setEditLoading(false);
    }
  }

  /* ── Change Role Handler ── */
  async function handleChangeRole() {
    if (!changeRoleUser) return;
    setActionLoading(true);
    try {
      const res = await adminApi.changeRole(changeRoleUser._id, changeRoleVal);
      showToast('success', res.message || 'Role updated successfully.');
      setUsers((prev) => prev.map((u) => (u._id === changeRoleUser._id ? res.user : u)));
      if (selectedUser && selectedUser._id === changeRoleUser._id) {
        setSelectedUser(res.user);
      }
      setChangeRoleUser(null);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Role change failed.');
    } finally {
      setActionLoading(false);
    }
  }

  /* ── Activate / Deactivate ── */
  async function handleToggleBlock(user: AdminUser) {
    setActiveMenuId(null);
    try {
      const res = await adminApi.block(user._id);
      showToast('success', res.message);
      setUsers((prev) => prev.map((u) => (u._id === user._id ? res.user : u)));
      if (selectedUser && selectedUser._id === user._id) {
        setSelectedUser(res.user);
      }
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Action failed.');
    }
  }

  /* ── Reset Password ── */
  async function handleResetPassword() {
    if (!resetPwUser) return;
    setActionLoading(true);
    try {
      const res = await adminApi.resetPassword(resetPwUser._id);
      showToast('success', 'Password reset successfully.');
      setResetPwLink(res.resetLink || 'Password@123');
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Reset failed.');
      setResetPwUser(null);
    } finally {
      setActionLoading(false);
    }
  }

  /* ── Delete User ── */
  async function handleDeleteUser() {
    if (!confirmDelete) return;
    setActionLoading(true);
    try {
      await adminApi.deleteUser(confirmDelete._id);
      showToast('success', `${confirmDelete.name} deleted successfully.`);
      setUsers((prev) => prev.filter((u) => u._id !== confirmDelete._id));
      setTotal((t) => t - 1);
      if (selectedUser && selectedUser._id === confirmDelete._id) {
        setSelectedUser(null);
      }
      setConfirmDelete(null);
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Delete failed.');
    } finally {
      setActionLoading(false);
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="animate-fade-in space-y-4">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[70] flex items-center gap-2 rounded-md px-4 py-2.5 text-xs font-semibold shadow-md ${
            toast.type === 'success'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              : 'bg-rose-950 text-rose-300 border border-rose-800'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-rose-400" />}
          {toast.msg}
        </div>
      )}

      {/* Header & Primary Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-steel-200 dark:border-[#2a3242] pb-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-steel-900 dark:text-steel-100">User Management</h1>
          <p className="text-xs text-steel-500 dark:text-steel-400 mt-0.5">
            Manage employee access, roles, departments, and plant permissions ({total} total registered)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => fetchUsers()} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => setAddDrawerOpen(true)}>
            <Plus className="h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-md bg-white dark:bg-[#1a2130] border border-steel-200 dark:border-[#2a3242] p-2.5">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-steel-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search name, email, employee ID…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="input pl-8 py-1 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={filterRole}
            onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
            className="w-32 py-1 text-xs"
          >
            <option value="">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="manager">Manager</option>
            <option value="engineer">Engineer</option>
            <option value="employee">Employee</option>
          </Select>

          <Select
            value={filterPlant}
            onChange={(e) => { setFilterPlant(e.target.value); setPage(1); }}
            className="w-32 py-1 text-xs"
          >
            <option value="">All Plants</option>
            {PLANTS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>

          <Select
            value={filterDept}
            onChange={(e) => { setFilterDept(e.target.value); setPage(1); }}
            className="w-36 py-1 text-xs"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </Select>

          <Select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="w-32 py-1 text-xs"
          >
            <option value="">All Statuses</option>
            <option value="approved">Active</option>
            <option value="pending">Pending</option>
            <option value="blocked">Blocked</option>
            <option value="rejected">Rejected</option>
          </Select>

          {(filterPlant || filterDept || filterStatus || filterRole || search) && (
            <button
              onClick={() => {
                setSearch('');
                setFilterPlant('');
                setFilterDept('');
                setFilterStatus('');
                setFilterRole('');
                setPage(1);
              }}
              className="text-xs font-semibold text-brand-700 dark:text-rose-400 hover:underline px-1"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Main High-Density Table Card */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-steel-500 text-xs gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" /> Fetching organization users…
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16 text-rose-500 text-xs gap-2">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-steel-100 dark:bg-[#141a29] border border-steel-200 dark:border-[#2a3242] text-steel-400 mb-3">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-steel-900 dark:text-steel-100">No users found</h3>
            <p className="mt-1 text-xs text-steel-500 dark:text-steel-400 max-w-sm">
              Create your first user to start managing your organization.
            </p>
            <Button variant="primary" size="sm" className="mt-4" onClick={() => setAddDrawerOpen(true)}>
              <Plus className="h-4 w-4" /> Add User
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-steel-100 dark:bg-[#0f1420] border-b border-steel-200 dark:border-[#2a3242]">
                  <th className="table-header">Employee ID</th>
                  <th className="table-header">Full Name</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Role</th>
                  <th className="table-header">Plant</th>
                  <th className="table-header">Department</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Joined Date</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steel-200 dark:divide-[#2a3242]">
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-steel-50 dark:hover:bg-[#222b3d] transition-colors cursor-pointer"
                    onClick={() => openUserModal(user, false)}
                  >
                    <td className="table-cell font-mono text-xs font-bold text-steel-900 dark:text-steel-200">
                      {user.employeeId}
                    </td>
                    <td className="table-cell font-semibold text-steel-900 dark:text-steel-100">
                      {user.name}
                    </td>
                    <td className="table-cell text-steel-600 dark:text-steel-400 font-mono text-xs">
                      {user.email}
                    </td>
                    <td className="table-cell">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="table-cell text-steel-700 dark:text-steel-300">
                      {user.plant || '—'}
                    </td>
                    <td className="table-cell text-steel-700 dark:text-steel-300">
                      {user.department || '—'}
                    </td>
                    <td className="table-cell">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="table-cell text-steel-500 dark:text-steel-400 text-xs">
                      {formatDate(user.createdAt)}
                    </td>
                    <td
                      className="table-cell text-right relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => openUserModal(user, false)}
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </Button>

                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => setActiveMenuId(activeMenuId === user._id ? null : user._id)}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>

                          {activeMenuId === user._id && (
                            <div className="absolute right-0 top-8 z-50 w-44 rounded-md bg-white dark:bg-[#1a2130] border border-steel-200 dark:border-[#2a3242] shadow-lg py-1 text-xs text-left">
                              <button
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-steel-700 dark:text-steel-200 hover:bg-steel-100 dark:hover:bg-[#222b3d]"
                                onClick={() => openUserModal(user, true)}
                              >
                                <Pencil className="h-3.5 w-3.5 text-blue-500" /> Edit User
                              </button>

                              {user.role !== 'super_admin' && (
                                <button
                                  className="w-full flex items-center gap-2 px-3 py-1.5 text-steel-700 dark:text-steel-200 hover:bg-steel-100 dark:hover:bg-[#222b3d]"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    setChangeRoleUser(user);
                                    setChangeRoleVal(user.role);
                                  }}
                                >
                                  <UserCheck className="h-3.5 w-3.5 text-purple-400" /> Change Role
                                </button>
                              )}

                              <button
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-steel-700 dark:text-steel-200 hover:bg-steel-100 dark:hover:bg-[#222b3d]"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setResetPwUser(user);
                                  setResetPwLink(null);
                                }}
                              >
                                <Key className="h-3.5 w-3.5 text-gold-500" /> Reset Password
                              </button>

                              {user.role !== 'super_admin' && (
                                <>
                                  <button
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-steel-700 dark:text-steel-200 hover:bg-steel-100 dark:hover:bg-[#222b3d]"
                                    onClick={() => handleToggleBlock(user)}
                                  >
                                    {user.isBlocked ? (
                                      <>
                                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Activate User
                                      </>
                                    ) : (
                                      <>
                                        <Ban className="h-3.5 w-3.5 text-amber-500" /> Deactivate User
                                      </>
                                    )}
                                  </button>

                                  <div className="my-1 border-t border-steel-200 dark:border-[#2a3242]" />

                                  <button
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      setConfirmDelete(user);
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" /> Delete User
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2.5 bg-steel-50 dark:bg-[#0f1420] border-t border-steel-200 dark:border-[#2a3242]">
            <p className="text-xs text-steel-500 dark:text-steel-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} users
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                className="h-7 px-2"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <span className="text-xs font-mono px-2 text-steel-700 dark:text-steel-300">
                {page} / {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                className="h-7 px-2"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── ENTERPRISE LARGE CENTERED RESPONSIVE MODAL (900-1000px, 80vh) ── */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          {/* Blurred Dark Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedUser(null)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-[980px] max-h-[82vh] bg-white dark:bg-[#1a2130] border border-steel-200 dark:border-[#2a3242] rounded-lg shadow-2xl flex flex-col overflow-hidden z-50">
            
            {/* Modal Header Banner */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-steel-200 dark:border-[#2a3242] bg-steel-50 dark:bg-[#0f1420]">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#9E1B1B] text-base font-bold text-white uppercase">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-base font-bold text-steel-900 dark:text-steel-100">{selectedUser.name}</h2>
                    <span className="font-mono text-xs font-bold text-brand-600 dark:text-gold-400">
                      ({selectedUser.employeeId})
                    </span>
                    <RoleBadge role={selectedUser.role} />
                    <StatusBadge status={selectedUser.status} />
                  </div>
                  <p className="text-xs text-steel-500 dark:text-steel-400 font-mono mt-0.5">
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isEditingMode ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsEditingMode(true)}
                  >
                    <Pencil className="h-3.5 w-3.5 text-blue-500" /> Edit Profile
                  </Button>
                ) : (
                  <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 flex items-center gap-1.5">
                    <Pencil className="h-3 w-3" /> Edit Mode
                  </span>
                )}
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1.5 rounded-md text-steel-400 hover:text-steel-700 dark:hover:text-white hover:bg-steel-200 dark:hover:bg-[#222b3d] transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: High-Density 3-Section Grid Layout */}
            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
              {editError && (
                <div className="mb-4 rounded-md bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {editError}
                </div>
              )}

              <form id="centeredModalEditForm" onSubmit={handleUpdateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                  {/* SECTION 1: BASIC INFORMATION */}
                  <div className="card p-3.5 space-y-3">
                    <div className="flex items-center gap-2 border-b border-steel-200 dark:border-[#2a3242] pb-2">
                      <UserIcon className="h-4 w-4 text-brand-700 dark:text-gold-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-steel-900 dark:text-steel-100">
                        Basic Information
                      </h3>
                    </div>

                    <div className="space-y-2.5">
                      {!isEditingMode ? (
                        <>
                          <div className="flex justify-between py-1 border-b border-steel-100 dark:border-[#2a3242]">
                            <span className="text-xs text-steel-500">Name</span>
                            <span className="text-xs font-bold text-steel-900 dark:text-steel-100">{selectedUser.name}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-steel-100 dark:border-[#2a3242]">
                            <span className="text-xs text-steel-500">Employee ID</span>
                            <span className="text-xs font-mono font-bold text-brand-600 dark:text-gold-400">{selectedUser.employeeId}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-steel-100 dark:border-[#2a3242]">
                            <span className="text-xs text-steel-500">Email</span>
                            <span className="text-xs font-mono text-steel-700 dark:text-steel-300 truncate max-w-[160px]">{selectedUser.email}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-xs text-steel-500">Phone</span>
                            <span className="text-xs font-medium text-steel-700 dark:text-steel-300">{selectedUser.phone || '—'}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <Input
                            label="Full Name *"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            required
                          />
                          <Input
                            label="Employee ID (Read-only)"
                            value={selectedUser.employeeId}
                            disabled
                            className="bg-steel-100 dark:bg-[#0f1420] opacity-70 cursor-not-allowed"
                          />
                          <Input
                            label="Email Address (Read-only)"
                            value={selectedUser.email}
                            disabled
                            className="bg-steel-100 dark:bg-[#0f1420] opacity-70 cursor-not-allowed"
                          />
                          <Input
                            label="Phone Number"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          />
                        </>
                      )}
                    </div>
                  </div>

                  {/* SECTION 2: ORGANIZATION */}
                  <div className="card p-3.5 space-y-3">
                    <div className="flex items-center gap-2 border-b border-steel-200 dark:border-[#2a3242] pb-2">
                      <Building2 className="h-4 w-4 text-brand-700 dark:text-gold-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-steel-900 dark:text-steel-100">
                        Organization
                      </h3>
                    </div>

                    <div className="space-y-2.5">
                      {!isEditingMode ? (
                        <>
                          <div className="flex justify-between py-1 border-b border-steel-100 dark:border-[#2a3242]">
                            <span className="text-xs text-steel-500">Role</span>
                            <RoleBadge role={selectedUser.role} />
                          </div>
                          <div className="flex justify-between py-1 border-b border-steel-100 dark:border-[#2a3242]">
                            <span className="text-xs text-steel-500">Plant</span>
                            <span className="text-xs font-semibold text-steel-800 dark:text-steel-200">{selectedUser.plant || '—'}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-steel-100 dark:border-[#2a3242]">
                            <span className="text-xs text-steel-500">Department</span>
                            <span className="text-xs font-semibold text-steel-800 dark:text-steel-200">{selectedUser.department || '—'}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-xs text-steel-500">Designation</span>
                            <span className="text-xs font-medium text-steel-700 dark:text-steel-300">{selectedUser.designation || selectedUser.area || '—'}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <Select
                            label="Role *"
                            value={editForm.role}
                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                          >
                            <option value="employee">Employee</option>
                            <option value="engineer">Engineer</option>
                            <option value="manager">Manager</option>
                            <option value="super_admin">Super Admin</option>
                          </Select>
                          <Select
                            label="Plant Location"
                            value={editForm.plant}
                            onChange={(e) => setEditForm({ ...editForm, plant: e.target.value })}
                          >
                            {PLANTS.map((p) => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </Select>
                          <Select
                            label="Department"
                            value={editForm.department}
                            onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                          >
                            {DEPARTMENTS.map((d) => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </Select>
                        </>
                      )}
                    </div>
                  </div>

                  {/* SECTION 3: ACCOUNT & TIMESTAMPS */}
                  <div className="card p-3.5 space-y-3 md:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-2 border-b border-steel-200 dark:border-[#2a3242] pb-2">
                      <ShieldCheck className="h-4 w-4 text-brand-700 dark:text-gold-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-steel-900 dark:text-steel-100">
                        Account Details
                      </h3>
                    </div>

                    <div className="space-y-2.5">
                      {!isEditingMode ? (
                        <>
                          <div className="flex justify-between py-1 border-b border-steel-100 dark:border-[#2a3242]">
                            <span className="text-xs text-steel-500">Account Status</span>
                            <StatusBadge status={selectedUser.status} />
                          </div>
                          <div className="flex justify-between py-1 border-b border-steel-100 dark:border-[#2a3242]">
                            <span className="text-xs text-steel-500">Approval Status</span>
                            <span className={`text-xs font-bold ${selectedUser.isApproved ? 'text-emerald-500' : 'text-amber-500'}`}>
                              {selectedUser.isApproved ? '✓ Verified' : '⏳ Pending'}
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-steel-100 dark:border-[#2a3242]">
                            <span className="text-xs text-steel-500">Created Date</span>
                            <span className="text-xs font-medium text-steel-700 dark:text-steel-300">{formatDate(selectedUser.createdAt)}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-xs text-steel-500">Last Updated</span>
                            <span className="text-xs font-medium text-steel-700 dark:text-steel-300">{timeAgo(selectedUser.updatedAt || selectedUser.createdAt)}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <Select
                            label="Account Status *"
                            value={editForm.status}
                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          >
                            <option value="approved">Approved / Active Access</option>
                            <option value="blocked">Blocked / Deactivated Access</option>
                          </Select>
                          <div className="py-1">
                            <span className="text-xs text-steel-500">Created Date: </span>
                            <span className="text-xs font-medium text-steel-700 dark:text-steel-300">{formatDate(selectedUser.createdAt)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                </div>
              </form>
            </div>

            {/* Modal Footer Controls */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-steel-200 dark:border-[#2a3242] bg-steel-50 dark:bg-[#0f1420]">
              <div className="text-xs text-steel-500 dark:text-steel-400 font-medium">
                Created: <span className="text-steel-700 dark:text-steel-300 font-semibold">{formatDate(selectedUser.createdAt)}</span>
              </div>

              <div className="flex items-center gap-2">
                {!isEditingMode ? (
                  <Button variant="secondary" size="sm" onClick={() => setSelectedUser(null)}>
                    Close
                  </Button>
                ) : (
                  <>
                    <Button variant="secondary" size="sm" onClick={() => setIsEditingMode(false)} disabled={editLoading}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" form="centeredModalEditForm" type="submit" disabled={editLoading}>
                      {editLoading ? 'Saving…' : <><Save className="h-3.5 w-3.5" /> Save Changes</>}
                    </Button>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── CREATE USER DRAWER/MODAL ── */}
      <Modal
        open={addDrawerOpen}
        onClose={() => !addLoading && setAddDrawerOpen(false)}
        title="Add New User"
        description="Register a new employee into the organization directory."
        size="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-3">
          {addError && (
            <div className="rounded-md bg-rose-500/10 border border-rose-500/20 p-2.5 text-xs text-rose-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" /> {addError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Full Name *"
              placeholder="e.g. Rahul Sharma"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              required
            />
            <Input
              label="Employee ID *"
              placeholder="e.g. EMP-1092"
              value={addForm.employeeId}
              onChange={(e) => setAddForm({ ...addForm, employeeId: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Email Address *"
              type="email"
              placeholder="rahul@company.com"
              value={addForm.email}
              onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              required
            />
            <Input
              label="Phone Number"
              placeholder="+91 9876543210"
              value={addForm.phone}
              onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Select
              label="Role *"
              value={addForm.role}
              onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
            >
              <option value="employee">Employee</option>
              <option value="engineer">Engineer</option>
              <option value="manager">Manager</option>
              <option value="super_admin">Super Admin</option>
            </Select>

            <Select
              label="Plant *"
              value={addForm.plant}
              onChange={(e) => setAddForm({ ...addForm, plant: e.target.value })}
            >
              {PLANTS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Select>

            <Select
              label="Department *"
              value={addForm.department}
              onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Password *"
              type="password"
              placeholder="••••••••"
              value={addForm.password}
              onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
              required
            />
            <Input
              label="Confirm Password *"
              type="password"
              placeholder="••••••••"
              value={addForm.confirmPassword}
              onChange={(e) => setAddForm({ ...addForm, confirmPassword: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-steel-200 dark:border-[#2a3242]">
            <Button variant="secondary" type="button" onClick={() => setAddDrawerOpen(false)} disabled={addLoading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={addLoading}>
              {addLoading ? 'Creating…' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── CHANGE ROLE MODAL ── */}
      <Modal
        open={!!changeRoleUser}
        onClose={() => !actionLoading && setChangeRoleUser(null)}
        title="Change User Role"
        description={`Update role permissions for ${changeRoleUser?.name ?? ''}.`}
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setChangeRoleUser(null)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleChangeRole} disabled={actionLoading}>
              {actionLoading ? 'Saving…' : 'Save Role'}
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          {(['employee', 'engineer', 'manager'] as const).map((r) => (
            <label
              key={r}
              className="flex items-center gap-3 cursor-pointer rounded-md p-2.5 transition-colors bg-steel-50 dark:bg-[#141a29] border border-steel-200 dark:border-[#2a3242]"
            >
              <input
                type="radio"
                name="changeRole"
                value={r}
                checked={changeRoleVal === r}
                onChange={() => setChangeRoleVal(r)}
                className="accent-brand-700 font-semibold"
              />
              <span className="text-xs font-semibold capitalize text-steel-900 dark:text-steel-100">{r}</span>
            </label>
          ))}
        </div>
      </Modal>

      {/* ── RESET PASSWORD CONFIRM MODAL ── */}
      <Modal
        open={!!resetPwUser}
        onClose={() => { if (!actionLoading) { setResetPwUser(null); setResetPwLink(null); } }}
        title="Reset User Password"
        size="sm"
      >
        {!resetPwLink ? (
          <div className="space-y-3">
            <p className="text-xs text-steel-700 dark:text-steel-300">
              Reset password for <strong>{resetPwUser?.name}</strong>? The user password will be reset to:
            </p>
            <div className="rounded bg-steel-100 dark:bg-[#0f1420] border border-steel-200 dark:border-[#2a3242] p-2.5 font-mono text-xs text-brand-700 dark:text-gold-400 font-bold">
              Password@123
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setResetPwUser(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleResetPassword} disabled={actionLoading}>
                {actionLoading ? 'Resetting…' : 'Confirm Reset'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400 font-semibold">
              ✓ Password reset successfully for {resetPwUser?.name}.
            </div>
            <p className="text-xs text-steel-500">Default Temporary Password:</p>
            <div className="rounded bg-steel-100 dark:bg-[#0f1420] border border-steel-200 dark:border-[#2a3242] p-2 font-mono text-xs font-bold text-steel-900 dark:text-white">
              Password@123
            </div>
            <div className="flex justify-end">
              <Button variant="primary" size="sm" onClick={() => { setResetPwUser(null); setResetPwLink(null); }}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── DELETE CONFIRMATION MODAL ── */}
      <Modal
        open={!!confirmDelete}
        onClose={() => !actionLoading && setConfirmDelete(null)}
        title="Delete User Account"
        size="sm"
      >
        <div className="space-y-3">
          <div className="rounded bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400 flex items-start gap-2.5">
            <UserX className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Permanent Deletion Warning</p>
              <p className="mt-0.5">
                Are you sure you want to permanently delete <strong>{confirmDelete?.name}</strong> ({confirmDelete?.employeeId})? This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setConfirmDelete(null)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteUser} disabled={actionLoading}>
              {actionLoading ? 'Deleting…' : 'Delete Permanently'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
