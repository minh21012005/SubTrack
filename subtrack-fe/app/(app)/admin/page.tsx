'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Shield, Users, CreditCard, TrendingUp, RefreshCw, Search,
  CheckCircle2, XCircle, Clock, Check, X
} from 'lucide-react';
import { adminApi } from '@/lib/services';
import { formatVND } from '@/lib/utils';
import type { AdminUser, PaymentRequest } from '@/lib/types';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';

type Tab = 'users' | 'payments';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<Tab>('users');
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  if (user && user.role !== 'ADMIN') {
    router.replace('/dashboard');
    return null;
  }

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getAllUsers().then((r) => r.data.data),
    enabled: user?.role === 'ADMIN',
  });

  const { data: payments, isLoading: loadingPayments, refetch: refetchPayments } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => adminApi.getPayments().then((r) => r.data.data),
    enabled: user?.role === 'ADMIN',
  });

  const { mutate: approve } = useMutation({
    mutationFn: (id: string) => adminApi.approvePayment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-payments'] });
      qc.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (e: any) => alert(e?.response?.data?.message || 'Lỗi khi duyệt'),
  });

  const { mutate: reject } = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      adminApi.rejectPayment(id, notes),
    onSuccess: () => {
      setRejectingId(null);
      qc.invalidateQueries({ queryKey: ['admin-payments'] });
    },
    onError: (e: any) => alert(e?.response?.data?.message || 'Lỗi khi từ chối'),
  });

  const filtered = (data || []).filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalUsers = data?.length ?? 0;
  const premiumUsers = data?.filter((u) => u.planType === 'PREMIUM').length ?? 0;
  const totalSubs = data?.reduce((s, u) => s + u.activeSubscriptions, 0) ?? 0;
  const pendingPayments = payments?.filter((p) => p.status === 'PENDING').length ?? 0;

  const statusBadge = (status: PaymentRequest['status']) => {
    const map = {
      PENDING: { label: 'Chờ duyệt', color: '#D97706', bg: '#FEF3C7', icon: <Clock size={12} /> },
      APPROVED: { label: 'Đã duyệt', color: 'var(--accent-green)', bg: 'var(--accent-green-light)', icon: <CheckCircle2 size={12} /> },
      REJECTED: { label: 'Từ chối', color: 'var(--accent-red)', bg: '#FEF2F2', icon: <XCircle size={12} /> },
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
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={22} color="var(--accent-red)" />
          </div>
          <div>
            <h1 className="page-title">Admin Panel</h1>
            <p className="page-subtitle">Quản lý người dùng và xác nhận thanh toán</p>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => { refetch(); refetchPayments(); }}>
          <RefreshCw size={14} /> Làm mới
        </button>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Tổng users', value: String(totalUsers), icon: <Users size={20} color="var(--primary)" />, bg: 'var(--primary-light)', color: 'var(--primary)' },
          { label: 'Premium users', value: String(premiumUsers), icon: <TrendingUp size={20} color="var(--accent-green)" />, bg: 'var(--accent-green-light)', color: 'var(--accent-green)' },
          { label: 'Tổng subscriptions', value: String(totalSubs), icon: <CreditCard size={20} color="var(--accent-blue)" />, bg: '#EFF6FF', color: 'var(--accent-blue)' },
          { label: 'Chờ duyệt', value: String(pendingPayments), icon: <Clock size={20} color="#D97706" />, bg: '#FEF3C7', color: '#D97706' },
        ].map(({ label, value, icon, bg, color }, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="card card-sm" style={{ border: `1.5px solid ${bg}` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color, letterSpacing: '-0.02em' }}>{value}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border-light)', paddingBottom: 0 }}>
        {[
          { key: 'users' as Tab, label: 'Người dùng', count: totalUsers },
          { key: 'payments' as Tab, label: 'Duyệt thanh toán', count: pendingPayments > 0 ? pendingPayments : undefined, highlight: pendingPayments > 0 },
        ].map(({ key, label, count, highlight }) => (
          <button key={key} onClick={() => setTab(key)}
            style={{
              padding: '10px 20px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
              background: 'transparent', color: tab === key ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: tab === key ? '2px solid var(--primary)' : '2px solid transparent',
              transition: 'var(--transition)', display: 'flex', alignItems: 'center', gap: 6,
            }}>
            {label}
            {count !== undefined && (
              <span style={{
                minWidth: 20, height: 20, borderRadius: 10, padding: '0 6px',
                background: highlight ? 'var(--accent-red)' : 'var(--border-light)',
                color: highlight ? 'white' : 'var(--text-secondary)',
                fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {tab === 'users' && (
        <>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-input" placeholder="Tìm theo tên hoặc email..." style={{ paddingLeft: 36 }}
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0', gap: 12 }}>
                <div className="spinner" /><span style={{ color: 'var(--text-muted)' }}>Đang tải...</span>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
                    {['Người dùng', 'Role / Plan', 'Gói cước', 'Chi tiêu / tháng', 'Ngày tạo'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Không tìm thấy user</td></tr>
                  ) : filtered.map((u, i) => (
                    <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      style={{ borderBottom: '1px solid var(--border-light)', transition: 'var(--transition)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: u.role === 'ADMIN' ? '#FEF2F2' : 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: u.role === 'ADMIN' ? 'var(--accent-red)' : 'var(--primary)', flexShrink: 0 }}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, background: u.role === 'ADMIN' ? '#FEF2F2' : 'var(--border-light)', color: u.role === 'ADMIN' ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
                            {u.role === 'ADMIN' && <Shield size={10} />}{u.role}
                          </span>
                          <span style={{ display: 'inline-flex', padding: '2px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 600, background: u.planType === 'PREMIUM' ? 'var(--accent-green-light)' : 'var(--bg)', color: u.planType === 'PREMIUM' ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                            {u.planType === 'PREMIUM' ? '⭐ Premium' : 'Free'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: 700, fontSize: '1rem' }}>
                        {u.activeSubscriptions}<span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 4 }}>gói</span>
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>{formatVND(u.totalMonthlySpend)}</td>
                      <td style={{ padding: '14px 20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {!isLoading && <p style={{ textAlign: 'right', marginTop: 12, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hiển thị {filtered.length} / {totalUsers} tài khoản</p>}
        </>
      )}

      {/* Payments Tab */}
      {tab === 'payments' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loadingPayments ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0', gap: 12 }}>
              <div className="spinner" /><span style={{ color: 'var(--text-muted)' }}>Đang tải...</span>
            </div>
          ) : !payments?.length ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
              <Clock size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <div>Chưa có yêu cầu thanh toán nào</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
                  {['Người dùng', 'Nội dung CK (để xác minh)', 'Gói / Số tiền', 'Trạng thái', 'Ngày gửi', 'Hành động'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 20px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    style={{ borderBottom: '1px solid var(--border-light)', transition: 'var(--transition)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.userName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.userEmail}</div>
                    </td>
                    {/* Transfer content column — admin matches this against bank statement */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{
                        display: 'inline-block',
                        background: '#F0FDF4', color: '#166534',
                        border: '1px solid #BBF7D0',
                        borderRadius: 'var(--radius-sm)',
                        padding: '4px 10px',
                        fontFamily: 'monospace', fontWeight: 700, fontSize: '0.82rem',
                        letterSpacing: '0.04em',
                      }}>
                        {p.transferContent}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>Tìm trong lịch sử GD ngân hàng</div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Premium · {p.billingPeriod === 'YEARLY' ? 'Năm' : 'Tháng'}</div>
                      <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem', marginTop: 2 }}>{formatVND(p.amount)}</div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>{statusBadge(p.status)}</td>
                    <td style={{ padding: '14px 20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(p.createdAt).toLocaleString('vi-VN')}</td>
                    <td style={{ padding: '14px 20px' }}>
                      {p.status === 'PENDING' ? (
                        rejectingId === p.id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <input className="form-input" style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                              placeholder="Lý do từ chối..." value={rejectNotes[p.id] || ''}
                              onChange={(e) => setRejectNotes({ ...rejectNotes, [p.id]: e.target.value })} />
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-danger btn-sm" onClick={() => reject({ id: p.id, notes: rejectNotes[p.id] || '' })}>
                                <X size={12} /> Xác nhận từ chối
                              </button>
                              <button className="btn btn-ghost btn-sm" onClick={() => setRejectingId(null)}>Huỷ</button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-success btn-sm" onClick={() => approve(p.id)}>
                              <Check size={14} /> Duyệt
                            </button>
                            <button className="btn btn-danger btn-sm" style={{ background: 'transparent', color: 'var(--accent-red)', border: '1px solid var(--accent-red)' }}
                              onClick={() => setRejectingId(p.id)}>
                              <X size={14} /> Từ chối
                            </button>
                          </div>
                        )
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {p.verifiedByName && `Bởi ${p.verifiedByName}`}
                          {p.notes && <div style={{ color: 'var(--accent-red)', marginTop: 2 }}>{p.notes}</div>}
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
