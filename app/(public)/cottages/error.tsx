'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Phone } from 'lucide-react';

export default function CottageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Cottages page error:', error);
  }, [error]);

  return (
    <section className="pt-32 pb-20 min-h-screen flex items-center justify-center bg-background">
      <div className="vintage-container text-center max-w-lg mx-auto px-4">
        <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-8">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-4">Something Went Wrong</h2>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          Unable to load cottages at the moment. Please contact us directly for availability.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="vintage-button-primary text-sm inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <a
            href="tel:+919118882242"
            className="vintage-button-outline text-sm inline-flex items-center gap-2"
          >
            <Phone className="w-4 h-4" /> Call +91-91188-82242
          </a>
          <Link href="/" className="vintage-button-outline text-sm">
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
