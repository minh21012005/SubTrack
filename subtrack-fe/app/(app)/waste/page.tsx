'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { wasteApi, subscriptionApi } from '@/lib/services';
import { formatVND, categoryLabel } from '@/lib/utils';
import { TrendingDown, Zap, AlertTriangle, Copy, RefreshCw, CheckCircle } from 'lucide-react';
import type { ActionType, WasteItem } from '@/lib/types';
import Link from 'next/link';

export default function WastePage() {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['waste'],
    queryFn: () => wasteApi.analyze().then((r) => r.data.data),
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: ActionType }) =>
      subscriptionApi.action(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waste'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)' }}>Đang phân tích lãng phí...</p>
      </div>
    );
  }

  if (!data) return null;

  const noWaste = data.totalWasteCost === 0 && data.duplicateCategories.length === 0;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Waste Analysis</h1>
          <p className="page-subtitle">Phân tích chi tiết các khoản lãng phí</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => refetch()}>
          <RefreshCw size={14} /> Làm mới
        </button>
      </div>

      {noWaste ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="card" style={{ textAlign: 'center', padding: '64px 32px' }}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}><CheckCircle size={48} strokeWidth={1.5} color="var(--accent-green)" /></div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>Không phát hiện lãng phí!</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto' }}>
            Tất cả subscription của bạn đều đang được sử dụng hiệu quả. Tuyệt vời!
          </p>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Summary banner */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'var(--accent-red-light)',
              border: '1px solid var(--accent-red-light)',
              borderRadius: 'var(--radius-xl)',
              padding: '28px 32px',
              display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center',
            }}
          >
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--accent-red)', fontWeight: 600, marginBottom: 6 }}>
                TỔNG LÃNG PHÍ
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-red)', letterSpacing: '-0.03em' }}>
                ~{formatVND(data.totalWasteCost)}
                <span style={{ fontSize: '1rem', fontWeight: 600 }}>/tháng</span>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--accent-red)', marginTop: 4 }}>
                {data.wastePercentage}% tổng chi tiêu · {formatVND(data.totalWasteCost * 12)}/năm nếu không thay đổi
              </div>
            </div>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <WasteStat label="Không dùng" value={data.unusedItems.length} color="var(--accent-red)" />
              <WasteStat label="Hiếm dùng" value={data.rarelyUsedItems.length} color="var(--accent-orange)" />
              <WasteStat label="Trùng lặp" value={data.duplicateCategories.length} color="var(--accent-yellow)" />
            </div>
          </motion.div>

          {/* Unused subscriptions */}
          {data.unusedItems.length > 0 && (
            <Section
              title={`Không sử dụng (${data.unusedItems.length})`}
              subtitle="100% lãng phí — Nên hủy ngay"
              items={data.unusedItems}
              onAction={(id, action) => actionMutation.mutate({ id, action })}
              loading={actionMutation.isPending}
            />
          )}

          {/* Rarely used */}
          {data.rarelyUsedItems.length > 0 && (
            <Section
              title={`Hiếm khi sử dụng (${data.rarelyUsedItems.length})`}
              subtitle="50% lãng phí — Xem xét cắt giảm"
              items={data.rarelyUsedItems}
              onAction={(id, action) => actionMutation.mutate({ id, action })}
              loading={actionMutation.isPending}
            />
          )}

          {/* Duplicates */}
          {data.duplicateCategories.length > 0 && (
            <div>
              <div style={{ marginBottom: 12 }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Copy size={16} color="var(--accent-orange)" /> Trùng lặp danh mục
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Có thể bạn chỉ cần 1 trong số các subscription này
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.duplicateCategories.map((dup) => (
                  <motion.div key={dup.category} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="card card-sm" style={{ border: '1.5px solid var(--accent-orange)22' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Copy size={14} color="var(--accent-orange)" />
                          {categoryLabel(dup.category)}
                          <span className="badge badge-orange">{dup.count} services</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
                          {dup.subscriptionNames.join(' · ')}
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, color: 'var(--accent-orange)', fontSize: '1.1rem' }}>
                        {formatVND(dup.totalMonthlyCost)}/tháng
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {data.suggestions.length > 0 && (
            <div>
              <div style={{ marginBottom: 12 }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Zap size={16} color="var(--accent-green)" /> Gợi ý tiết kiệm
                </h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.suggestions.map((s) => (
                  <motion.div key={s.subscriptionId} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="card card-sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{s.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.reason}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 600 }}>Tiết kiệm</div>
                        <div style={{ fontWeight: 800, color: 'var(--accent-green)' }}>{formatVND(s.monthlySaving)}/tháng</div>
                      </div>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => actionMutation.mutate({ id: s.subscriptionId, action: 'CANCEL' })}
                        disabled={actionMutation.isPending}
                      >
                        <TrendingDown size={13} /> Hủy ngay
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div style={{ marginTop: 16, padding: '14px 18px', background: 'var(--accent-green-light)', border: '1.5px solid var(--accent-green)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 6 }}><Zap size={16} /> Tổng tiết kiệm nếu hủy tất cả</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-green)' }}>
                    {data.suggestions.length} subscription · {formatVND(data.potentialSavings * 12)}/năm
                  </div>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-green)' }}>
                  {formatVND(data.potentialSavings)}/tháng
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WasteStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '1.75rem', fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--accent-red)' }}>{label}</div>
    </div>
  );
}

function Section({ title, subtitle, items, onAction, loading }: {
  title: string; subtitle: string; items: WasteItem[];
  onAction: (id: string, action: ActionType) => void; loading: boolean;
}) {
  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{title}</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((item) => (
          <motion.div key={item.subscriptionId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="card card-sm" style={{ border: `1.5px solid ${item.usageStatus === 'UNUSED' ? 'var(--accent-red)' : 'var(--accent-orange)'}22` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color || 'var(--primary)', flexShrink: 0 }} />
                  {item.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{item.reason}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 700, color: item.usageStatus === 'UNUSED' ? 'var(--accent-red)' : 'var(--accent-orange)' }}>
                    {formatVND(item.wasteCost)}/tháng
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>từ {formatVND(item.monthlyCost)}</div>
                </div>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => onAction(item.subscriptionId, 'CANCEL')}
                  disabled={loading}
                >
                  Hủy
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
