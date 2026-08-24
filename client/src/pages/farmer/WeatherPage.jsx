import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  CloudSun,
  Droplets,
  Wind,
  CloudRain,
  AlertTriangle,
  Sparkles,
  MapPin,
  Calendar,
  CheckCircle2,
  Sprout,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';

export default function WeatherPage() {
  const [location, setLocation] = useState('Vijayawada, Andhra Pradesh');
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [location]);

  if (loading) {
    return <LoadingSpinner message="Fetching live agricultural weather forecast..." fullScreen />;
  }

  const isSevere = weather?.alertType === 'SEVERE';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Back Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/farmer/dashboard"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/30 transition-all mb-3 shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <CloudSun className="w-7 h-7 text-emerald-400" />
            <span>Agricultural Weather & Advisory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
            Real-time conditions, rainfall predictions, and field-level spraying advisories.
          </p>
        </div>

        {/* Location Selector */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-slate-200 shadow-xs">
          <MapPin className="w-4 h-4 text-forest-600" />
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
          >
            <option value="Vijayawada, Andhra Pradesh">Vijayawada, AP</option>
            <option value="Guntur, Andhra Pradesh">Guntur, AP</option>
            <option value="Mangalagiri, Andhra Pradesh">Mangalagiri, AP</option>
            <option value="Tenali, Andhra Pradesh">Tenali, AP</option>
          </select>
        </div>
      </div>

      {/* Main Condition Card (Section 38: Good Weather vs Severe Alert) */}
      <div
        className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden ${
          isSevere
            ? 'bg-gradient-to-r from-rose-900 via-amber-900 to-slate-900 border border-rose-500'
            : 'bg-gradient-to-r from-forest-800 via-forest-900 to-emerald-950 border border-forest-700'
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold">
              {isSevere ? (
                <>
                  <ShieldAlert className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>⚠️ Severe Weather Warning</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>☀️ Optimal Farming Conditions</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-5xl sm:text-6xl">{weather?.emoji}</span>
              <div>
                <h2 className="text-4xl sm:text-5xl font-extrabold">{weather?.temperature}°C</h2>
                <p className="text-base text-slate-200 font-semibold">{weather?.condition}</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              {weather?.comment}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-xs">
            <div>
              <span className="text-slate-300 block">Humidity</span>
              <strong className="text-base text-white">{weather?.humidity}%</strong>
            </div>
            <div>
              <span className="text-slate-300 block">Rain Probability</span>
              <strong className="text-base text-white">{weather?.rainProbability}</strong>
            </div>
            <div>
              <span className="text-slate-300 block">Wind Velocity</span>
              <strong className="text-base text-white">{weather?.windSpeed}</strong>
            </div>
            <div>
              <span className="text-slate-300 block">Feels Like</span>
              <strong className="text-base text-white">{weather?.feelsLike || 32}°C</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Field Activity Recommendations */}
      {weather?.advisory && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="glass-card rounded-2xl p-5 border border-teal-500/20 bg-[#06151a]/90 space-y-2 shadow-lg">
            <h4 className="font-black text-sm text-white flex items-center gap-2">
              <Droplets className="w-4 h-4 text-sky-400" />
              <span className="text-sky-300">Irrigation Advisory</span>
            </h4>
            <p className="text-xs text-slate-200 font-medium leading-relaxed">
              {weather.advisory.irrigation}
            </p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-teal-500/20 bg-[#06151a]/90 space-y-2 shadow-lg">
            <h4 className="font-black text-sm text-white flex items-center gap-2">
              <Wind className="w-4 h-4 text-teal-400" />
              <span className="text-teal-300">Pesticide Spraying Guide</span>
            </h4>
            <p className="text-xs text-slate-200 font-medium leading-relaxed">
              {weather.advisory.pesticideSpraying}
            </p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-teal-500/20 bg-[#06151a]/90 space-y-2 shadow-lg">
            <h4 className="font-black text-sm text-white flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-300">Fertilizer Application</span>
            </h4>
            <p className="text-xs text-slate-200 font-medium leading-relaxed">
              {weather.advisory.fertilizerApplication}
            </p>
          </div>
        </div>
      )}

      {/* 5-Day Forecast Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-400" />
          <span>5-Day Agricultural Forecast</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {weather?.forecast?.map((day, idx) => (
            <div
              key={idx}
              className="glass-card rounded-2xl p-4 text-center border border-teal-500/20 bg-[#06151a]/90 space-y-2 shadow-lg hover:border-teal-400/50 transition-all"
            >
              <span className="text-xs font-bold text-teal-300 block">{day.day}</span>
              <span className="text-3xl block my-1">{day.emoji}</span>
              <strong className="text-sm font-black text-white block">{day.temp}</strong>
              <p className="text-xs font-medium text-slate-300">{day.condition}</p>
              <span className="inline-block text-[11px] font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                Rain: {day.rain}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
