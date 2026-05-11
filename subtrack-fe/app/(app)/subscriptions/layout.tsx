import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Danh sách Subscription',
  description: 'Quản lý toàn bộ các gói đăng ký dịch vụ của bạn tại một nơi duy nhất.',
};

export default function SubscriptionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
