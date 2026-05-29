'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Tag, X } from 'lucide-react';
import { api } from '@/lib/api';

export function CouponBanner() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    api.get('/cms/coupons/active').then((res: any) => setCoupons(res.data || [])).catch(() => {});
  }, []);

  if (coupons.length === 0 || dismissed) return null;

  const getDiscountText = (c: any) => {
    const lines: string[] = [];
    if (c.discountType === 'PERCENTAGE') lines.push(`Up to ${c.discountValue}% OFF`);
    if (c.discountType === 'FIXED') lines.push(`${c.discountValue} OFF`);
    if (c.voucherType === 'CAFE') lines.push('at Cafe');
    if (c.voucherType === 'BOOKING') lines.push('on Stay');
    return lines.join(' ');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-forest-700 via-forest-600 to-earth-600"
    >
      <div className="vintage-container py-2.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Gift className="w-4 h-4 text-clay-200 shrink-0 hidden sm:block" />
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="text-cream-100 text-xs font-medium whitespace-nowrap">Active Offers:</span>
              {coupons.slice(0, 3).map((c: any) => (
                <button
                  key={c.code}
                  onClick={() => {
                    const input = document.querySelector<HTMLInputElement>('[placeholder="Enter coupon code"]');
                    if (input) { input.value = c.code; input.dispatchEvent(new Event('input', { bubbles: true })); input.focus(); }
                  }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-white/15 text-cream-100 border border-cream-200/20 hover:bg-white/25 transition-colors"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {c.code}
                  {c.description && <span className="hidden sm:inline text-cream-200/70">— {c.description}</span>}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 text-cream-200/60 hover:text-cream-100 transition-colors"
            aria-label="Dismiss offers"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
