'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import { formatVND, daysUntilLabel } from '@/lib/utils';
import BrandLogo from '@/components/ui/BrandLogo';
import type { UpcomingCharge } from '@/lib/types';

interface UpcomingChargesProps {
  charges: UpcomingCharge[];
  title: string;
}

export default function UpcomingCharges({ charges, title }: UpcomingChargesProps) {
  if (charges.length === 0) {
    return (
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
          <Calendar size={16} style={{ display: 'inline', marginRight: 6 }} />
          {title}
        </h3>
        <div className="empty-state" style={{ padding: '24px 0' }}>
          <div className="empty-state-icon"><Calendar size={48} strokeWidth={1.5} color="var(--text-muted)" /></div>
          <p style={{ fontSize: '0.875rem' }}>Không có khoản nào sắp tới!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Calendar size={16} color="var(--primary)" />
        {title}
        <span className="badge badge-purple" style={{ marginLeft: 'auto' }}>{charges.length} khoản</span>
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {charges.map((charge, i) => (
          <motion.div
            key={charge.subscriptionId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              background: charge.daysUntilRenewal <= 3 ? 'var(--accent-red-light)' : 'var(--bg)',
              border: `1px solid ${charge.daysUntilRenewal <= 3 ? '#fca5a5' : 'transparent'}`,
            }}
          >
            <BrandLogo name={charge.name} fallbackColor={charge.color} size={32} />

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {charge.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={11} />
                {daysUntilLabel(charge.daysUntilRenewal)}
              </div>
            </div>

            <div style={{
              fontSize: '0.9rem',
              fontWeight: 700,
              color: charge.daysUntilRenewal <= 3 ? 'var(--accent-red)' : 'var(--text-primary)',
              whiteSpace: 'nowrap',
            }}>
              {formatVND(charge.price)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
