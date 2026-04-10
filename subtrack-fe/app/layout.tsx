import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'SubTrack – Phát hiện lãng phí subscription',
  description: 'Bạn đang mất bao nhiêu tiền mỗi tháng — và làm sao để dừng lại ngay.',
  keywords: ['subscription', 'quản lý chi tiêu', 'tiết kiệm', 'lãng phí'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <Providers>
          {children}
          <Toaster position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
