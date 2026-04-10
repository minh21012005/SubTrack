'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Star, Zap, Shield, Clock, CheckCircle2, Copy, CheckCheck } from 'lucide-react';
import { paymentApi } from '@/lib/services';
import { useAuth } from '@/lib/context/AuthContext';
import { formatVND } from '@/lib/utils';
import type { BillingPeriod } from '@/lib/types';

// ── Bank config ─────────────────────────────────────────────────────────────
const BANKS = [
  {
    key: 'TCB',
    name: 'Techcombank',
    stk: '6365210105',
    owner: 'NGUYEN BA MINH',
    color: '#c8102e',
    bg: '#FFF1F1',
  },
  {
    key: 'TPB',
    name: 'TPBank',
    stk: '56711111111',
    owner: 'NGUYEN BA MINH',
    color: '#6d2b8f',
    bg: '#F5F0FF',
  },
];

const PLANS: { period: BillingPeriod; label: string; price: number; perMonth: number; badge?: string; highlight?: boolean }[] = [
  {
    period: 'MONTHLY',
    label: 'Hàng tháng',
    price: 29000,
    perMonth: 29000,
  },
  {
    period: 'YEARLY',
    label: 'Hàng năm',
    price: 199000,
    perMonth: Math.round(199000 / 12),
    badge: 'Tiết kiệm 43%',
    highlight: true,
  },
];

const PREMIUM_FEATURES = [
  'Không giới hạn subscriptions',
  'Phân tích lãng phí nâng cao',
  'Cảnh báo gia hạn sớm (7 ngày)',
  'Báo cáo chi tiêu hàng tháng',
  'Phát hiện subscription trùng lặp',
  'Đề xuất tối ưu chi phí tự động',
];

function vietQrUrl(bankKey: string, stk: string, owner: string, amount: number, content: string) {
  const params = new URLSearchParams({
    amount: String(amount),
    addInfo: content,
    accountName: owner,
  });
  return `https://img.vietqr.io/image/${bankKey}-${stk}-compact2.png?${params.toString()}`;
}

// ── Plan card ────────────────────────────────────────────────────────────────
function PlanCard({
  plan,
  userEmail,
  onSubmit,
  isPending: isSubmitting,
}: {
  plan: typeof PLANS[0];
  userEmail: string;
  onSubmit: (period: BillingPeriod) => void;
  isPending: boolean;
}) {
  const [selectedBank, setSelectedBank] = useState(BANKS[0]);
  const [copied, setCopied] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  const emailPrefix = userEmail.split('@')[0].toUpperCase();
  const transferContent = `SUBTRACK ${emailPrefix} ${plan.period}`;

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const qrUrl = vietQrUrl(selectedBank.key, selectedBank.stk, selectedBank.owner, plan.price, transferContent);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: plan.highlight
          ? 'linear-gradient(160deg,#1E40AF 0%,#4F46E5 100%)'
          : 'white',
        borderRadius: 'var(--radius-xl)',
        padding: 28,
        border: plan.highlight ? 'none' : '1.5px solid var(--border)',
        boxShadow: plan.highlight
          ? '0 20px 60px -10px rgba(79,70,229,0.45)'
          : 'var(--shadow-sm)',
        color: plan.highlight ? 'white' : 'var(--text-primary)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {plan.highlight && (
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
      )}

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.7 }}>
            {plan.label}
          </span>
          {plan.badge && (
            <span style={{ background: '#FCD34D', color: '#92400E', borderRadius: 6, padding: '2px 10px', fontSize: '0.72rem', fontWeight: 800 }}>
              {plan.badge}
            </span>
          )}
        </div>
        <div style={{ fontSize: '2.6rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          {formatVND(plan.price)}
        </div>
        <div style={{ fontSize: '0.83rem', opacity: 0.7, marginTop: 4 }}>
          / {plan.period === 'YEARLY' ? 'năm' : 'tháng'}
          {plan.period === 'YEARLY' && (
            <span style={{ marginLeft: 8, opacity: 0.9 }}>≈ {formatVND(plan.perMonth)}/tháng</span>
          )}
        </div>
      </div>

      {/* Features */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        {PREMIUM_FEATURES.map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', opacity: 0.9 }}>
            <Check size={14} color={plan.highlight ? '#6EE7B7' : 'var(--accent-green)'} style={{ flexShrink: 0 }} /> {f}
          </div>
        ))}
      </div>

      {/* Separator */}
      <div style={{ borderTop: `1px solid ${plan.highlight ? 'rgba(255,255,255,0.15)' : 'var(--border-light)'}`, marginBottom: 20 }} />

      {/* Bank selector */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 600, opacity: 0.7, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Chọn ngân hàng nhận tiền
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {BANKS.map(bank => (
            <button
              key={bank.key}
              onClick={() => { setSelectedBank(bank); setShowQR(false); }}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-md)',
                border: selectedBank.key === bank.key
                  ? `2px solid ${plan.highlight ? 'white' : bank.color}`
                  : `1.5px solid ${plan.highlight ? 'rgba(255,255,255,0.2)' : 'var(--border)'}`,
                background: selectedBank.key === bank.key
                  ? (plan.highlight ? 'rgba(255,255,255,0.15)' : bank.bg)
                  : 'transparent',
                color: plan.highlight ? 'white' : bank.color,
                fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
                transition: 'var(--transition)',
              }}>
              {bank.name}
            </button>
          ))}
        </div>
      </div>

      {/* Transfer info */}
      <div style={{
        background: plan.highlight ? 'rgba(0,0,0,0.2)' : 'var(--bg)',
        borderRadius: 'var(--radius-md)', padding: 14, marginBottom: 16,
        display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.83rem',
      }}>
        {[
          { label: 'Số tài khoản', value: selectedBank.stk, key: 'stk' },
          { label: 'Chủ tài khoản', value: selectedBank.owner, key: 'owner' },
          { label: 'Số tiền', value: formatVND(plan.price), key: 'amount' },
        ].map(({ label, value, key }) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ opacity: 0.65 }}>{label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 700 }}>{value}</span>
              {key !== 'owner' && (
                <button onClick={() => copy(value, key)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, opacity: 0.7, color: 'inherit' }}>
                  {copied === key ? <CheckCheck size={13} color="#6EE7B7" /> : <Copy size={13} />}
                </button>
              )}
            </div>
          </div>
        ))}
        {/* Transfer content — read-only */}
        <div style={{ borderTop: `1px solid ${plan.highlight ? 'rgba(255,255,255,0.1)' : 'var(--border-light)'}`, paddingTop: 8 }}>
          <div style={{ fontSize: '0.72rem', opacity: 0.6, marginBottom: 4 }}>📝 Nội dung chuyển khoản (bắt buộc, không được sửa)</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <code style={{
              fontFamily: 'monospace', fontWeight: 800, fontSize: '0.88rem', letterSpacing: '0.04em',
              background: plan.highlight ? 'rgba(255,255,255,0.12)' : '#F0FDF4',
              color: plan.highlight ? '#A5F3FC' : '#166534',
              padding: '3px 8px', borderRadius: 4,
            }}>
              {transferContent}
            </code>
            <button onClick={() => copy(transferContent, 'content')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, opacity: 0.7, color: 'inherit' }}>
              {copied === 'content' ? <CheckCheck size={13} color="#6EE7B7" /> : <Copy size={13} />}
            </button>
          </div>
        </div>
      </div>

      {/* QR Toggle */}
      <button
        onClick={() => setShowQR(!showQR)}
        style={{
          background: 'none', border: `1px dashed ${plan.highlight ? 'rgba(255,255,255,0.4)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-md)', padding: '8px 0', color: 'inherit',
          cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', opacity: 0.8,
          transition: 'var(--transition)', marginBottom: 12, width: '100%',
        }}>
        {showQR ? '▲ Ẩn QR Code' : '▼ Hiện QR Code để quét'}
      </button>

      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
              <div style={{ background: 'white', borderRadius: 12, padding: 10, display: 'inline-block', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrUrl}
                  alt={`QR ${selectedBank.name}`}
                  width={180} height={180}
                  style={{ display: 'block', borderRadius: 6 }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.75rem', opacity: 0.65, margin: 0 }}>
              Quét bằng app {selectedBank.name} hoặc bất kỳ app ngân hàng nào
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <button
        className="btn btn-full"
        style={{
          marginTop: 'auto',
          background: plan.highlight ? 'white' : 'var(--primary)',
          color: plan.highlight ? '#4F46E5' : 'white',
          fontWeight: 800, fontSize: '0.95rem', padding: '12px',
        }}
        disabled={isSubmitting}
        onClick={() => onSubmit(plan.period)}>
        <Shield size={16} />
        {isSubmitting ? 'Đang gửi...' : 'Xác nhận đã chuyển khoản'}
      </button>
    </motion.div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function PricingPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [submittedPeriod, setSubmittedPeriod] = useState<BillingPeriod | null>(null);

  const { data: myRequests } = useQuery({
    queryKey: ['my-payment-requests'],
    queryFn: () => paymentApi.getMyRequests().then((r) => r.data.data),
    enabled: user?.planType === 'FREE',
  });

  const pendingRequest = myRequests?.find((r) => r.status === 'PENDING');
  const rejectedRequest = myRequests?.find((r) => r.status === 'REJECTED');

  const { mutate: submitRequest, isPending } = useMutation({
    mutationFn: (billingPeriod: BillingPeriod) => paymentApi.request(billingPeriod),
    onSuccess: (_, vars) => {
      setSubmittedPeriod(vars);
      qc.invalidateQueries({ queryKey: ['my-payment-requests'] });
    },
    onError: (err: any) => alert(err?.response?.data?.message || 'Có lỗi xảy ra, thử lại nhé!'),
  });

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ textAlign: 'center', marginBottom: 40 }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)',
            border: '1px solid #FCD34D', borderRadius: 'var(--radius-full)',
            padding: '6px 18px', marginBottom: 16,
            fontWeight: 700, fontSize: '0.85rem', color: '#D97706',
          }}>
            <Star size={14} fill="#D97706" /> Nâng cấp SubTrack Premium
          </div>
          <h1 className="page-title" style={{ fontSize: '2rem' }}>Chọn gói phù hợp với bạn</h1>
          <p className="page-subtitle" style={{ maxWidth: 480, margin: '0 auto' }}>
            Chuyển khoản → Xác nhận → Admin duyệt trong 24h. Không phức tạp!
          </p>
        </motion.div>
      </div>

      {/* PREMIUM user */}
      {user?.planType === 'PREMIUM' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="card" style={{ background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)', border: '1.5px solid #6EE7B7', maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 56, height: 56, background: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={28} color="white" />
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#065F46' }}>Bạn đang dùng Premium ⭐</div>
            <div style={{ color: '#059669', fontSize: '0.9rem' }}>Tận hưởng toàn bộ tính năng không giới hạn.</div>
          </div>
        </motion.div>
      )}

      {/* PENDING state */}
      {(pendingRequest || submittedPeriod) && user?.planType === 'FREE' && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="card" style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', border: '1.5px solid #FCD34D', background: '#FFFBEB' }}>
          <div style={{ width: 64, height: 64, background: '#FEF3C7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Clock size={28} color="#D97706" />
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#92400E', marginBottom: 8 }}>Đang chờ admin xác nhận</div>
          <div style={{ color: '#B45309', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Yêu cầu nâng cấp của bạn đã được ghi nhận.<br />
            Admin sẽ kiểm tra và xác nhận trong <strong>24 giờ</strong>.<br />
            Bạn sẽ nhận thông báo sau khi được duyệt 🔔
          </div>
        </motion.div>
      )}

      {/* Rejected notice */}
      {rejectedRequest && !pendingRequest && !submittedPeriod && user?.planType === 'FREE' && (
        <div className="card" style={{ border: '1px solid var(--accent-red)', maxWidth: 720, margin: '0 auto 20px', padding: '14px 18px', display: 'flex', gap: 10, background: '#FEF2F2' }}>
          <Zap size={16} color="var(--accent-red)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--accent-red)', fontSize: '0.9rem' }}>Yêu cầu trước đã bị từ chối</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>{rejectedRequest.notes || 'Bạn có thể gửi lại yêu cầu mới bên dưới.'}</div>
          </div>
        </div>
      )}

      {/* Plan cards — always shown for FREE users without pending */}
      {user?.planType === 'FREE' && !pendingRequest && !submittedPeriod && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, maxWidth: 760, margin: '0 auto' }}>
          {PLANS.map(plan => (
            <PlanCard
              key={plan.period}
              plan={plan}
              userEmail={user?.email ?? ''}
              onSubmit={submitRequest}
              isPending={isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
