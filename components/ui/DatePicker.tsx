'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  min?: string;
  placeholder?: string;
  className?: string;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function toDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function isDateDisabled(year: number, month: number, day: number, minStr?: string): boolean {
  const d = new Date(year, month, day);
  d.setHours(0, 0, 0, 0);
  if (minStr) {
    const [my, mm, md] = minStr.split('-').map(Number);
    const minDate = new Date(my, mm - 1, md);
    minDate.setHours(0, 0, 0, 0);
    return d < minDate;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

export function DatePicker({ value, onChange, min, placeholder = 'Select date', className = '' }: DatePickerProps) {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    if (value) {
      const [y, m] = value.split('-').map(Number);
      return new Date(y, m - 1);
    }
    return new Date(today.getFullYear(), today.getMonth());
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      const [y, m] = value.split('-').map(Number);
      setViewMonth(new Date(y, m - 1));
    }
  }, [value]);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthName = viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => setViewMonth(new Date(year, month - 1));
  const nextMonth = () => setViewMonth(new Date(year, month + 1));

  const canGoPrev = !(year === today.getFullYear() && month === today.getMonth());

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const display = value
    ? new Date(value + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm rounded-lg border border-[var(--clr-stone)] bg-[var(--clr-surface)] text-[var(--clr-text)] hover:border-[var(--clr-cedar)] transition-colors"
      >
        <Calendar className="w-4 h-4 text-[var(--clr-cedar)] shrink-0" />
        <span className={value ? '' : 'text-[var(--clr-text-muted)]'}>{display || placeholder}</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 bg-[var(--clr-surface)] border border-[var(--clr-stone)] rounded-xl shadow-lg p-3 w-[280px]">
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={prevMonth} disabled={canGoPrev} className="p-1 rounded hover:bg-[var(--clr-stone)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium">{monthName}</span>
            <button type="button" onClick={nextMonth} className="p-1 rounded hover:bg-[var(--clr-stone)] transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="text-center text-[10px] font-medium text-[var(--clr-text-muted)] py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {days.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} />;
              const disabled = isDateDisabled(year, month, day, min);
              const dateStr = toDateString(year, month, day);
              const selected = dateStr === value;
              const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();

              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={disabled}
                  onClick={() => { onChange(dateStr); setOpen(false); }}
                  className={`text-xs py-1.5 rounded-lg transition-all ${
                    disabled
                      ? 'text-[var(--clr-text-muted)] opacity-30 cursor-not-allowed line-through'
                      : selected
                        ? 'bg-[var(--clr-cedar)] text-white font-medium shadow-sm'
                        : isToday
                          ? 'bg-[var(--clr-saffron)]/10 text-[var(--clr-saffron)] font-medium hover:bg-[var(--clr-saffron)]/20'
                          : 'hover:bg-[var(--clr-stone)] text-[var(--clr-text)]'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
