'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Lock, Target, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import SavingGoalWidget from '@/components/dashboard/SavingGoalWidget';
import { dashboardApi } from '@/lib/services';

// A visual "demo" saving goal that shows what the feature looks like
function DemoGoal({ name, target, current, color }: { name: string; target: number; current: number; color: string }) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  return (
    <div style={{ padding: '16px 20px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', background: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{name}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{pct}%</div>
      </div>
      <div style={{ height: 8, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          style={{ height: '100%', background: color, borderRadius: 99 }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <span>{(current / 1000).toFixed(0)}k đ đã tích lũy</span>
        <span>Mục tiêu: {(target / 1000).toFixed(0)}k đ</span>
      </div>
    </div>
  );
}

export default function GoalsPage() {
  const { user } = useAuth();
  const isPremium = user?.planType === 'PREMIUM';

  // For Free users, fetch dashboard to compute a "potential savings" demo figure
  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getSummary().then(r => r.data.data),
    enabled: !isPremium,
  });

  // Demo goal target = 3 months of estimated waste, or a sensible fallback
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
          {/* Real context — what they could save */}
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
                <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                  Tiềm năng tiết kiệm của bạn
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#065F46', letterSpacing: '-0.03em' }}>
                  ~{(estimatedWaste / 1000).toFixed(0)}k đ/tháng
                </div>
                <div style={{ fontSize: '0.85rem', color: '#047857', marginTop: 2 }}>
                  Nếu cắt bỏ các gói không dùng, bạn có thể tích lũy {(estimatedWaste * 12 / 1000000).toFixed(1)} triệu/năm.
                </div>
              </div>
            </motion.div>
          )}

          {/* Demo goals — visually shows the feature but locked */}
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, filter: 'blur(2px)', opacity: 0.5, pointerEvents: 'none', userSelect: 'none' }}>
              <DemoGoal name="🎸 Guitar mới" target={demoTarget} current={demoSaved} color="#4F46E5" />
              <DemoGoal name="✈️ Du lịch Đà Lạt" target={demoTarget * 2} current={demoSaved * 0.5} color="#10B981" />
            </div>

            {/* Lock overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.65)',
                backdropFilter: 'blur(4px)',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center',
                padding: 24,
              }}
            >
              <div style={{ width: 52, height: 52, background: '#ECFDF5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #6EE7B7', marginBottom: 14, boxShadow: '0 4px 16px rgba(16,185,129,0.2)' }}>
                <Lock size={24} color="#059669" />
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: 8 }}>Tạo mục tiêu tiết kiệm của bạn</div>
              <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 8, textAlign: 'left', marginBottom: 18 }}>
                {[
                  'Tạo không giới hạn mục tiêu',
                  'Tự động cộng tiền khi hủy subscription',
                  'Theo dõi tiến độ trực quan',
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <CheckCircle2 size={15} color="#10B981" /> {f}
                  </div>
                ))}
              </div>
              <Link href="/pricing" className="btn btn-outline btn-sm" style={{ color: '#059669', borderColor: '#059669' }}>
                Xem bảng giá <ArrowRight size={14} style={{ marginLeft: 4 }} />
              </Link>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
