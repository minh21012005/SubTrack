'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CreditCard, Clock, CheckCircle2, XCircle, Crown, Calendar, ReceiptText } from 'lucide-react';
import { paymentApi } from '@/lib/services';
import { formatVND } from '@/lib/utils';
import { useAuth } from '@/lib/context/AuthContext';
import type { PaymentRequest } from '@/lib/types';

export default function BillingPage() {
  const { user } = useAuth();

  const { data: payments, isLoading } = useQuery({
    queryKey: ['my-payments'],
    queryFn: () => paymentApi.getMyRequests().then((r) => r.data.data),
  });

  const statusBadge = (status: PaymentRequest['status']) => {
    const map = {
      PENDING: { label: 'Đang xử lý', color: '#D97706', bg: '#FEF3C7', icon: <Clock size={12} /> },
      APPROVED: { label: 'Thành công', color: 'var(--accent-green)', bg: 'var(--accent-green-light)', icon: <CheckCircle2 size={12} /> },
      REJECTED: { label: 'Bị từ chối', color: 'var(--accent-red)', bg: '#FEF2F2', icon: <XCircle size={12} /> },
    };
    const s = map[status];
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '3px 10px', borderRadius: 'var(--radius-full)',
        fontSize: '0.75rem', fontWeight: 700,
        background: s.bg, color: s.color,
      }}>
        {s.icon} {s.label}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ReceiptText size={22} color="var(--primary)" />
        </div>
        <div>
          <h1 className="page-title">Lịch sử thanh toán</h1>
          <p className="page-subtitle">Theo dõi trạng thái các yêu cầu nâng cấp Premium</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Current Plan Card (Quick View) */}
        <div className="card" style={{
          background: user?.planType === 'PREMIUM' ? 'linear-gradient(135deg, #0F172A, #1E293B)' : 'var(--bg-card)',
          color: user?.planType === 'PREMIUM' ? 'white' : 'var(--text-primary)',
          border: user?.planType === 'PREMIUM' ? 'none' : '1px solid var(--border)',
          position: 'relative', overflow: 'hidden',
          boxShadow: user?.planType === 'PREMIUM' ? '0 10px 30px -10px rgba(15,23,42,0.5)' : 'var(--shadow-sm)',
        }}>
          {user?.planType === 'PREMIUM' && (
            <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.05, color: '#F59E0B' }}>
              <Crown size={140} />
            </div>
          )}
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ 
              fontSize: '0.85rem', 
              color: user?.planType === 'PREMIUM' ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)', 
              marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' 
            }}>
              Gói dịch vụ hiện tại
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: user?.planType === 'PREMIUM' ? 24 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '1.8rem', fontWeight: 900 }}>
                {user?.planType === 'PREMIUM' ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#FCD34D' }}>
                    <Crown size={28} color="#FCD34D" /> Premium
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-primary)' }}>Free Plan</span>
                )}
              </div>
            </div>

            {user?.planType === 'PREMIUM' && user.planExpiresAt && (
              <div style={{ display: 'flex', gap: 32 }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Chu kỳ</div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{user.billingPeriod === 'YEARLY' ? 'Hàng năm' : 'Hàng tháng'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Ngày hết hạn</div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{new Intl.DateTimeFormat('vi-VN').format(new Date(user.planExpiresAt))}</div>
                </div>
              </div>
            )}
            
            {user?.planType !== 'PREMIUM' && (
              <div style={{ marginTop: 16 }}>
                <Link href="/pricing" className="btn btn-primary btn-sm" style={{ fontWeight: 700 }}>
                  <Crown size={14} /> Nâng cấp Premium ngay
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* History Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={18} color="var(--text-secondary)" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Danh sách giao dịch</h2>
          </div>

          {isLoading ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <div className="spinner" style={{ margin: '0 auto 12px' }} />
              <div style={{ color: 'var(--text-muted)' }}>Đang tải lịch sử...</div>
            </div>
          ) : !payments?.length ? (
            <div style={{ padding: 64, textAlign: 'center', color: 'var(--text-muted)' }}>
              <ReceiptText size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
              <p>Bạn chưa thực hiện giao dịch nào.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                  {['Giao dịch', 'Số tiền', 'Trạng thái', 'Ngày thực hiện'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '14px 24px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{ borderBottom: '1px solid var(--border-light)' }}
                  >
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Nâng cấp Premium</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gói {p.billingPeriod === 'YEARLY' ? 'Năm' : 'Tháng'}</div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{formatVND(p.amount)}</div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
                        {statusBadge(p.status)}
                        {p.notes && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--accent-red)', maxWidth: 200, paddingLeft: 4 }}>
                            {p.notes}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {new Date(p.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div style={{ marginTop: 24, padding: 16, borderRadius: 'var(--radius-md)', background: '#F8FAFC', border: '1px solid var(--border-light)', display: 'flex', gap: 12 }}>
        <Calendar size={18} color="var(--primary)" style={{ marginTop: 2 }} />
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Các yêu cầu thanh toán thường được xử lý trong vòng <strong>10-30 phút</strong>. Nếu sau 24h bạn chưa thấy tài khoản được nâng cấp, vui lòng liên hệ hỗ trợ.
        </div>
      </div>
    </div>
  );
}
