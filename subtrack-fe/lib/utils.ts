import type { BillingCycle } from './types';

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrency(amount: number, currency: string): string {
  if (currency === 'VND') return formatVND(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function billingCycleLabel(cycle: BillingCycle): string {
  const map: Record<BillingCycle, string> = {
    WEEKLY: 'hàng tuần',
    MONTHLY: 'hàng tháng',
    QUARTERLY: 'hàng quý',
    YEARLY: 'hàng năm',
  };
  return map[cycle];
}

export function categoryLabel(cat: string): string {
  const map: Record<string, string> = {
    ENTERTAINMENT: 'Giải trí',
    MUSIC: 'Âm nhạc',
    AI_TOOLS: 'AI Tools',
    DESIGN: 'Thiết kế',
    PRODUCTIVITY: 'Năng suất',
    EDUCATION: 'Học tập',
    DEV_TOOLS: 'Dev Tools',
    CLOUD: 'Đám mây',
    COMMUNICATION: 'Giao tiếp',
    HEALTH: 'Sức khoẻ',
    SOCIAL: 'Mạng xã hội',
    UTILITIES: 'Tiện ích',
    OTHER: 'Khác',
  };
  return map[cat] || cat;
}

export function usageStatusLabel(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: 'Đang dùng',
    RARELY: 'Hiếm dùng',
    UNUSED: 'Không dùng',
  };
  return map[status] || status;
}

export function daysUntilLabel(days: number): string {
  if (days === 0) return 'Hôm nay';
  if (days === 1) return 'Ngày mai';
  return `${days} ngày nữa`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('subtrack_token');
}

export function saveAuth(token: string, user: object): void {
  localStorage.setItem('subtrack_token', token);
  localStorage.setItem('subtrack_user', JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem('subtrack_token');
  localStorage.removeItem('subtrack_user');
}

export function getSavedUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('subtrack_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const CATEGORIES = [
  { value: 'ENTERTAINMENT', label: 'Giải trí' },
  { value: 'MUSIC', label: 'Âm nhạc' },
  { value: 'AI_TOOLS', label: 'AI Tools' },
  { value: 'DESIGN', label: 'Thiết kế' },
  { value: 'PRODUCTIVITY', label: 'Năng suất' },
  { value: 'EDUCATION', label: 'Học tập' },
  { value: 'DEV_TOOLS', label: 'Dev Tools' },
  { value: 'CLOUD', label: 'Đám mây' },
  { value: 'COMMUNICATION', label: 'Giao tiếp' },
  { value: 'HEALTH', label: 'Sức khoẻ' },
  { value: 'SOCIAL', label: 'Mạng xã hội' },
  { value: 'UTILITIES', label: 'Tiện ích' },
  { value: 'OTHER', label: 'Khác' },
];

export const BILLING_CYCLES = [
  { value: 'WEEKLY', label: 'Hàng tuần' },
  { value: 'MONTHLY', label: 'Hàng tháng' },
  { value: 'QUARTERLY', label: 'Hàng quý' },
  { value: 'YEARLY', label: 'Hàng năm' },
];
