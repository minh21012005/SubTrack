'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  formatter?: (val: number) => string;
  className?: string;
}

export default function AnimatedCounter({
  value,
  duration = 1500,
  formatter = (v) => String(Math.round(v)),
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    let raf: number;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = value * eased;
      if (ref.current) {
        ref.current.textContent = formatter(current);
      }
      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      }
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return <span ref={ref} className={className}>{formatter(0)}</span>;
}
