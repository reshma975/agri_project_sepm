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
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        label: status === 'VERIFIED' ? 'Verified' : status,
        icon: 'check',
      };
    case 'UNDER_VERIFICATION':
    case 'Under Verification':
    case 'SUBMITTED':
    case 'Submitted':
    case 'Low Stock':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        label: status === 'UNDER_VERIFICATION' ? 'Under Verification' : status === 'SUBMITTED' ? 'Submitted' : status,
        icon: 'clock',
      };
    case 'RETURNED_FOR_CORRECTION':
    case 'Returned for Correction':
      return {
        bg: 'bg-orange-50 text-orange-700 border-orange-200',
        dot: 'bg-orange-500',
        label: 'Returned for Correction',
        icon: 'alert-circle',
      };
    case 'REJECTED':
    case 'Rejected':
    case 'UNVERIFIED':
    case 'Unverified':
    case 'Out of Stock':
    case 'Empty':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        label: status === 'Out of Stock' ? 'Temporarily Out of Stock' : status,
        icon: 'x-circle',
      };
    case 'DRAFT':
    case 'Draft':
      return {
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
        label: 'Draft',
        icon: 'file-text',
      };
    default:
      return {
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
        label: status || 'Pending',
        icon: 'help-circle',
      };
  }
};
