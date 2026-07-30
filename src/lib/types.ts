export type Role = "super_admin" | "manager" | "engineer" | "employee";
export type UserApprovalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "blocked";

export interface PendingUser {
  _id: string;
  name: string;
  employeeId: string;
  email: string;
  phone: string | null;
  plant: string | null;
  area: string | null;
  department: string | null;
  designation: string | null;
  role: Role;
  status: UserApprovalStatus;
  rejectionReason: string | null;
  isApproved: boolean;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DepartmentType = "production" | "maintenance" | "support";
export type AssetStatus =
  | "operational"
  | "active"
  | "under_maintenance"
  | "breakdown"
  | "idle"
  | "retired";
export type Criticality = "low" | "medium" | "high" | "critical";
export type Priority = "low" | "medium" | "high" | "critical";
export type RequestStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "completed"
  | "closed";
export type LogType = "update" | "assignment" | "completion" | "note";
export type MaintenanceType =
  | "preventive"
  | "corrective"
  | "predictive"
  | "emergency"
  | "inspection";
export type AssetType =
  | "production_equipment"
  | "mechanical_equipment"
  | "electrical_equipment"
  | "instrumentation"
  | "it_asset"
  | "facility_asset"
  | "vehicle"
  | "tool";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  department_id: string | null;
  phone: string | null;
  avatar_url: string | null;
  employee_id: string | null;
  designation: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  department?: Department | null;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  departmentType?: DepartmentType;
  description: string | null;
  head_of_department: string | null;
  created_at: string;
}

export interface Asset {
  id: string;
  asset_id: string;
  name: string;
  category: string;
  asset_type?: AssetType;
  maintenance_type?: MaintenanceType;
  department_id: string | null;
  plant: string | null;
  location: string | null;
  manufacturer: string | null;
  model_number: string | null;
  serial_number: string | null;
  purchase_date: string | null;
  warranty_expiry: string | null;
  last_maintenance_date: string | null;
  next_maintenance_date: string | null;
  health_score: number;
  status: AssetStatus;
  image_url: string | null;
  qr_code: string | null;
  criticality: Criticality;
  purchase_cost: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  department?: Department | null;
}

export interface MaintenanceRequest {
  id: string;
  request_code: string;
  asset_id: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: RequestStatus;
  requested_by: string;
  assigned_engineer: string | null;
  assigned_by: string | null;
  images: string[];
  repair_notes: string | null;
  repair_images: string[];
  estimated_hours: number | null;
  actual_hours: number | null;
  maintenance_cost: number;
  downtime_hours: number;
  rating?: number | null;
  feedback_comment?: string | null;
  assigned_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  asset?: Asset;
  requester?: Profile;
  engineer?: Profile | null;
  assigner?: Profile | null;
}

export interface MaintenanceLog {
  id: string;
  request_id: string;
  author_id: string;
  note: string;
  images: string[];
  progress: number;
  log_type: LogType;
  created_at: string;
  author?: Profile;
}

export interface InventoryItem {
  id: string;
  item_name: string;
  part_number: string;
  category: string | null;
  quantity: number;
  minimum_stock: number;
  unit: string;
  supplier: string | null;
  unit_price: number;
  storage_location: string | null;
  last_restocked: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryUsage {
  id: string;
  request_id: string;
  inventory_id: string;
  quantity: number;
  unit_price: number;
  used_by: string;
  used_at: string;
  inventory?: InventoryItem;
}

export interface Notification {
  id: string;
  user_id: string | null;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface DashboardStats {
  totalAssets: number;
  activeAssets: number;
  underMaintenance: number;
  criticalAssets: number;
  totalEngineers: number;
  pendingRequests: number;
  completedRequests: number;
  lowStockAlerts: number;
}
