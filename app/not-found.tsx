import Link from 'next/link';
import { Mountain } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream-50 dark:bg-earth-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <Mountain className="w-16 h-16 text-earth-300 mx-auto mb-6" />
        <h1 className="font-serif text-5xl text-foreground mb-2">404</h1>
        <p className="text-muted-foreground mb-8">The path you wandered does not exist.</p>
        <Link href="/" className="vintage-button-primary">
          Return Home
        </Link>
      </div>
    </div>
  );
}
