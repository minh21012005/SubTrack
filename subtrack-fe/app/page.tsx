'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, Check, Zap, ShieldAlert, CreditCard, LogOut, Star,
  TrendingDown, Bell, BarChart3, Users, Music2, MonitorPlay,
  Briefcase, Gamepad2, Cloud, Newspaper, Target, Crown,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

const PREMIUM_FEATURES = [
  'Không giới hạn subscriptions',
  'Phân tích lãng phí nâng cao',
  'Điểm sức khoẻ chi tiêu (0–100)',
  'Cảnh báo gia hạn sớm (7 ngày)',
  'Báo cáo chi tiêu hàng tháng',
  'Phát hiện subscription trùng lặp',
  'Đề xuất tối ưu chi phí tự động',
];

// Icon với gradient background — component dùng chung
function IconBox({
  icon, bg, border, size = 48,
}: {
  icon: React.ReactNode; bg: string; border: string; size?: number;
}) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.26,
      background: bg,
      border: `1.5px solid ${border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      boxShadow: `0 4px 12px ${border}55`,
    }}>
      {icon}
    </div>
  );
}

const HOW_IT_WORKS = [
  {
    iconEl: (
      <IconBox
        icon={<CreditCard size={22} color="#4F46E5" strokeWidth={2} />}
        bg="linear-gradient(135deg, #EEF2FF, #E0E7FF)"
        border="#C7D2FE"
        size={52}
      />
    ),
    title: 'Thêm subscription',
    desc: 'Chọn từ 30+ dịch vụ phổ biến hoặc tự nhập thủ công trong vài giây.',
  },
  {
    iconEl: (
      <IconBox
        icon={<BarChart3 size={22} color="#059669" strokeWidth={2} />}
        bg="linear-gradient(135deg, #ECFDF5, #D1FAE5)"
        border="#6EE7B7"
        size={52}
      />
    ),
    title: 'Phân tích tự động',
    desc: 'Hệ thống tính toán tổng chi phí, phát hiện lãng phí và tính Điểm sức khoẻ.',
  },
  {
    iconEl: (
      <IconBox
        icon={<TrendingDown size={22} color="#DC2626" strokeWidth={2} />}
        bg="linear-gradient(135deg, #FEF2F2, #FEE2E2)"
        border="#FCA5A5"
        size={52}
      />
    ),
    title: 'Cắt giảm thông minh',
    desc: 'Nhận gợi ý cụ thể nên hủy service nào để tiết kiệm nhiều nhất.',
  },
];

const WASTE_SCENARIOS = [
  { title: 'Trùng lặp app giải trí', desc: 'Đang trả tiền cho cả Netflix, Spotify, YouTube Premium nhưng thực tế bạn chỉ xài đúng 1 cái.', tag: 'Trùng lặp', accent: '#7C3AED' },
  { title: 'Quên huỷ gói Dùng thử', desc: 'App tự động trừ tiền ngay sau khi hết 7 ngày miễn phí, cứ thế trôi qua mất vài tháng tiền oan.', tag: 'Không dùng', accent: '#DC2626' },
  { title: 'App điện thoại bị lãng quên', desc: 'Ứng dụng chỉnh ảnh, fitness tự gia hạn gói 1 năm (vài trăm ngàn) dù bạn đã xoá app từ lâu.', tag: 'Lãng phí', accent: '#D97706' },
  { title: 'Phần mềm làm việc cũ', desc: 'Đã xong dự án hoặc đổi việc nhưng thẻ của bạn vẫn đang gánh phí Canva Pro, Zoom hàng tháng.', tag: 'Không dùng', accent: '#DC2626' },
  { title: 'Mua Cloud "quá tay"', desc: 'Bị trừ tiền cho cả iCloud, Google One, OneDrive dù tổng dữ liệu thực tế của bạn chỉ vài chục GB.', tag: 'Trùng lặp', accent: '#7C3AED' },
  { title: 'Chi tiêu "Tích tiểu thành đại"', desc: 'Các gói VIP mồi chài giá "vài nghìn/ngày" sẽ âm thầm ngốn của bạn hàng triệu đồng mỗi năm.', tag: 'Hiếm dùng', accent: '#0891B2' },
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
        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
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
              <Link href="/register" className="btn btn-primary">Bắt đầu miễn phí</Link>
            </>
          )}
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>

        {/* ── Hero ── */}
        <section style={{ padding: '100px 24px 60px', position: 'relative', width: '100%', maxWidth: 860, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Hero badge — Lucide icon thay emoji */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', padding: '6px 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 32 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg,#EEF2FF,#E0E7FF)', border: '1px solid #C7D2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={13} color="#4F46E5" strokeWidth={2.5} />
              </div>
              Kiểm soát chi tiêu subscription
            </div>
            <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, color: 'var(--text-primary)', marginBottom: 24 }}>
              Bạn đang lãng phí<br />bao nhiêu tiền mỗi tháng?
            </h1>
            <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.65 }}>
              Công cụ duy nhất giúp bạn phát hiện, tính toán lãng phí và quyết định ngay nên giữ hay hủy từng subscription một cách thông minh.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href={isLoggedIn ? dashboardHref : '/register'} className="btn btn-primary btn-lg" style={{ fontSize: '1rem', padding: '14px 28px' }}>
                Kiểm tra miễn phí <ArrowRight size={18} />
              </Link>
              <a href="#how" className="btn btn-outline btn-lg" style={{ fontSize: '1rem', padding: '14px 28px' }}>
                Xem cách hoạt động
              </a>
            </div>
          </motion.div>

          {/* Social Proof Bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
            style={{
              marginTop: 64, display: 'flex', gap: 0, justifyContent: 'center',
              background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)', overflow: 'hidden', flexWrap: 'wrap',
            }}
          >
            {[
              { icon: <Users size={16} color="#4F46E5" />, iconBg: 'linear-gradient(135deg,#EEF2FF,#E0E7FF)', iconBorder: '#C7D2FE', num: '2.400+', label: 'người dùng đang tiết kiệm' },
              { icon: <TrendingDown size={16} color="#059669" />, iconBg: 'linear-gradient(135deg,#ECFDF5,#D1FAE5)', iconBorder: '#6EE7B7', num: '420.000đ', label: 'tiết kiệm trung bình/tháng' },
              { icon: <ShieldAlert size={16} color="#DC2626" />, iconBg: 'linear-gradient(135deg,#FEF2F2,#FEE2E2)', iconBorder: '#FCA5A5', num: '38%', label: 'chi phí là lãng phí trung bình' },
              { icon: <Bell size={16} color="#D97706" />, iconBg: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)', iconBorder: '#FCD34D', num: '4 phút', label: 'để phát hiện lãng phí đầu tiên' },
            ].map((s, i) => (
              <div key={i} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '20px 28px', flex: '1 1 140px',
                borderRight: i < 3 ? '1px solid var(--border-light)' : 'none',
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: s.iconBg, border: `1px solid ${s.iconBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)' }}>{s.num}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', maxWidth: 100, lineHeight: 1.3 }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* ── How it Works ── */}
        <section id="how" style={{ width: '100%', maxWidth: 960, padding: '80px 24px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', marginBottom: 12 }}>Cách hoạt động</div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 48, color: 'var(--text-primary)' }}>
              3 bước để kiểm soát chi tiêu
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, textAlign: 'left' }}>
              {HOW_IT_WORKS.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                  style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '28px 24px', boxShadow: 'var(--shadow-sm)' }}
                >
                  <div style={{ marginBottom: 18 }}>{step.iconEl}</div>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 8, color: 'var(--text-primary)' }}>{step.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.55 }}>{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ── Common Waste Scenarios ── */}
        <section style={{ width: '100%', background: 'white', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', padding: '72px 24px' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-red)', marginBottom: 12, textAlign: 'center' }}>Bạn có biết không?</div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)', textAlign: 'center' }}>
              Bạn có thể đang trả tiền cho...
            </h2>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 40, fontSize: '0.95rem' }}>
              Những tình huống phổ biến nhất mà người dùng phát hiện ra sau khi dùng SubTrack.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
              {WASTE_SCENARIOS.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                  style={{
                    background: '#FAFAFF', borderRadius: 'var(--radius-md)',
                    padding: '16px 18px 16px 20px',
                    textAlign: 'left',
                    border: `1px solid var(--border)`,
                    borderLeftWidth: 4,
                    borderLeftColor: item.accent,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{item.title}</div>
                    <span style={{
                      flexShrink: 0,
                      fontSize: '0.65rem', fontWeight: 700,
                      padding: '2px 8px', borderRadius: 12,
                      background: item.accent + '15',
                      color: item.accent,
                      border: `1px solid ${item.accent}33`,
                    }}>
                      {item.tag}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.55, margin: 0 }}>{item.desc}</p>
                </motion.div>
              ))}
            </div>
            <div style={{ marginTop: 36, textAlign: 'center' }}>
              <Link href={isLoggedIn ? dashboardHref : '/register'} className="btn btn-primary" style={{ fontSize: '0.95rem', padding: '12px 28px' }}>
                Kiểm tra xem bạn đang trả cho gì <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* ── Pricing Section ── */}
        <section id="pricing" style={{ width: '100%', maxWidth: 900, marginTop: 80, padding: '0 24px 100px' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#FFF7ED,#FEF3C7)', border: '1px solid #FCD34D', borderRadius: 'var(--radius-full)', padding: '6px 18px', marginBottom: 16, fontWeight: 700, fontSize: '0.85rem', color: '#D97706' }}>
              <Star size={14} fill="#D97706" /> Gói Premium
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: 12 }}>
              Chọn gói phù hợp với bạn
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 48, fontSize: '1rem' }}>
              Bắt đầu miễn phí, nâng cấp bất cứ lúc nào.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, textAlign: 'left' }}>

              {/* Free Card */}
              <div style={{ background: 'white', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 32, boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Miễn phí</div>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 4 }}>0 ₫</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 28 }}>Mãi mãi miễn phí</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
                  {['Tối đa 5 subscriptions', 'Dashboard tổng quan', 'Điểm sức khoẻ chi tiêu', 'Cảnh báo gia hạn cơ bản'].map(f => (
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16, color: '#FCD34D' }}><Crown size={18} color="#FCD34D" /> Gói Premium lựa chọn nhiều nhất</div>
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
