'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, Check, Mail } from 'lucide-react';
import { authApi } from '@/lib/services';
import { saveAuth } from '@/lib/utils';
import { useAuth } from '@/lib/context/AuthContext';

const PERKS = [
  'Phát hiện subscription đang lãng phí',
  'Xem tổng chi phí hàng tháng',
  '5 subscription miễn phí',
];

export default function RegisterPage() {
  const router = useRouter();
  const { updateUser } = useAuth();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({ email: '', name: '', password: '', otp: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (form.password.length < 6) { setError('Mật khẩu phải ít nhất 6 ký tự'); return; }
    
    setLoading(true);
    try {
      await authApi.sendOtp(form.email);
      setSuccessMsg('Mã OTP đã được gửi đến email của bạn!');
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi gửi OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.otp.length !== 6) { setError('Mã OTP phải có đúng 6 chữ số'); return; }
    
    setLoading(true);
    try {
      const res = await authApi.register(form.email, form.name, form.password, form.otp);
      const { token, user } = res.data.data;
      saveAuth(token, user);
      updateUser(user); // sync context state immediately
      document.cookie = `subtrack_token=${token}; path=/; max-age=${60 * 60 * 24}`;
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Xác thực OTP thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <img 
            src="/image.jpg" 
            alt="SubTrack Logo" 
            width={44} 
            height={44} 
            style={{ borderRadius: 12, border: '1px solid var(--border)', objectFit: 'cover' }} 
          />
          <div>
            <div style={{ fontWeight: 900, fontSize: '1.3rem', color: 'var(--text-primary)' }}>SubTrack</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phát hiện lãng phí subscription</div>
          </div>
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 6 }}>
          {step === 1 ? 'Tạo tài khoản miễn phí' : 'Xác thực Email'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.9rem' }}>
          {step === 1 
            ? 'Khám phá bạn đang tiêu bao nhiêu tiền mỗi tháng'
            : `Mã xác thực gồm 6 chữ số đã được gửi đến ${form.email}`
          }
        </p>

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
            {PERKS.map((perk) => (
              <div key={perk} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <Check size={14} color="var(--accent-green)" />
                {perk}
              </div>
            ))}
          </div>
        )}

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
        {successMsg && <div className="alert alert-success" style={{ marginBottom: 16, backgroundColor: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>{successMsg}</div>}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? 'Đang gửi mã...' : 'Tiếp tục'}
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  maxLength={1}
                  value={form.otp[i] || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    const newOtp = form.otp.split('');
                    newOtp[i] = val;
                    const finalOtp = newOtp.join('');
                    setForm({ ...form, otp: finalOtp });
                    
                    if (val && i < 5) {
                      document.getElementById(`otp-${i + 1}`)?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !form.otp[i] && i > 0) {
                      document.getElementById(`otp-${i - 1}`)?.focus();
                    }
                  }}
                  style={{
                    width: '46px',
                    height: '56px',
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    borderRadius: '12px',
                    border: '2px solid var(--border)',
                    backgroundColor: 'var(--bg-secondary)',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    color: 'var(--primary)',
                    boxShadow: form.otp[i] ? '0 0 0 2px var(--primary-light)' : 'none',
                    borderColor: form.otp[i] ? 'var(--primary)' : 'var(--border)'
                  }}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button 
                onClick={handleRegister} 
                className="btn btn-primary btn-full btn-lg" 
                disabled={loading || form.otp.length !== 6}
                style={{ height: '52px', fontSize: '1rem' }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Xác nhận mã OTP'}
              </button>

              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  type="button" 
                  onClick={() => {setStep(1); setError(''); setSuccessMsg(''); setForm({...form, otp: ''});}}
                  className="btn" 
                  style={{ flex: 1, background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontSize: '0.85rem' }}
                  disabled={loading}
                >
                  Đổi email
                </button>
                <button 
                  type="button" 
                  onClick={handleSendOtp}
                  className="btn" 
                  style={{ flex: 1, background: 'transparent', color: 'var(--accent-orange)', border: '1px solid var(--accent-orange)', fontSize: '0.85rem' }}
                  disabled={loading}
                >
                  Gửi lại mã
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Đã có tài khoản?{' '}
            <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Đăng nhập</Link>
          </p>
        )}
      </div>
    </div>
  );
}
