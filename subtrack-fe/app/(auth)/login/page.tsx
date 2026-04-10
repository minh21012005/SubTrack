'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, TrendingUp, Loader2 } from 'lucide-react';
import { authApi } from '@/lib/services';
import { saveAuth } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      const { token, user } = res.data.data;
      saveAuth(token, user);
      // Also set cookie for middleware
      document.cookie = `subtrack_token=${token}; path=/; max-age=${60 * 60 * 24}`;
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Thử lại nhé!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
          <div style={{
            width: 44, height: 44,
            background: 'linear-gradient(135deg, var(--primary), #a78bfa)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <TrendingUp size={22} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: '1.3rem', color: 'var(--text-primary)' }}>SubTrack</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phát hiện lãng phí subscription</div>
          </div>
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
          Chào mừng trở lại 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: '0.95rem' }}>
          Đăng nhập để xem bạn đang tiêu bao nhiêu
        </p>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="ban@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                }}
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Chưa có tài khoản?{' '}
          <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Đăng ký miễn phí
          </Link>
        </p>
      </div>
    </div>
  );
}
