'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, BarChart3, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import Link from 'next/link';
import SpendingChart from '@/components/dashboard/SpendingChart';
import { dashboardApi } from '@/lib/services';
import { formatVND } from '@/lib/utils';

// Shared lock overlay — same structure/animation across all 3 premium pages
function PremiumLockOverlay({
  accentColor,
  accentBg,
  accentBorder,
  title,
  description,
}: {
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(4px)',
        textAlign: 'center',
        padding: 32,
      }}
    >
      <div style={{
        width: 60, height: 60, borderRadius: '50%',
        background: accentBg, border: `1.5px solid ${accentBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        marginBottom: 16,
        boxShadow: `0 4px 20px ${accentColor}22`,
      }}>
        <Lock size={26} color={accentColor} />
      </div>
      <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 8, color: 'var(--text-primary)' }}>{title}</div>
      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: 320, lineHeight: 1.6, marginBottom: 20 }}>
        {description}
      </div>
      <Link href="/pricing" className="btn btn-outline btn-sm" style={{ color: accentColor, borderColor: accentColor }}>
        Xem gói Premium <ArrowRight size={13} style={{ marginLeft: 4 }} />
      </Link>
    </motion.div>
  );
}

// Animated fake chart bar
function FakeChartBar({ height, delay, color }: { height: number; delay: number; color: string }) {
  return (
    <motion.div
      initial={{ height: 0 }}
      animate={{ height }}
      transition={{ delay, duration: 0.6, ease: 'easeOut' }}
      style={{
        width: '100%', borderRadius: '6px 6px 0 0',
        flexShrink: 0, alignSelf: 'flex-end',
        background: color,
      }}
    />
  );
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const isPremium = user?.planType === 'PREMIUM';

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get().then(r => r.data.data),
    enabled: !isPremium,
  });

  // Analytics-specific: show spending trends, not waste
  const stats = dashboard ? [
    {
      label: 'Tổng chi / tháng',
      value: `${(dashboard.totalMonthlyCost / 1000).toFixed(0)}k đ`,
      icon: <TrendingUp size={18} color="#4F46E5" />,
      bg: '#EEF2FF', color: '#4F46E5',
    },
    {
      label: 'Số gói đang theo dõi',
      value: `${dashboard.subscriptionCount} gói`,
      icon: <BarChart3 size={18} color="#7C3AED" />,
      bg: '#F5F3FF', color: '#7C3AED',
    },
    {
      label: 'Dự kiến năm nay',
      value: formatVND(dashboard.totalMonthlyCost * 12),
      icon: <Calendar size={18} color="#0284C7" />,
      bg: '#E0F2FE', color: '#0284C7',
    },
  ] : [];

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
          {/* Real spending context — Analytics-specific stats (no waste overlap) */}
          {dashboard && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}
            >
              {stats.map((s) => (
                <div key={s.label} className="card card-sm" style={{ border: `1.5px solid ${s.bg}` }}>
                  <div style={{ width: 36, height: 36, borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    {s.icon}
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Locked chart section */}
          <div style={{ position: 'relative', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', minHeight: 280 }}>
            {/* Striped placeholder background behind blur */}
            <div style={{ height: 280, background: 'repeating-linear-gradient(0deg, var(--bg) 0px, var(--bg) 40px, var(--border-light) 40px, var(--border-light) 41px)', opacity: 0.4, filter: 'blur(4px)' }} />
            {/* Fake animated bars */}
            <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24, display: 'flex', alignItems: 'flex-end', gap: 12, height: 190, opacity: 0.2, filter: 'blur(1px)', pointerEvents: 'none', userSelect: 'none' }}>
              {[
                { h: 70, c: '#C7D2FE' }, { h: 110, c: '#A5B4FC' }, { h: 60, c: '#C7D2FE' },
                { h: 150, c: '#818CF8' }, { h: 90, c: '#A5B4FC' }, { h: 180, c: '#6366F1' },
              ].map(({ h, c }, i) => (
                <FakeChartBar key={i} height={h} delay={i * 0.08} color={c} />
              ))}
            </div>
            <PremiumLockOverlay
              accentColor="#4F46E5"
              accentBg="#EEF2FF"
              accentBorder="#C7D2FE"
              title="Biểu đồ xu hướng 6 tháng"
              description="Nâng cấp gói Premium để tự động cập nhật và phân tích biểu đồ chi tiêu hàng tháng, giúp bạn dễ dàng theo dõi biến động ngân sách."
            />
          </div>
        </>
      )}
    </div>
  );
}
