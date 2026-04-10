// ─── Auth ────────────────────────────────────────────────────────────────────
export type PlanType = 'FREE' | 'PREMIUM';

export interface User {
  id: string;
  email: string;
  name: string;
  planType: PlanType;
  reminderDaysBefore: number;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: User;
}

// ─── Subscriptions ───────────────────────────────────────────────────────────
export type BillingCycle = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type UsageStatus = 'ACTIVE' | 'RARELY' | 'UNUSED';
export type ActionStatus = 'NONE' | 'KEEP' | 'CANCEL';
export type ActionType = 'KEEP' | 'CANCEL' | 'MARK_RARELY' | 'MARK_UNUSED' | 'MARK_ACTIVE';

export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  category: string;
  usageStatus: UsageStatus;
  actionStatus: ActionStatus;
  iconUrl?: string;
  color?: string;
  notes?: string;
  cancelled: boolean;
  monthlyCost: number;
  wasteCost: number;
  potentialDuplicate: boolean;
  daysUntilRenewal: number;
  presetId?: string;
  websiteUrl?: string;
}

export interface AddSubscriptionRequest {
  presetId?: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  category: string;
  usageStatus?: UsageStatus;
  iconUrl?: string;
  color?: string;
  notes?: string;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export interface UpcomingCharge {
  subscriptionId: string;
  name: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  daysUntilRenewal: number;
  iconUrl?: string;
  color?: string;
  category: string;
}

export interface Dashboard {
  totalMonthlyCost: number;
  totalYearlyCost: number;
  totalWasteCost: number;
  potentialSavings: number;
  wastePercentage: number;
  subscriptionCount: number;
  activeCount: number;
  wasteCount: number;
  cancelledCount: number;
  upcomingNext7Days: UpcomingCharge[];
  upcomingNext30Days: UpcomingCharge[];
  duplicateCategories: string[];
  wasteSubscriptions: Subscription[];
  isPremium: boolean;
  freeLimit: number;
}

// ─── Waste ───────────────────────────────────────────────────────────────────
export interface WasteItem {
  subscriptionId: string;
  name: string;
  category: string;
  monthlyCost: number;
  wasteCost: number;
  wastePercentage: number;
  usageStatus: UsageStatus;
  iconUrl?: string;
  color?: string;
  reason: string;
}

export interface DuplicateCategory {
  category: string;
  count: number;
  totalMonthlyCost: number;
  subscriptionNames: string[];
}

export interface SavingSuggestion {
  subscriptionId: string;
  name: string;
  reason: string;
  monthlySaving: number;
  action: string;
  iconUrl?: string;
  color?: string;
}

export interface WasteAnalysis {
  totalMonthlyCost: number;
  totalWasteCost: number;
  potentialSavings: number;
  wastePercentage: number;
  unusedItems: WasteItem[];
  rarelyUsedItems: WasteItem[];
  duplicateCategories: DuplicateCategory[];
  suggestions: SavingSuggestion[];
}

// ─── Presets ─────────────────────────────────────────────────────────────────
export interface Preset {
  id: string;
  name: string;
  category: string;
  defaultPrice: number;
  currency: string;
  billingCycle: BillingCycle;
  iconUrl?: string;
  color?: string;
  websiteUrl?: string;
  description?: string;
  vnService: boolean;
}

// ─── Notifications ────────────────────────────────────────────────────────────
export type NotificationType = 'RENEWAL_REMINDER' | 'WASTE_ALERT' | 'GENERAL';
export type NotificationStatus = 'UNREAD' | 'READ';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  subscriptionId?: string;
  subscriptionName?: string;
  createdAt: string;
}

// ─── API wrapper ─────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}
