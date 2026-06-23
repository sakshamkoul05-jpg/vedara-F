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
      <div className="rounded p-5 animate-pulse" style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-stone)' }}>
        <div className="h-4 rounded w-1/3 mb-3" style={{ background: 'var(--clr-stone)' }} />
        <div className="h-8 rounded w-1/2 mb-4" style={{ background: 'var(--clr-stone)' }} />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 rounded flex-1" style={{ background: 'var(--clr-stone)' }} />
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
      className="rounded p-5"
      style={{ background: 'var(--clr-surface)', border: '1px solid var(--clr-stone)' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Jibhi, Himachal</p>
          <div className="flex items-end gap-2">
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 300, color: 'var(--clr-text)' }}>{weather.temp}°</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)', marginBottom: '6px' }}>Feels {weather.feelsLike}°</span>
          </div>
        </div>
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <IconComponent style={{ width: '2.5rem', height: '2.5rem', color: 'var(--clr-saffron)' }} />
        </motion.div>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)', marginBottom: '16px' }}>{weather.condition}</p>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="flex items-center gap-1.5" style={{ color: 'var(--clr-text-muted)' }}>
          <Droplets style={{ width: '0.875rem', height: '0.875rem' }} />
          <span style={{ fontSize: '0.75rem' }}>{weather.humidity}%</span>
        </div>
        <div className="flex items-center gap-1.5" style={{ color: 'var(--clr-text-muted)' }}>
          <Wind style={{ width: '0.875rem', height: '0.875rem' }} />
          <span style={{ fontSize: '0.75rem' }}>{weather.windSpeed} km/h</span>
        </div>
        <div className="flex items-center gap-1.5" style={{ color: 'var(--clr-text-muted)' }}>
          <Eye style={{ width: '0.875rem', height: '0.875rem' }} />
          <span style={{ fontSize: '0.75rem' }}>{weather.visibility} km</span>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--clr-stone)', paddingTop: '12px' }}>
        <div className="flex gap-1.5">
          {weather.forecast.map((f, i) => {
            const FIcon = weatherIcons[f.icon] || Cloud;
            return (
              <div key={i} className="flex-1 text-center rounded py-2" style={{ background: 'rgba(201,148,58,0.06)' }}>
                <p style={{ fontSize: '0.6rem', color: 'var(--clr-text-muted)', marginBottom: '4px' }}>{f.day}</p>
                <FIcon style={{ width: '0.875rem', height: '0.875rem', color: 'var(--clr-saffron)', margin: '0 auto 4px' }} />
                <p style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--clr-text)' }}>{f.temp}°</p>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
