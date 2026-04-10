'use client';

import { useState } from 'react';
import { getSavedUser, getInitials, clearAuth } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { User, Shield, Bell, Crown, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const user = getSavedUser();

  const handleLogout = () => {
    clearAuth();
    document.cookie = 'subtrack_token=; max-age=0; path=/';
    router.push('/login');
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <div className="page-header">
        <h1 className="page-title">Cài đặt</h1>
        <p className="page-subtitle">Quản lý tài khoản và tuỳ chọn</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Profile card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 20 }}>
            <User size={18} color="var(--primary)" />
            <h2 style={{ fontWeight: 700, fontSize: '1rem', marginLeft: 6 }}>Thông tin tài khoản</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary-light), var(--primary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)',
              flexShrink: 0,
            }}>
              {user ? getInitials(user.name || user.email) : '?'}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{user?.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user?.email}</div>
              <div style={{ marginTop: 4 }}>
                {user?.planType === 'PREMIUM'
                  ? <span className="badge badge-purple"><Crown size={11} /> Premium</span>
                  : <span className="badge badge-gray">Free Plan</span>}
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            🔔 Nhắc nhở gia hạn trước <strong>{user?.reminderDaysBefore || 7} ngày</strong>
          </div>
        </div>

        {/* Plan card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 16 }}>
            <Crown size={18} color="var(--accent-yellow)" />
            <h2 style={{ fontWeight: 700, fontSize: '1rem', marginLeft: 6 }}>Gói dịch vụ</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* Free plan */}
            <div style={{
              padding: '16px', borderRadius: 'var(--radius-md)',
              border: user?.planType !== 'PREMIUM' ? '2px solid var(--primary)' : '1.5px solid var(--border)',
              background: user?.planType !== 'PREMIUM' ? 'var(--primary-light)' : '#fff',
            }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Free</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: 8 }}>0đ<span style={{ fontSize: '0.8rem', fontWeight: 500 }}>/tháng</span></div>
              {['5 subscription', 'Dashboard cơ bản', 'Waste detection'].map((f) => (
                <div key={f} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: 6, marginBottom: 4 }}>
                  <span style={{ color: 'var(--accent-green)' }}>✓</span> {f}
                </div>
              ))}
              {user?.planType !== 'PREMIUM' && <div className="badge badge-purple" style={{ marginTop: 8 }}>Gói hiện tại</div>}
            </div>

            {/* Premium plan */}
            <div style={{
              padding: '16px', borderRadius: 'var(--radius-md)',
              border: user?.planType === 'PREMIUM' ? '2px solid var(--primary)' : '1.5px solid var(--border)',
              background: user?.planType === 'PREMIUM' ? 'var(--primary-light)' : 'linear-gradient(135deg, #fafaff, #f5f0ff)',
            }}>
              <div style={{ fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Crown size={14} color="var(--accent-yellow)" /> Premium
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: 8 }}>29k–79k<span style={{ fontSize: '0.8rem', fontWeight: 500 }}>/tháng</span></div>
              {['Không giới hạn subscription', 'Advanced waste analysis', 'Smart alerts', 'Phân tích nâng cao'].map((f) => (
                <div key={f} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: 6, marginBottom: 4 }}>
                  <span style={{ color: 'var(--accent-green)' }}>✓</span> {f}
                </div>
              ))}
              {user?.planType === 'PREMIUM'
                ? <div className="badge badge-purple" style={{ marginTop: 8 }}>Gói hiện tại</div>
                : <button className="btn btn-primary btn-sm btn-full" style={{ marginTop: 8 }}>Nâng cấp ngay</button>}
            </div>
          </div>
        </div>



        {/* Danger zone */}
        <div className="card" style={{ border: '1.5px solid #fca5a5' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--accent-red)', marginBottom: 12 }}>Đăng xuất</h2>

          <button className="btn btn-danger btn-sm" onClick={handleLogout}>
            <LogOut size={14} /> Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}
