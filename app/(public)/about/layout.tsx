import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'Discover Vedara Retreat, a boutique mountain stay in Ghiyagi, Jibhi. 7 luxury cottages, 1 alpine studio, in-house café, and soulful Himalayan hospitality.',
  keywords: [
    'boutique stay in Jibhi',
    'luxury cottages Jibhi',
    'Tirthan Valley stay',
    'nature retreat Himachal',
    'boutique resort in Jibhi',
    'luxury stay in Tirthan Valley',
    'jacuzzi cottages in Jibhi',
    'couple friendly stay in Jibhi',
    'mountain retreat Himachal',
    'boutique café stay in Himachal',
  ],
  openGraph: {
    title: 'About Vedara Retreat - Himalayan Boutique Stay in Jibhi',
    description: '7 luxury cottages and 1 alpine studio in Ghiyagi, Jibhi. In-house café, mountain views, and unforgettable experiences.',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
