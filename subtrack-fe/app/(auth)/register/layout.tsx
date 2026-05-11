import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đăng ký tài khoản',
  description: 'Tham gia SubTrack ngay hôm nay để bắt đầu tiết kiệm tiền từ các subscription lãng phí.',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
