'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Shield, Users, CreditCard, TrendingUp, RefreshCw, Search } from 'lucide-react';
import { useState } from 'react';
import { adminApi } from '@/lib/services';
import { formatVND, categoryLabel } from '@/lib/utils';
import type { AdminUser } from '@/lib/types';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');

  // Guard: redirect non-admins
  if (user && user.role !== 'ADMIN') {
    router.replace('/dashboard');
    return null;
  }

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getAllUsers().then((r) => r.data.data),
    enabled: user?.role === 'ADMIN',
  });

  const filtered = (data || []).filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalUsers = data?.length ?? 0;
  const premiumUsers = data?.filter((u) => u.planType === 'PREMIUM').length ?? 0;
  const totalSubs = data?.reduce((s, u) => s + u.activeSubscriptions, 0) ?? 0;
  const totalRevenue = data?.reduce((s, u) => s + u.totalMonthlySpend, 0) ?? 0;

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--radius-md)',
            background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield size={22} color="var(--accent-red)" />
          </div>
          <div>
            <h1 className="page-title">Admin Panel</h1>
            <p className="page-subtitle">Quản lý người dùng hệ thống SubTrack</p>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => refetch()}>
          <RefreshCw size={14} /> Làm mới
        </button>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Tổng users', value: String(totalUsers), icon: <Users size={20} color="var(--primary)" />, bg: 'var(--primary-light)', color: 'var(--primary)' },
          { label: 'Premium users', value: String(premiumUsers), icon: <TrendingUp size={20} color="var(--accent-green)" />, bg: 'var(--accent-green-light)', color: 'var(--accent-green)' },
          { label: 'Tổng subscriptions', value: String(totalSubs), icon: <CreditCard size={20} color="var(--accent-blue)" />, bg: '#EFF6FF', color: 'var(--accent-blue)' },
          { label: 'Tổng chi tiêu / tháng', value: formatVND(totalRevenue), icon: <Shield size={20} color="var(--accent-red)" />, bg: '#FEF2F2', color: 'var(--accent-red)' },
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

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          className="form-input"
          placeholder="Tìm theo tên hoặc email..."
          style={{ paddingLeft: 36 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0', gap: 12 }}>
            <div className="spinner" />
            <span style={{ color: 'var(--text-muted)' }}>Đang tải dữ liệu...</span>
          </div>
        ) : error ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--accent-red)' }}>Không thể tải dữ liệu. Bạn có đang đăng nhập với tài khoản Admin?</div>
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
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Không tìm thấy user nào</td></tr>
              ) : filtered.map((u, i) => (
                <motion.tr key={u.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  style={{ borderBottom: '1px solid var(--border-light)', cursor: 'default', transition: 'var(--transition)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* User col */}
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: u.role === 'ADMIN' ? '#FEF2F2' : 'var(--primary-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.85rem', fontWeight: 700,
                        color: u.role === 'ADMIN' ? 'var(--accent-red)' : 'var(--primary)',
                        flexShrink: 0,
                      }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  {/* Role/Plan col */}
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '2px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700,
                        background: u.role === 'ADMIN' ? '#FEF2F2' : 'var(--border-light)',
                        color: u.role === 'ADMIN' ? 'var(--accent-red)' : 'var(--text-secondary)',
                      }}>
                        {u.role === 'ADMIN' && <Shield size={10} />}
                        {u.role}
                      </span>
                      <span style={{
                        display: 'inline-flex', padding: '2px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 600,
                        background: u.planType === 'PREMIUM' ? 'var(--accent-green-light)' : 'var(--bg)',
                        color: u.planType === 'PREMIUM' ? 'var(--accent-green)' : 'var(--text-muted)',
                      }}>
                        {u.planType === 'PREMIUM' ? '⭐ Premium' : 'Free'}
                      </span>
                    </div>
                  </td>
                  {/* Subs col */}
                  <td style={{ padding: '14px 20px', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                    {u.activeSubscriptions}
                    <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 4 }}>gói</span>
                  </td>
                  {/* Spend col */}
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>
                    {formatVND(u.totalMonthlySpend)}
                  </td>
                  {/* Created At col */}
                  <td style={{ padding: '14px 20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer count */}
      {!isLoading && !error && (
        <p style={{ textAlign: 'right', marginTop: 12, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Hiển thị {filtered.length} / {totalUsers} tài khoản
        </p>
      )}
    </div>
  );
}
