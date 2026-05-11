'use client';

import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { getToken } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export default function RealTimeProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    const token = getToken();
    if (!token) return;

    // Use absolute URL or proxy-relative
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const sseUrl = `${baseUrl}/api/notifications/subscribe?token=${token}`;

    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;

    es.addEventListener('connected', (e) => {
      console.log('SSE Connected:', e.data);
    });

    es.addEventListener('notification', (e) => {
      try {
        const notif = JSON.parse(e.data);
        toast.success(notif.message, {
          duration: 5000,
          icon: '🔔',
        });
        // Invalidate notification queries
        queryClient.invalidateQueries({ queryKey: ['notification-count'] });
        queryClient.invalidateQueries({ queryKey: ['notifications-preview'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      } catch (err) {
        console.error('Failed to parse notification event', err);
      }
    });

    es.addEventListener('PLAN_UPDATED', (e) => {
      console.log('Plan updated event received:', e.data);
      refreshUser();
      toast.success('Tài khoản của bạn đã được cập nhật!', {
        duration: 6000,
        icon: '🚀',
      });
      // Also refresh dashboard data
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    });

    es.onerror = (err) => {
      console.error('SSE Error:', err);
      es.close();
      // Browser will typically try to reconnect automatically if not closed, 
      // but here we might want to handle specific retry logic if needed.
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [isLoggedIn, refreshUser, queryClient]);

  return <>{children}</>;
}
