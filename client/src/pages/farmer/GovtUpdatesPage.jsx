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
  ArrowLeft,
  Newspaper,
  RefreshCw,
  AlertCircle,
  Globe,
  Clock,
  User,
  ShieldCheck,
  Info,
} from 'lucide-react';

export default function GovtUpdatesPage() {
  // Active Tab: 'news' (News API) or 'schemes' (Official MongoDB schemes)
  const [activeTab, setActiveTab] = useState('news');

  // --- State for Live Agriculture & Farmer News (News API) ---
  const [newsList, setNewsList] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);
  const [newsSearchQuery, setNewsSearchQuery] = useState('');
  const [newsTopic, setNewsTopic] = useState('All');

  // --- State for FarmSetu Official Government Updates (MongoDB) ---
  const [updates, setUpdates] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [schemesSearchQuery, setSchemesSearchQuery] = useState('');
  const [schemesLoading, setSchemesLoading] = useState(true);
  const [schemesError, setSchemesError] = useState(null);

  // Quick topics for Live News filter
  const newsTopics = [
    { label: 'All Updates', query: '' },
    { label: 'PM-KISAN', query: 'PM-KISAN OR PM KISAN' },
    { label: 'Crop Insurance (PMFBY)', query: 'PMFBY OR crop insurance' },
    { label: 'Subsidies & Financial Aid', query: 'agriculture subsidy OR farm loan' },
    { label: 'MSP & Procurement', query: 'MSP OR minimum support price' },
    { label: 'Fertilizers & Seeds', query: 'fertilizer subsidy OR seed distribution' },
    { label: 'Farmer Welfare', query: 'farmer welfare OR Rythu' },
  ];

  // Categories for Official Schemes
  const schemeCategories = [
    'All',
    'Farmer Schemes',
    'Financial Assistance',
    'Crop Insurance',
    'Fertilizer',
    'Agriculture',
  ];

  // Fetch Live Farmer & Agriculture News from backend (/api/government-updates/news)
  const fetchFarmerNews = async (customQuery = '') => {
    try {
      setNewsLoading(true);
      setNewsError(null);

      const params = {};
      const combinedQuery = [customQuery || '', newsTopic !== 'All' ? newsTopics.find(t => t.label === newsTopic)?.query : '']
        .filter(Boolean)
        .join(' ');

      if (combinedQuery) {
        params.q = combinedQuery;
      }

      const res = await apiClient.get('/government-updates/news', { params });
      if (res.data.success) {
        setNewsList(res.data.news || []);
      } else {
        setNewsError(res.data.message || 'Failed to fetch live agriculture news.');
      }
    } catch (err) {
      console.error('Error fetching live agriculture news:', err);
      const errMsg =
        err.response?.data?.message ||
        'Unable to connect to the news feed. Please verify the server configuration and NEWS_API_KEY in .env.';
      setNewsError(errMsg);
    } finally {
      setNewsLoading(false);
    }
  };

  // Fetch Official FarmSetu Government Updates (/api/government-updates)
  const fetchOfficialUpdates = async () => {
    try {
      setSchemesLoading(true);
      setSchemesError(null);
      const params = { crop: 'Paddy', state: 'Andhra Pradesh' };
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (schemesSearchQuery) params.search = schemesSearchQuery;

      const res = await apiClient.get('/government-updates', { params });
      if (res.data.success) {
        setUpdates(res.data.updates || []);
        setRecommended(res.data.recommended || []);
      }
    } catch (err) {
      console.error('Error fetching government updates:', err);
      setSchemesError(err.response?.data?.message || 'Failed to load official government updates.');
    } finally {
      setSchemesLoading(false);
    }
  };

  // Load News on mount and when newsTopic changes
  useEffect(() => {
    if (activeTab === 'news') {
      fetchFarmerNews(newsSearchQuery);
    }
  }, [newsTopic, activeTab]);

  // Load Official Schemes on mount and when category/search changes
  useEffect(() => {
    if (activeTab === 'schemes') {
      fetchOfficialUpdates();
    }
  }, [selectedCategory, schemesSearchQuery, activeTab]);

  // Handle News Search submit
  const handleNewsSearchSubmit = (e) => {
    e.preventDefault();
    fetchFarmerNews(newsSearchQuery);
  };

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Building2 className="w-7 h-7 text-emerald-400" />
              <span>Farmer & Agriculture Government Updates</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
              Real-time media reports, nationwide welfare policies, subsidies, and verified government portals.
            </p>
          </div>
        </div>
      </div>

      {/* Main Section Tabs: Live News vs Official Schemes */}
      <div className="flex flex-wrap items-center gap-3 p-1.5 bg-[#06151a]/95 rounded-2xl border border-slate-700 shadow-lg">
        <button
          onClick={() => setActiveTab('news')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex-1 justify-center sm:flex-initial ${
            activeTab === 'news'
              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
              : 'text-slate-300 hover:text-white hover:bg-[#0c242c]'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>Latest Farmer & Agriculture News</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </button>

        <button
          onClick={() => setActiveTab('schemes')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex-1 justify-center sm:flex-initial ${
            activeTab === 'schemes'
              ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
              : 'text-slate-300 hover:text-white hover:bg-[#0c242c]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>FarmSetu Official Schemes & Portals</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#030b0e] text-teal-300 border border-slate-700">
            Verified
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION A: LATEST FARMER & AGRICULTURE NEWS (LIVE NEWS API)               */}
      {/* ========================================================================= */}
      {activeTab === 'news' && (
        <div className="space-y-6">
          {/* Informational banner about News Aggregation */}
          <div className="bg-[#06151a]/95 rounded-3xl p-5 sm:p-6 border border-slate-700 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-2xl bg-teal-950/80 border border-teal-500/30 text-teal-400 mt-0.5">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                    Latest Farmer & Agriculture Updates
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                    Live news updates on farmer welfare schemes, PM-KISAN instalments, PMFBY crop insurance,
                    MSP rates, fertilizer subsidies, and Agriculture Ministry announcements across India.
                  </p>
                </div>
              </div>
              <button
                onClick={() => fetchFarmerNews(newsSearchQuery)}
                disabled={newsLoading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-teal-300 bg-[#030b0e] hover:bg-[#0c242c] border border-slate-700 transition-all cursor-pointer flex-shrink-0 self-end sm:self-center"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${newsLoading ? 'animate-spin text-teal-400' : ''}`} />
                <span>Refresh News</span>
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 text-[11px] text-slate-400">
              <Info className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
              <span>
                News articles are aggregated in real-time from national media publications and agricultural news wires.
                For verified government portal links, switch to the <strong>FarmSetu Official Schemes</strong> tab.
              </span>
            </div>
          </div>

          {/* Search & Topic Filters for News */}
          <div className="glass-card rounded-3xl p-5 bg-[#06151a]/95 space-y-4 border border-slate-700 shadow-xl">
            <form onSubmit={handleNewsSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-teal-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={newsSearchQuery}
                  onChange={(e) => setNewsSearchQuery(e.target.value)}
                  placeholder="Search live news (e.g. PM Kisan 17th instalment, paddy MSP, drought relief, fertilizer subsidy)..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#030b0e] border border-slate-700 text-white rounded-xl focus:border-teal-400 outline-none placeholder:text-slate-500 font-bold"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 btn-glow-primary text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search News</span>
              </button>
            </form>

            {/* Quick Topic Filter Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-700">
              <span className="text-[11px] font-bold text-slate-400 mr-1">Topics:</span>
              {newsTopics.map((topic) => (
                <button
                  key={topic.label}
                  onClick={() => {
                    setNewsTopic(topic.label);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    newsTopic === topic.label
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'bg-[#030b0e] hover:bg-[#0c242c] text-slate-300 border border-slate-700'
                  }`}
                >
                  {topic.label}
                </button>
              ))}
            </div>
          </div>

          {/* News Content State Rendering */}
          {newsLoading ? (
            <LoadingSpinner message="Fetching latest farmer & agriculture updates from across India..." />
          ) : newsError ? (
            <div className="glass-card bg-[#06151a]/95 rounded-3xl p-8 border border-amber-500/30 text-center space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-white">Live News Feed Unavailable</h3>
                <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
                  {newsError}
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => fetchFarmerNews(newsSearchQuery)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry News Feed
                </button>
                <button
                  onClick={() => setActiveTab('schemes')}
                  className="px-4 py-2 bg-[#030b0e] hover:bg-[#0c242c] text-slate-300 font-bold rounded-xl text-xs border border-slate-700 cursor-pointer transition-colors"
                >
                  Browse Official Schemes
                </button>
              </div>
            </div>
          ) : newsList.length === 0 ? (
            <div className="text-center py-12 p-4 bg-[#06151a]/90 rounded-3xl border border-slate-700 text-slate-300 text-xs shadow-xl space-y-2">
              <p className="text-sm font-bold text-white">No articles found matching your query.</p>
              <p className="text-xs text-slate-400">Try broadening your search term or select "All Updates".</p>
              <button
                onClick={() => {
                  setNewsSearchQuery('');
                  setNewsTopic('All');
                }}
                className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-teal-300 bg-[#030b0e] border border-slate-700 hover:bg-[#0c242c] cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {newsList.map((article, idx) => (
                <article
                  key={`${article.url}-${idx}`}
                  className="glass-card bg-[#06151a]/95 rounded-2xl overflow-hidden border border-slate-700/80 flex flex-col justify-between hover:border-teal-400 transition-all shadow-md group"
                >
                  {/* Article Thumbnail Image (Compact Height) */}
                  <div className="relative w-full h-32 bg-[#030b0e] overflow-hidden">
                    {article.urlToImage ? (
                      <img
                        src={article.urlToImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      style={{ display: article.urlToImage ? 'none' : 'flex' }}
                      className="w-full h-full bg-gradient-to-br from-emerald-950/80 via-[#06151a] to-[#030b0e] items-center justify-center flex-col gap-1 p-3 text-center border-b border-slate-800"
                    >
                      <Newspaper className="w-6 h-6 text-teal-400/60" />
                      <span className="text-[10px] font-bold text-slate-400">Agriculture & Scheme Update</span>
                    </div>
                    {/* Source tag overlay */}
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-white bg-[#030b0e]/90 backdrop-blur-md px-2 py-0.5 rounded-full border border-teal-500/30 shadow-xs">
                        <Tag className="w-2.5 h-2.5 text-teal-400" />
                        {article.source}
                      </span>
                    </div>
                  </div>

                  {/* Article Content (Compact Padding & Typography) */}
                  <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      {/* Meta: Topic Badge, Published Date & Author */}
                      <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-400">
                        <span className="inline-flex items-center gap-1 font-bold text-teal-300 bg-teal-950/70 border border-teal-500/30 px-2 py-0.5 rounded-md text-[9px]">
                          <ShieldCheck className="w-2.5 h-2.5 text-teal-400" />
                          {article.topic || 'Scheme'}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5 text-teal-400" />
                            {formatDate(article.publishedAt)}
                          </span>
                          {article.author && (
                            <span className="hidden sm:flex items-center gap-1 text-slate-400 truncate max-w-[100px]" title={article.author}>
                              <User className="w-2.5 h-2.5 text-slate-500" />
                              {article.author}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Headline (2-line clamp for uniform compact cards) */}
                      <h3 className="text-sm font-bold text-white leading-snug group-hover:text-teal-300 transition-colors line-clamp-2">
                        {article.title}
                      </h3>

                      {/* Short Description (2-line clamp) */}
                      <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                        {article.description || 'Click below to read the complete article coverage.'}
                      </p>
                    </div>

                    {/* Footer Action */}
                    <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[110px]">
                        {article.source}
                      </span>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 btn-glow-primary text-slate-950 font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1 text-[11px] cursor-pointer flex-shrink-0"
                      >
                        <span>Read Full Story</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>

          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION B: FARMSETU OFFICIAL GOVERNMENT UPDATES (MONGODB)                 */}
      {/* ========================================================================= */}
      {activeTab === 'schemes' && (
        <div className="space-y-6">
          {/* Personalized "Recommended for You" Banner */}
          {recommended.length > 0 && selectedCategory === 'All' && !schemesSearchQuery && (
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

          {/* Filter & Search Bar for Official Schemes */}
          <div className="glass-card rounded-3xl p-5 bg-[#06151a]/95 space-y-4 border border-slate-700 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-teal-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={schemesSearchQuery}
                  onChange={(e) => setSchemesSearchQuery(e.target.value)}
                  placeholder="Search schemes, subsidies, fertilizers, or insurance announcements..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#030b0e] border border-slate-700 text-white rounded-xl focus:border-teal-400 outline-none placeholder:text-slate-500 font-bold"
                />
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-700">
              {schemeCategories.map((cat) => (
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
          {schemesLoading ? (
            <LoadingSpinner message="Loading official government scheme updates..." />
          ) : schemesError ? (
            <div className="glass-card bg-[#06151a]/95 rounded-3xl p-8 border border-amber-500/30 text-center space-y-4 shadow-xl">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
              <p className="text-xs text-slate-300">{schemesError}</p>
              <button
                onClick={fetchOfficialUpdates}
                className="px-4 py-2 bg-teal-600 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Retry
              </button>
            </div>
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
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Official Source
                      </span>
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
      )}
    </div>
  );
}
