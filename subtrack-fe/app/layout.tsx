import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: {
    default: 'SubTrack – Phát hiện lãng phí subscription & Tiết kiệm chi phí',
    template: '%s | SubTrack'
  },
  description: 'SubTrack giúp bạn phát hiện các subscription đang lãng phí tiền bạc, quản lý chi tiêu định kỳ và tối ưu hóa ngân sách cá nhân một cách thông minh.',
  keywords: [
    'subscription', 'quản lý chi tiêu', 'tiết kiệm', 'lãng phí', 
    'quản lý tài chính cá nhân', 'theo dõi gói cước', 'hủy subscription', 
    'tiết kiệm tiền', 'chi phí định kỳ'
  ],
  authors: [{ name: 'SubTrack Team' }],
  creator: 'SubTrack Team',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://subtrack.vn',
    title: 'SubTrack – Dừng lãng phí tiền cho các Subscription không dùng tới',
    description: 'Bạn đang mất bao nhiêu tiền mỗi tháng? SubTrack giúp bạn tìm ra và cắt giảm các chi phí đăng ký lãng phí ngay lập tức.',
    siteName: 'SubTrack',
    images: [
      {
        url: 'https://subtrack.vn/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SubTrack - Quản lý Subscription thông minh',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SubTrack – Quản lý & Tiết kiệm chi phí Subscription',
    description: 'Phát hiện lãng phí và quản lý chi tiêu định kỳ thông minh hơn cùng SubTrack.',
    images: ['https://subtrack.vn/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
