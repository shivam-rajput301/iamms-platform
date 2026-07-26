/**
 * IAMMS Backend API client
 *
 * Wraps all calls to the Express/MongoDB backend (default: http://localhost:4000).
 * The base URL is read from VITE_API_BASE_URL (falls back to localhost:4000).
 *
 * Auth token is stored in localStorage under the key 'iamms_api_token'.
 */

import type {
  Role,
  Department,
  Profile,
  Asset,
  MaintenanceRequest,
  MaintenanceLog,
  InventoryItem,
  Notification,
} from './types';

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:4000';

/* ── Token helpers ─────────────────────────────────────────── */
export const TOKEN_KEY = 'iamms_api_token';

export function getApiToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setApiToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearApiToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/* ── Core fetch wrapper ────────────────────────────────────── */
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  withAuth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (withAuth) {
    const token = getApiToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new ApiError(data?.error ?? `HTTP ${res.status}`, res.status, data);
    throw err;
  }
  return data as T;
}

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/* ══════════════════════════════════════════════════════════════
   Auth endpoints (public)
══════════════════════════════════════════════════════════════ */
export interface RequestAccessPayload {
  name?: string;       // optional — Super Admin fills in during approval
  employeeId: string;
  email: string;
  phone?: string;
  plant?: string;
  area?: string;
  department?: string;
  designation?: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  employeeId: string;
  department: string | null;
  designation: string | null;
  plant: string | null;
  area: string | null;
  status: string;
  phone?: string | null;
  isApproved?: boolean;
  isBlocked?: boolean;
}

export interface CheckStatusResult {
  status: 'pending' | 'approved' | 'rejected' | 'blocked' | 'not_found';
  rejectionReason?: string | null;
  name?: string;
  role?: string;
  email?: string;
}

export interface LoginResult {
  token: string;
  user: AuthUser;
}

export const authApi = {
  requestAccess: (payload: RequestAccessPayload) =>
    apiFetch<{ message: string; userId: string }>('/api/auth/request-access', {
      method: 'POST',
      body:   JSON.stringify(payload),
    }, false),

  checkStatus: (identifier: string) =>
    apiFetch<CheckStatusResult>('/api/auth/check-status', {
      method: 'POST',
      body:   JSON.stringify({ identifier }),
    }, false),

  login: (identifier: string, password: string) =>
    apiFetch<LoginResult>('/api/auth/login', {
      method: 'POST',
      body:   JSON.stringify({ identifier, password }),
    }, false),

  getMe: () =>
    apiFetch<{ user: AuthUser }>('/api/auth/me', {
      method: 'GET',
    }, true),
};

/* ══════════════════════════════════════════════════════════════
   Admin endpoints (all require super_admin JWT)
══════════════════════════════════════════════════════════════ */
export interface AdminUser {
  _id: string;
  name: string;
  employeeId: string;
  email: string;
  phone: string | null;
  plant: string | null;
  area: string | null;
  department: string | null;
  designation: string | null;
  role: 'super_admin' | 'manager' | 'engineer' | 'employee';
  status: 'pending' | 'approved' | 'rejected' | 'blocked';
  rejectionReason: string | null;
  isApproved: boolean;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UsersListResult {
  users: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
}

export interface UserFilters {
  search?: string;
  plant?: string;
  department?: string;
  status?: string;
  role?: string;
  page?: number;
  limit?: number;
}

export interface PendingStats {
  pending: number;
  approvedToday: number;
  rejectedToday: number;
  totalWaiting: number;
}

export const adminApi = {
  getPendingCount: () =>
    apiFetch<{ count: number }>('/api/admin/pending-count'),

  getPendingStats: () =>
    apiFetch<PendingStats>('/api/admin/pending-stats'),

  getPendingUsers: () =>
    apiFetch<{ users: AdminUser[]; total: number }>('/api/admin/pending-registrations'),

  getUsers: (filters: UserFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.search)     params.set('search',     filters.search);
    if (filters.plant)      params.set('plant',      filters.plant);
    if (filters.department) params.set('department', filters.department);
    if (filters.status)     params.set('status',     filters.status);
    if (filters.role)       params.set('role',       filters.role);
    if (filters.page)       params.set('page',       String(filters.page));
    if (filters.limit)      params.set('limit',      String(filters.limit));
    return apiFetch<UsersListResult>(`/api/admin/users?${params.toString()}`);
  },

  approve: (id: string, role: string) =>
    apiFetch<{ message: string; setupLink: string | null; user: AdminUser }>(
      `/api/admin/approve/${id}`, { method: 'PUT', body: JSON.stringify({ role }) }
    ),

  reject: (id: string, reason: string) =>
    apiFetch<{ message: string; user: AdminUser }>(
      `/api/admin/reject/${id}`, { method: 'PUT', body: JSON.stringify({ reason }) }
    ),

  changeRole: (id: string, role: string) =>
    apiFetch<{ message: string; user: AdminUser }>(
      `/api/admin/change-role/${id}`, { method: 'PUT', body: JSON.stringify({ role }) }
    ),

  block: (id: string) =>
    apiFetch<{ message: string; user: AdminUser }>(
      `/api/admin/block/${id}`, { method: 'PUT' }
    ),

  resetPassword: (id: string) =>
    apiFetch<{ message: string; resetLink: string | null }>(
      `/api/admin/reset-password/${id}`, { method: 'PUT' }
    ),

  createUser: (userData: Partial<AdminUser> & { password?: string }) =>
    apiFetch<{ message: string; user: AdminUser }>('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  updateUser: (id: string, userData: Partial<AdminUser>) =>
    apiFetch<{ message: string; user: AdminUser }>(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  deleteUser: (id: string) =>
    apiFetch<{ message: string }>(
      `/api/admin/user/${id}`, { method: 'DELETE' }
    ),
};

/* ══════════════════════════════════════════════════════════════
   Resource endpoints (Departments, Profiles, Assets, Requests, Inventory, Notifications)
══════════════════════════════════════════════════════════════ */
export const departmentsApi = {
  getAll: () => apiFetch<Department[]>('/api/departments', { method: 'GET' }, false),
};

export const profilesApi = {
  getAll: () => apiFetch<Profile[]>('/api/profiles', { method: 'GET' }, false),
  getEngineers: () => apiFetch<Profile[]>('/api/profiles/engineers', { method: 'GET' }, false),
  update: (id: string, data: Partial<Profile>) =>
    apiFetch<Profile>(`/api/profiles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true),
};

export const assetsApi = {
  getAll: () => apiFetch<Asset[]>('/api/assets', { method: 'GET' }, false),
  getById: (id: string) => apiFetch<Asset>(`/api/assets/${id}`, { method: 'GET' }, false),
  create: (data: Partial<Asset>) =>
    apiFetch<Asset>('/api/assets', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),
  update: (id: string, data: Partial<Asset>) =>
    apiFetch<Asset>(`/api/assets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true),
  delete: (id: string) =>
    apiFetch<{ message: string }>(`/api/assets/${id}`, { method: 'DELETE' }, true),
};

export const requestsApi = {
  getAll: () => apiFetch<MaintenanceRequest[]>('/api/requests', { method: 'GET' }, false),
  getById: (id: string) => apiFetch<MaintenanceRequest>(`/api/requests/${id}`, { method: 'GET' }, false),
  getLogs: (id: string) => apiFetch<MaintenanceLog[]>(`/api/requests/${id}/logs`, { method: 'GET' }, false),
  create: (data: Partial<MaintenanceRequest>) =>
    apiFetch<MaintenanceRequest>('/api/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),
  update: (id: string, data: Partial<MaintenanceRequest>) =>
    apiFetch<MaintenanceRequest>(`/api/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true),
  submitRating: (id: string, rating: number, feedback_comment?: string) =>
    apiFetch<MaintenanceRequest>(`/api/requests/${id}/rating`, {
      method: 'PUT',
      body: JSON.stringify({ rating, feedback_comment }),
    }, true),
  addLog: (data: Partial<MaintenanceLog>) =>
    apiFetch<MaintenanceLog>('/api/requests/logs', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),
};

export const inventoryApi = {
  getAll: () => apiFetch<InventoryItem[]>('/api/inventory', { method: 'GET' }, false),
  create: (data: Partial<InventoryItem>) =>
    apiFetch<InventoryItem>('/api/inventory', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true),
  update: (id: string, data: Partial<InventoryItem>) =>
    apiFetch<InventoryItem>(`/api/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true),
  delete: (id: string) =>
    apiFetch<{ message: string }>(`/api/inventory/${id}`, { method: 'DELETE' }, true),
  decrement: (id: string, quantity: number) =>
    apiFetch<InventoryItem>(`/api/inventory/${id}/decrement`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }, true),
};

export const notificationsApi = {
  getAll: () => apiFetch<Notification[]>('/api/notifications', { method: 'GET' }, false),
  markRead: (id: string) =>
    apiFetch<Notification>(`/api/notifications/${id}/read`, { method: 'PUT' }, true),
  markAllRead: () =>
    apiFetch<{ message: string }>('/api/notifications/read-all', { method: 'PUT' }, true),
};

export interface OrganizationConfig {
  company_name: string;
  plant_name: string;
  logo_url?: string | null;
  address?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
}

export const organizationApi = {
  getConfig: () =>
    apiFetch<OrganizationConfig>('/api/config/organization', { method: 'GET' }, false),
  updateConfig: (data: Partial<OrganizationConfig>) =>
    apiFetch<OrganizationConfig>('/api/config/organization', {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true),
};
