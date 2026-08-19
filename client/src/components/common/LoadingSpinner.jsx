import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading...', fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-9 h-9 text-forest-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">{message}</p>
      </div>
    );
  }

  return (
    <div className="py-12 flex flex-col items-center justify-center gap-2">
      <Loader2 className="w-7 h-7 text-forest-600 animate-spin" />
      <p className="text-xs font-medium text-slate-500">{message}</p>
    </div>
  );
}
