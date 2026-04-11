'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { authApi } from '@/lib/services';
import { saveAuth } from '@/lib/utils';
import { useAuth } from '@/lib/context/AuthContext';
import toast from 'react-hot-toast';

type Mode = 'LOGIN' | 'FORGOT_PASSWORD_EMAIL' | 'FORGOT_PASSWORD_OTP';

export default function LoginPage() {
  const router = useRouter();
  const { updateUser } = useAuth();
  
  const [mode, setMode] = useState<Mode>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Countdown timer cho OTP
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      const { token, user } = res.data.data;
      saveAuth(token, user);
      updateUser(user); // update context state immediately
      document.cookie = `subtrack_token=${token}; path=/; max-age=${60 * 60 * 24}`;
      router.push(user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Thử lại nhé!');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.sendForgotPasswordOtp(email);
      toast.success('Mã xác thực đã được gửi đến email của bạn!');
      setMode('FORGOT_PASSWORD_OTP');
      setOtpCountdown(30); // 30s mặc định như đã thảo luận
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể gửi email OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.resetPassword({ email, otp, newPassword });
      toast.success('Mật khẩu đã được thay đổi thành công! Vui lòng đăng nhập.');
      // Xoá thông tin cũ & quay về login
      setPassword('');
      setNewPassword('');
      setOtp('');
      setMode('LOGIN');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Thiết lập mật khẩu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {mode === 'LOGIN' ? (
          <Link 
            href="/" 
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', 
              color: 'var(--text-muted)', marginBottom: 24, textDecoration: 'none', transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <span style={{ fontSize: '1.1rem' }}>←</span> Quay về trang chủ
          </Link>
        ) : (
          <button 
            type="button"
            onClick={() => {
              setMode(mode === 'FORGOT_PASSWORD_OTP' ? 'FORGOT_PASSWORD_EMAIL' : 'LOGIN');
              setError('');
            }}
            style={{ 
              display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', 
              color: 'var(--text-muted)', marginBottom: 24, padding: 0,
              background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
          <img src="/image.jpg" alt="Logo" width={44} height={44} style={{ borderRadius: 12, border: '1px solid var(--border)', objectFit: 'cover' }} />
          <div>
            <div style={{ fontWeight: 900, fontSize: '1.3rem', color: 'var(--text-primary)' }}>SubTrack</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phát hiện lãng phí subscription</div>
          </div>
        </div>

        {mode === 'LOGIN' && (
          <>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Chào mừng trở lại</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: '0.95rem' }}>Đăng nhập để quản lý chi tiêu</p>
            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" placeholder="ban@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Mật khẩu</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPwd ? 'text' : 'password'} className="form-input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                  <button 
                    type="button" 
                    onClick={() => setMode('FORGOT_PASSWORD_EMAIL')}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                  >
                    Quên mật khẩu?
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 8 }}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Chưa có tài khoản? <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Đăng ký miễn phí</Link>
            </p>
          </>
        )}

        {mode === 'FORGOT_PASSWORD_EMAIL' && (
          <>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Quên mật khẩu?</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: '0.95rem' }}>Nhập email của bạn để nhận mã khôi phục an toàn.</p>
            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Email tài khoản</label>
                <input type="email" className="form-input" placeholder="ban@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 8 }}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                {loading ? 'Đang gửi mã...' : 'Tiếp tục'}
              </button>
            </form>
          </>
        )}

        {mode === 'FORGOT_PASSWORD_OTP' && (
          <>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Nhập mã xác thực</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: '0.95rem' }}>
              Mã bảo mật gồm 6 số đã được gửi tới <strong>{email}</strong>
            </p>
            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Mã OTP (6 số)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="123456" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required 
                  autoFocus 
                  style={{ letterSpacing: '0.2em', fontWeight: 700, fontSize: '1.2rem', textAlign: 'center' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mật khẩu mới</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPwd ? 'text' : 'password'} className="form-input" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} style={{ paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading || otp.length < 6} style={{ marginTop: 8 }}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                {loading ? 'Đang xử lý...' : 'Khôi phục mật khẩu'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.9rem' }}>
              {otpCountdown > 0 ? (
                <span style={{ color: 'var(--text-muted)' }}>
                  Gửi lại mã sau <strong style={{ color: 'var(--text-primary)' }}>{otpCountdown}s</strong>
                </span>
              ) : (
                <button 
                  type="button" 
                  onClick={() => handleSendOtp()} 
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
                  disabled={loading}
                >
                  Không nhận được email? Gửi lại mã
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
