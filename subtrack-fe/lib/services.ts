import apiClient from './api';
import type {
  ApiResponse, AuthResponse, Dashboard, Subscription,
  AddSubscriptionRequest, WasteAnalysis, Preset,
  Notification, ActionType, User, AdminUser, AdminSummary, PaymentRequest,
  SpendingTrend, SavingGoal, SavingGoalRequest, PageResponse,
} from './types';

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  sendOtp: (email: string) =>
    apiClient.post<ApiResponse<void>>('/api/auth/send-otp', { email }),

  register: (email: string, name: string, password: string, otp: string) =>
    apiClient.post<ApiResponse<AuthResponse>>('/api/auth/register', { email, name, password, otp }),

  login: (email: string, password: string) =>
    apiClient.post<ApiResponse<AuthResponse>>('/api/auth/login', { email, password }),

  logout: () =>
    apiClient.post<ApiResponse<void>>('/api/auth/logout'),

  me: () =>
    apiClient.get<ApiResponse<User>>('/api/auth/me'),

  changePassword: (data: any) =>
    apiClient.put<ApiResponse<void>>('/api/auth/password', data),

  sendForgotPasswordOtp: (email: string) =>
    apiClient.post<ApiResponse<void>>('/api/auth/forgot-password/send-otp', { email }),

  resetPassword: (data: any) =>
    apiClient.post<ApiResponse<void>>('/api/auth/forgot-password/reset', data),
};

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const dashboardApi = {
  get: () =>
    apiClient.get<ApiResponse<Dashboard>>('/api/dashboard'),

  getSpendingTrend: () =>
    apiClient.get<ApiResponse<SpendingTrend[]>>('/api/dashboard/spending-trend'),
};

// ─── Subscriptions ───────────────────────────────────────────────────────────
export const subscriptionApi = {
  getPage: (page: number, size: number, filter: string, search?: string) =>
    apiClient.get<ApiResponse<PageResponse<Subscription>>>('/api/subscriptions', {
      params: {
        page,
        size,
        filter,
        ...(search?.trim() ? { search: search.trim() } : {}),
      },
    }),

  getOne: (id: string) =>
    apiClient.get<ApiResponse<Subscription>>(`/api/subscriptions/${id}`),

  add: (data: AddSubscriptionRequest) =>
    apiClient.post<ApiResponse<Subscription>>('/api/subscriptions', data),

  update: (id: string, data: Partial<AddSubscriptionRequest>) =>
    apiClient.put<ApiResponse<Subscription>>(`/api/subscriptions/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/api/subscriptions/${id}`),

  action: (id: string, actionType: ActionType, note?: string) =>
    apiClient.put<ApiResponse<Subscription>>(`/api/subscriptions/${id}/action`, { actionType, note }),
};

// ─── Waste ───────────────────────────────────────────────────────────────────
export const wasteApi = {
  analyze: () =>
    apiClient.get<ApiResponse<WasteAnalysis>>('/api/waste'),
};

// ─── Presets ─────────────────────────────────────────────────────────────────
export const presetApi = {
  getAll: (category?: string) =>
    apiClient.get<ApiResponse<Preset[]>>('/api/presets', { params: { category } }),

  getCategories: () =>
    apiClient.get<ApiResponse<string[]>>('/api/presets/categories'),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationApi = {
  getPage: (page: number, size: number, months?: number) =>
    apiClient.get<ApiResponse<PageResponse<Notification>>>('/api/notifications', {
      params: { page, size, months: months ?? 12 },
    }),

  getUnreadCount: () =>
    apiClient.get<ApiResponse<{ count: number }>>('/api/notifications/unread-count'),

  markRead: (id: string) =>
    apiClient.put<ApiResponse<void>>(`/api/notifications/${id}/read`),

  markAllRead: () =>
    apiClient.put<ApiResponse<void>>('/api/notifications/read-all'),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/api/notifications/${id}`),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminApi = {
  getSummary: () =>
    apiClient.get<ApiResponse<AdminSummary>>('/api/admin/summary'),

  getUsers: (page: number, size: number, search?: string) =>
    apiClient.get<ApiResponse<PageResponse<AdminUser>>>('/api/admin/users', {
      params: {
        page,
        size,
        ...(search?.trim() ? { search: search.trim() } : {}),
      },
    }),

  getPendingPayments: (page: number, size: number) =>
    apiClient.get<ApiResponse<PageResponse<PaymentRequest>>>('/api/admin/payments/pending', {
      params: { page, size },
    }),

  getPaymentHistory: (page: number, size: number, months?: number) =>
    apiClient.get<ApiResponse<PageResponse<PaymentRequest>>>('/api/admin/payments/history', {
      params: { page, size, months: months ?? 12 },
    }),

  approvePayment: (id: string) =>
    apiClient.put<ApiResponse<PaymentRequest>>(`/api/admin/payments/${id}/approve`),

  rejectPayment: (id: string, notes?: string) =>
    apiClient.put<ApiResponse<PaymentRequest>>(`/api/admin/payments/${id}/reject`, { notes }),
};

// ─── Payments ─────────────────────────────────────────────────────────────────
export const paymentApi = {
  request: (billingPeriod: 'MONTHLY' | 'YEARLY') =>
    apiClient.post<ApiResponse<PaymentRequest>>('/api/payments/request', { billingPeriod }),

  getMyRequests: (page: number, size: number, months?: number) =>
    apiClient.get<ApiResponse<PageResponse<PaymentRequest>>>('/api/payments/my-requests', {
      params: { page, size, months: months ?? 12 },
    }),
};

// ─── Saving Goals ─────────────────────────────────────────────────────────────
export const savingGoalApi = {
  getGoals: () =>
    apiClient.get<ApiResponse<SavingGoal[]>>('/api/saving-goals'),

  createGoal: (data: SavingGoalRequest) =>
    apiClient.post<ApiResponse<SavingGoal>>('/api/saving-goals', data),

  addFunds: (id: string, amount: number) =>
    apiClient.put<ApiResponse<SavingGoal>>(`/api/saving-goals/${id}/add-funds`, null, { params: { amount } }),

  deleteGoal: (id: string) =>
    apiClient.delete<ApiResponse<void>>(`/api/saving-goals/${id}`),
};
