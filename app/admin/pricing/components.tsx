'use client';

import { useState } from 'react';
import { Loader2, Check } from 'lucide-react';

/**
 * Small building blocks shared by the pricing tabs.
 *
 * The editors all follow the same shape: change a value, it saves on blur, and
 * the field reports success or failure inline. Nothing here holds a draft that
 * could be lost by navigating away.
 */

export function Section({
  title,
  description,
  specRef,
  children,
  actions,
}: {
  title: string;
  description?: string;
  specRef?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="bg-card border border-border rounded-2xl p-5 md:p-6 mb-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="font-serif text-xl text-foreground flex items-center gap-2">
            {title}
            {specRef && (
              <span className="text-[10px] font-sans uppercase tracking-wider text-muted-foreground border border-border rounded px-1.5 py-0.5">
                {specRef}
              </span>
            )}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{description}</p>
          )}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

/**
 * A field that commits on blur (or Enter) and shows what happened.
 * Reverts to the last known-good value when the save is rejected.
 */
export function SavingInput({
  value,
  onSave,
  type = 'text',
  className = '',
  disabled,
  min,
  max,
  step,
  prefix,
  suffix,
  ariaLabel,
  placeholder,
}: {
  value: string | number;
  onSave: (next: string) => Promise<void>;
  type?: 'text' | 'number' | 'date';
  className?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  ariaLabel?: string;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState(String(value ?? ''));
  const [state, setState] = useState<SaveState>('idle');
  const [message, setMessage] = useState('');

  // Keep in step with the server when the parent reloads the config.
  const [lastProp, setLastProp] = useState(value);
  if (lastProp !== value && state !== 'saving') {
    setLastProp(value);
    setDraft(String(value ?? ''));
  }

  const commit = async () => {
    if (draft === String(value ?? '')) {
      setState('idle');
      return;
    }
    setState('saving');
    setMessage('');
    try {
      await onSave(draft);
      setState('saved');
      setTimeout(() => setState((s) => (s === 'saved' ? 'idle' : s)), 1500);
    } catch (err: any) {
      setState('error');
      setMessage(err?.message ?? 'Could not save');
      setDraft(String(value ?? ''));
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center">
        {prefix && <span className="text-xs text-muted-foreground mr-1">{prefix}</span>}
        <input
          type={type}
          value={draft}
          disabled={disabled || state === 'saving'}
          aria-label={ariaLabel}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            if (e.key === 'Escape') {
              setDraft(String(value ?? ''));
              setState('idle');
            }
          }}
          className={`w-full h-9 rounded-lg border bg-background px-2 text-sm text-foreground transition-colors
            ${state === 'error' ? 'border-red-500' : state === 'saved' ? 'border-green-500' : 'border-border'}
            focus:outline-none focus:ring-2 focus:ring-gold-400 disabled:opacity-60`}
        />
        {suffix && <span className="text-xs text-muted-foreground ml-1">{suffix}</span>}
        {state === 'saving' && (
          <Loader2 className="w-3 h-3 animate-spin text-muted-foreground ml-1 shrink-0" />
        )}
        {state === 'saved' && <Check className="w-3 h-3 text-green-600 ml-1 shrink-0" />}
      </div>
      {state === 'error' && message && (
        <p className="text-[11px] text-red-500 mt-1 leading-tight">{message}</p>
      )}
    </div>
  );
}

export function SavingSelect({
  value,
  options,
  onSave,
  className = '',
  ariaLabel,
  disabled,
}: {
  value: string;
  options: { value: string; label: string }[];
  onSave: (next: string) => Promise<void>;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
}) {
  const [state, setState] = useState<SaveState>('idle');
  const [message, setMessage] = useState('');

  const commit = async (next: string) => {
    if (next === value) return;
    setState('saving');
    try {
      await onSave(next);
      setState('saved');
      setTimeout(() => setState((s) => (s === 'saved' ? 'idle' : s)), 1500);
    } catch (err: any) {
      setState('error');
      setMessage(err?.message ?? 'Could not save');
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-1">
        <select
          value={value}
          aria-label={ariaLabel}
          disabled={disabled || state === 'saving'}
          onChange={(e) => commit(e.target.value)}
          className={`w-full h-9 rounded-lg border bg-background px-2 text-sm text-foreground
            ${state === 'error' ? 'border-red-500' : 'border-border'}
            focus:outline-none focus:ring-2 focus:ring-gold-400 disabled:opacity-60`}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {state === 'saving' && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
        {state === 'saved' && <Check className="w-3 h-3 text-green-600" />}
      </div>
      {state === 'error' && message && (
        <p className="text-[11px] text-red-500 mt-1">{message}</p>
      )}
    </div>
  );
}

export function SavingToggle({
  checked,
  onSave,
  label,
  disabled,
}: {
  checked: boolean;
  onSave: (next: boolean) => Promise<void>;
  label: string;
  disabled?: boolean;
}) {
  const [state, setState] = useState<SaveState>('idle');
  const [message, setMessage] = useState('');

  const commit = async () => {
    setState('saving');
    try {
      await onSave(!checked);
      setState('idle');
    } catch (err: any) {
      setState('error');
      setMessage(err?.message ?? 'Could not save');
    }
  };

  return (
    <div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled || state === 'saving'}
        onClick={commit}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-60
          ${checked ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-600'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${checked ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
      {state === 'error' && message && (
        <p className="text-[11px] text-red-500 mt-1">{message}</p>
      )}
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-muted-foreground py-6 text-center border border-dashed border-border rounded-xl">
      {children}
    </p>
  );
}
