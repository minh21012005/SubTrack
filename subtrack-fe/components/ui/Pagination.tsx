'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type PaginationProps = {
  /** 0-based page index */
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  /** Max numbered buttons (excluding prev/next) */
  siblingCount?: number;
};

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
  siblingCount = 5,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const windowSize = Math.max(3, siblingCount);
  let start = Math.max(0, page - Math.floor(windowSize / 2));
  let end = Math.min(totalPages, start + windowSize);
  start = Math.max(0, end - windowSize);
  const pages = Array.from({ length: end - start }, (_, i) => start + i);

  const btnBase: React.CSSProperties = {
    minWidth: 40,
    height: 40,
    borderRadius: 'var(--radius-md)',
    fontWeight: 700,
    fontSize: '0.85rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'var(--transition)',
    border: '1px solid var(--border)',
    background: 'var(--bg-card)',
    color: 'var(--text-secondary)',
    boxShadow: 'var(--shadow-sm)',
  };

  return (
    <motion.nav
      className={className}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Phân trang"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 20,
      }}
    >
      <motion.button
        type="button"
        disabled={page <= 0}
        whileHover={page > 0 ? { scale: 1.02 } : undefined}
        whileTap={page > 0 ? { scale: 0.98 } : undefined}
        onClick={() => onPageChange(page - 1)}
        style={{
          ...btnBase,
          padding: '0 14px',
          gap: 6,
          opacity: page <= 0 ? 0.45 : 1,
          cursor: page <= 0 ? 'not-allowed' : 'pointer',
        }}
      >
        <ChevronLeft size={18} strokeWidth={2.5} />
        <span style={{ fontSize: '0.82rem' }}>Trước</span>
      </motion.button>

      {pages.map((p) => {
        const active = p === page;
        return (
          <motion.button
            key={p}
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onPageChange(p)}
            style={{
              ...btnBase,
              minWidth: 42,
              border: active ? '1.5px solid var(--primary)' : btnBase.border,
              background: active
                ? 'linear-gradient(135deg, var(--primary-light), #EEF2FF)'
                : 'var(--bg-card)',
              color: active ? 'var(--primary)' : 'var(--text-secondary)',
              boxShadow: active ? '0 4px 14px rgba(37, 99, 235, 0.18)' : btnBase.boxShadow,
            }}
            aria-current={active ? 'page' : undefined}
          >
            {p + 1}
          </motion.button>
        );
      })}

      <motion.button
        type="button"
        disabled={page >= totalPages - 1}
        whileHover={page < totalPages - 1 ? { scale: 1.02 } : undefined}
        whileTap={page < totalPages - 1 ? { scale: 0.98 } : undefined}
        onClick={() => onPageChange(page + 1)}
        style={{
          ...btnBase,
          padding: '0 14px',
          gap: 6,
          opacity: page >= totalPages - 1 ? 0.45 : 1,
          cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
        }}
      >
        <span style={{ fontSize: '0.82rem' }}>Sau</span>
        <ChevronRight size={18} strokeWidth={2.5} />
      </motion.button>
    </motion.nav>
  );
}
