'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, Thermometer, Eye } from 'lucide-react';

interface WeatherData {
  temp: number;
  feelsLike: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  forecast: { day: string; temp: number; icon: string }[];
}

const weatherIcons: Record<string, typeof Sun> = {
  Clear: Sun,
  Clouds: Cloud,
  Rain: CloudRain,
  Snow: CloudSnow,
  Wind: Wind,
  Mist: Cloud,
  Fog: Cloud,
};

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
        if (!apiKey) {
          setWeather(getMockWeather());
          setLoading(false);
          return;
        }
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=Jibhi,IN&appid=${apiKey}&units=metric`
        );
        const data = await res.json();
        if (data.list) {
          const current = data.list[0];
          const forecast = [0, 8, 16, 24, 32].map((i) => {
            const item = data.list[i] || data.list[data.list.length - 1];
            const date = new Date(item.dt * 1000);
            return {
              day: i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' }),
              temp: Math.round(item.main.temp),
              icon: item.weather[0].main,
            };
          });
          setWeather({
            temp: Math.round(current.main.temp),
            feelsLike: Math.round(current.main.feels_like),
            condition: current.weather[0].main,
            icon: current.weather[0].main,
            humidity: current.main.humidity,
            windSpeed: Math.round(current.wind.speed * 3.6),
            visibility: Math.round(current.visibility / 1000),
            forecast,
          });
        }
      } catch {
        setWeather(getMockWeather());
      }
      setLoading(false);
    };
    fetchWeather();
  }, []);

  function getMockWeather(): WeatherData {
    return {
      temp: 18,
      feelsLike: 16,
      condition: 'Partly Cloudy',
      icon: 'Clouds',
      humidity: 65,
      windSpeed: 12,
      visibility: 10,
      forecast: [
        { day: 'Today', temp: 18, icon: 'Clouds' },
        { day: 'Tomorrow', temp: 20, icon: 'Clear' },
        { day: 'Wed', temp: 16, icon: 'Rain' },
        { day: 'Thu', temp: 17, icon: 'Clouds' },
        { day: 'Fri', temp: 21, icon: 'Clear' },
      ],
    };
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 animate-pulse shadow-[0_1px_3px_rgba(28,43,58,0.04)] border border-[rgba(74,85,104,0.06)]">
        <div className="h-4 bg-white/20 rounded w-1/3 mb-3" />
        <div className="h-8 bg-white/20 rounded w-1/2 mb-4" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-white/10 rounded-lg flex-1" />
          ))}
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const IconComponent = weatherIcons[weather.icon] || Cloud;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(28,43,58,0.04)] border border-[rgba(74,85,104,0.06)]"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-white/50 uppercase tracking-wider font-sans mb-1">Jibhi, Himachal</p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-serif text-white">{weather.temp}°</span>
            <span className="text-sm text-white/60 mb-1.5">Feels {weather.feelsLike}°</span>
          </div>
        </div>
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <IconComponent className="w-10 h-10 text-gold-400" />
        </motion.div>
      </div>

      <p className="text-sm text-white/70 mb-4 font-sans">{weather.condition}</p>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="flex items-center gap-1.5 text-white/60">
          <Droplets className="w-3.5 h-3.5" />
          <span className="text-xs">{weather.humidity}%</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/60">
          <Wind className="w-3.5 h-3.5" />
          <span className="text-xs">{weather.windSpeed} km/h</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/60">
          <Eye className="w-3.5 h-3.5" />
          <span className="text-xs">{weather.visibility} km</span>
        </div>
      </div>

      <div className="border-t border-alabaster/10 pt-3">
        <div className="flex gap-1.5">
          {weather.forecast.map((f, i) => {
            const FIcon = weatherIcons[f.icon] || Cloud;
            return (
              <div key={i} className="flex-1 text-center rounded-lg py-2 bg-white/5">
                <p className="text-[10px] text-white/50 mb-1">{f.day}</p>
                <FIcon className="w-3.5 h-3.5 text-gold-400 mx-auto mb-1" />
                <p className="text-xs text-white font-medium">{f.temp}°</p>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
