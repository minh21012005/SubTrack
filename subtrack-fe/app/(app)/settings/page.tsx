'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getInitials } from '@/lib/utils';
import { User, Shield, Bell, Crown, Lock, CheckCircle2 } from 'lucide-react';
import { authApi } from '@/lib/services';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/lib/context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Nhập lại mật khẩu không khớp');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    
    setIsChangingPassword(true);
    try {
      await authApi.changePassword({ oldPassword, newPassword });
      toast.success('Đổi mật khẩu thành công');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi đổi mật khẩu');
    } finally {
      setIsChangingPassword(false);
    }
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <User size={18} color="var(--primary)" />
              <h2 style={{ fontWeight: 700, fontSize: '1rem', marginLeft: 6 }}>Thông tin tài khoản</h2>
            </div>
            <button 
              className="btn btn-outline btn-sm" 
              onClick={() => setIsModalOpen(true)}
              style={{ padding: '6px 12px', fontWeight: 600, color: 'var(--text-primary)' }}
            >
              <Lock size={14} /> Đổi mật khẩu
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--primary-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-dark)',
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

          <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={16} color="var(--accent-orange)" /> Nhắc nhở gia hạn trước <strong>{user?.planType === 'PREMIUM' ? (user?.reminderDaysBefore || 7) : 3} ngày</strong>
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
              border: user?.planType !== 'PREMIUM' ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: user?.planType !== 'PREMIUM' ? 'var(--primary-light)' : '#fff',
            }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Free</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, marginBottom: 8 }}>0đ<span style={{ fontSize: '0.8rem', fontWeight: 500 }}>/tháng</span></div>
              {['5 subscription', 'Dashboard cơ bản', 'Waste detection'].map((f) => (
                <div key={f} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: 6, marginBottom: 4 }}>
                  <CheckCircle2 size={14} color="var(--accent-green)" /> {f}
                </div>
              ))}
              {user?.planType !== 'PREMIUM' && <div className="badge badge-purple" style={{ marginTop: 8 }}>Gói hiện tại</div>}
            </div>

            {/* Premium plan */}
            <div style={{
              padding: '16px', borderRadius: 'var(--radius-md)',
              border: user?.planType === 'PREMIUM' ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: user?.planType === 'PREMIUM' ? 'var(--primary-light)' : 'var(--bg)',
            }}>
              <div style={{ fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Crown size={14} color="var(--accent-yellow)" /> Premium
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 8 }}>29k/tháng <span style={{ fontSize: '0.8rem', opacity: 0.6, fontWeight: 500 }}>hoặc</span> 199k/năm</div>
              
              {user?.planType === 'PREMIUM' && (
                <div style={{ 
                  marginBottom: 16, padding: '10px 12px', background: 'white', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--primary-light)', fontSize: '0.82rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Chu kỳ:</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      {user.billingPeriod === 'YEARLY' ? 'Hàng năm' : 'Hàng tháng'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Hết hạn:</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {user.planExpiresAt ? new Intl.DateTimeFormat('vi-VN').format(new Date(user.planExpiresAt)) : '---'}
                    </span>
                  </div>
                </div>
              )}

              {[
                'Không giới hạn subscription',
                'Phân tích lãng phí nâng cao',
                'Cảnh báo gia hạn sớm',
                'Đề xuất tối ưu tự động',
              ].map((f) => (
                <div key={f} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: 6, marginBottom: 4 }}>
                  <CheckCircle2 size={14} color="var(--accent-green)" /> {f}
                </div>
              ))}
              {user?.planType === 'PREMIUM'
                ? <div className="badge badge-purple" style={{ marginTop: 8 }}>Gói hiện tại</div>
                : <Link href="/pricing" className="btn btn-outline btn-sm btn-full" style={{ marginTop: 8 }}>Xem chi tiết gói</Link>}
            </div>
          </div>
        </div>



        </div>

      {/* Change Password Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(17, 24, 39, 0.4)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'white', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 420,
            padding: 32, boxShadow: 'var(--shadow-lg)', position: 'relative'
          }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-primary)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={20} color="var(--primary)" />
              </div>
              Đổi mật khẩu
            </h2>
            
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="form-group">
                <label className="form-label">Mật khẩu hiện tại</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="Nhập mật khẩu hiện tại" 
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mật khẩu mới</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="Mật khẩu mới (ít nhất 6 ký tự)" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nhập lại mật khẩu mới</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="Xác nhận mật khẩu mới" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => {
                    setIsModalOpen(false);
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  disabled={isChangingPassword}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={isChangingPassword}>
                  {isChangingPassword ? 'Đang cập nhật...' : 'Xác nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
