'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, XCircle, RotateCcw, ExternalLink, Copy, Trash2 } from 'lucide-react';
import { formatCurrency, formatVND, categoryLabel, billingCycleLabel } from '@/lib/utils';
import BrandLogo from '@/components/ui/BrandLogo';
import type { Subscription, ActionType } from '@/lib/types';
import { useAuth } from '@/lib/context/AuthContext';

interface SubscriptionCardProps {
  subscription: Subscription;
  onAction: (id: string, action: ActionType) => void;
  onDelete?: (id: string) => void;
  loading?: boolean;
}

const USAGE_CONFIG = {
  ACTIVE: { color: 'var(--accent-green)', bg: 'var(--accent-green-light)', label: 'Đang dùng' },
  RARELY: { color: 'var(--accent-orange)', bg: 'var(--accent-orange-light)', label: 'Hiếm dùng' },
  UNUSED: { color: 'var(--accent-red)', bg: 'var(--accent-red-light)', label: 'Không dùng' },
};

export default function SubscriptionCard({ subscription: sub, onAction, onDelete, loading }: SubscriptionCardProps) {
  const { user } = useAuth();
  const isPremium = user?.planType === 'PREMIUM';
  const usage = USAGE_CONFIG[sub.usageStatus];
  const hasWaste = sub.wasteCost > 0;
  const isCancelled = sub.cancelled;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: isCancelled ? 0 : -2, boxShadow: isCancelled ? 'none' : 'var(--shadow-md)' }}
      style={{
        background: isCancelled ? 'var(--bg)' : 'var(--bg-card)',
        border: `1.5px solid ${hasWaste && !isCancelled ? usage.color + '44' : 'var(--border-light)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        boxShadow: isCancelled ? 'none' : 'var(--shadow-sm)',
        opacity: isCancelled ? 0.6 : 1,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Waste stripe accent - Premium ONLY */}
      {isPremium && hasWaste && !isCancelled && (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
          background: usage.color,
          borderRadius: '4px 0 0 4px',
        }} />
      )}

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingLeft: hasWaste && !isCancelled ? 8 : 0 }}>
        <BrandLogo name={sub.name} fallbackColor={sub.color} size={48} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {sub.name}
            </span>
            {isCancelled && <span className="badge badge-gray">Đã hủy</span>}
            {isPremium && sub.potentialDuplicate && !isCancelled && (
              <span className="badge badge-orange" title="Trùng danh mục với subscription khác">
                <Copy size={10} /> Trùng lặp
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
            {isPremium && (
              <span style={{
                fontSize: '0.75rem', fontWeight: 500, padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: usage.bg, color: usage.color,
              }}>
                {usage.label}
              </span>
            )}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {categoryLabel(sub.category)}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              · {billingCycleLabel(sub.billingCycle)}
            </span>
            {sub.websiteUrl && (
              <a href={sub.websiteUrl} target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 2 }}>
                <ExternalLink size={11} />
              </a>
            )}
          </div>
        </div>

        {/* Price */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {formatCurrency(sub.price, sub.currency)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {formatCurrency(sub.monthlyCost, sub.currency)}/tháng
          </div>
        </div>
      </div>

      {/* Waste info - Premium ONLY */}
      {isPremium && hasWaste && !isCancelled && (
        <div style={{
          marginTop: 12, padding: '8px 12px',
          background: usage.bg,
          borderRadius: 'var(--radius-sm)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: '0.8rem', color: usage.color, fontWeight: 600 }}>
            <AlertTriangle size={13} style={{ display: 'inline', marginRight: 4 }} />
            Lãng phí ~{formatVND(sub.wasteCost)}/tháng
            <span style={{ fontSize: '0.7rem', fontWeight: 400 }}> (đã quy đổi)</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: usage.color }}>
            Gia hạn: {sub.daysUntilRenewal === 0 ? 'hôm nay' : `${sub.daysUntilRenewal} ngày nữa`}
          </div>
        </div>
      )}

      {/* Days until renewal for Free users */}
      {!isPremium && !isCancelled && (
        <div style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          Gia hạn sau: {sub.daysUntilRenewal === 0 ? 'hôm nay' : `${sub.daysUntilRenewal} ngày`}
        </div>
      )}

      {/* Notes section */}
      {sub.notes && (
        <div style={{
          marginTop: 12, 
          padding: '8px 12px',
          background: 'var(--bg)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          borderLeft: sub.notes.toLowerCase().includes('trial') || sub.notes.toLowerCase().includes('dùng thử')
            ? '3px solid var(--accent-orange)'
            : '3px solid var(--border)',
          fontStyle: 'italic'
        }}>
          <span style={{ fontWeight: 600, fontStyle: 'normal', fontSize: '0.7rem', textTransform: 'uppercase', display: 'block', marginBottom: 2, color: 'var(--text-muted)' }}>Ghi chú:</span>
          {sub.notes}
          {(sub.notes.toLowerCase().includes('trial') || sub.notes.toLowerCase().includes('dùng thử')) && (
            <div style={{ marginTop: 4, color: 'var(--accent-orange)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem' }}>
              <AlertTriangle size={12} /> Đây là gói dùng thử, hãy lưu ý ngày hủy!
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {!isCancelled && (
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          {isPremium && (
            <button
              className="btn btn-success btn-sm"
              onClick={() => onAction(sub.id, 'KEEP')}
              disabled={loading}
            >
              <CheckCircle size={14} /> Giữ lại
            </button>
          )}
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onAction(sub.id, 'CANCEL')}
            disabled={loading}
          >
            <XCircle size={14} /> Hủy bỏ
          </button>
          
          {isPremium && sub.usageStatus === 'ACTIVE' && (
            <button
              className="btn btn-outline btn-sm"
              style={{ color: 'var(--accent-orange)', borderColor: 'var(--accent-orange)' }}
              onClick={() => onAction(sub.id, 'MARK_RARELY')}
              disabled={loading}
            >
              Hiếm dùng
            </button>
          )}
          {isPremium && sub.usageStatus !== 'UNUSED' && (
            <button
              className="btn btn-outline btn-sm"
              style={{ color: 'var(--accent-red)', borderColor: 'var(--accent-red)' }}
              onClick={() => onAction(sub.id, 'MARK_UNUSED')}
              disabled={loading}
            >
              Không dùng
            </button>
          )}
          
          {(isPremium ? sub.usageStatus !== 'ACTIVE' : false) && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => onAction(sub.id, 'MARK_ACTIVE')}
              disabled={loading}
            >
              <RotateCcw size={13} /> Kích hoạt lại
            </button>
          )}
          
          {onDelete && (
            <button
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--accent-red)' }}
              onClick={() => onDelete(sub.id)}
              disabled={loading}
            >
              <Trash2 size={13} /> Xóa
            </button>
          )}
        </div>
      )}

      {/* Restore if cancelled */}
      {isCancelled && (
        <div style={{ marginTop: 12 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onAction(sub.id, 'MARK_ACTIVE')}
            disabled={loading}
          >
            <RotateCcw size={13} /> Khôi phục
          </button>
          {onDelete && (
            <button
              className="btn btn-danger btn-sm"
              style={{ marginLeft: 8 }}
              onClick={() => onDelete(sub.id)}
              disabled={loading}
            >
              <Trash2 size={13} /> Xóa vĩnh viễn
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
