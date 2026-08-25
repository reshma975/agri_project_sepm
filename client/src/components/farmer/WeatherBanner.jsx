import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { CloudRain, Wind, Droplets, AlertTriangle, Sparkles, MapPin, ArrowRight, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';

const formatShortLocation = (loc) => {
  if (!loc) return 'Vijayawada';
  const parts = loc.split(',').map((p) => p.trim()).filter(Boolean);
  let first = parts[0] || 'Vijayawada';
  first = first.replace(/\bvillage\b/gi, '').replace(/\bmandal\b/gi, '').trim();
  if (!first) first = parts[0] || 'Vijayawada';
  return first
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

export default function WeatherBanner({ location = 'Vijayawada, Andhra Pradesh' }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/weather?location=${encodeURIComponent(location)}`);
      if (res.data.success) {
        setWeather(res.data.weather);
      }
    } catch (err) {
      console.error('Error fetching weather:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [location]);

  if (loading || !weather) {
    return (
      <div className="w-full bg-gradient-to-r from-forest-900 via-forest-800 to-emerald-950 text-white rounded-3xl p-6 shadow-card animate-pulse">
        <div className="h-6 w-48 bg-white/20 rounded-lg mb-4"></div>
        <div className="h-10 w-full max-w-lg bg-white/20 rounded-lg mb-4"></div>
        <div className="h-8 w-64 bg-white/20 rounded-lg"></div>
      </div>
    );
  }

  const isSevere = weather.alertType === 'SEVERE';

  return (
    <div
      className={`w-full rounded-3xl p-6 sm:p-7 shadow-xl transition-all relative overflow-hidden text-white border border-slate-700 ${
        isSevere
          ? 'bg-gradient-to-br from-amber-950 via-rose-950 to-[#06151a]'
          : 'bg-gradient-to-br from-[#07242c] via-[#06181e] to-[#040e12]'
      }`}
    >
      {/* Decorative Glow Elements */}
      <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-1/3 bottom-0 translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-5">
        {/* Top Header: Location + Status Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-emerald-300 font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-white">{formatShortLocation(weather.location)}</span>
            <span className="text-white/40">•</span>
            <span className="text-emerald-200">{weather.expectedTime || 'Next 24-48 hours clear'}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Live Agricultural Advisory</span>
          </div>
        </div>

        {/* 1. CONCISE IMPACTFUL ADVISORY QUOTE */}
        <div className="relative pl-3.5 border-l-3 border-teal-400 py-0.5">
          <div className="flex items-center gap-2.5">
            <Quote className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-tight leading-snug">
              {isSevere && <AlertTriangle className="w-4 h-4 text-amber-400 inline mr-1.5 -mt-0.5 animate-bounce" />}
              {weather.comment}
            </h2>
          </div>
        </div>

        {/* 2. SMALLER COMPACT WEATHER STATS & TEMPERATURE (BELOW QUOTE) */}
        <div className="pt-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-t border-white/10">
          {/* Temperature & Condition Capsule */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15">
            <span className="text-3xl sm:text-4xl filter drop-shadow">{weather.emoji}</span>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {weather.temperature}°C
                </span>
                <span className="text-xs font-bold text-emerald-200 bg-emerald-500/20 px-2 py-0.5 rounded-lg border border-emerald-400/20">
                  {weather.condition}
                </span>
              </div>
              <span className="text-[11px] text-slate-300">Feels like {weather.feelsLike || (parseInt(weather.temperature) + 1)}°C</span>
            </div>
          </div>

          {/* Quick Metrics Bar: Humidity, Rain Chance, Wind */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <div className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 transition-colors px-3 py-2 rounded-xl border border-white/10">
              <Droplets className="w-4 h-4 text-sky-300" />
              <span className="text-slate-300">Humidity:</span>
              <strong className="text-white font-bold">{weather.humidity}%</strong>
            </div>

            <div className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 transition-colors px-3 py-2 rounded-xl border border-white/10">
              <CloudRain className="w-4 h-4 text-cyan-300" />
              <span className="text-slate-300">Rain:</span>
              <strong className="text-white font-bold">{weather.rainProbability}</strong>
            </div>

            <div className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 transition-colors px-3 py-2 rounded-xl border border-white/10">
              <Wind className="w-4 h-4 text-teal-300" />
              <span className="text-slate-300">Wind:</span>
              <strong className="text-white font-bold">{weather.windSpeed}</strong>
            </div>
          </div>

          {/* 5-Day Forecast CTA Button */}
          <Link
            to="/farmer/weather"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-forest-950 text-xs font-bold rounded-xl shadow-md transition-all hover:scale-[1.02] flex-shrink-0"
          >
            <span>5-Day Forecast</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

