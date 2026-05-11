import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đăng nhập',
  description: 'Đăng nhập vào SubTrack để quản lý các gói đăng ký của bạn.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
