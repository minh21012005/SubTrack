'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TrendingUp, Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { authApi } from '@/lib/services';
import { saveAuth } from '@/lib/utils';

const PERKS = [
  'Phát hiện subscription đang lãng phí',
  'Xem tổng chi phí hàng tháng',
  '5 subscription miễn phí',
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', name: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Mật khẩu phải ít nhất 6 ký tự'); return; }
    setLoading(true);
    try {
      const res = await authApi.register(form.email, form.name, form.password);
      const { token, user } = res.data.data;
      saveAuth(token, user);
      document.cookie = `subtrack_token=${token}; path=/; max-age=${60 * 60 * 24}`;
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Thử lại nhé!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
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

        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 6 }}>Tạo tài khoản miễn phí</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.9rem' }}>
          Khám phá bạn đang tiêu bao nhiêu tiền mỗi tháng
        </p>

        {/* Perks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
          {PERKS.map((perk) => (
            <div key={perk} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <Check size={14} color="var(--accent-green)" />
              {perk}
            </div>
          ))}
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Tên của bạn</label>
            <input type="text" className="form-input" placeholder="Nguyễn Văn A" value={form.name} onChange={set('name')} required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" placeholder="ban@example.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                className="form-input"
                placeholder="Ít nhất 6 ký tự"
                value={form.password}
                onChange={set('password')}
                required
                style={{ paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? <Loader2 size={18} /> : null}
            {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Đã có tài khoản?{' '}
          <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
