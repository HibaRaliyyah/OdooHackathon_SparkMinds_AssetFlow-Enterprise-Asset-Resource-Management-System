// User types
export interface User {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: 'admin' | 'asset_manager' | 'department_head' | 'employee';
  department?: Department;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  manager?: User;
  employeeCount?: number;
  budget?: number;
  location?: string;
  isActive: boolean;
}

export interface AssetCategory {
  _id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  color?: string;
  depreciationRate?: number;
  maintenanceInterval?: number;
  isActive: boolean;
}

export type AssetStatus = 'available' | 'allocated' | 'under_maintenance' | 'disposed' | 'lost';
export type AssetCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';

export interface Asset {
  _id: string;
  assetId: string;
  qrCode?: string;
  name: string;
  description?: string;
  category: AssetCategory;
  department?: Department;
  assignedTo?: User;
  status: AssetStatus;
  condition: AssetCondition;
  location?: string;
  serialNumber?: string;
  brand?: string;
  model?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  currentValue?: number;
  vendor?: string;
  warrantyExpiry?: string;
  images: string[];
  tags: string[];
  healthScore: number;
  lastAuditDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';

export interface Booking {
  _id: string;
  bookingId: string;
  asset: Asset;
  bookedBy: User;
  department?: Department;
  startTime: string;
  endTime: string;
  purpose?: string;
  status: BookingStatus;
  approvedBy?: User;
  approvedAt?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
}

export type MaintenanceStatus = 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical';

export interface Maintenance {
  _id: string;
  maintenanceId: string;
  asset: Asset;
  reportedBy: User;
  assignedTo?: User;
  type: 'corrective' | 'preventive' | 'inspection';
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  description: string;
  diagnosis?: string;
  resolution?: string;
  estimatedCost?: number;
  actualCost?: number;
  images: string[];
  approvedBy?: User;
  approvedAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface Transfer {
  _id: string;
  transferId: string;
  asset: Asset;
  fromDepartment?: Department;
  toDepartment?: Department;
  fromUser?: User;
  toUser?: User;
  requestedBy: User;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  reason?: string;
  approvedBy?: User;
  approvedAt?: string;
  createdAt: string;
}

export interface Audit {
  _id: string;
  auditId: string;
  title: string;
  department?: Department;
  conductedBy: User;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate?: string;
  startedAt?: string;
  completedAt?: string;
  totalAssets: number;
  scannedAssets: number;
  matchedAssets: number;
  discrepancies: Array<{ asset: string; issue: string; expectedValue?: string; actualValue?: string }>;
  notes?: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'maintenance' | 'booking' | 'transfer' | 'audit' | 'system' | 'asset';
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  createdAt: string;
}

export interface ActivityLog {
  _id: string;
  action: string;
  entity: string;
  entityId?: string;
  performedBy?: User;
  ipAddress?: string;
  description: string;
  createdAt: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface DashboardStats {
  total: number;
  available: number;
  allocated: number;
  underMaintenance: number;
  disposed: number;
  pendingRequests: number;
}

export interface DashboardData {
  stats: DashboardStats;
  categoryDistribution: Array<{ name: string; count: number; color?: string }>;
  departmentUsage: Array<{ name: string; count: number }>;
  recentActivity: ActivityLog[];
}

export interface AIInsight {
  type: 'info' | 'warning' | 'error' | 'success';
  icon: string;
  message: string;
  action?: string;
}

// Auth
export interface LoginCredentials { email: string; password: string; }
export interface RegisterData {
  firstName: string; lastName: string;
  email: string; password: string;
  role: string; department?: string; phone?: string;
}
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
