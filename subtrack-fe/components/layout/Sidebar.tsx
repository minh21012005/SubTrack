'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, CreditCard, AlertTriangle,
  Bell, Settings, LogOut, TrendingUp, Plus
} from 'lucide-react';
import { clearAuth, getSavedUser, getInitials } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/subscriptions', icon: CreditCard, label: 'Subscriptions' },
  { href: '/waste', icon: AlertTriangle, label: 'Waste Analysis' },
  { href: '/notifications', icon: Bell, label: 'Thông báo' },
  { href: '/settings', icon: Settings, label: 'Cài đặt' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = getSavedUser();

  const handleLogout = () => {
    clearAuth();
    document.cookie = 'subtrack_token=; max-age=0; path=/';
    router.push('/login');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, var(--primary), #a78bfa)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <TrendingUp size={18} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>SubTrack</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>Chống lãng phí</div>
          </div>
        </div>
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
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border-light)' }}>
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
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.planType === 'PREMIUM' ? '⭐ Premium' : 'Free Plan'}
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
      </div>
    </aside>
  );
}
