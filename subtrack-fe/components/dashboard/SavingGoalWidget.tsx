'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { savingGoalApi } from '@/lib/services';
import { formatVND } from '@/lib/utils';
import { Target, Plus, CheckCircle2, PiggyBank, Trash2, Award } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SavingGoalWidget() {
  const qc = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState<string>('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['saving-goals'],
    queryFn: () => savingGoalApi.getGoals().then(r => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: () => savingGoalApi.createGoal({ name, targetAmount: Number(target) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['saving-goals'] });
      setIsAdding(false);
      setName('');
      setTarget('');
      toast.success('Đã tạo mục tiêu thành công!');
    },
    onError: () => toast.error('Không thể tạo mục tiêu'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => savingGoalApi.deleteGoal(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['saving-goals'] });
      toast.success('Đã xóa mục tiêu');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !target || Number(target) <= 0) return;
    createMutation.mutate();
  };

  if (isLoading) return <div className="card animate-pulse" style={{ height: 160 }} />;

  return (
    <div className="card" style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#ECFEFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PiggyBank size={20} color="#0891B2" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Mục tiêu tiết kiệm</h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tự động tích lũy tiền khi hủy các gói lãng phí</div>
          </div>
        </div>
        {!isAdding && (
          <button className="btn btn-outline btn-sm" onClick={() => setIsAdding(true)}>
            <Plus size={14} /> Thêm Mục tiêu
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              paddingTop: 24,
              paddingBottom: 24,
              marginBottom: 32,
              borderTop: '1px solid var(--border-light)',
              borderBottom: '1px solid var(--border-light)',
            }}
          >
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {/* Name Field */}
              <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Mục tiêu của bạn là gì?</label>
                <div style={{ position: 'relative' }}>
                  <Target size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    placeholder="VD: Mua Macbook, Du lịch..."
                    value={name} onChange={e => setName(e.target.value)}
                    style={{
                      width: '100%', padding: '14px 16px 14px 44px',
                      background: 'var(--bg)', border: '1.5px solid transparent',
                      borderRadius: 'var(--radius-md)', fontSize: '0.95rem', fontWeight: 500,
                      color: 'var(--text-primary)', outline: 'none', transition: 'all 0.2s',
                    }} required
                    onFocus={(e) => { e.target.style.background = '#fff'; e.target.style.borderColor = '#10B981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)'; }}
                    onBlur={(e) => { e.target.style.background = 'var(--bg)'; e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {/* Amount Field */}
              <div style={{ flex: '0 1 280px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Cần tiết kiệm bao nhiêu?</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: '#10B981', fontSize: '1.05rem' }}>₫</div>
                  <input
                    placeholder="0" type="number"
                    value={target} onChange={e => setTarget(e.target.value)}
                    style={{
                      width: '100%', padding: '14px 16px 14px 40px',
                      background: 'var(--bg)', border: '1.5px solid transparent',
                      borderRadius: 'var(--radius-md)', fontSize: '1.05rem', fontWeight: 700,
                      color: '#059669', outline: 'none', transition: 'all 0.2s',
                    }} required
                    onFocus={(e) => { e.target.style.background = '#fff'; e.target.style.borderColor = '#10B981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)'; }}
                    onBlur={(e) => { e.target.style.background = 'var(--bg)'; e.target.style.borderColor = 'transparent'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 4 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setIsAdding(false)}>
                Hủy
              </button>
              <button type="submit" className="btn btn-primary" style={{ background: '#10B981', color: 'white', border: 'none', boxShadow: '0 4px 14px rgba(16,185,129,0.25)' }} disabled={createMutation.isPending}>
                <Plus size={16} /> Bắt đầu tích lũy
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {goals.length === 0 && !isAdding ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
          <Target size={40} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
          <p style={{ fontSize: '0.9rem', marginBottom: 24, maxWidth: 300, lineHeight: 1.5 }}>
            Bạn chưa có mục tiêu nào. Thiết lập một mục tiêu để có động lực cắt giảm lãng phí nhé!
          </p>
          <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
            <Plus size={16} /> Tạo Lọ heo đất đầu tiên
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {goals.map(goal => {
            const percent = Math.min(100, (goal.currentSaved / goal.targetAmount) * 100);
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: goal.achieved ? 'linear-gradient(to right, #ECFDF5, #F0FDF4)' : 'var(--bg)',
                  border: `1px solid ${goal.achieved ? '#34D399' : 'var(--border-light)'}`,
                  borderRadius: 'var(--radius-md)', padding: '20px 24px', position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 8, color: goal.achieved ? '#065F46' : 'inherit' }}>
                    {goal.achieved && <CheckCircle2 size={18} color="#10B981" />}
                    {goal.name}
                  </div>
                  <button
                    onClick={() => setConfirmDeleteId(goal.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 8 }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{formatVND(goal.currentSaved)}</span>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{formatVND(goal.targetAmount)}</span>
                </div>

                <div style={{ height: 10, background: 'var(--border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    style={{ height: '100%', background: goal.achieved ? '#10B981' : 'var(--primary)', borderRadius: 'var(--radius-full)' }}
                  />
                </div>

                {goal.achieved && (
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    style={{ position: 'absolute', top: -12, right: -12, background: '#10B981', color: 'white', fontSize: '0.75rem', padding: '4px 12px', borderRadius: 16, fontWeight: 800, boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    Đã hoàn thành! <Award size={14} />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmDeleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 24,
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              style={{
                background: 'white', borderRadius: 'var(--radius-xl)', padding: 32,
                width: '100%', maxWidth: 400, boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}
            >
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#FEE2E2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Trash2 size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)' }}>Xóa ống heo này?</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.5 }}>
                Mọi mức tích lũy cho mục tiêu này sẽ bị hủy bỏ vĩnh viễn và không thể khôi phục. Bạn có chắc chắn không?
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setConfirmDeleteId(null)}>
                  Giữ lại
                </button>
                <button
                  className="btn btn-danger" style={{ flex: 1 }}
                  onClick={() => {
                    deleteMutation.mutate(confirmDeleteId);
                    setConfirmDeleteId(null);
                  }}
                  disabled={deleteMutation.isPending}
                >
                  Xóa vĩnh viễn
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
