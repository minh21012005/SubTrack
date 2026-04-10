'use client';

import { motion } from 'framer-motion';
import { formatVND, categoryLabel, billingCycleLabel } from '@/lib/utils';
import BrandLogo from '@/components/ui/BrandLogo';
import type { Preset } from '@/lib/types';
import { Check } from 'lucide-react';

interface PresetGridProps {
  presets: Preset[];
  selectedId?: string;
  onSelect: (preset: Preset) => void;
  filterCategory?: string;
}

export default function PresetGrid({ presets, selectedId, onSelect, filterCategory }: PresetGridProps) {
  const filtered = filterCategory
    ? presets.filter((p) => p.category === filterCategory)
    : presets;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
      gap: 10,
    }}>
      {filtered.map((preset, i) => {
        const isSelected = preset.id === selectedId;
        return (
          <motion.button
            key={preset.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: isSelected ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ delay: i * 0.02, duration: 0.2 }}
            onClick={() => onSelect(preset)}
            style={{
              background: isSelected ? 'var(--primary-light)' : '#fff',
              border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '14px 12px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'var(--transition)',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)';
                (e.currentTarget as HTMLElement).style.background = 'var(--bg)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLElement).style.background = '#fff';
              }
            }}
          >
            {isSelected && (
              <div style={{
                position: 'absolute', top: 8, right: 8,
                width: 20, height: 20, borderRadius: '50%',
                background: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Check size={12} color="white" />
              </div>
            )}

            <div style={{ marginBottom: 8 }}>
              <BrandLogo name={preset.name} fallbackColor={preset.color} size={36} />
            </div>

            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
              {preset.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
              {categoryLabel(preset.category)}
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: isSelected ? 'var(--primary)' : 'var(--text-secondary)' }}>
              {formatVND(preset.defaultPrice)}/{preset.billingCycle === 'MONTHLY' ? 'tháng' : billingCycleLabel(preset.billingCycle)}
            </div>
            {preset.vnService && (
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-green)', marginTop: 4, fontWeight: 600 }}>
                🇻🇳 Việt Nam
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
