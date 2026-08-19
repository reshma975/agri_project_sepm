import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import { CloudRain, Wind, Droplets, AlertTriangle, Sparkles, MapPin, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

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
      <div className="w-full bg-gradient-to-r from-emerald-800 to-forest-900 text-white rounded-3xl p-6 shadow-card animate-pulse">
        <div className="h-6 w-48 bg-white/20 rounded-lg mb-4"></div>
        <div className="h-10 w-32 bg-white/20 rounded-lg"></div>
      </div>
    );
  }

  const isSevere = weather.alertType === 'SEVERE';

  return (
    <div
      className={`w-full rounded-3xl p-5 sm:p-6 shadow-card transition-all relative overflow-hidden text-white ${
        isSevere
          ? 'bg-gradient-to-r from-amber-900 via-rose-900 to-slate-900 border border-rose-500/40'
          : 'bg-gradient-to-r from-forest-800 via-forest-900 to-emerald-950 border border-forest-700/50'
      }`}
    >
      {/* Background Subtle Accent Pattern */}
      <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Column: Emoji + Condition + Comment */}
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
            <MapPin className="w-3.5 h-3.5" />
            <span>{weather.location}</span>
            <span className="text-white/40">•</span>
            <span className="text-emerald-200">{weather.expectedTime}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-4xl sm:text-5xl">{weather.emoji}</span>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {weather.temperature}°C
                </h3>
                <span className="text-sm font-semibold text-slate-200 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
                  {weather.condition}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 font-medium mt-1 leading-relaxed">
                {isSevere && <AlertTriangle className="w-4 h-4 text-amber-300 inline mr-1 -mt-0.5" />}
                {weather.comment}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Agricultural Stats Chips */}
        <div className="flex flex-wrap md:flex-col items-start gap-2 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-xs">
          <div className="flex items-center gap-2 text-slate-200">
            <Droplets className="w-4 h-4 text-sky-300" />
            <span>Humidity: <strong className="text-white">{weather.humidity}%</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <CloudRain className="w-4 h-4 text-cyan-300" />
            <span>Rain Chance: <strong className="text-white">{weather.rainProbability}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <Wind className="w-4 h-4 text-teal-300" />
            <span>Wind: <strong className="text-white">{weather.windSpeed}</strong></span>
          </div>
          <Link
            to="/farmer/weather"
            className="w-full text-center text-[11px] font-bold text-emerald-300 hover:text-white pt-1 mt-1 border-t border-white/10 transition-colors"
          >
            View 5-Day Forecast →
          </Link>
        </div>
      </div>
    </div>
  );
}
