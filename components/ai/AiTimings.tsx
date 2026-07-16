'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, CalendarClock, RefreshCw } from 'lucide-react';
import { endpoints } from '@/lib/api';

type State = 'idle' | 'loading' | 'done' | 'error';

const PROMPT =
  'You are the concierge for The Vedara, a boutique retreat in Jibhi, Himachal Pradesh. ' +
  'In under 130 words, give: (1) the best time of year to visit and why, and ' +
  '(2) a sample one-day mountain itinerary with timings from morning to night. ' +
  'Be warm and specific, and use line breaks between the two parts.';

export function AiTimings() {
  const [state, setState] = useState<State>('idle');
  const [reply, setReply] = useState('');

  const ask = useCallback(async () => {
    setState('loading');
    try {
      const res: any = await endpoints.chatbot.chat(PROMPT);
      const text = res?.reply || res?.data?.reply || res?.message || '';
      if (!text) throw new Error('empty');
      setReply(text.trim());
      setState('done');
    } catch {
      setState('error');
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto text-center">
      <p className="eyebrow eyebrow-center mb-4">AI Concierge</p>
      <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">Perfectly Timed Stays</h2>
      <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
        Let our AI concierge suggest the best season to visit and a sample day in the mountains.
      </p>

      <div className="glass-card rounded-3xl p-6 md:p-8 text-left">
        <AnimatePresence mode="wait">
          {state === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-6"
            >
              <div className="w-12 h-12 rounded-full bg-gold-500/15 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-gold-400" />
              </div>
              <p className="text-muted-foreground text-sm">Tap to generate a personalised timing &amp; itinerary suggestion.</p>
              <button onClick={ask} className="vintage-button-primary text-sm px-6 py-3">Ask the AI Concierge</button>
            </motion.div>
          )}

          {state === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-3 py-10 text-muted-foreground"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Consulting the concierge&hellip;</span>
            </motion.div>
          )}

          {state === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center gap-2 mb-3 text-gold-600 dark:text-gold-400">
                <CalendarClock className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em]">Your AI Suggestion</span>
              </div>
              <p className="text-foreground/90 text-sm leading-relaxed whitespace-pre-line">{reply}</p>
              <button
                onClick={ask}
                className="mt-5 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-gold-600 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Regenerate
              </button>
            </motion.div>
          )}

          {state === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-6"
            >
              <p className="text-muted-foreground text-sm mb-4">
                The concierge is momentarily offline. Call us at +91-91188-82242 or message us on WhatsApp.
              </p>
              <button onClick={ask} className="vintage-button-secondary text-sm px-6 py-3">Try again</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
