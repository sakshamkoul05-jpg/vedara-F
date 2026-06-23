'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarDay {
  date: number;
  available: boolean;
  isCurrentMonth: boolean;
  isToday: boolean;
}

const cottageNames = ['Monal Haven', 'Koklass Cove', 'Magpie Retreat', 'Whistling Thrush', 'Rufous Retreat', 'Kalij Pheasant', 'Himalayan Bluetail'];

export function AvailabilityHeatmap() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCottage, setSelectedCottage] = useState(0);
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateCalendar();
  }, [currentMonth, selectedCottage]);

  const generateCalendar = () => {
    setLoading(true);
    setTimeout(() => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const daysInPrevMonth = new Date(year, month, 0).getDate();
      const today = new Date();
      const seed = selectedCottage * 7 + month * 3;

      const days: CalendarDay[] = [];

      for (let i = firstDay - 1; i >= 0; i--) {
        days.push({
          date: daysInPrevMonth - i,
          available: false,
          isCurrentMonth: false,
          isToday: false,
        });
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, month, d);
        const dayOfWeek = dateObj.getDay();
        const isPast = dateObj < today && !(dateObj.toDateString() === today.toDateString());
        const hash = (d * 13 + seed * 7 + dayOfWeek * 3) % 10;
        const available = !isPast && hash > 2;

        days.push({
          date: d,
          available,
          isCurrentMonth: true,
          isToday: dateObj.toDateString() === today.toDateString(),
        });
      }

      const remaining = 42 - days.length;
      for (let i = 1; i <= remaining; i++) {
        days.push({
          date: i,
          available: false,
          isCurrentMonth: false,
          isToday: false,
        });
      }

      setCalendar(days);
      setLoading(false);
    }, 300);
  };

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const availableCount = calendar.filter((d) => d.isCurrentMonth && d.available).length;
  const totalDays = calendar.filter((d) => d.isCurrentMonth).length;

  return (
    <div className="rounded p-5" style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-stone)' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Availability</p>
          <p style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--clr-text)' }}>{cottageNames[selectedCottage]}</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-1.5 rounded transition-colors" style={{ color: 'var(--clr-text-muted)' }}>
            <ChevronLeft style={{ width: '1rem', height: '1rem' }} />
          </button>
          <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', fontWeight: 400, minWidth: '100px', textAlign: 'center' }}>{monthName}</span>
          <button onClick={nextMonth} className="p-1.5 rounded transition-colors" style={{ color: 'var(--clr-text-muted)' }}>
            <ChevronRight style={{ width: '1rem', height: '1rem' }} />
          </button>
        </div>
      </div>

      <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
        {cottageNames.slice(0, 5).map((name, i) => (
          <button
            key={i}
            onClick={() => setSelectedCottage(i)}
            className="whitespace-nowrap transition-all"
            style={{
              fontSize: '0.65rem',
              padding: '4px 10px',
              borderRadius: '2px',
              background: selectedCottage === i ? 'rgba(201,148,58,0.15)' : 'transparent',
              color: selectedCottage === i ? 'var(--clr-cedar)' : 'var(--clr-text-muted)',
              border: selectedCottage === i ? '1px solid rgba(201,148,58,0.3)' : '1px solid transparent',
            }}
          >
            {name.split(' ')[0]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-2">
        {weekDays.map((day) => (
          <div key={day} style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--clr-text-muted)', padding: '4px 0' }}>
            {day}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: 42 }).map((_, i) => (
            <div key={i} className="aspect-square rounded animate-pulse" style={{ background: 'var(--clr-stone)' }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-0.5">
          {calendar.map((day, i) => {
            let cellBg = 'transparent';
            let cellColor = 'var(--clr-text-muted)';
            let cellWeight = '400';
            let cellBorder = 'none';

            if (!day.isCurrentMonth) {
              cellColor = 'rgba(107,101,96,0.3)';
            } else if (day.isToday) {
              cellBorder = '1px solid var(--clr-saffron)';
              cellColor = 'var(--clr-saffron)';
              cellWeight = '500';
            } else if (day.available) {
              cellBg = 'rgba(22,163,74,0.08)';
              cellColor = '#16a34a';
            } else {
              cellBg = 'rgba(220,38,38,0.06)';
              cellColor = 'rgba(220,38,38,0.5)';
            }

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.005 }}
                className="aspect-square rounded flex items-center justify-center transition-all"
                style={{ fontSize: '0.7rem', background: cellBg, color: cellColor, fontWeight: cellWeight, border: cellBorder, cursor: day.isCurrentMonth && day.available ? 'pointer' : 'default' }}
              >
                {day.date}
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--clr-stone)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'rgba(22,163,74,0.2)' }} />
            <span style={{ fontSize: '0.65rem', color: 'var(--clr-text-muted)' }}>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'rgba(220,38,38,0.12)' }} />
            <span style={{ fontSize: '0.65rem', color: 'var(--clr-text-muted)' }}>Booked</span>
          </div>
        </div>
        <span style={{ fontSize: '0.65rem', color: 'var(--clr-text-muted)' }}>
          {availableCount}/{totalDays} days free
        </span>
      </div>
    </div>
  );
}
