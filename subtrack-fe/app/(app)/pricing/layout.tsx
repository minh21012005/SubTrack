import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bảng giá & Nâng cấp Premium',
  description: 'Nâng cấp lên SubTrack Premium để mở khóa toàn bộ tính năng quản lý subscription không giới hạn.',
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
