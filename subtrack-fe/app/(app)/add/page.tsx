'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2, Search } from 'lucide-react';
import { presetApi, subscriptionApi } from '@/lib/services';
import PresetGrid from '@/components/subscription/PresetGrid';
import BrandLogo from '@/components/ui/BrandLogo';
import { categoryLabel, CATEGORIES, BILLING_CYCLES } from '@/lib/utils';
import type { Preset, BillingCycle, UsageStatus } from '@/lib/types';

type Step = 1 | 2 | 3;

export default function AddSubscriptionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>(1);
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchPreset, setSearchPreset] = useState('');

  const [form, setForm] = useState({
    name: '',
    price: '',
    currency: 'VND',
    billingCycle: 'MONTHLY' as BillingCycle,
    nextBillingDate: '',
    category: '',
    usageStatus: 'ACTIVE' as UsageStatus,
    notes: '',
  });

  const [error, setError] = useState('');

  const { data: presets = [] } = useQuery({
    queryKey: ['presets'],
    queryFn: () => presetApi.getAll().then((r) => r.data.data),
  });

  const addMutation = useMutation({
    mutationFn: () =>
      subscriptionApi.add({
        presetId: selectedPreset?.id,
        name: form.name,
        price: Number(form.price),
        currency: form.currency,
        billingCycle: form.billingCycle,
        nextBillingDate: form.nextBillingDate || defaultDate(),
        category: form.category,
        usageStatus: form.usageStatus,
        iconUrl: selectedPreset?.iconUrl,
        color: selectedPreset?.color,
        notes: form.notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      router.push('/dashboard');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Không thể thêm subscription');
    },
  });

  const handlePresetSelect = (preset: Preset) => {
    setSelectedPreset(preset);
    setForm((f) => ({
      ...f,
      name: preset.name,
      price: String(preset.defaultPrice),
      currency: preset.currency,
      billingCycle: preset.billingCycle,
      category: preset.category,
    }));
  };

  const handleSkipPreset = () => {
    setSelectedPreset(null);
    setStep(2);
  };

  const filteredPresets = presets.filter((p) => {
    const matchCat = categoryFilter ? p.category === categoryFilter : true;
    const matchSearch = searchPreset
      ? p.name.toLowerCase().includes(searchPreset.toLowerCase())
      : true;
    return matchCat && matchSearch;
  });

  // Default next billing date to 1 month from now
  const defaultDate = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  };

  const currentNextBillingDate = form.nextBillingDate || defaultDate();

  const canSubmit =
    form.name.trim() &&
    form.price &&
    Number(form.price) > 0 &&
    form.billingCycle &&
    currentNextBillingDate &&
    form.category;

  const STEPS = [
    { n: 1, label: 'Chọn service' },
    { n: 2, label: 'Chi tiết' },
    { n: 3, label: 'Xác nhận' },
  ];

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => router.back()}>
          <ChevronLeft size={16} /> Quay lại
        </button>
        <div>
          <h1 className="page-title">Thêm Subscription</h1>
          <p className="page-subtitle">Chọn service hoặc tự nhập thông tin</p>
        </div>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
        {STEPS.map((s, i) => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: step >= s.n ? 'var(--primary)' : 'var(--border)',
              color: step >= s.n ? 'white' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
              transition: 'var(--transition)',
            }}>
              {s.n}
            </div>
            <span style={{ fontSize: '0.85rem', color: step >= s.n ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: step === s.n ? 600 : 400 }}>
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <div style={{ width: 32, height: 1.5, background: step > s.n ? 'var(--primary)' : 'var(--border)', transition: 'var(--transition)' }} />
            )}
          </div>
        ))}
      </div>

      {/* STEP 1: Preset picker */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="card">
              <h2 style={{ fontWeight: 700, marginBottom: 4 }}>Chọn service phổ biến</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 16 }}>
                Chọn từ danh sách để tự động điền thông tin
              </p>

              {/* Search */}
              <div style={{ position: 'relative', marginBottom: 14 }}>
                <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="form-input"
                  placeholder="Tìm Netflix, Spotify..."
                  style={{ paddingLeft: 34, fontSize: '0.875rem' }}
                  value={searchPreset}
                  onChange={(e) => setSearchPreset(e.target.value)}
                />
              </div>

              {/* Category chips */}
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
                <button className={`chip ${categoryFilter === '' ? 'active' : ''}`} onClick={() => setCategoryFilter('')}>
                  Tất cả
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    className={`chip ${categoryFilter === cat.value ? 'active' : ''}`}
                    onClick={() => setCategoryFilter(cat.value)}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <PresetGrid
                presets={filteredPresets}
                selectedId={selectedPreset?.id}
                onSelect={handlePresetSelect}
              />

              <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
                <button className="btn btn-ghost" onClick={handleSkipPreset}>
                  Nhập thủ công →
                </button>
                <button
                  className="btn btn-primary"
                  disabled={!selectedPreset}
                  onClick={() => setStep(2)}
                >
                  Tiếp tục <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Details form */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="card">
              {selectedPreset && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                  background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)', marginBottom: 20,
                }}>
                  <BrandLogo name={selectedPreset.name} fallbackColor={selectedPreset.color} size={28} />
                  <span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '0.9rem' }}>{selectedPreset.name}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>đã được chọn</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Tên subscription *</label>
                  <input className="form-input" placeholder="Ví dụ: Netflix Premium" value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} autoFocus />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Giá *</label>
                    <input type="number" className="form-input" placeholder="180000" value={form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} min="0" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tiền tệ</label>
                    <select className="form-input" value={form.currency}
                      onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}>
                      <option value="VND">VND (đ)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Chu kỳ *</label>
                    <select className="form-input" value={form.billingCycle}
                      onChange={(e) => setForm((f) => ({ ...f, billingCycle: e.target.value as BillingCycle }))}>
                      {BILLING_CYCLES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ngày gia hạn tiếp *</label>
                    <input type="date" className="form-input"
                      value={form.nextBillingDate || defaultDate()}
                      onChange={(e) => setForm((f) => ({ ...f, nextBillingDate: e.target.value }))} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Danh mục *</label>
                  <select className="form-input" value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                    <option value="">-- Chọn danh mục --</option>
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Tình trạng sử dụng</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['ACTIVE', 'RARELY', 'UNUSED'] as UsageStatus[]).map((status) => {
                      const labels: Record<UsageStatus, string> = { ACTIVE: '✅ Đang dùng', RARELY: '🟡 Hiếm dùng', UNUSED: '🔴 Không dùng' };
                      return (
                        <button key={status}
                          type="button"
                          className={`chip ${form.usageStatus === status ? 'active' : ''}`}
                          onClick={() => setForm((f) => ({ ...f, usageStatus: status }))}>
                          {labels[status]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Ghi chú (tuỳ chọn)</label>
                  <input className="form-input" placeholder="Ví dụ: Share với gia đình" value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
                <button className="btn btn-outline" onClick={() => setStep(1)}>
                  <ChevronLeft size={16} /> Quay lại
                </button>
                <button className="btn btn-primary" disabled={!canSubmit} onClick={() => setStep(3)}>
                  Xem lại <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Confirm */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="card">
              <h2 style={{ fontWeight: 700, marginBottom: 20 }}>Xác nhận thông tin</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {[
                  ['Tên', form.name],
                  ['Giá', `${Number(form.price).toLocaleString('vi-VN')} ${form.currency}`],
                  ['Chu kỳ', BILLING_CYCLES.find(b => b.value === form.billingCycle)?.label || form.billingCycle],
                  ['Gia hạn tiếp', form.nextBillingDate || defaultDate()],
                  ['Danh mục', categoryLabel(form.category)],
                  ['Tình trạng', form.usageStatus === 'ACTIVE' ? 'Đang dùng' : form.usageStatus === 'RARELY' ? 'Hiếm dùng' : 'Không dùng'],
                  ...(form.notes ? [['Ghi chú', form.notes]] : []),
                ].map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{key}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{val}</span>
                  </div>
                ))}
              </div>

              {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

              {form.usageStatus !== 'ACTIVE' && (
                <div className="alert alert-info" style={{ marginBottom: 16 }}>
                  💡 Subscription này sẽ ngay lập tức được tính là <strong>lãng phí</strong> vì tình trạng không phải "Đang dùng".
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between' }}>
                <button className="btn btn-outline" onClick={() => setStep(2)}>
                  <ChevronLeft size={16} /> Chỉnh sửa
                </button>
                <button
                  className="btn btn-primary"
                  disabled={addMutation.isPending}
                  onClick={() => addMutation.mutate()}
                >
                  {addMutation.isPending ? <Loader2 size={16} /> : null}
                  {addMutation.isPending ? 'Đang thêm...' : '✅ Xác nhận thêm'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
