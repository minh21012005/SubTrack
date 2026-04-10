'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import NotificationBell from '@/components/layout/NotificationBell';
import { Menu, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isInitializing, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitializing && !isLoggedIn) {
      router.push('/login');
    }
  }, [isInitializing, isLoggedIn, router]);

  if (isInitializing || !isLoggedIn) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <Loader2 size={32} className="animate-spin text-primary" color="var(--primary)" />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div
        className={`sidebar-overlay mobile-only ${isSidebarOpen ? 'active' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <main className="content-area">
        {/* Mobile header */}
        <div className="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/image.jpg" alt="Logo" width={32} height={32} style={{ borderRadius: 8, border: '1px solid var(--border)', objectFit: 'cover' }} />
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>SubTrack</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <NotificationBell />
            <button
              className="btn btn-ghost"
              style={{ padding: '4px' }}
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Desktop top-right notification (Absolute, top-aligned) */}
        <div className="desktop-only" style={{ position: 'absolute', top: 16, right: 24, zIndex: 1000 }}>
          <NotificationBell />
        </div>

        {children}
      </main>
    </div>
  );
}

