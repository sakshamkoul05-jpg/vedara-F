'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BackButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={cn(
        'flex items-center gap-1.5 text-xs font-medium transition-colors mb-6',
        'text-earth-500 dark:text-cream-400 hover:text-forest-600 dark:hover:text-cream-50',
        className
      )}
    >
      <ArrowLeft className="w-3.5 h-3.5" /> Back
    </button>
  );
}
