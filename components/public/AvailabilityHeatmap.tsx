'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

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
    <div className="glass-card rounded-2xl p-5 liquid-gradient">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-alabaster/50 uppercase tracking-wider font-sans mb-1">Availability</p>
          <p className="text-sm font-medium text-alabaster">{cottageNames[selectedCottage]}</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-alabaster/10 transition-colors text-alabaster/60">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-alabaster/70 font-medium min-w-[100px] text-center">{monthName}</span>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-alabaster/10 transition-colors text-alabaster/60">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
        {cottageNames.slice(0, 5).map((name, i) => (
          <button
            key={i}
            onClick={() => setSelectedCottage(i)}
            className={`text-[10px] px-2.5 py-1 rounded-full whitespace-nowrap transition-all ${
              selectedCottage === i
                ? 'bg-gold-500/30 text-gold-300 border border-gold-500/30'
                : 'bg-alabaster/5 text-alabaster/50 hover:bg-alabaster/10 border border-transparent'
            }`}
          >
            {name.split(' ')[0]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-[10px] text-alabaster/40 py-1 font-sans">
            {day}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: 42 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-md bg-alabaster/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-0.5">
          {calendar.map((day, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.005 }}
              className={`aspect-square rounded-md flex items-center justify-center text-[11px] transition-all ${
                !day.isCurrentMonth
                  ? 'text-alabaster/10'
                  : day.isToday
                  ? 'ring-1 ring-gold-500/50 text-gold-400 font-bold'
                  : day.available
                  ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 cursor-pointer'
                  : 'bg-red-500/15 text-red-400/50'
              }`}
            >
              {day.date}
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-alabaster/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30" />
            <span className="text-[10px] text-alabaster/50">Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm bg-red-500/20" />
            <span className="text-[10px] text-alabaster/50">Booked</span>
          </div>
        </div>
        <span className="text-[10px] text-alabaster/40">
          {availableCount}/{totalDays} days free
        </span>
      </div>
    </div>
  );
}
