'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Zap, ShieldAlert, CreditCard, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

export default function LandingPage() {
  const { user, isLoggedIn, isInitializing, logout } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAFAFF' }}>
      
      {/* Navbar */}
      <header className="landing-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/image.jpg" alt="SubTrack Logo" width={36} height={36} style={{ borderRadius: 10, border: '1px solid var(--border)', objectFit: 'cover' }} />
          <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>SubTrack</span>
        </Link>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {isInitializing ? (
            <div style={{ width: 140, height: 36 }} /> /* Placeholder for hydration */
          ) : isLoggedIn ? (
            <>
              <Link href="/dashboard" style={{ fontWeight: 600, color: 'var(--text-secondary)', padding: '8px 16px', textDecoration: 'none' }}>
                Xin chào, {user?.name}
              </Link>
              <button 
                onClick={logout}
                className="desktop-only"
                style={{ 
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', fontWeight: 600, fontSize: '0.9rem',
                  color: 'var(--text-secondary)', background: 'transparent', border: 'none',
                  borderRadius: 'var(--radius-full)', cursor: 'pointer',
                  transition: 'background 0.2s, color 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--accent-red-light)';
                  e.currentTarget.style.color = 'var(--accent-red)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <LogOut size={16} /> Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="desktop-only" style={{ fontWeight: 600, color: 'var(--text-secondary)', padding: '8px 16px' }}>Đăng nhập</Link>
              <Link href="/register" className="btn btn-primary">
                Bắt đầu ngay
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '100px 24px', position: 'relative' }}>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ position: 'relative', zIndex: 1, maxWidth: 800 }}
        >
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: 8, 
            background: '#ffffff', padding: '6px 16px', borderRadius: 'var(--radius-full)', 
            border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
            fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)',
            marginBottom: 32
          }}>
            <span style={{ display: 'flex', width: 8, height: 8, background: 'var(--accent-red)', borderRadius: '50%' }} />
            Kiểm soát chi tiêu tự động
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, color: 'var(--text-primary)', marginBottom: 24 }}>
            Bạn đang lãng phí<br />bao nhiêu tiền mỗi tháng?
          </h1>
          
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: 40, maxWidth: 640, margin: '0 auto 40px', lineHeight: 1.6 }}>
            Công cụ duy nhất giúp bạn phát hiện, tính toán chi phí lãng phí và quyết định ngay nên tiếp tục dùng hay hủy bỏ các subscription.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={isLoggedIn ? "/dashboard" : "/login"} className="btn btn-primary btn-lg" style={{ fontSize: '1.1rem', padding: '16px 32px' }}>
              Kiểm tra ngay <ArrowRight size={20} />
            </Link>
          </div>
        </motion.div>

        {/* Feature Highlights */}
        <div style={{ display: 'flex', gap: 24, marginTop: 80, flexWrap: 'wrap', justifyContent: 'center', zIndex: 1 }}>
          <FeatureCard icon={<ShieldAlert color="var(--accent-red)" />} title="Phát hiện sớm" desc="Cảnh báo trước khi bị tự động trừ tiền gia hạn." />
          <FeatureCard icon={<Zap color="var(--accent-yellow)" />} title="Shock Moment" desc="Tính toán chính xác số tiền lãng phí mỗi tháng." />
          <FeatureCard icon={<CreditCard color="var(--primary)" />} title="Tối ưu chi phí" desc="Giải quyết các subscription trùng danh mục dịch vụ." />
        </div>
      </main>

      {/* Footer */}
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

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{
        background: '#ffffff',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        borderRadius: 'var(--radius-md)',
        padding: '32px 24px',
        maxWidth: 320,
        textAlign: 'left'
      }}
    >
      <div style={{ width: 44, height: 44, background: 'var(--bg)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, border: '1px solid var(--border-light)' }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '0.95rem' }}>{desc}</p>
    </motion.div>
  );
}
