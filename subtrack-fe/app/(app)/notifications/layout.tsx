import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thông báo',
  description: 'Xem các cảnh báo gia hạn và cập nhật từ SubTrack.',
};

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
