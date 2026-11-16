'use client';

import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ThemeInitializer } from '@/components/layout/ThemeInitializer';
import { ScrollProgress } from '@/components/animations/ScrollProgress';
import { Toaster } from 'react-hot-toast';

const FogParticles = dynamic(() => import('@/components/animations/FogParticles').then(m => ({ default: m.FogParticles })), { ssr: false });
const ParallaxCursor = dynamic(() => import('@/components/animations/ParallaxCursor').then(m => ({ default: m.ParallaxCursor })), { ssr: false });
const ChatBot = dynamic(() => import('@/components/chatbot/ChatBot').then(m => ({ default: m.ChatBot })), { ssr: false });
const TripPlanner = dynamic(() => import('@/components/public/TripPlanner').then(m => ({ default: m.TripPlanner })), { ssr: false });
const RevealOnScroll = dynamic(() => import('@/components/animations/RevealOnScroll').then(m => ({ default: m.RevealOnScroll })), { ssr: false });

export function ClientBody({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isEmployee = pathname.startsWith('/employee');
  const isBooking = pathname === '/booking' || pathname.startsWith('/booking/');

  if (isAdmin || isEmployee) {
    return (
      <>
        <ThemeInitializer />
        <RevealOnScroll />
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
            success: { iconTheme: { primary: '#fefcf5', secondary: '#2d5536' } },
            error: { style: { background: '#7f1d1d', color: '#fefcf5' } },
          }}
        />
        {children}
      </>
    );
  }

  return (
    <>
      <ThemeInitializer />
      <ScrollProgress />
      <FogParticles />
      <ParallaxCursor />
      <RevealOnScroll />
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
      <ChatBot />
      {/* The planner used to be switched off by a settings fetch to the old
          Railway backend, which no longer exists — the request was blocked by
          CSP on every page load and could only ever fail, so the flag could
          never turn it off anyway. Rendered unconditionally everywhere except
          the booking flow: it is pinned to the bottom-left of the viewport and
          sat on top of the reservation form's own controls (the Adults select),
          which made part of the form unclickable on desktop. Someone already
          mid-booking has no use for a trip planner either. */}
      {!isBooking && <TripPlanner />}
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
          success: { iconTheme: { primary: '#fefcf5', secondary: '#2d5536' } },
          error: { style: { background: '#7f1d1d', color: '#fefcf5' } },
        }}
      />
    </>
  );
}
