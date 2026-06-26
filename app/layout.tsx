import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import { ClientBody } from '@/components/layout/ClientBody';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant-garamond',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vedara.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'The Vedara - Himalayan Boutique Retreat | Luxury Stay in Jibhi',
    template: '%s | The Vedara - Himalayan Boutique Retreat',
  },
  description: 'The Vedara is a Himalayan boutique retreat in Jibhi, offering handcrafted luxury cottages, a serene mountain escape, and Café Charade. Book your stay in the heart of Himachal.',
  keywords: [
    'boutique stay in Jibhi', 'luxury cottages Jibhi', 'Tirthan Valley stay',
    'nature retreat Himachal', 'boutique resort in Jibhi', 'luxury stay in Tirthan Valley',
    'mountain retreat Himachal', 'Himalayan boutique retreat',
    'boutique café stay in Himachal', 'top hotels in Jibhi',
    'hotels in Jibhi', 'resorts in Jibhi',
    'Jibhi waterfall stay', 'Jalori Pass hotels', 'Serolsar Lake stay',
    'The Vedara', 'Café Charade',
  ],
  authors: [{ name: 'The Vedara' }],
  creator: 'The Vedara',
  publisher: 'The Vedara',
  formatDetection: { telephone: true },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'The Vedara - Himalayan Boutique Retreat',
    title: 'The Vedara - Himalayan Boutique Retreat | Luxury Stay in Jibhi',
    description: 'The Vedara is a Himalayan luxury retreat in Jibhi with handcrafted cottages, bonfire nights, and Café Charade. Book your mountain escape in Himachal.',
    url: siteUrl,
    images: [{ url: `${siteUrl}/images/vedlogo.jpeg`, width: 1200, height: 630, alt: 'The Vedara - Himalayan Boutique Retreat' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Vedara - Himalayan Boutique Retreat',
    description: 'Himalayan boutique retreat in Jibhi with luxury cottages and Café Charade. Discover The Vedara, a nature retreat in Himachal.',
    images: [`${siteUrl}/images/vedlogo.jpeg`],
  },
  alternates: { canonical: siteUrl },
  category: 'travel',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LodgingBusiness',
  name: 'The Vedara - A Himalayan Boutique Retreat',
  description: 'Himalayan luxury retreat in Jibhi offering handcrafted cottages, Café Charade, and serene nature experiences in Himachal Pradesh.',
  url: siteUrl,
  telephone: '+91-9118882242',
  email: 'vedararetreat@gmail.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Ghiyagi',
    addressLocality: 'Jibhi',
    addressRegion: 'Himachal Pradesh',
    postalCode: '175123',
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
    { '@type': 'LocationFeatureSpecification', name: 'Café Charade' },
    { '@type': 'LocationFeatureSpecification', name: 'Free WiFi' },
    { '@type': 'LocationFeatureSpecification', name: 'Parking' },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    bestRating: '5',
    reviewCount: '120',
  },
  knowsAbout: [
    'Boutique stay in Jibhi', 'Luxury cottages Jibhi', 'Tirthan Valley stay',
    'Nature retreat Himachal', 'Mountain retreat Himachal',
    'The Vedara', 'Café Charade',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorantGaramond.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <meta name="geo.region" content="IN-HP" />
        <meta name="geo.placename" content="Jibhi" />
        <meta name="geo.position" content="31.4875;77.5410" />
        <meta name="ICBM" content="31.4875, 77.5410" />
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </head>
      <body className={`min-h-screen bg-background text-foreground font-sans antialiased ${cormorantGaramond.variable} ${inter.variable}`}>
        <ClientBody>{children}</ClientBody>
      </body>
    </html>
  );
}
