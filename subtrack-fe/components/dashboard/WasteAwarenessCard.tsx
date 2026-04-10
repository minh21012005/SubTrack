import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function WasteAwarenessCard({ 
  percentage = 40,
  estimatedWaste = 200000,
  isPremium = false
}: { 
  percentage?: number;
  estimatedWaste?: number;
  isPremium?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
        border: '1.5px solid #FDA4AF',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 14px rgba(225, 29, 72, 0.08)'
      }}
    >
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ flexShrink: 0, width: 44, height: 44, background: '#FFE4E6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E11D48' }}>
          <AlertCircle size={24} strokeWidth={2} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#BE123C', marginBottom: 4 }}>
            {isPremium ? 'Đang thất thoát tài chính!' : 'Phát hiện rò rỉ tài chính!'}
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#9F1239', marginBottom: 16, lineHeight: 1.5 }}>
            {isPremium ? (
              <>Bạn đang trực tiếp ném qua cửa sổ khoảng <strong>{(estimatedWaste).toLocaleString('vi-VN')}đ/tháng</strong> ({percentage}% tổng chi) cho các app không dùng đến.</>
            ) : (
              <>Trung bình người dùng ném qua cửa sổ khoảng <strong>~{(estimatedWaste).toLocaleString('vi-VN')}đ/tháng</strong> (khoảng {percentage}%). Kiểm tra ngay xem bạn có nằm trong số đó không?</>
            )}
          </p>
          
          <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: 'var(--radius-full)', height: 8, overflow: 'hidden', marginBottom: 16 }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
              style={{ background: '#E11D48', height: '100%', borderRadius: 'var(--radius-full)' }} 
            />
          </div>

          <Link href="/waste" className="btn btn-sm" style={{ background: '#E11D48', color: 'white', border: 'none', fontWeight: 700, padding: '8px 16px' }}>
            Xem chi tiết lãng phí <ArrowRight size={14} style={{ marginLeft: 4 }} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
