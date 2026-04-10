'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { RefreshCw, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import { dashboardApi, subscriptionApi } from '@/lib/services';
import ShockHero from '@/components/dashboard/ShockHero';
import UpcomingCharges from '@/components/dashboard/UpcomingCharges';
import SubscriptionCard from '@/components/subscription/SubscriptionCard';
import { formatVND } from '@/lib/utils';
import type { ActionType } from '@/lib/types';

export default function DashboardPage() {
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
        <div className="empty-state-icon">😕</div>
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
          <Link href="/add" className="btn btn-primary btn-sm">
            <Plus size={14} /> Thêm
          </Link>
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
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>💸</div>
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

          {/* Free plan limit warning */}
          {!data.isPremium && data.subscriptionCount >= data.freeLimit && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'linear-gradient(135deg, var(--primary-light), #ede9fe)',
                border: '1.5px solid var(--primary)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 2 }}>
                  ⭐ Bạn đã dùng hết {data.freeLimit} subscription miễn phí
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Nâng cấp Premium để thêm không giới hạn và phân tích nâng cao
                </div>
              </div>
              <button className="btn btn-primary btn-sm">Nâng cấp</button>
            </motion.div>
          )}

          {/* Stats row */}
          <div className="stat-grid">
            <StatCard
              label="Tổng / tháng"
              value={formatVND(data.totalMonthlyCost)}
              sub={`${formatVND(data.totalYearlyCost)} / năm`}
              color="var(--primary)"
              bg="var(--primary-light)"
              emoji="💰"
            />
            <StatCard
              label="Đang lãng phí"
              value={`~${formatVND(data.totalWasteCost)}`}
              sub={`${data.wastePercentage}% tổng chi tiêu`}
              color="var(--accent-red)"
              bg="var(--accent-red-light)"
              emoji="🔥"
            />
            <StatCard
              label="Subscription"
              value={String(data.subscriptionCount)}
              sub={`${data.activeCount} đang dùng · ${data.cancelledCount} đã hủy`}
              color="var(--accent-blue)"
              bg="#EFF6FF"
              emoji="📦"
            />
            <StatCard
              label="Tiết kiệm được"
              value={formatVND(data.potentialSavings)}
              sub="nếu hủy hết lãng phí"
              color="var(--accent-green)"
              bg="var(--accent-green-light)"
              emoji="💡"
            />
          </div>

          {/* Upcoming + Duplicate warnings */}
          <div className="grid-2" style={{ gap: 20 }}>
            <UpcomingCharges charges={data.upcomingNext7Days} title="Sắp hết hạn (7 ngày)" />
            <UpcomingCharges charges={data.upcomingNext30Days} title="Sắp hết hạn (30 ngày)" />
          </div>

          {/* Duplicate category alert */}
          {data.duplicateCategories.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: 'var(--accent-orange-light)',
                border: '1.5px solid var(--accent-orange)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--accent-orange)', marginBottom: 6 }}>
                ⚠️ Phát hiện trùng lặp danh mục
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Bạn có nhiều subscription trong cùng danh mục:{' '}
                <strong>{data.duplicateCategories.join(', ')}</strong>. Xem xét cắt bỏ bớt!
              </div>
            </motion.div>
          )}

          {/* Waste Subscriptions */}
          {data.wasteSubscriptions.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                  🔥 Cần xem xét ({data.wasteSubscriptions.length})
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

function StatCard({ label, value, sub, color, bg, emoji }: {
  label: string; value: string; sub: string; color: string; bg: string; emoji: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card card-sm"
      style={{ border: `1.5px solid ${color}22` }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem', flexShrink: 0,
        }}>
          {emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color, letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
        </div>
      </div>
    </motion.div>
  );
}
