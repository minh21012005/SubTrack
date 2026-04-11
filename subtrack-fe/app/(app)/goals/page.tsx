'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Target, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import SavingGoalWidget from '@/components/dashboard/SavingGoalWidget';
import { dashboardApi } from '@/lib/services';
import { formatVND } from '@/lib/utils';

// Shared lock overlay — same structure/animation across all 3 premium pages
function PremiumLockOverlay({
  accentColor,
  accentBg,
  accentBorder,
  title,
  description,
  features,
}: {
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  title: string;
  description: string;
  features?: string[];
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
      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: 320, lineHeight: 1.6, marginBottom: features ? 14 : 20 }}>
        {description}
      </div>
      {features && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20, textAlign: 'left' }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={14} color={accentColor} /> {f}
            </div>
          ))}
        </div>
      )}
      <Link href="/pricing" className="btn btn-outline btn-sm" style={{ color: accentColor, borderColor: accentColor }}>
        Xem gói Premium <ArrowRight size={13} style={{ marginLeft: 4 }} />
      </Link>
    </motion.div>
  );
}

// Demo goal row shown behind blur
function DemoGoalRow({ name, pct, accentColor }: { name: string; pct: number; accentColor: string }) {
  return (
    <div style={{ padding: '14px 20px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', background: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{name}</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{pct}%</span>
      </div>
      <div style={{ height: 8, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
          style={{ height: '100%', background: accentColor, borderRadius: 99 }}
        />
      </div>
    </div>
  );
}

export default function GoalsPage() {
  const { user } = useAuth();
  const isPremium = user?.planType === 'PREMIUM';

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get().then(r => r.data.data),
    enabled: !isPremium,
  });

  const estimatedWaste = dashboard
    ? (dashboard.totalWasteCost > 0 ? dashboard.totalWasteCost : dashboard.totalMonthlyCost * 0.4)
    : 300000;
  const demoTarget = Math.round(estimatedWaste * 3 / 100000) * 100000 || 900000;
  const demoSaved = Math.round(demoTarget * 0.33);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="page-header">
        <h1 className="page-title">Mục tiêu tiết kiệm</h1>
        <p className="page-subtitle">Biến lãng phí thành khoản tích lũy thông minh</p>
      </div>

      {isPremium ? (
        <SavingGoalWidget />
      ) : (
        <>
          {/* Real potential savings banner — Goals-specific */}
          {dashboard && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
                border: '1.5px solid #6EE7B7',
                borderRadius: 'var(--radius-lg)',
                padding: '20px 24px',
                display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
              }}
            >
              <Target size={40} color="#059669" strokeWidth={1.5} />
              <div>
                <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                  Tiềm năng tiết kiệm của bạn
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#065F46', letterSpacing: '-0.03em' }}>
                  ~{formatVND(estimatedWaste)}<span style={{ fontSize: '1rem', fontWeight: 600 }}>/tháng</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#047857', marginTop: 2 }}>
                  Nếu cắt các gói lãng phí → tích lũy được {formatVND(estimatedWaste * 12)}/năm
                </div>
              </div>
            </motion.div>
          )}

          {/* Locked demo goals */}
          <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', minHeight: 320 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 4, filter: 'blur(2px)', opacity: 0.45, pointerEvents: 'none', userSelect: 'none' }}>
              <DemoGoalRow name="🎸 Guitar mới" pct={33} accentColor="#4F46E5" />
              <DemoGoalRow name="✈️ Du lịch Đà Lạt" pct={18} accentColor="#10B981" />
              <DemoGoalRow name="💻 Laptop gaming" pct={55} accentColor="#F59E0B" />
            </div>

            <PremiumLockOverlay
              accentColor="#059669"
              accentBg="#ECFDF5"
              accentBorder="#6EE7B7"
              title="Tạo mục tiêu tiết kiệm"
              description="Đặt mục tiêu và để SubTrack tự động nạp tiền mỗi khi bạn hủy một gói lãng phí."
              features={[
                'Tạo không giới hạn mục tiêu',
                'Tự động cộng tiền khi hủy subscription',
                'Theo dõi tiến độ trực quan',
              ]}
            />
          </div>
        </>
      )}
    </div>
  );
}
