'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { notificationApi } from '@/lib/services';
import { Bell, CheckCheck, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const TYPE_EMOJI: Record<string, string> = {
  RENEWAL_REMINDER: '⏰',
  WASTE_ALERT: '🔥',
  GENERAL: '📢',
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifs = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getAll().then((r) => r.data.data),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markOneMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unread = notifs.filter((n) => n.status === 'UNREAD').length;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell size={24} /> Thông báo
            {unread > 0 && (
              <span style={{
                background: 'var(--accent-red)', color: 'white',
                borderRadius: 'var(--radius-full)', padding: '2px 10px',
                fontSize: '0.8rem', fontWeight: 700,
              }}>{unread}</span>
            )}
          </h1>
          <p className="page-subtitle">{notifs.length} thông báo · {unread} chưa đọc</p>
        </div>
        {unread > 0 && (
          <button className="btn btn-outline btn-sm" onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}>
            <CheckCheck size={14} /> Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
          <div className="spinner" />
        </div>
      ) : notifs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔔</div>
          <p style={{ fontWeight: 600 }}>Chưa có thông báo nào</p>
          <p style={{ fontSize: '0.875rem' }}>Các thông báo gia hạn sẽ xuất hiện ở đây</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifs.map((notif, i) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => notif.status === 'UNREAD' && markOneMutation.mutate(notif.id)}
              style={{
                background: notif.status === 'UNREAD' ? 'var(--primary-light)' : 'var(--bg-card)',
                border: `1.5px solid ${notif.status === 'UNREAD' ? 'var(--primary)22' : 'var(--border-light)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '14px 18px',
                cursor: notif.status === 'UNREAD' ? 'pointer' : 'default',
                display: 'flex', gap: 14, alignItems: 'flex-start',
                transition: 'var(--transition)',
              }}
            >
              <div style={{ fontSize: '1.3rem', flexShrink: 0, marginTop: 2 }}>
                {TYPE_EMOJI[notif.type] || '📢'}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5, fontWeight: notif.status === 'UNREAD' ? 600 : 400 }}>
                  {notif.message}
                </p>
                {notif.subscriptionName && (
                  <span className="badge badge-purple" style={{ marginTop: 6 }}>{notif.subscriptionName}</span>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  <Clock size={11} />
                  {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: vi })}
                </div>
              </div>
              {notif.status === 'UNREAD' && (
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 6 }} />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
