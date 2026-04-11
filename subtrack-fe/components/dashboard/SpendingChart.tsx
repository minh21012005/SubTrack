'use client';

import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatVND } from '@/lib/utils';
import { BarChart3 } from 'lucide-react';
import { dashboardApi } from '@/lib/services';
import type { SpendingTrend } from '@/lib/types';

export default function SpendingChart() {
  const { data: snapshots, isLoading } = useQuery({
    queryKey: ['spending-trend'],
    queryFn: () => dashboardApi.getSpendingTrend().then(r => r.data.data),
  });

  const color = '#4F46E5';
  const chartData = (snapshots ?? []).map((s: SpendingTrend) => ({
    name: s.monthYear.replace(/^\d{4}-/, 'T'),
    cost: Number(s.totalCost),
    waste: Number(s.wasteCost),
  }));

  return (
    <div className="card" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: '10px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BarChart3 size={20} color={color} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Xu hướng chi tiêu</h2>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Mức biến động chi phí trong 6 tháng gần nhất</div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ flex: 1, minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Đang tải dữ liệu...
        </div>
      ) : chartData.length === 0 ? (
        <div style={{ flex: 1, minHeight: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: 8 }}>
          <BarChart3 size={40} style={{ opacity: 0.2 }} />
          <p style={{ fontSize: '0.9rem', textAlign: 'center', maxWidth: 300, lineHeight: 1.5 }}>
            Dữ liệu sẽ xuất hiện sau lần snapshot cuối tháng đầu tiên.<br />
            Hệ thống tự động ghi nhận vào 23:55 ngày cuối cùng mỗi tháng.
          </p>
        </div>
      ) : (
        <div style={{ flex: 1, minHeight: 350, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: 'var(--text-muted)' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: 'var(--text-muted)' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} dx={-10} width={60} />
              <Tooltip
                formatter={(value: any, name: any) => {
                  const label = name === 'cost' ? 'Tổng chi phí' : 'Lãng phí';
                  return [formatVND(value || 0), label];
                }}
                labelStyle={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 4 }}
                contentStyle={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)', fontWeight: 600 }}
                itemStyle={{ fontSize: '0.95rem' }}
              />
              <Area type="monotone" dataKey="cost" stroke={color} strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" activeDot={{ r: 6, strokeWidth: 0, fill: color }} />
              <Area type="monotone" dataKey="waste" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorWaste)" activeDot={{ r: 6, strokeWidth: 0, fill: "#EF4444" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
