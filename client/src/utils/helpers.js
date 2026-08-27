export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const getStatusConfig = (status) => {
  switch (status) {
    case 'VERIFIED':
    case 'Verified':
    case 'Full':
    case 'In Stock':
      return {
        bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
        dot: 'bg-emerald-400',
        label: status === 'VERIFIED' ? 'Verified & Approved' : status,
        icon: 'check',
      };
    case 'UNDER_VERIFICATION':
    case 'Under Verification':
    case 'SUBMITTED':
    case 'Submitted':
    case 'Pending':
    case 'PENDING':
    case 'Low Stock':
      return {
        bg: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
        dot: 'bg-amber-400',
        label: ['UNDER_VERIFICATION', 'SUBMITTED', 'Pending', 'PENDING'].includes(status) ? 'Pending Verification' : status,
        icon: 'clock',
      };
    case 'RETURNED_FOR_CORRECTION':
    case 'Returned for Correction':
    case 'RESUBMIT_NEEDED':
    case 'Resubmit Needed':
      return {
        bg: 'bg-orange-950/90 text-orange-300 border-orange-500/50',
        dot: 'bg-orange-400',
        label: 'Resubmit Needed',
        icon: 'alert-circle',
      };
    case 'REJECTED':
    case 'Rejected':
    case 'UNVERIFIED':
    case 'Unverified':
    case 'Out of Stock':
    case 'Empty':
      return {
        bg: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
        dot: 'bg-rose-400',
        label: status === 'Out of Stock' ? 'Temporarily Out of Stock' : status === 'UNVERIFIED' ? 'Unverified Profile' : status,
        icon: 'x-circle',
      };
    case 'DRAFT':
    case 'Draft':
      return {
        bg: 'bg-slate-900 text-slate-300 border-slate-700',
        dot: 'bg-slate-400',
        label: 'Draft',
        icon: 'file-text',
      };
    default:
      return {
        bg: 'bg-slate-900 text-slate-300 border-slate-700',
        dot: 'bg-slate-400',
        label: status || 'Pending',
        icon: 'help-circle',
      };
  }
};
