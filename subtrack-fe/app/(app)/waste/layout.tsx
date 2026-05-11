import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Phân tích Lãng phí',
  description: 'Tìm ra những subscription bạn ít sử dụng và nhận gợi ý hủy để tiết kiệm tiền.',
};

export default function WasteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
