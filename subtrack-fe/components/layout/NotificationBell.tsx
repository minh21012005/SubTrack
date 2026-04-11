'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCircle2, Clock, AlertTriangle, Star, X } from 'lucide-react';
import { notificationApi } from '@/lib/services';
import { useRouter } from 'next/navigation';
import type { Notification } from '@/lib/types';

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  RENEWAL_REMINDER: { icon: <Clock size={14} />, color: '#D97706', bg: '#FEF3C7' },
  WASTE_ALERT:      { icon: <AlertTriangle size={14} />, color: 'var(--accent-red)', bg: '#FEF2F2' },
  PAYMENT_APPROVED: { icon: <CheckCircle2 size={14} />, color: 'var(--accent-green)', bg: '#ECFDF5' },
  PAYMENT_REJECTED: { icon: <X size={14} />, color: 'var(--accent-red)', bg: '#FEF2F2' },
  GENERAL:          { icon: <Star size={14} />, color: 'var(--primary)', bg: 'var(--primary-light)' },
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
  const { data: notifications } = useQuery({
    queryKey: ['notifications-preview'],
    queryFn: () => notificationApi.getAll().then(r => r.data.data.slice(0, 6)),
    enabled: open,
  });

  const { mutate: markAllRead } = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onMutate: () => {
      // Optimistic upate
      qc.setQueryData(['notification-count'], { count: 0 });
      // Optimistic update for notifications list to mark all as read
      qc.setQueryData(['notifications-preview'], (old: Notification[] | undefined) => 
        old ? old.map(n => ({ ...n, status: 'READ' })) : []
      );
      qc.setQueryData(['notifications'], (old: Notification[] | undefined) => 
        old ? old.map(n => ({ ...n, status: 'READ' })) : []
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
          position: 'absolute', right: 0, top: '110%', zIndex: 9999,
          width: 340,
          background: '#ffffff',
          border: '1px solid #E2E8F0',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border-light)' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Thông báo</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {unreadCount > 0 && (
                <button onClick={() => markAllRead()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                  Đánh dấu đã đọc
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {!notifications || notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <Bell size={28} style={{ opacity: 0.2, margin: '0 auto 8px', display: 'block' }} />
                Chưa có thông báo nào
              </div>
            ) : (
              notifications.map((n) => {
                const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.GENERAL;
                const isUnread = n.status === 'UNREAD';
                return (
                  <div
                    key={n.id}
                    style={{
                      display: 'flex', gap: 12, padding: '12px 16px',
                      borderBottom: '1px solid var(--border-light)',
                      background: isUnread ? 'var(--primary-light)' : 'transparent',
                      cursor: 'default', transition: 'background 0.15s',
                    }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: cfg.bg, color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {cfg.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.83rem', color: 'var(--text-primary)', lineHeight: 1.45, fontWeight: isUnread ? 600 : 400 }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                        {timeAgo(n.createdAt)}
                      </div>
                    </div>
                    {isUnread && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 4 }} />
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
