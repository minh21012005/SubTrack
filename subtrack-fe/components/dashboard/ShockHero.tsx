'use client';

import { motion } from 'framer-motion';
import { TrendingDown, AlertCircle, DollarSign, ChevronRight } from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { formatVND } from '@/lib/utils';
import type { Dashboard } from '@/lib/types';
import Link from 'next/link';

export default function ShockHero({ data, isPremium }: { data: Dashboard; isPremium?: boolean }) {
  const hasWaste = data.totalWasteCost > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Main shock card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: isPremium 
            ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #020617 100%)' 
            : 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px 32px 24px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 200, height: 200,
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, right: 80,
          width: 280, height: 280,
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '50%',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ 
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.1)', padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
              color: isPremium ? '#FCD34D' : 'rgba(255,255,255,0.9)'
            }}>
              <DollarSign size={14} strokeWidth={2.5} />
              Chi phí hàng tháng
            </span>
          </div>

          <div style={{ fontSize: 'clamp(2.4rem, 5vw, 3.2rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 4, color: 'white' }}>
            <AnimatedCounter
              value={data.totalMonthlyCost}
              formatter={(v) => formatVND(v)}
            />
          </div>

          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500, marginBottom: 24 }}>
            ≈ {formatVND(data.totalYearlyCost)} / năm
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <Stat label="Subscription" value={String(data.subscriptionCount)} isPremium={isPremium} />
            <Stat label="Đang dùng" value={String(data.activeCount)} isPremium={isPremium} />
            <Stat label="Đã hủy" value={String(data.cancelledCount)} isPremium={isPremium} />
          </div>
        </div>
      </motion.div>

    </div>
  );
}

function Stat({ label, value, isPremium }: { label: string; value: string; isPremium?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'white' }}>{value}</div>
      <div style={{ fontSize: '0.72rem', color: isPremium ? 'rgba(252,211,77,0.7)' : 'rgba(255,255,255,0.6)', marginTop: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  );
}
