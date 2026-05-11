'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCircle2, Clock, AlertTriangle, Star, X } from 'lucide-react';
import { notificationApi } from '@/lib/services';
import { useRouter } from 'next/navigation';
import type { Notification } from '@/lib/types';

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  RENEWAL_REMINDER: { icon: <Clock size={14} />, color: '#F59E0B', bg: '#FFFBEB' },
  WASTE_ALERT:      { icon: <AlertTriangle size={14} />, color: '#EF4444', bg: '#FEF2F2' },
  PAYMENT_APPROVED: { icon: <CheckCircle2 size={14} />, color: '#10B981', bg: '#ECFDF5' },
  PAYMENT_REJECTED: { icon: <X size={14} />, color: '#EF4444', bg: '#FEF2F2' },
  GENERAL:          { icon: <Star size={14} />, color: '#6366F1', bg: '#EEF2FF' },
};

export default function NotificationBell() {
  const router = useRouter();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Unread count — polls every 30s
  const { data: countData } = useQuery({
    queryKey: ['notification-count'],
    queryFn: () => notificationApi.getUnreadCount().then(r => r.data.data),
    refetchInterval: 30_000,
  });

  // Recent notifications — fetch when dropdown opens
  const { data: previewPage } = useQuery({
    queryKey: ['notifications-preview'],
    queryFn: () => notificationApi.getPage(0, 6, 12).then((r) => r.data.data),
    enabled: open,
  });

  const notifications = previewPage?.content ?? [];

  const { mutate: markAllRead } = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onMutate: () => {
      qc.setQueryData(['notification-count'], { count: 0 });
      qc.setQueryData(['notifications-preview'], (old: { content: Notification[] } | undefined) =>
        old ? { ...old, content: old.content.map((n) => ({ ...n, status: 'READ' as const })) } : old
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notification-count'] });
      qc.invalidateQueries({ queryKey: ['notifications-preview'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = countData?.count ?? 0;

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'vừa xong';
    if (m < 60) return `${m} phút trước`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} giờ trước`;
    return `${Math.floor(h / 24)} ngày trước`;
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => {
          if (!open && unreadCount > 0) {
            markAllRead();
          }
          setOpen(!open);
        }}
        style={{
          position: 'relative', background: 'none', border: 'none',
          cursor: 'pointer', padding: 8, borderRadius: 'var(--radius-md)',
          color: 'var(--text-secondary)',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        aria-label="Thông báo"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            minWidth: 16, height: 16, borderRadius: 8, padding: '0 4px',
            background: 'var(--accent-red)', color: 'white',
            fontSize: '0.65rem', fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            lineHeight: 1,
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 12px)', zIndex: 9999,
          width: 380,
          background: '#ffffff',
          border: '1px solid #E5E7EB',
          borderRadius: '20px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          animation: 'scaleIn 0.2s ease-out',
        }}>
          {/* Header */}
          <div style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
            padding: '20px 24px', 
            borderBottom: '1px solid #F3F4F6',
            background: '#FAFAFA'
          }}>
            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#111827', letterSpacing: '-0.01em' }}>Thông báo</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {unreadCount > 0 && (
                <button 
                  onClick={() => markAllRead()} 
                  style={{ 
                    background: 'none', border: 'none', cursor: 'pointer', 
                    fontSize: '0.78rem', color: '#6366F1', fontWeight: 700,
                    padding: '4px 8px', borderRadius: '6px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#EEF2FF'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  Đánh dấu đã đọc
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight: 420, overflowY: 'auto' }}>
            {!notifications || notifications.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: '#9CA3AF', fontSize: '0.9rem' }}>
                <Bell size={40} style={{ opacity: 0.1, margin: '0 auto 16px', display: 'block' }} />
                Chưa có thông báo nào mới
              </div>
            ) : (
              notifications.map((n) => {
                const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.GENERAL;
                const isUnread = n.status === 'UNREAD';
                return (
                  <div
                    key={n.id}
                    style={{
                      display: 'flex', gap: 16, padding: '16px 24px',
                      borderBottom: '1px solid #F3F4F6',
                      background: isUnread ? '#F5F7FF' : 'transparent',
                      cursor: 'default', transition: 'background 0.2s',
                    }}
                  >
                    <div style={{ 
                      width: 40, height: 40, borderRadius: '12px', 
                      background: cfg.bg, color: cfg.color, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      flexShrink: 0,
                      boxShadow: `0 2px 4px ${cfg.color}11`
                    }}>
                      {cfg.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        fontSize: '0.875rem', color: '#374151', 
                        lineHeight: 1.5, fontWeight: isUnread ? 700 : 400,
                        letterSpacing: '-0.01em'
                      }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={10} /> {timeAgo(n.createdAt)}
                      </div>
                    </div>
                    {isUnread && (
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#6366F1', flexShrink: 0, marginTop: 6, boxShadow: '0 0 0 4px #6366F122' }} />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <button
            onClick={() => { setOpen(false); router.push('/notifications'); }}
            style={{ width: '100%', padding: '12px', background: 'none', border: 'none', borderTop: '1px solid var(--border-light)', cursor: 'pointer', fontSize: '0.83rem', fontWeight: 600, color: 'var(--primary)', transition: 'background 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            Xem tất cả thông báo →
          </button>
        </div>
      )}
    </div>
  );
}
