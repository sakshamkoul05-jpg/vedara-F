import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'Discover The Vedara – a boutique mountain stay in Ghiyagi, Jibhi. 7 luxury cottages, in-house café, and soulful Himalayan hospitality.',
  keywords: [
    'boutique stay in Jibhi',
    'luxury cottages Jibhi',
    'Tirthan Valley stay',
    'nature retreat Himachal',
    'boutique resort in Jibhi',
    'luxury stay in Tirthan Valley',
    'jacuzzi cottages in Jibhi',
    'mountain retreat Himachal',
    'boutique café stay in Himachal',
  ],
  openGraph: {
    title: 'About The Vedara – Himalayan Boutique Stay in Jibhi',
    description: '7 luxury cottages in Ghiyagi, Jibhi. In-house café, mountain views, and unforgettable experiences.',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
