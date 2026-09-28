import React, { useState } from 'react';
import { Edit2, Trash2, Tag, Layers, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

export default function ProductInventoryCard({ item, onEdit, onDelete, onStatusChange }) {
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const prod = item.productId || {};

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Full':
      case 'In Stock':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
      case 'Low Stock':
      case 'Low':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/40';
      case 'Out of Stock':
      case 'Empty':
        return 'bg-rose-950/80 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  const statuses = ['Full', 'In Stock', 'Low Stock', 'Out of Stock', 'Empty'];

  return (
    <div className="glass-card bg-[#06151a]/90 rounded-3xl p-4 sm:p-5 border border-slate-700 hover:border-teal-400 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
      {/* Left: Product Image & Details */}
      <div className="flex items-center gap-3.5 w-full sm:w-auto">
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-900 flex-shrink-0 border border-slate-700">
          <img
            src={item.imageUrl || prod.imageUrl || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80'}
            alt={item.customName || prod.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-sm sm:text-base text-white">
              {item.customName || prod.name}
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1 bg-[#030b0e] text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
              <Tag className="w-3 h-3 text-teal-400" />
              {prod.category || 'General'}
            </span>

            {/* Status Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${getStatusBadge(
                  item.status
                )}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {item.status}
                <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
              </button>

              {statusMenuOpen && (
                <div className="absolute left-0 mt-1 w-36 bg-[#06151a] rounded-2xl shadow-2xl border border-slate-700 py-1 z-30 animate-fade-in">
                  {statuses.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        onStatusChange(item, st);
                        setStatusMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-[#0c2830] hover:text-teal-300 flex items-center justify-between cursor-pointer"
                    >
                      <span>{st}</span>
                      {item.status === st && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Price & Stock values */}
      <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-start border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-700">
        <div className="text-left sm:text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price</span>
          <div className="text-sm sm:text-base font-black text-teal-300">
            {formatCurrency(item.price)}
            <span className="text-xs font-normal text-slate-400">/{item.unit}</span>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Stock Available</span>
          <div className="text-sm sm:text-base font-extrabold text-white flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-teal-400" />
            {item.quantity} {item.unit}
          </div>
        </div>

        {/* Right: Actions (Edit, Delete) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(item)}
            title="Edit Price & Stock"
            className="p-2 text-slate-300 hover:text-white bg-[#030b0e] hover:bg-[#0c2830] rounded-xl transition-colors border border-slate-700 cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item)}
            title="Delete Product from Shop"
            className="p-2 text-rose-400 hover:text-rose-300 bg-[#030b0e] hover:bg-rose-950/50 rounded-xl transition-colors border border-slate-700 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
