import type { Role, Criticality, Priority, RequestStatus } from './types';
import {
  APPLICATION_NAME,
  APPLICATION_FULL_NAME,
  DEFAULT_COMPANY_NAME,
  DEFAULT_PLANT_NAME,
  COMPANY_NAME,
  PLANT_NAME,
  COMPANY_SHORT,
  DEPARTMENTS,
  ASSET_CATEGORIES,
  INDUSTRIAL_DEPARTMENTS,
  DEPARTMENT_TYPE_LABELS,
  getCategoriesForDepartment,
  INDUSTRIAL_ASSET_TYPES,
  ASSET_STATUS_META,
  CRITICALITY_META,
  PRIORITY_META,
  MAINTENANCE_TYPE_META,
  MAINTENANCE_TYPES,
  type AssetStatus,
} from './masterData';

export {
  APPLICATION_NAME,
  APPLICATION_FULL_NAME,
  DEFAULT_COMPANY_NAME,
  DEFAULT_PLANT_NAME,
  COMPANY_NAME,
  PLANT_NAME,
  COMPANY_SHORT,
  DEPARTMENTS,
  ASSET_CATEGORIES,
  INDUSTRIAL_DEPARTMENTS,
  DEPARTMENT_TYPE_LABELS,
  getCategoriesForDepartment,
  INDUSTRIAL_ASSET_TYPES,
  ASSET_STATUS_META,
  CRITICALITY_META,
  PRIORITY_META,
  MAINTENANCE_TYPE_META,
  MAINTENANCE_TYPES,
};

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  manager: 'Maintenance Manager',
  engineer: 'Engineer',
  employee: 'Employee',
};

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  super_admin: ['*'],
  manager: [
    'dashboard:view',
    'assets:view', 'assets:create', 'assets:edit',
    'requests:view', 'requests:assign', 'requests:close', 'requests:change_priority',
    'inventory:view', 'inventory:create', 'inventory:edit', 'inventory:delete',
    'reports:view',
    'notifications:view',
    'settings:view',
  ],
  engineer: [
    'dashboard:view',
    'assets:view',
    'requests:view', 'requests:accept', 'requests:update_progress', 'requests:complete',
    'inventory:view',
    'reports:view',
    'notifications:view',
  ],
  employee: [
    'dashboard:view',
    'requests:view', 'requests:create',
    'notifications:view',
  ],
};

export function can(role: Role | undefined, permission: string): boolean {
  if (!role) return false;
  const perms = ROLE_PERMISSIONS[role] ?? [];
  return perms.includes('*') || perms.includes(permission);
}

export const REQUEST_STATUS_META: Record<RequestStatus, { label: string; color: string; bg: string; dot: string }> = {
  pending: { label: 'Pending', color: 'text-steel-700 dark:text-steel-300', bg: 'bg-steel-100 dark:bg-steel-800', dot: 'bg-steel-400' },
  assigned: { label: 'Assigned', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10', dot: 'bg-blue-500' },
  in_progress: { label: 'In Progress', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', dot: 'bg-amber-500' },
  completed: { label: 'Completed', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', dot: 'bg-emerald-500' },
  closed: { label: 'Closed', color: 'text-steel-600 dark:text-steel-400', bg: 'bg-steel-100 dark:bg-steel-800', dot: 'bg-steel-400' },
};

export const REQUEST_STATUSES: RequestStatus[] = ['pending', 'assigned', 'in_progress', 'completed', 'closed'];
export const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'critical'];
export const CRITICALITIES: Criticality[] = ['low', 'medium', 'high', 'critical'];
export const ASSET_STATUSES: AssetStatus[] = ['operational', 'active', 'under_maintenance', 'breakdown', 'idle', 'retired'];

export const NOTIFICATION_TYPE_META: Record<string, { label: string; color: string }> = {
  new_request: { label: 'New Request', color: 'text-blue-600' },
  assignment: { label: 'Assignment', color: 'text-amber-600' },
  completed: { label: 'Completed', color: 'text-emerald-600' },
  low_stock: { label: 'Low Stock', color: 'text-rose-600' },
  breakdown: { label: 'Breakdown', color: 'text-rose-600' },
};
