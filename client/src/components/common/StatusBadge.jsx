import React from 'react';
import { getStatusConfig } from '../../utils/helpers';
import { CheckCircle2, Clock, AlertCircle, XCircle, FileText } from 'lucide-react';

export default function StatusBadge({ status, className = '' }) {
  const config = getStatusConfig(status);

  const renderIcon = () => {
    switch (config.icon) {
      case 'check':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'clock':
        return <Clock className="w-3.5 h-3.5 text-amber-600" />;
      case 'alert-circle':
        return <AlertCircle className="w-3.5 h-3.5 text-orange-600" />;
      case 'x-circle':
        return <XCircle className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {renderIcon()}
      {config.label}
    </span>
  );
}
