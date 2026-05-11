import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Phân tích & Xu hướng',
  description: 'Theo dõi xu hướng chi tiêu subscription của bạn qua từng tháng.',
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
