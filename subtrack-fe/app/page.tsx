'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Zap, ShieldAlert, CreditCard, LogOut, Star } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

const PREMIUM_FEATURES = [
  'Không giới hạn subscriptions',
  'Phân tích lãng phí nâng cao',
  'Cảnh báo gia hạn sớm (7 ngày)',
  'Báo cáo chi tiêu hàng tháng',
  'Phát hiện subscription trùng lặp',
  'Đề xuất tối ưu chi phí tự động',
];

export default function LandingPage() {
  const { user, isLoggedIn, isInitializing, logout } = useAuth();
  const dashboardHref = user?.role === 'ADMIN' ? '/admin' : '/dashboard';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAFAFF' }}>

      {/* ── Navbar ── */}
      <header className="landing-header" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/image.jpg" alt="SubTrack Logo" width={36} height={36} style={{ borderRadius: 10, border: '1px solid var(--border)', objectFit: 'cover' }} />
          <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>SubTrack</span>
        </Link>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {isInitializing ? (
            <div style={{ width: 140, height: 36 }} />
          ) : isLoggedIn ? (
            <>
              <Link href={dashboardHref} style={{ fontWeight: 600, color: 'var(--text-secondary)', padding: '8px 16px', textDecoration: 'none' }}>
                Xin chào, {user?.name}
              </Link>
              <button
                onClick={logout}
                className="desktop-only"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)', background: 'transparent', border: 'none', borderRadius: 'var(--radius-full)', cursor: 'pointer', transition: 'background 0.2s, color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-red-light)'; e.currentTarget.style.color = 'var(--accent-red)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                <LogOut size={16} /> Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="desktop-only" style={{ fontWeight: 600, color: 'var(--text-secondary)', padding: '8px 16px' }}>Đăng nhập</Link>
              <Link href="/register" className="btn btn-primary">Bắt đầu ngay</Link>
            </>
          )}
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '100px 24px 80px', position: 'relative' }}>

        {/* ── Hero ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          style={{ position: 'relative', zIndex: 1, maxWidth: 800 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#ffffff', padding: '6px 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 32 }}>
            <span style={{ display: 'flex', width: 8, height: 8, background: 'var(--accent-red)', borderRadius: '50%' }} />
            Kiểm soát chi tiêu tự động
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, color: 'var(--text-primary)', marginBottom: 24 }}>
            Bạn đang lãng phí<br />bao nhiêu tiền mỗi tháng?
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: 640, margin: '0 auto 40px', lineHeight: 1.6 }}>
            Công cụ duy nhất giúp bạn phát hiện, tính toán chi phí lãng phí và quyết định ngay nên tiếp tục dùng hay hủy bỏ các subscription.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={isLoggedIn ? dashboardHref : '/login'} className="btn btn-primary btn-lg" style={{ fontSize: '1.1rem', padding: '16px 32px' }}>
              Kiểm tra ngay <ArrowRight size={20} />
            </Link>
            <a href="#pricing" className="btn btn-outline btn-lg" style={{ fontSize: '1.1rem', padding: '16px 32px' }}>
              Xem bảng giá
            </a>
          </div>
        </motion.div>

        {/* ── Feature Cards ── */}
        <div style={{ display: 'flex', gap: 24, marginTop: 80, flexWrap: 'wrap', justifyContent: 'center', zIndex: 1 }}>
          <FeatureCard icon={<ShieldAlert color="var(--accent-red)" />} title="Phát hiện sớm" desc="Cảnh báo trước khi bị tự động trừ tiền gia hạn." />
          <FeatureCard icon={<Zap color="var(--accent-yellow)" />} title="Shock Moment" desc="Tính toán chính xác số tiền lãng phí mỗi tháng." />
          <FeatureCard icon={<CreditCard color="var(--primary)" />} title="Tối ưu chi phí" desc="Giải quyết các subscription trùng danh mục dịch vụ." />
        </div>

        {/* ── Pricing Section ── */}
        <section id="pricing" style={{ width: '100%', maxWidth: 900, marginTop: 120 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#FFF7ED,#FEF3C7)', border: '1px solid #FCD34D', borderRadius: 'var(--radius-full)', padding: '6px 18px', marginBottom: 16, fontWeight: 700, fontSize: '0.85rem', color: '#D97706' }}>
              <Star size={14} fill="#D97706" /> Gói Premium
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: 12 }}>
              Chọn gói phù hợp với bạn
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 48, fontSize: '1rem' }}>
              Bắt đầu miễn phí, nâng cấp bất cứ lúc nào với giá cực kỳ tiết kiệm.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, textAlign: 'left' }}>

              {/* Free Card */}
              <div style={{ background: 'white', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 32, boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Miễn phí</div>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 4 }}>0 ₫</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 28 }}>Mãi mãi miễn phí</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
                  {['Tối đa 5 subscriptions', 'Dashboard tổng quan', 'Cảnh báo gia hạn cơ bản'].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <Check size={16} color="var(--text-muted)" /> {f}
                    </div>
                  ))}
                </div>
                <Link href="/register" className="btn btn-outline btn-full">Bắt đầu miễn phí</Link>
              </div>

              {/* Premium Card */}
              <div style={{ background: 'linear-gradient(160deg,#1E40AF 0%,#4F46E5 100%)', borderRadius: 'var(--radius-xl)', padding: 32, boxShadow: '0 20px 60px -10px rgba(79,70,229,0.5)', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
                <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, color: '#A5B4FC' }}>Premium ⭐</div>
                {/* Prices stacked cleanly */}
                <div style={{ display: 'flex', gap: 24, marginBottom: 20, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, lineHeight: 1.1 }}>29.000 ₫</div>
                    <div style={{ fontSize: '0.8rem', color: '#A5B4FC', marginTop: 2 }}>/ tháng</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', color: '#A5B4FC', fontSize: '0.9rem' }}>hoặc</div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, lineHeight: 1.1 }}>199.000 ₫</div>
                      <span style={{ background: '#FCD34D', color: '#92400E', borderRadius: 6, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 800, whiteSpace: 'nowrap' }}>Tiết kiệm 43%</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#A5B4FC', marginTop: 2 }}>/ năm</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32, marginTop: 20 }}>
                  {PREMIUM_FEATURES.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
                      <Check size={16} color="#6EE7B7" /> {f}
                    </div>
                  ))}
                </div>
                <Link
                  href={isLoggedIn ? '/pricing' : '/register'}
                  className="btn btn-full"
                  style={{ background: 'white', color: '#4F46E5', fontWeight: 800, fontSize: '1rem' }}>
                  <Zap size={18} /> {isLoggedIn ? 'Thanh toán ngay' : 'Đăng ký & Nâng cấp'}
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer style={{ padding: '40px', textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.05)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
          <img src="/image.jpg" alt="Logo" width={20} height={20} style={{ borderRadius: 4, objectFit: 'cover' }} />
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>SubTrack</span>
        </div>
        <p>© 2026 SubTrack - Dừng lãng phí tiền bạc của bạn.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      style={{ background: '#ffffff', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', borderRadius: 'var(--radius-md)', padding: '32px 24px', maxWidth: 320, textAlign: 'left' }}
    >
      <div style={{ width: 44, height: 44, background: 'var(--bg)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, border: '1px solid var(--border-light)' }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.95rem' }}>{desc}</p>
    </motion.div>
  );
}
