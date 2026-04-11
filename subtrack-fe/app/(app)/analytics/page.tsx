'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Crown, BarChart3, Lock, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Link from 'next/link';
import SpendingChart from '@/components/dashboard/SpendingChart';
import { dashboardApi } from '@/lib/services';

// Skeleton bars that represent a locked chart
function FakeChartBar({ height, delay }: { height: number; delay: number }) {
  return (
    <motion.div
      initial={{ height: 0 }}
      animate={{ height }}
      transition={{ delay, duration: 0.6, ease: 'easeOut' }}
      style={{
        width: '100%',
        background: 'linear-gradient(180deg, #E2E8F0, #F1F5F9)',
        borderRadius: '6px 6px 0 0',
        flexShrink: 0,
        alignSelf: 'flex-end',
      }}
    />
  );
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const isPremium = user?.planType === 'PREMIUM';

  // Always fetch dashboard summary so Free users can see their real numbers
  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getSummary().then(r => r.data.data),
    enabled: !isPremium,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <h1 className="page-title">Phân tích xu hướng</h1>
        <p className="page-subtitle">Theo dõi lịch sử chi tiêu của bạn qua từng tháng</p>
      </div>

      {isPremium ? (
        <SpendingChart />
      ) : (
        <>
          {/* Summary numbers — real data, always visible */}
          {dashboard && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                {
                  label: 'Chi phí hàng tháng',
                  value: `${(dashboard.totalMonthlyCost / 1000).toFixed(0)}k đ`,
                  icon: <TrendingUp size={18} color="#4F46E5" />,
                  bg: '#EEF2FF', color: '#4F46E5',
                },
                {
                  label: 'Ước tính lãng phí',
                  value: `~${(dashboard.totalWasteCost > 0 ? dashboard.totalWasteCost / 1000 : dashboard.totalMonthlyCost * 0.4 / 1000).toFixed(0)}k đ`,
                  icon: <TrendingDown size={18} color="#EF4444" />,
                  bg: '#FEF2F2', color: '#EF4444',
                },
                {
                  label: 'Số subscription',
                  value: `${dashboard.subscriptionCount} gói`,
                  icon: <Minus size={18} color="#D97706" />,
                  bg: '#FFFBEB', color: '#D97706',
                },
              ].map((s) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card card-sm"
                  style={{ border: `1.5px solid ${s.bg}` }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    {s.icon}
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Locked chart area */}
          <div className="card" style={{ position: 'relative', overflow: 'hidden', padding: '24px' }}>
            {/* Fake chart behind blur */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 200, opacity: 0.25, filter: 'blur(2px)', pointerEvents: 'none', userSelect: 'none' }}>
              {[60, 90, 50, 130, 80, 160].map((h, i) => (
                <FakeChartBar key={i} height={h} delay={i * 0.08} />
              ))}
            </div>

            {/* Lock overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(4px)',
                textAlign: 'center',
                padding: 24,
              }}
            >
              <div style={{ width: 52, height: 52, background: '#FFFBEB', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #FCD34D', marginBottom: 16, boxShadow: '0 4px 16px rgba(245,158,11,0.2)' }}>
                <Lock size={24} color="#D97706" />
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 8 }}>Biểu đồ xu hướng 6 tháng</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: 300, lineHeight: 1.5, marginBottom: 20 }}>
                Premium tự động ghi nhận và vẽ biểu đồ chi tiêu & lãng phí của bạn theo từng tháng.
              </div>
              <Link href="/pricing" className="btn btn-outline btn-sm" style={{ color: '#D97706', borderColor: '#D97706' }}>
                Xem bảng giá <ArrowRight size={14} style={{ marginLeft: 4 }} />
              </Link>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
