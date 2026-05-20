import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ChatBot } from '@/components/chatbot/ChatBot';
import { ThemeInitializer } from '@/components/layout/ThemeInitializer';
import { SmoothScroll } from '@/components/layout/SmoothScroll';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Vedara Retreat — Mountain Stories, Crafted for You',
    template: '%s | Vedara Retreat',
  },
  description: 'A cozy mountain retreat with 6 luxury cottages and a premium cafe. Experience slow living in the heart of the mountains.',
  keywords: ['mountain retreat', 'luxury cottages', 'Himachal Pradesh', 'boutique hotel', 'mountain cafe', 'Vedara'],
  openGraph: {
    title: 'Vedara Retreat — Mountain Stories, Crafted for You',
    description: 'A cozy mountain retreat with 6 luxury cottages and a premium cafe.',
    type: 'website',
    locale: 'en_IN',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeInitializer />
        <SmoothScroll>
          <Header />
          <main>{children}</main>
          <Footer />
          <ChatBot />
        </SmoothScroll>
      </body>
    </html>
  );
}
