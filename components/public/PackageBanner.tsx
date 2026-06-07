'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Gift, ExternalLink, X } from 'lucide-react';
import Link from 'next/link';
import { endpoints } from '@/services/api';

export function PackageBanner() {
  const [packages, setPackages] = useState<any[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endpoints.cms.activePackages().then((res: any) => {
      const data = res?.data || res?.packages || [];
      setPackages(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  if (packages.length === 0 || dismissed) return null;

  const allItems = [...packages, ...packages, ...packages];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-amber-800 via-amber-700 to-amber-600 overflow-hidden"
    >
      <div className="relative flex items-center">
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-900/50 shrink-0 relative z-10">
          <Gift className="w-4 h-4 text-amber-200" />
          <span className="text-amber-100 text-xs font-semibold whitespace-nowrap">Offers</span>
        </div>
        <div ref={scrollRef} className="overflow-hidden flex-1 py-2.5">
          <motion.div
            className="flex gap-8 whitespace-nowrap"
            animate={{ x: ['0%', '-33.33%'] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          >
            {allItems.map((pkg, i) => (
              <span key={`${pkg.id}-${i}`} className="inline-flex items-center gap-2 text-amber-100 text-xs">
                <ExternalLink className="w-3 h-3 text-amber-300" />
                {pkg.link ? (
                  <Link href={pkg.link} className="hover:text-white transition-colors font-medium">
                    {pkg.title}
                  </Link>
                ) : (
                  <span className="font-medium">{pkg.title}</span>
                )}
                {pkg.description && (
                  <span className="text-amber-200/70 hidden sm:inline">&ndash; {pkg.description}</span>
                )}
              </span>
            ))}
          </motion.div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 px-3 text-amber-200/60 hover:text-amber-100 transition-colors"
          aria-label="Dismiss offers"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
