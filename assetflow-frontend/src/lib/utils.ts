import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: string | Date) =>
  format(new Date(date), 'MMM dd, yyyy');

export const formatDateTime = (date: string | Date) =>
  format(new Date(date), 'MMM dd, yyyy HH:mm');

export const timeAgo = (date: string | Date) =>
  formatDistanceToNow(new Date(date), { addSuffix: true });

export const formatCurrency = (amount: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

export const getStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    available: 'badge-available', allocated: 'badge-allocated',
    under_maintenance: 'badge-maintenance', disposed: 'badge-disposed',
    pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected',
    completed: 'badge-approved', cancelled: 'badge-disposed', in_progress: 'badge-maintenance',
  };
  return map[status] || 'badge-pending';
};

export const getConditionColor = (condition: string): string => {
  const map: Record<string, string> = {
    excellent: 'text-green-600 bg-green-50',
    good: 'text-blue-600 bg-blue-50',
    fair: 'text-yellow-600 bg-yellow-50',
    poor: 'text-orange-600 bg-orange-50',
    damaged: 'text-red-600 bg-red-50',
  };
  return map[condition] || 'text-slate-600 bg-slate-50';
};

export const getHealthScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
};

export const getAvatarFallback = (name: string): string =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export const truncate = (str: string, max = 50): string =>
  str.length > max ? str.slice(0, max) + '...' : str;

export const ROLES = {
  ADMIN: 'admin',
  ASSET_MANAGER: 'asset_manager',
  DEPARTMENT_HEAD: 'department_head',
  EMPLOYEE: 'employee',
} as const;

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator',
  asset_manager: 'Asset Manager',
  department_head: 'Department Head',
  employee: 'Employee',
};
