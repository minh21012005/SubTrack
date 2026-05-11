import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tổng quan',
  description: 'Xem tổng quan chi tiêu subscription và tình trạng lãng phí của bạn.',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
