import api from '../lib/api';
import { Asset, ApiResponse, Pagination } from '../types';

export interface AssetsResponse {
  success: boolean;
  data: Asset[];
  pagination: Pagination;
}

export const assetService = {
  getAll: (params?: Record<string, unknown>) =>
    api.get<AssetsResponse>('/assets', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<Asset>>(`/assets/${id}`),

  create: (data: FormData) =>
    api.post<ApiResponse<Asset>>('/assets', data, { headers: { 'Content-Type': 'multipart/form-data' } }),

  update: (id: string, data: FormData | Record<string, unknown>) =>
    api.put<ApiResponse<Asset>>(`/assets/${id}`, data,
      data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}),

  delete: (id: string) =>
    api.delete(`/assets/${id}`),

  allocate: (id: string, userId: string) =>
    api.patch<ApiResponse<Asset>>(`/assets/${id}/allocate`, { userId }),

  return: (id: string) =>
    api.patch<ApiResponse<Asset>>(`/assets/${id}/return`),

  getDashboardStats: () =>
    api.get('/assets/stats'),
};

export const departmentService = {
  getAll: () => api.get('/departments'),
  getById: (id: string) => api.get(`/departments/${id}`),
  create: (data: unknown) => api.post('/departments', data),
  update: (id: string, data: unknown) => api.put(`/departments/${id}`, data),
  delete: (id: string) => api.delete(`/departments/${id}`),
};

export const categoryService = {
  getAll: () => api.get('/categories'),
  create: (data: unknown) => api.post('/categories', data),
  update: (id: string, data: unknown) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

export const userService = {
  getAll: (params?: Record<string, unknown>) => api.get('/users', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (data: unknown) => api.post('/users', data),
  update: (id: string, data: FormData | unknown) =>
    api.put(`/users/${id}`, data, data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}),
  delete: (id: string) => api.delete(`/users/${id}`),
  updateProfile: (data: FormData) => api.put('/users/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const bookingService = {
  getAll: (params?: Record<string, unknown>) => api.get('/bookings', { params }),
  create: (data: unknown) => api.post('/bookings', data),
  approve: (id: string) => api.patch(`/bookings/${id}/approve`),
  reject: (id: string, reason: string) => api.patch(`/bookings/${id}/reject`, { reason }),
  cancel: (id: string) => api.patch(`/bookings/${id}/cancel`),
};

export const maintenanceService = {
  getAll: (params?: Record<string, unknown>) => api.get('/maintenance', { params }),
  getById: (id: string) => api.get(`/maintenance/${id}`),
  create: (data: FormData) => api.post('/maintenance', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  approve: (id: string, data?: unknown) => api.patch(`/maintenance/${id}/approve`, data),
  updateStatus: (id: string, data: unknown) => api.patch(`/maintenance/${id}/status`, data),
};

export const transferService = {
  getAll: (params?: Record<string, unknown>) => api.get('/transfers', { params }),
  create: (data: unknown) => api.post('/transfers', data),
  approve: (id: string) => api.patch(`/transfers/${id}/approve`),
  reject: (id: string, reason: string) => api.patch(`/transfers/${id}/reject`, { reason }),
};

export const auditService = {
  getAll: (params?: Record<string, unknown>) => api.get('/audits', { params }),
  start: (data: unknown) => api.post('/audits', data),
  scanAsset: (auditId: string, data: unknown) => api.post(`/audits/${auditId}/scan`, data),
  complete: (id: string, notes?: string) => api.patch(`/audits/${id}/complete`, { notes }),
};

export const notificationService = {
  getAll: (params?: Record<string, unknown>) => api.get('/notifications', { params }),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
};

export const aiService = {
  getHealthScores: () => api.get('/ai/health-scores'),
  getPredictions: () => api.get('/ai/predictions'),
  getInsights: () => api.get('/ai/insights'),
  naturalLanguageSearch: (query: string) => api.post('/ai/search', { query }),
};
