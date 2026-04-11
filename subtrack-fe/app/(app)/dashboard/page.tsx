'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { RefreshCw, Loader2, Plus, CreditCard, AlertTriangle, Zap, Info, Calendar, LayoutGrid, Crown } from 'lucide-react';
import Link from 'next/link';
import { dashboardApi, subscriptionApi } from '@/lib/services';
import { useAuth } from '@/lib/context/AuthContext';
import ShockHero from '@/components/dashboard/ShockHero';
import UpcomingCharges from '@/components/dashboard/UpcomingCharges';
import HealthScoreWidget from '@/components/dashboard/HealthScoreWidget';
import SubscriptionCard from '@/components/subscription/SubscriptionCard';
import WasteAwarenessCard from '@/components/dashboard/WasteAwarenessCard';
import { formatVND } from '@/lib/utils';
import type { ActionType } from '@/lib/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get().then((r) => r.data.data),
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: ActionType }) =>
      subscriptionApi.action(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Đang tính toán chi phí của bạn...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"><Info size={48} strokeWidth={1.5} color="var(--text-muted)" /></div>
        <p>Không thể tải dashboard. Vui lòng thử lại.</p>
        <button className="btn btn-outline btn-sm" onClick={() => refetch()}>
          <RefreshCw size={14} /> Thử lại
        </button>
      </div>
    );
  }

  const hasNoSubscriptions = data.subscriptionCount === 0;

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Tổng quan chi tiêu subscription của bạn</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => refetch()}>
            <RefreshCw size={14} /> Làm mới
          </button>
        </div>
      </div>

      {/* Empty onboarding state */}
      {hasNoSubscriptions ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{ textAlign: 'center', padding: '64px 32px' }}
        >
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}><CreditCard size={48} strokeWidth={1.5} color="var(--primary)" /></div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>Bắt đầu theo dõi subscription</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28, maxWidth: 420, margin: '0 auto 28px' }}>
            Thêm các subscription bạn đang trả tiền để khám phá bạn đang tiêu bao nhiêu mỗi tháng.
          </p>
          <Link href="/add" className="btn btn-primary btn-lg">
            <Plus size={18} /> Thêm subscription đầu tiên
          </Link>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Shock Moment Hero */}
          <ShockHero data={data} />

          {/* Health Score Widget — visible to all users */}
          <HealthScoreWidget
            score={data.healthScore}
            label={data.healthScoreLabel}
            breakdown={data.healthScoreBreakdown}
            isPremium={!!user?.planType && user.planType === 'PREMIUM'}
            hasSubscriptions={data.subscriptionCount > 0}
          />

          {/* Alerts: Free limit & Premium expiry */}
          {!data.isPremium && data.subscriptionCount >= data.freeLimit && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'var(--primary-light)',
                border: '1px solid var(--primary)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--primary)', marginBottom: 2 }}>
                  <Crown size={16} color="var(--primary)" /> Bạn đã dùng hết {data.freeLimit} subscription miễn phí
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Nâng cấp Premium để thêm không giới hạn và phân tích nâng cao
                </div>
              </div>
              <Link href="/pricing" className="btn btn-primary btn-sm">Nâng cấp</Link>
            </motion.div>
          )}
          {user?.planType === 'PREMIUM' && user.planExpiresAt && (() => {
            const daysLeft = Math.ceil((new Date(user.planExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            if (daysLeft <= 7 && daysLeft >= 0) {
              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)',
                    border: '1.5px solid #FCD34D',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Zap size={18} color="#D97706" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#92400E', fontSize: '0.9rem' }}>Gói Premium sắp hết hạn</div>
                      <div style={{ fontSize: '0.78rem', color: '#B45309' }}>Tài khoản hết hạn sau {daysLeft} ngày nữa ({new Intl.DateTimeFormat('vi-VN').format(new Date(user.planExpiresAt))}).</div>
                    </div>
                  </div>
                  <Link href="/pricing" className="btn btn-primary btn-sm" style={{ background: '#D97706', borderColor: '#B45309' }}>Gia hạn ngay</Link>
                </motion.div>
              );
            }
            return null;
          })()}

          {/* 4-Stat Grid */}
          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            {/* Card 1: Waste */}
            <StatCard
              label="Đang lãng phí"
              value={formatVND(user?.planType === 'PREMIUM' ? data.totalWasteCost : data.totalMonthlyCost * 0.4)}
              sub={user?.planType === 'PREMIUM' ? `${data.wastePercentage}% tổng chi tiêu` : '~40% ước tính'}
              color="var(--accent-red)"
              bg="var(--accent-red-light)"
              icon={<AlertTriangle size={20} color="var(--accent-red)" />}
              href="/waste"
            />
            {/* Card 2: Savings */}
            <StatCard
              label="Có thể tiết kiệm"
              value={formatVND(user?.planType === 'PREMIUM' ? data.potentialSavings : data.totalMonthlyCost * 0.4)}
              sub={user?.planType === 'PREMIUM' ? 'nếu hủy hết lãng phí' : 'ước tính tiết kiệm'}
              color="var(--accent-green)"
              bg="var(--accent-green-light)"
              icon={<Zap size={20} color="var(--accent-green)" />}
            />
            {/* Card 3: Renewal upcoming 7 days */}
            <StatCard
              label="Gia hạn trong 7 ngày"
              value={String(data.upcomingNext7Days.length)}
              sub={data.upcomingNext7Days.length > 0
                ? `Tổng ${formatVND(data.upcomingNext7Days.reduce((s, c) => s + Number(c.price), 0))}`
                : 'Không có gia hạn sắp tới'}
              color="var(--accent-orange)"
              bg="var(--accent-orange-light)"
              icon={<Calendar size={20} color="var(--accent-orange)" />}
            />
            {/* Card 4: Active count */}
            <StatCard
              label="Đang hoạt động"
              value={`${data.activeCount}/${data.subscriptionCount}`}
              sub={`${data.cancelledCount > 0 ? `${data.cancelledCount} đã hủy` : 'Tất cả đang dùng'}`}
              color="var(--accent-blue)"
              bg="#EFF6FF"
              icon={<LayoutGrid size={20} color="var(--accent-blue)" />}
            />
          </div>

          {/* FOMO Waste Banner */}
          {user?.planType === 'PREMIUM' ? (
            data.totalWasteCost > 0 && (
              <WasteAwarenessCard
                isPremium={true}
                estimatedWaste={data.totalWasteCost}
                percentage={data.wastePercentage}
              />
            )
          ) : (
            data.subscriptionCount > 0 && (
              <WasteAwarenessCard
                isPremium={false}
                estimatedWaste={data.totalMonthlyCost * 0.4}
                percentage={40}
              />
            )
          )}

          {/* Upcoming Charges */}
          <div className="grid-2" style={{ gap: 20 }}>
            <UpcomingCharges charges={data.upcomingNext7Days} title="Sắp hết hạn (7 ngày)" />
            <UpcomingCharges charges={data.upcomingNext30Days} title="Sắp hết hạn (30 ngày)" />
          </div>

          {/* Duplicate category alert */}
          {user?.planType === 'PREMIUM' && data.duplicateCategories.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: 'var(--accent-orange-light)',
                border: '1px solid var(--accent-orange)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--accent-orange)', marginBottom: 6 }}>
                <AlertTriangle size={16} /> Phát hiện trùng lặp danh mục
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Bạn có nhiều subscription trong cùng danh mục:{' '}
                <strong>{data.duplicateCategories.join(', ')}</strong>. Xem xét cắt bỏ bớt!
              </div>
            </motion.div>
          )}

          {/* Waste Subscriptions */}
          {user?.planType === 'PREMIUM' && data.wasteSubscriptions.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                  <AlertTriangle size={18} color="var(--accent-red)" /> Cần xem xét ({data.wasteSubscriptions.length})
                </h2>
                <Link href="/waste" style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 600 }}>
                  Xem tất cả →
                </Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data.wasteSubscriptions.slice(0, 4).map((sub) => (
                  <SubscriptionCard
                    key={sub.id}
                    subscription={sub}
                    onAction={(id, action) => actionMutation.mutate({ id, action })}
                    loading={actionMutation.isPending}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, color, bg, icon, href }: {
  label: string; value: string; sub: string; color: string; bg: string; icon: React.ReactNode; href?: string;
}) {
  const inner = (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ boxShadow: 'var(--shadow-md)', y: -2 }}
      className="card card-sm"
      style={{ border: `1.5px solid ${bg}`, background: 'var(--bg-card)', cursor: href ? 'pointer' : 'default' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '14px',
          background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, border: `1px solid ${color}22`,
        }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color, letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
        </div>
      </div>
    </motion.div>
  );
  return href ? <Link href={href} style={{ textDecoration: 'none' }}>{inner}</Link> : inner;
}
