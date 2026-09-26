'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Globe, Loader2 } from 'lucide-react';
import { LOCALES } from '@/lib/i18n/locales';
import { useLanguage } from '@/lib/i18n/provider';

/**
 * Language picker.
 *
 * Lists each language in its own script, because someone looking for their
 * language is scanning for it as they would write it, not for its English
 * name. The current one is marked rather than being the only thing shown, so
 * changing it does not mean first working out what it currently is.
 */

export function LanguageSwitcher({
  /** Icon only, to sit in a row of icon buttons. */
  iconOnly = false,
  /** Button classes, so a header can match it to its siblings. */
  className,
}: {
  iconOnly?: boolean;
  className?: string;
}) {
  const { locale, setLocale, loading, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('language.choose')}
        // The current language in the tooltip, since the icon alone does not
        // say which one is active.
        title={`${t('language.label')}: ${current.nativeName}`}
        className={
          className ??
          `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors
           text-foreground/80 hover:text-foreground hover:bg-foreground/5`
        }
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
        {iconOnly ? (
          // The code rather than the full name: "EN", "עב", "日本語" would each
          // need a different width, and the row has to stay a row.
          <span className="text-[10px] font-semibold uppercase tracking-wide" dir="ltr">
            {current.code}
          </span>
        ) : (
          <span className="font-medium">{current.nativeName}</span>
        )}
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t('language.choose')}
          // Anchored to the end so it never runs off the right edge of a
          // header, and flipped with the writing direction.
          className="absolute end-0 mt-2 w-56 max-h-80 overflow-y-auto rounded-xl border border-border bg-background shadow-lg z-50 py-1.5"
        >
          {LOCALES.map((option) => {
            const selected = option.code === locale;
            return (
              <button
                key={option.code}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => { setLocale(option.code); setOpen(false); }}
                dir={option.dir}
                className={`w-full flex items-center justify-between gap-3 px-3.5 py-2 text-sm text-start transition-colors ${
                  selected ? 'text-primary font-medium' : 'text-foreground hover:bg-foreground/5'
                }`}
              >
                <span className="truncate">{option.nativeName}</span>
                <span className="flex items-center gap-2 shrink-0">
                  {/* The English name too, so staff and anyone who lands on the
                      wrong language can still find their way back. */}
                  <span className="text-[11px] text-muted-foreground" dir="ltr">{option.name}</span>
                  {selected && <Check className="w-3.5 h-3.5" />}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
