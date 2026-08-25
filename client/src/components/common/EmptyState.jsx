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
    <div className="text-center py-12 px-4 rounded-3xl bg-[#06151a]/90 border border-slate-700 shadow-xl">
      <div className="inline-flex p-4 rounded-2xl bg-teal-950/80 text-teal-400 border border-slate-700 mb-3 shadow-md">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-extrabold text-white mb-1">{title}</h4>
      <p className="text-sm text-slate-300 max-w-md mx-auto mb-4">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 btn-glow-primary text-slate-950 text-xs sm:text-sm font-black rounded-full transition-all shadow-md cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
