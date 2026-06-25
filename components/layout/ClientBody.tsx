'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ThemeInitializer } from '@/components/layout/ThemeInitializer';
import { ScrollProgress } from '@/components/animations/ScrollProgress';
import { Toaster } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const FogParticles = dynamic(() => import('@/components/animations/FogParticles').then(m => ({ default: m.FogParticles })), { ssr: false });
const ParallaxCursor = dynamic(() => import('@/components/animations/ParallaxCursor').then(m => ({ default: m.ParallaxCursor })), { ssr: false });
const ChatBot = dynamic(() => import('@/components/chatbot/ChatBot').then(m => ({ default: m.ChatBot })), { ssr: false });
const TripPlanner = dynamic(() => import('@/components/public/TripPlanner').then(m => ({ default: m.TripPlanner })), { ssr: false });
const RevealOnScroll = dynamic(() => import('@/components/animations/RevealOnScroll').then(m => ({ default: m.RevealOnScroll })), { ssr: false });

export function ClientBody({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isEmployee = pathname.startsWith('/employee');
  const [aiPlannerEnabled, setAiPlannerEnabled] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/cms/public-settings`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data?.data?.aiPlannerEnabled === 'false') setAiPlannerEnabled(false);
      })
      .catch(() => {});
  }, []);

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
      <main>{children}</main>
      <Footer />
      <ChatBot />
      {aiPlannerEnabled && <TripPlanner />}
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
