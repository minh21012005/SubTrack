'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { savingGoalApi } from '@/lib/services';
import { formatVND } from '@/lib/utils';
import { Target, Plus, CheckCircle2, PiggyBank, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SavingGoalWidget() {
  const qc = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState<string>('');

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
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            style={{ display: 'flex', gap: 12, marginBottom: 24, overflow: 'hidden' }}
          >
            <input 
              className="input" placeholder="Tên mục tiêu (VD: Mua Macbook)" 
              value={name} onChange={e => setName(e.target.value)} style={{ flex: 1 }} required
            />
            <input 
              className="input" placeholder="Số tiền đích (VNĐ)" type="number" 
              value={target} onChange={e => setTarget(e.target.value)} style={{ width: 180 }} required
            />
            <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
              Lưu
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setIsAdding(false)}>
              Hủy
            </button>
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
                    onClick={() => { if(confirm('Xóa mục tiêu này?')) deleteMutation.mutate(goal.id) }}
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
                    style={{ position: 'absolute', top: -12, right: -12, background: '#10B981', color: 'white', fontSize: '0.75rem', padding: '4px 10px', borderRadius: 16, fontWeight: 800, boxShadow: 'var(--shadow-sm)' }}
                  >
                    Đã hoàn thành! 🎉
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
