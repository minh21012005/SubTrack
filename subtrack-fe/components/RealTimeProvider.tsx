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
        
        // Skip toast for payment events because PLAN_UPDATED handler will show a better one
        const isPaymentEvent = notif.type === 'PAYMENT_APPROVED' || notif.type === 'PAYMENT_REJECTED';
        
        if (!isPaymentEvent) {
          const isError = notif.type === 'WASTE_ALERT';
          toast(notif.message, {
            duration: 6000,
            icon: isError ? '⚠️' : '🔔',
            style: {
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              color: '#1E293B',
              border: '1px solid #E2E8F0',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '14px 18px',
              borderRadius: '16px',
              fontSize: '0.9rem',
              maxWidth: '380px',
            },
          });
        }

        // Always invalidate notification queries to update the bell count/list
        queryClient.invalidateQueries({ queryKey: ['notification-count'] });
        queryClient.invalidateQueries({ queryKey: ['notifications-preview'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['my-payment-requests'] });
      } catch (err) {
        console.error('Failed to parse notification event', err);
      }
    });

    es.addEventListener('PLAN_UPDATED', (e) => {
      try {
        const data = JSON.parse(e.data);
        refreshUser();
        
        if (data.expired) {
          toast('Gói Premium đã hết hạn', { icon: '⏳', duration: 6000 });
        } else if (data.approved) {
          toast.success('Chúc mừng! Tài khoản của bạn đã lên Premium 🚀', {
            duration: 8000,
            style: {
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
              color: '#F8FAFC',
              border: '1px solid #334155',
              padding: '16px',
              borderRadius: '12px',
              fontWeight: 600,
            },
          });
        } else {
          toast.error('Yêu cầu nâng cấp bị từ chối. Vui lòng kiểm tra thông báo.', {
            duration: 8000,
          });
        }
        
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
        queryClient.invalidateQueries({ queryKey: ['my-payment-requests'] });
      } catch (err) {
        console.error('Failed to parse PLAN_UPDATED event', err);
        refreshUser();
      }
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
