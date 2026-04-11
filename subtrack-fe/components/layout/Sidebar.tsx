'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, CreditCard, AlertTriangle,
  Settings, LogOut, TrendingUp, Plus, X, Shield, Crown
} from 'lucide-react';
import { clearAuth, getInitials } from '@/lib/utils';
import { useAuth } from '@/lib/context/AuthContext';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/subscriptions', icon: CreditCard, label: 'Subscriptions' },
  { href: '/waste', icon: AlertTriangle, label: 'Waste Analysis' },
  { href: '/billing', icon: TrendingUp, label: 'Lịch sử thanh toán' },
  { href: '/settings', icon: Settings, label: 'Cài đặt' },
];

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Logo */}
      <div
        onClick={() => router.push('/')}
        style={{ padding: '28px 24px 20px', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', position: 'relative' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/image.jpg" alt="Logo" width={36} height={36} style={{ borderRadius: 8, border: '1px solid var(--border)', objectFit: 'cover' }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>SubTrack</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>Chống lãng phí</div>
          </div>
        </div>
        {onClose && (
          <button
            className="btn btn-ghost mobile-only"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            style={{ padding: 4, position: 'absolute', right: 16, top: 28 }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Quick Add Button */}
      <div style={{ padding: '16px 16px 8px' }}>
        <Link href="/add" className="btn btn-primary btn-full btn-sm">
          <Plus size={16} /> Thêm subscription
        </Link>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: active ? 600 : 500,
                fontSize: '0.9rem',
                color: active ? 'var(--primary)' : 'var(--text-secondary)',
                background: active ? 'var(--primary-light)' : 'transparent',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'var(--border-light)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                }
              }}
              onClick={onClose}
            >
              <Icon size={18} strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}

        {/* Admin-only link */}
        {user?.role === 'ADMIN' && (() => {
          const active = pathname === '/admin' || pathname.startsWith('/admin/');
          return (
            <>
              <div style={{ height: 1, background: 'var(--border-light)', margin: '8px 0' }} />
              <Link
                href="/admin"
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)', fontWeight: active ? 600 : 500,
                  fontSize: '0.9rem',
                  color: active ? 'var(--accent-red)' : 'var(--text-secondary)',
                  background: active ? '#FEF2F2' : 'transparent',
                  transition: 'var(--transition)',
                }}
                onClick={onClose}
              >
                <Shield size={18} strokeWidth={1.75} />
                Admin Panel
              </Link>
            </>
          );
        })()}
      </nav>

      {/* User Footer */}
      <div style={{ padding: '0 16px 16px' }}>
        {/* Go Premium CTA for FREE users */}
        {user && user.planType === 'FREE' && user.role !== 'ADMIN' && (
          <Link href="/pricing" onClick={onClose}
            style={{
              display: 'block', marginBottom: 12,
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              borderRadius: 'var(--radius-lg)', padding: '14px 16px',
              textDecoration: 'none', color: 'white',
              boxShadow: '0 4px 16px -4px rgba(79,70,229,0.45)',
              transition: 'var(--transition)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Crown size={14} color="#FCD34D" />
              <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Nâng cấp Premium</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)' }}>Bắt đầu từ 29k/tháng. Không giới hạn!</div>
          </Link>
        )}

        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 12 }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 36, height: 36,
                background: 'linear-gradient(135deg, var(--primary-light), var(--primary))',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)',
              }}>
                {getInitials(user.name || user.email)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {user.role === 'ADMIN'
                    ? <><Shield size={10} color="var(--accent-red)" />Admin</>
                    : user.planType === 'PREMIUM' ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#F59E0B', fontWeight: 700 }}><Crown size={14} color="#F59E0B" /> Premium</span> : 'Free Plan'
                  }
                </div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-full btn-sm"
            style={{ justifyContent: 'flex-start', color: 'var(--accent-red)' }}
          >
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>  {/* end inner border-top div */}
      </div>
    </aside>
  );
}
