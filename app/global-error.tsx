'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { Sentry.captureException(error); }, [error]);

  return (
    <div className="min-h-screen bg-alabaster flex items-center justify-center p-8">
      <div className="vintage-card p-8 max-w-md text-center">
        <h2 className="font-serif text-2xl font-bold text-foreground mb-4">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">An unexpected error occurred. Our team has been notified.</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} className="bg-gold-600 hover:bg-gold-700">Try Again</Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>Go Home</Button>
        </div>
      </div>
    </div>
  );
}
