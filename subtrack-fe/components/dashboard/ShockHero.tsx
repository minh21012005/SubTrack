'use client';

import { motion } from 'framer-motion';
import { TrendingDown, AlertCircle, DollarSign, ChevronRight } from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { formatVND } from '@/lib/utils';
import type { Dashboard } from '@/lib/types';
import Link from 'next/link';

export default function ShockHero({ data }: { data: Dashboard }) {
  const hasWaste = data.totalWasteCost > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Main shock card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '40px 40px 36px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, opacity: 0.7 }}>
            <DollarSign size={16} />
            <span style={{ fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.05em' }}>
              CHI PHÍ HÀNG THÁNG
            </span>
          </div>

          <div style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 8 }}>
            <AnimatedCounter
              value={data.totalMonthlyCost}
              formatter={(v) => formatVND(v)}
            />
          </div>

          <div style={{ fontSize: '1rem', opacity: 0.6, marginBottom: 24 }}>
            ≈ {formatVND(data.totalYearlyCost)} / năm
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <Stat label="Subscription" value={String(data.subscriptionCount)} />
            <Stat label="Đang dùng" value={String(data.activeCount)} />
            <Stat label="Đã hủy" value={String(data.cancelledCount)} />
          </div>
        </div>
      </motion.div>

    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: 2 }}>{label}</div>
    </div>
  );
}
