'use client';

import { motion } from 'framer-motion';
import { Shield, TrendingUp, Lock, HelpCircle, CheckCircle, AlertCircle, AlertTriangle, Lightbulb, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Props {
  score: number;
  label: string;
  breakdown: Record<string, number>;
  isPremium: boolean;
  hasSubscriptions: boolean;
}

function getScoreConfig(score: number) {
  if (score >= 90) return { color: '#10B981', bgColor: '#ECFDF5', ringColor: '#6EE7B7', icon: <CheckCircle size={22} color="#10B981" />, advice: 'Bạn đang rất tiết kiệm!' };
  if (score >= 70) return { color: '#F59E0B', bgColor: '#FFFBEB', ringColor: '#FCD34D', icon: <AlertCircle size={22} color="#F59E0B" />, advice: 'Vẫn còn có thể tối ưu thêm.' };
  return { color: '#EF4444', bgColor: '#FEF2F2', ringColor: '#FCA5A5', icon: <AlertTriangle size={22} color="#EF4444" />, advice: 'Cần hành động để giảm lãng phí!' };
}

const SCORE_CIRCUMFERENCE = 2 * Math.PI * 42;

export default function HealthScoreWidget({ score, label, breakdown, isPremium, hasSubscriptions }: Props) {
  // ─── FREE USER: show locked/unknown state ─────────────────────────────────
  if (!isPremium) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
          border: '1.5px solid #FCD34D',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 28px',
          display: 'flex',
          gap: 24,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* Locked ring */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width={100} height={100} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={50} cy={50} r={42} fill="none" stroke="#FCD34D44" strokeWidth={10} />
            {/* Dashed partial ring suggesting unknown */}
            <circle
              cx={50} cy={50} r={42}
              fill="none" stroke="#D97706" strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray="60 205"
              opacity={0.5}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <HelpCircle size={28} color="#D97706" />
            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#D97706', marginTop: 2 }}>Ẩn</div>
          </div>
        </div>

        {/* FOMO info */}
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Shield size={16} color="#D97706" />
            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#92400E' }}>
              Điểm sức khoẻ chi tiêu
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '1.1rem', fontWeight: 900, color: '#92400E', marginBottom: 6 }}>
            <HelpCircle size={20} /> Chưa xác định được
          </div>
          <div style={{ fontSize: '0.82rem', color: '#B45309', lineHeight: 1.5, marginBottom: 12 }}>
            {hasSubscriptions
              ? 'Bạn chưa đánh giá tình trạng sử dụng các subscription. Điểm thực của bạn có thể thấp hơn 100 rất nhiều!'
              : 'Thêm subscription để bắt đầu tính điểm sức khoẻ chi tiêu của bạn.'}
          </div>
          {hasSubscriptions && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.78rem', color: '#92400E', background: '#FEF3C7', padding: '10px 12px', borderRadius: 6, border: '1px solid #FCD34D', marginBottom: 12 }}>
              <Lightbulb size={16} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>Theo thống kê, <strong>trung bình 38%</strong> chi phí subscription là lãng phí.</div>
            </div>
          )}
        </div>

        {/* Upgrade CTA */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          padding: '16px 20px', background: 'rgba(255,255,255,0.7)',
          borderRadius: 'var(--radius-md)', border: '1px solid #FCD34D',
          minWidth: 168, textAlign: 'center',
        }}>
          <Lock size={20} color="#D97706" />
          <div style={{ fontSize: '0.8rem', color: '#92400E', fontWeight: 600, lineHeight: 1.4 }}>
            Nâng cấp Premium để<br />
            <span style={{ fontWeight: 400 }}>biết điểm thực của bạn,</span><br />
            <span style={{ fontWeight: 400 }}>phân tích chi tiết lãng phí</span>
          </div>
          <Link href="/pricing" className="btn btn-sm" style={{ background: '#D97706', color: 'white', border: 'none', fontSize: '0.78rem', padding: '6px 14px', width: '100%', justifyContent: 'center' }}>
            <TrendingUp size={13} /> Xem gói Premium
          </Link>
        </div>
      </motion.div>
    );
  }

  // ─── PREMIUM USER: show actual score ─────────────────────────────────────
  const cfg = getScoreConfig(score);
  const dashOffset = SCORE_CIRCUMFERENCE * (1 - score / 100);
  const totalDeduction = Object.values(breakdown).reduce((a, b) => a + b, 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        background: cfg.bgColor,
        border: `1.5px solid ${cfg.ringColor}`,
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px',
        display: 'flex',
        gap: 28,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      {/* Circular progress ring */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <svg width={100} height={100} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={50} cy={50} r={42} fill="none" stroke={`${cfg.color}22`} strokeWidth={10} />
          <motion.circle
            cx={50} cy={50} r={42}
            fill="none"
            stroke={cfg.color}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={SCORE_CIRCUMFERENCE}
            initial={{ strokeDashoffset: SCORE_CIRCUMFERENCE }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ fontSize: '1.6rem', fontWeight: 900, color: cfg.color, lineHeight: 1 }}
          >
            {score}
          </motion.div>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: cfg.color, marginTop: 1 }}>/100</div>
        </div>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 160 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Shield size={16} color={cfg.color} />
          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: cfg.color }}>
            Điểm sức khoẻ chi tiêu
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 4 }}>
          {cfg.icon} {label}
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{cfg.advice}</div>
      </div>

      {/* Breakdown */}
      {totalDeduction > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 180 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
            Chi tiết trừ điểm
          </div>
          {Object.entries(breakdown).filter(([, v]) => v > 0).map(([key, val]) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{key}</span>
              <span style={{ fontWeight: 700, color: cfg.color }}>−{val}</span>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${cfg.ringColor}`, paddingTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700 }}>
            <span style={{ color: 'var(--text-muted)' }}>Điểm đạt được</span>
            <span style={{ color: cfg.color }}>{score}/100</span>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: cfg.color, fontWeight: 600, textAlign: 'center', padding: '12px 16px', background: `${cfg.color}11`, borderRadius: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={18} /> Không có điểm trừ!
          </div>
          <span style={{ fontWeight: 400, fontSize: '0.78rem' }}>Tất cả subscription đang được dùng hiệu quả.</span>
        </div>
      )}
    </motion.div>
  );
}
