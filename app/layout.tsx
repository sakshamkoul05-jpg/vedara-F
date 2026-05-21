import type { Metadata } from 'next';
import { Inter, Libre_Caslon_Text } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ChatBot } from '@/components/chatbot/ChatBot';
import { ThemeInitializer } from '@/components/layout/ThemeInitializer';
import { SmoothScroll } from '@/components/layout/SmoothScroll';
import { LanternToggle } from '@/components/animations/LanternToggle';
import { FogParticles } from '@/components/animations/FogParticles';
import { ParallaxCursor } from '@/components/animations/ParallaxCursor';
import { ScrollProgress } from '@/components/animations/ScrollProgress';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const libreCaslon = Libre_Caslon_Text({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-libre-caslon',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vedara.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Vedara — Boutique Stay in Jibhi | Luxury Cottages in Himachal',
    template: '%s | Vedara — Himalayan Boutique Retreat',
  },
  description: 'Vedara is a boutique stay in Jibhi offering luxury cottages, a couple-friendly mountain retreat in Himachal. Book the best hotel in Jibhi for a serene Tirthan Valley stay, nature escape, and boutique café experience.',
  keywords: [
    'boutique stay in Jibhi', 'luxury cottages Jibhi', 'Tirthan Valley stay',
    'nature retreat Himachal', 'boutique resort in Jibhi', 'luxury stay in Tirthan Valley',
    'jacuzzi cottages in Jibhi', 'couple friendly stay in Jibhi', 'mountain retreat Himachal',
    'boutique café stay in Himachal', 'top hotels in Jibhi', 'best hotel in Manali',
    'hotels in Jibhi', 'resorts in Jibhi', 'Himalayan boutique retreat',
    'Jibhi waterfall stay', 'Jalori Pass hotels', 'Serolsar Lake stay',
  ],
  authors: [{ name: 'Vedara Retreat' }],
  creator: 'Vedara Retreat',
  publisher: 'Vedara Retreat',
  formatDetection: { telephone: true },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Vedara — Himalayan Boutique Retreat',
    title: 'Vedara — Boutique Stay in Jibhi | Luxury Cottages, Tirthan Valley',
    description: 'Vedara is a boutique stay in Jibhi offering 6 luxury cottages, bonfire nights, mountain cafe — a couple friendly mountain retreat in Himachal. Book the best hotel in Jibhi.',
    url: siteUrl,
    images: [{ url: `${siteUrl}/images/vedlogo.jpeg`, width: 1200, height: 630, alt: 'Vedara Himalayan Boutique Retreat' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vedara — Boutique Stay in Jibhi | Luxury Cottages',
    description: 'Boutique stay in Jibhi with luxury cottages, couple-friendly resort, and café. Discover Vedara — a Himalayan nature retreat in Tirthan Valley.',
    images: [`${siteUrl}/images/vedlogo.jpeg`],
  },
  alternates: { canonical: siteUrl },
  category: 'travel',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': ' lodgingBusiness',
  name: 'Vedara — Himalayan Boutique Retreat',
  description: 'Boutique stay in Jibhi offering luxury cottages, couple-friendly mountain retreat, and café experience in Himachal Pradesh. Top hotel in Jibhi for Tirthan Valley stays.',
  url: siteUrl,
  telephone: '+91-99999-99999',
  email: 'hello@vedara.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Jibhi',
    addressRegion: 'Himachal Pradesh',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '31.4875',
    longitude: '77.5410',
  },
  image: `${siteUrl}/images/vedlogo.jpeg`,
  priceRange: '₹5,000 - ₹15,000',
  amenityFeature: [
    { '@type': 'LocationFeatureSpecification', name: 'Mountain View' },
    { '@type': 'LocationFeatureSpecification', name: 'Bonfire' },
    { '@type': 'LocationFeatureSpecification', name: 'In-house Café' },
    { '@type': 'LocationFeatureSpecification', name: 'Free WiFi' },
    { '@type': 'LocationFeatureSpecification', name: 'Parking' },
    { '@type': 'LocationFeatureSpecification', name: 'Jacuzzi Cottages' },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    bestRating: '5',
    reviewCount: '120',
  },
  knowsAbout: [
    'Boutique stay in Jibhi', 'Luxury cottages Jibhi', 'Tirthan Valley stay',
    'Nature retreat Himachal', 'Couple friendly stay in Jibhi', 'Mountain retreat Himachal',
    'Best hotel in Manali', 'Top hotels in Jibhi',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${libreCaslon.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <meta name="geo.region" content="IN-HP" />
        <meta name="geo.placename" content="Jibhi" />
        <meta name="geo.position" content="31.4875;77.5410" />
        <meta name="ICBM" content="31.4875, 77.5410" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeInitializer />
        <ScrollProgress />
        <FogParticles />
        <ParallaxCursor />
        <LanternToggle />
        <SmoothScroll>
          <Header />
          <main>{children}</main>
          <Footer />
          <ChatBot />
        </SmoothScroll>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#2d5536',
              color: '#fefcf5',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#fefcf5', secondary: '#2d5536' },
            },
            error: {
              style: { background: '#7f1d1d', color: '#fefcf5' },
            },
          }}
        />
      </body>
    </html>
  );
}
