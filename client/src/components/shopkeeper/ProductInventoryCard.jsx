import React, { useState } from 'react';
import { Star, Edit2, Trash2, Tag, Layers, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

export default function ProductInventoryCard({ item, onEdit, onDelete, onStatusChange }) {
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const prod = item.productId || {};

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Full':
      case 'In Stock':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Low Stock':
      case 'Low':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Out of Stock':
      case 'Empty':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const statuses = ['Full', 'In Stock', 'Low Stock', 'Out of Stock', 'Empty'];

  return (
    <div className="glass-card rounded-2xl p-4 border border-slate-200 hover:border-forest-400 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Left: Product Image & Details */}
      <div className="flex items-center gap-3.5 w-full sm:w-auto">
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
          <img
            src={item.imageUrl || prod.imageUrl || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80'}
            alt={item.customName || prod.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-sm sm:text-base text-slate-800">
              {item.customName || prod.name}
            </h4>
            {/* Rating */}
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {item.rating || 4.5}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
              <Tag className="w-3 h-3 text-slate-400" />
              {prod.category || 'General'}
            </span>

            {/* Status Dropdown (Wireframe 2: Full / Out of Stock / Low / Empty) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border transition-all ${getStatusBadge(
                  item.status
                )}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {item.status}
                <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
              </button>

              {statusMenuOpen && (
                <div className="absolute left-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-30">
                  {statuses.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        onStatusChange(item, st);
                        setStatusMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-forest-50 hover:text-forest-700 flex items-center justify-between"
                    >
                      <span>{st}</span>
                      {item.status === st && <CheckCircle2 className="w-3.5 h-3.5 text-forest-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Price & Stock values */}
      <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-start border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
        <div className="text-left sm:text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price</span>
          <div className="text-sm sm:text-base font-extrabold text-forest-800">
            {formatCurrency(item.price)}
            <span className="text-xs font-normal text-slate-400">/{item.unit}</span>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Stock Available</span>
          <div className="text-sm sm:text-base font-extrabold text-slate-800 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-forest-600" />
            {item.quantity} {item.unit}
          </div>
        </div>

        {/* Right: Actions (Edit, Delete) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(item)}
            title="Edit Price & Stock"
            className="p-2 text-slate-500 hover:text-forest-700 hover:bg-forest-50 rounded-xl transition-colors border border-slate-200"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            title="Delete Product from Shop"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-slate-200"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
