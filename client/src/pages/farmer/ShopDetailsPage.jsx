import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/helpers';
import {
  Store,
  MapPin,
  Star,
  Phone,
  ArrowLeft,
  Tag,
  Package,
  Layers,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function ShopDetailsPage() {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review form
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  const fetchShopDetails = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/shops/${id}`);
      if (res.data.success) {
        setShop(res.data.shop);
        setProducts(res.data.products);
        setReviews(res.data.reviews);
      }
    } catch (err) {
      console.error('Error fetching shop details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopDetails();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmittingReview(true);
    setReviewMessage('');

    try {
      const res = await apiClient.post(`/shops/${id}/reviews`, {
        rating: Number(rating),
        comment,
      });

      if (res.data.success) {
        setReviewMessage('Thank you! Your review has been recorded.');
        setComment('');
        fetchShopDetails();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading shop information..." fullScreen />;
  }

  if (!shop) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <p className="text-sm text-slate-500">Shop not found.</p>
        <Link to="/farmer/shops" className="text-xs font-bold text-forest-700 mt-2 inline-block">
          ← Back to Shops
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <div className="flex items-center gap-2">
        <Link
          to="/farmer/shops"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-forest-800 bg-forest-50 hover:bg-forest-100 border border-forest-200/80 transition-all shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Agricultural Shops
        </Link>
        <Link
          to="/farmer/dashboard"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all"
        >
          Dashboard
        </Link>
      </div>

      {/* Shop Banner & Profile Card */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-200 shadow-md">
        <div className="relative h-64 w-full bg-slate-200">
          <img
            src={shop.imageUrl || 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=1200&q=80'}
            alt={shop.shopName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-6 sm:p-8">
            <div className="text-white space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Verified Agro Dealer
                </span>
                <div className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{shop.ratingAverage?.toFixed(1) || '4.5'}</span>
                  <span className="text-[10px] opacity-80">({shop.ratingCount || 12} reviews)</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                {shop.shopName}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-200 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  {shop.location} • {shop.address}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  {shop.phone || '+91 98480 12345'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Products Inventory */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-teal-400" />
            Available Products & Stock ({products.length})
          </h2>
          <span className="text-xs text-slate-300 font-medium">
            Direct farmer store discovery • No online payments
          </span>
        </div>

        {products.length === 0 ? (
          <div className="p-8 text-center bg-[#06151a]/90 rounded-3xl border border-slate-700 text-slate-300 text-xs shadow-xl">
            No products listed in this store inventory yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((item) => {
              const prod = item.productId || {};

              return (
                <div
                  key={item._id}
                  className="glass-card bg-[#06151a]/95 rounded-3xl p-5 border border-slate-700 hover:border-teal-400 transition-all flex flex-col justify-between shadow-xl group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-900 flex-shrink-0 border border-slate-700">
                        <img
                          src={item.imageUrl || prod.imageUrl || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80'}
                          alt={item.customName || prod.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-base text-white group-hover:text-teal-300 transition-colors truncate">
                          {item.customName || prod.name}
                        </h4>
                        <span className="inline-block text-[11px] font-semibold text-slate-300 bg-[#030b0e] px-2 py-0.5 rounded-md mt-0.5 border border-slate-700">
                          {prod.category || 'General'}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-[#030b0e] rounded-2xl border border-slate-700 flex items-center justify-between shadow-2xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price</span>
                        <span className="text-base font-black text-teal-300">
                          {formatCurrency(item.price)}
                          <span className="text-xs font-normal text-slate-400">/{item.unit}</span>
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            item.status === 'Out of Stock' || item.status === 'Empty'
                              ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                              : item.status === 'Low Stock'
                              ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                              : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {item.status === 'Out of Stock' || item.status === 'Empty'
                            ? '🔴 Out of Stock'
                            : item.status === 'Low Stock'
                            ? '🟠 Low Stock'
                            : `🟢 ${item.status}`}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {prod.description || 'Quality agricultural input certified for crop application.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-700 text-xs text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-teal-400" />
                      In stock: <strong className="text-white">{item.quantity} {item.unit}</strong>
                    </span>
                    <span className="text-amber-300 font-bold flex items-center gap-0.5">
                      ⭐ {item.rating || 4.5}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reviews & Farmer Rating Submission */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 border-t border-slate-700">
        {/* Left: Farmer Reviews List */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-teal-400" />
            Farmer Reviews & Feedback ({reviews.length})
          </h3>

          {reviews.length === 0 ? (
            <p className="text-xs text-slate-300 p-4 bg-[#06151a]/90 rounded-2xl border border-slate-700">
              No farmer reviews yet. Be the first to leave feedback!
            </p>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r._id} className="p-4 bg-[#06151a]/95 rounded-2xl border border-slate-700 shadow-md space-y-1.5">
                  <div className="flex items-center justify-between">
                    <strong className="text-xs sm:text-sm text-white font-bold">{r.farmerName}</strong>
                    <span className="flex items-center gap-1 text-xs text-amber-300 font-bold bg-[#030b0e] px-2.5 py-0.5 rounded-full border border-slate-700">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {r.rating}/5
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Submit Review Form */}
        <div className="lg:col-span-5">
          <div className="bg-[#06151a]/95 rounded-3xl p-6 border border-slate-700 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white">
              Rate This Agricultural Shop
            </h3>

            {reviewMessage && (
              <div className="p-3 bg-emerald-950/60 text-emerald-300 rounded-xl text-xs border border-emerald-800/60 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{reviewMessage}</span>
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    YOUR RATING *
                  </label>
                  <span className="text-[11px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/40">
                    {rating === 5 && '5/5 (Very Good)'}
                    {rating === 4 && '4/5 (Good)'}
                    {rating === 3 && '3/5 (Average)'}
                    {rating === 2 && '2/5 (Fair)'}
                    {rating === 1 && '1/5 (Poor)'}
                  </span>
                </div>

                {/* 5 Compact Rating Buttons with Star & Number */}
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRating(num)}
                      className={`flex-1 py-1.5 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        rating >= num
                          ? 'bg-amber-950/80 text-amber-300 border-amber-500/60 shadow-xs ring-1 ring-amber-500/30'
                          : 'bg-[#030b0e] text-slate-400 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          rating >= num ? 'fill-amber-400 text-amber-400' : 'text-slate-500'
                        }`}
                      />
                      <span>{num}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Your Review / Experience
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share feedback on product quality, availability, and fair pricing..."
                  required
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#030b0e] border border-slate-700 text-white rounded-2xl focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 outline-none transition-all placeholder:text-slate-500"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-2.5 btn-glow-primary text-slate-950 font-black rounded-2xl shadow-md transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4 text-slate-950" />
                {submittingReview ? 'Submitting...' : 'Post Farmer Review'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
