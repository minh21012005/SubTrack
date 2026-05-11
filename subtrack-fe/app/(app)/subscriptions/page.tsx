'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, Loader2, Inbox } from 'lucide-react';
import Link from 'next/link';
import { subscriptionApi, dashboardApi } from '@/lib/services';
import SubscriptionCard from '@/components/subscription/SubscriptionCard';
import Pagination from '@/components/ui/Pagination';
import type { ActionType } from '@/lib/types';

const FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'waste', label: 'Lãng phí' },
  { value: 'active', label: 'Đang dùng' },
  { value: 'cancelled', label: 'Đã hủy' },
];

const PAGE_SIZE = 12;

export default function SubscriptionsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(0);
  }, [filter, debouncedSearch]);

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get().then((r) => r.data.data),
  });

  const { data: pageData, isLoading } = useQuery({
    queryKey: ['subscriptions', page, filter, debouncedSearch],
    queryFn: () =>
      subscriptionApi.getPage(page, PAGE_SIZE, filter, debouncedSearch).then((r) => r.data.data),
  });

  const subs = pageData?.content ?? [];

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

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Subscriptions</h1>
          <p className="page-subtitle">
            {dashboard?.activeCount ?? '—'} đang hoạt động · {dashboard?.wasteCount ?? '—'} cần xem xét
          </p>
        </div>
        <Link href="/add" className="btn btn-primary btn-sm">
          <Plus size={14} /> Thêm mới
        </Link>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 38 }}
            placeholder="Tìm theo tên hoặc danh mục (server)..."
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

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
          <div className="spinner" />
        </div>
      ) : subs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">{search ? <Search size={48} strokeWidth={1.5} color="var(--text-muted)" /> : <Inbox size={48} strokeWidth={1.5} color="var(--text-muted)" />}</div>
          <p style={{ fontWeight: 600 }}>{search ? 'Không tìm thấy kết quả' : 'Chưa có subscription nào'}</p>
          {!search && (
            <Link href="/add" className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>
              <Plus size={14} /> Thêm subscription đầu tiên
            </Link>
          )}
        </div>
      ) : (
        <>
          <AnimatePresence mode="popLayout">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {subs.map((sub) => (
                <div key={sub.id} style={{ position: 'relative' }}>
                  <SubscriptionCard
                    subscription={sub}
                    onAction={(id, action) => actionMutation.mutate({ id, action })}
                    onDelete={(id) => setDeleteId(id)}
                    loading={actionMutation.isPending || deleteMutation.isPending}
                  />
                </div>
              ))}
            </div>
          </AnimatePresence>
          {pageData && (
            <>
              <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Hiển thị {subs.length} / {pageData.totalElements} gói (trang {pageData.page + 1}/{Math.max(1, pageData.totalPages)})
              </p>
              <Pagination page={page} totalPages={pageData.totalPages} onPageChange={setPage} />
            </>
          )}
        </>
      )}

      {deleteId && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'white', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 400,
            padding: '32px 24px', boxShadow: 'var(--shadow-lg)'
          }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: 12, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Trash2 size={20} color="var(--accent-red)" /> Xác nhận xóa
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.95rem', lineHeight: 1.5 }}>
              Bạn có chắc chắn muốn xóa subscription này không? Thao tác này sẽ xóa mọi dữ liệu liên quan và <strong>không thể hoàn tác</strong>.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                className="btn btn-outline"
                onClick={() => setDeleteId(null)}
                disabled={deleteMutation.isPending}
              >
                Hủy
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  deleteMutation.mutate(deleteId);
                  setDeleteId(null);
                }}
                disabled={deleteMutation.isPending}
              >
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
