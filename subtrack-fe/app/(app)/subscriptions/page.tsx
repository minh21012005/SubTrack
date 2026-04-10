'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { subscriptionApi } from '@/lib/services';
import SubscriptionCard from '@/components/subscription/SubscriptionCard';
import { categoryLabel } from '@/lib/utils';
import type { ActionType } from '@/lib/types';

const FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'waste', label: '🔥 Lãng phí' },
  { value: 'active', label: '✅ Đang dùng' },
  { value: 'cancelled', label: '❌ Đã hủy' },
];

export default function SubscriptionsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const { data: subs = [], isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => subscriptionApi.getAll().then((r) => r.data.data),
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: ActionType }) =>
      subscriptionApi.action(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => subscriptionApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const filtered = subs.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ? true :
      filter === 'waste' ? s.wasteCost > 0 && !s.cancelled :
      filter === 'active' ? s.usageStatus === 'ACTIVE' && !s.cancelled :
      filter === 'cancelled' ? s.cancelled : true;
    return matchSearch && matchFilter;
  });

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Subscriptions</h1>
          <p className="page-subtitle">
            {subs.filter(s => !s.cancelled).length} đang hoạt động · {subs.filter(s => s.wasteCost > 0).length} cần xem xét
          </p>
        </div>
        <Link href="/add" className="btn btn-primary">
          <Plus size={16} /> Thêm mới
        </Link>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 38 }}
            placeholder="Tìm kiếm subscription..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`chip ${filter === f.value ? 'active' : ''}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">{search ? '🔍' : '📭'}</div>
          <p style={{ fontWeight: 600 }}>{search ? 'Không tìm thấy kết quả' : 'Chưa có subscription nào'}</p>
          {!search && (
            <Link href="/add" className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>
              <Plus size={14} /> Thêm subscription đầu tiên
            </Link>
          )}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((sub) => (
              <div key={sub.id} style={{ position: 'relative' }}>
                <SubscriptionCard
                  subscription={sub}
                  onAction={(id, action) => actionMutation.mutate({ id, action })}
                  loading={actionMutation.isPending}
                />
                {/* Delete button */}
                <button
                  onClick={() => {
                    if (confirm(`Xóa "${sub.name}"? Thao tác này không thể hoàn tác.`)) {
                      deleteMutation.mutate(sub.id);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  title="Xóa subscription"
                  style={{
                    position: 'absolute', top: 16, right: 16,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: 4, borderRadius: 6,
                    transition: 'var(--transition)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-red)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
