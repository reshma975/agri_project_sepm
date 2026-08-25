import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/helpers';
import {
  Building2,
  Tag,
  ExternalLink,
  Sparkles,
  Calendar,
  CheckCircle2,
  Search,
  MapPin,
  ShieldCheck,
  Award,
  ArrowLeft
} from 'lucide-react';

export default function GovtUpdatesPage() {
  const [updates, setUpdates] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = [
    'All',
    'Farmer Schemes',
    'Financial Assistance',
    'Crop Insurance',
    'Fertilizer',
    'Agriculture',
  ];

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      const params = { crop: 'Paddy', state: 'Andhra Pradesh' };
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;

      const res = await apiClient.get('/government-updates', { params });
      if (res.data.success) {
        setUpdates(res.data.updates);
        setRecommended(res.data.recommended || []);
      }
    } catch (err) {
      console.error('Error fetching government updates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, [selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Back Navigation */}
      <div>
        <Link
          to="/farmer/dashboard"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/30 transition-all mb-3 shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Building2 className="w-7 h-7 text-emerald-400" />
          <span>Government Benefits, Policies & Schemes</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
          Official announcements from the Ministry of Agriculture and Andhra Pradesh Rythu Seva Departments.
        </p>
      </div>

      {/* Section 42: Personalized "Recommended for You" Banner */}
      {recommended.length > 0 && selectedCategory === 'All' && !searchQuery && (
        <div className="bg-[#06151a]/95 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4 border border-slate-700">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-300">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Recommended for You (Based on Paddy Crop & Andhra Pradesh)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommended.map((rec) => (
              <div
                key={rec._id}
                className="bg-[#030b0e] p-4 sm:p-5 rounded-2xl border border-slate-700 space-y-2 hover:border-teal-400 transition-all shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-teal-300 bg-[#06151a] px-2.5 py-0.5 rounded-full uppercase border border-slate-700">
                    {rec.category}
                  </span>
                  <span className="text-[11px] text-slate-300">
                    Deadline: {rec.deadline || 'Ongoing'}
                  </span>
                </div>
                <h4 className="font-extrabold text-base text-white">{rec.title}</h4>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {rec.description}
                </p>
                <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-700">
                  <span className="text-[11px] text-slate-400">Source: {rec.source}</span>
                  <a
                    href={rec.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-teal-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    Official Portal <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="glass-card rounded-3xl p-5 bg-[#06151a]/95 space-y-4 border border-slate-700 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-teal-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search schemes, subsidies, fertilizers, or insurance announcements..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#030b0e] border border-slate-700 text-white rounded-xl focus:border-teal-400 outline-none placeholder:text-slate-500 font-bold"
            />
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-700">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-[#030b0e] hover:bg-[#0c242c] text-slate-300 border border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Schemes Grid */}
      {loading ? (
        <LoadingSpinner message="Loading government scheme updates..." />
      ) : updates.length === 0 ? (
        <div className="text-center py-12 p-4 bg-[#06151a]/90 rounded-3xl border border-slate-700 text-slate-300 text-xs shadow-xl">
          No announcements found matching this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {updates.map((item) => (
            <div
              key={item._id}
              className="glass-card bg-[#06151a]/95 rounded-3xl p-6 border border-slate-700 flex flex-col justify-between space-y-4 hover:border-teal-400 transition-all shadow-xl"
            >
              <div className="space-y-3">
                {/* Meta header */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-300 bg-[#030b0e] px-2.5 py-0.5 rounded-full border border-slate-700">
                    <Tag className="w-3 h-3 text-teal-400" />
                    {item.category}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(item.publishedDate)}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-white leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {item.description}
                </p>

                {/* Key Benefits List */}
                {item.keyBenefits?.length > 0 && (
                  <div className="p-3.5 bg-[#030b0e] rounded-2xl border border-slate-700 space-y-1.5 text-xs">
                    <strong className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                      Key Scheme Benefits:
                    </strong>
                    {item.keyBenefits.map((b, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-2 text-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Source and official notification link */}
              <div className="pt-4 border-t border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Official Source</span>
                  <p className="text-[11px] font-semibold text-slate-300">{item.source}</p>
                </div>

                <a
                  href={item.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 btn-glow-primary text-slate-950 font-black rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 text-xs flex-shrink-0 cursor-pointer"
                >
                  <span>Read Official Notification</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
