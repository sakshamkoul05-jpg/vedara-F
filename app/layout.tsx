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

export const metadata: Metadata = {
  title: {
    default: 'Vedara Retreat — Mountain Stories, Crafted for You',
    template: '%s | Vedara Retreat',
  },
  description: 'A cozy mountain retreat with 6 luxury cottages and a premium cafe. Experience slow living in the heart of the mountains.',
  keywords: ['mountain retreat', 'luxury cottages', 'Himachal Pradesh', 'boutique hotel', 'mountain cafe', 'Vedara', 'boutique stay in Jibhi', 'luxury cottages Jibhi', 'Tirthan Valley stay', 'nature retreat Himachal', 'boutique resort in Jibhi', 'luxury stay in Tirthan Valley', 'jacuzzi cottages in Jibhi', 'couple friendly stay in Jibhi', 'mountain retreat Himachal', 'boutique café stay in Himachal'],
  openGraph: {
    title: 'Vedara Retreat — Mountain Stories, Crafted for You',
    description: 'A cozy mountain retreat with 6 luxury cottages and a premium cafe.',
    type: 'website',
    locale: 'en_IN',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${libreCaslon.variable}`} suppressHydrationWarning>
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
