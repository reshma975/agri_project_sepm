import React from 'react';
import { Sprout } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Sprout,
  title = 'No items found',
  description = 'There are no records to display at this moment.',
  actionText,
  onAction,
}) {
  return (
    <div className="text-center py-12 px-4 rounded-2xl bg-white/60 border border-dashed border-slate-200">
      <div className="inline-flex p-4 rounded-2xl bg-forest-50 text-forest-600 mb-3 shadow-inner">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-bold text-slate-800 mb-1">{title}</h4>
      <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-forest-600 hover:bg-forest-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-forest-200"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
