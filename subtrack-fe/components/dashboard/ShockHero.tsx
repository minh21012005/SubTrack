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

      {/* Waste alert card */}
      {hasWaste && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{
            background: 'linear-gradient(135deg, #fff1f1 0%, #ffe4e4 100%)',
            border: '1.5px solid #fca5a5',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44,
              background: 'var(--accent-red)',
              borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: 'var(--shadow-glow-red)',
            }}>
              <AlertCircle size={22} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#991b1b', fontWeight: 600, marginBottom: 2 }}>
                💸 ĐANG LÃNG PHÍ
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-red)', letterSpacing: '-0.03em' }}>
                <AnimatedCounter
                  value={data.totalWasteCost}
                  formatter={(v) => `~${formatVND(v)}`}
                  duration={1200}
                />
                &nbsp;
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>/ tháng</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#b91c1c', marginTop: 2 }}>
                {data.wasteCount} subscription không cần thiết · {data.wastePercentage}% tổng chi tiêu
              </div>
            </div>
          </div>

          <Link href="/waste" style={{ flexShrink: 0 }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--accent-red)', color: 'white',
              border: 'none', borderRadius: 10, padding: '10px 18px',
              fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
              boxShadow: 'var(--shadow-glow-red)',
              whiteSpace: 'nowrap',
            }}>
              <TrendingDown size={16} /> Xem chi tiết <ChevronRight size={14} />
            </button>
          </Link>
        </motion.div>
      )}
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
