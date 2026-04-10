'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { Menu, TrendingUp } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="page-wrapper">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div 
        className={`sidebar-overlay mobile-only ${isSidebarOpen ? 'active' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <main className="content-area">
        <div className="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32,
              background: 'linear-gradient(135deg, var(--primary), #a78bfa)',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <TrendingUp size={16} color="white" />
            </div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>SubTrack</div>
          </div>
          <button 
            className="btn btn-ghost" 
            style={{ padding: '4px' }}
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>

        {children}
      </main>
    </div>
  );
}
