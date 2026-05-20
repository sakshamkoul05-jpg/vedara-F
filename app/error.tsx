'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-cream-50 dark:bg-earth-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="font-serif text-4xl text-foreground mb-4">Something went wrong</h1>
        <p className="text-muted-foreground mb-8">We apologize for the inconvenience. Please try again.</p>
        <button
          onClick={reset}
          className="vintage-button-primary"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
