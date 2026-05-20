import { Mountain } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-cream-50 dark:bg-earth-900 flex items-center justify-center">
      <div className="text-center">
        <Mountain className="w-12 h-12 text-forest-600 animate-float mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
}
