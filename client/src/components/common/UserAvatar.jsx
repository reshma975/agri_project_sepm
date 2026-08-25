import React, { useState } from 'react';
import { Sprout, Store, ShieldCheck } from 'lucide-react';

/**
 * Extract clean, authentic uppercase initials from user name or username
 * Handles dot notation (e.g. "B. Venkateswara Rao" -> "BV", "Dr. V. Sharma" -> "VS")
 */
export const getInitials = (name, username = '') => {
  const cleanName = (name || username || 'Farmer').trim();
  const parts = cleanName
    .replace(/^Dr\.\s*/i, '') // remove Dr. title if present
    .replace(/[._]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return 'FS';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return (parts[0][0] + parts[1][0]).toUpperCase();
};

/**
 * Filter out cartoon / dicebear anime URLs and return genuine custom photos only
 */
export const getValidPhotoUrl = (user) => {
  const avatar = user?.avatar;
  if (!avatar || typeof avatar !== 'string') return null;

  // Reject all cartoon dicebear anime/generator URLs that cause gender and cartoon mixups
  if (
    avatar.includes('dicebear.com') ||
    avatar.includes('bottts') ||
    avatar.includes('adventurer') ||
    avatar.includes('lorelei') ||
    avatar.includes('personas')
  ) {
    return null;
  }

  return avatar;
};

export default function UserAvatar({ user, className = 'w-full h-full', showBadge = false }) {
  const role = (user?.role || 'FARMER').toUpperCase();
  const validPhoto = getValidPhotoUrl(user);
  const initials = getInitials(user?.name, user?.username);
  const [imgError, setImgError] = useState(false);

  // Role-specific aesthetic gradient & border palettes
  const roleTheme = {
    FARMER: {
      gradient: 'from-emerald-700 via-teal-800 to-emerald-950',
      text: 'text-emerald-100',
      border: 'border-emerald-500/40',
      glow: 'shadow-emerald-900/20',
      badgeBg: 'bg-[#030b0e]',
      badgeBorder: 'border-emerald-500/50',
      badgeIcon: <Sprout className="w-2.5 h-2.5 text-emerald-400" />,
    },
    SHOPKEEPER: {
      gradient: 'from-amber-700 via-orange-800 to-amber-950',
      text: 'text-amber-100',
      border: 'border-amber-500/40',
      glow: 'shadow-amber-900/20',
      badgeBg: 'bg-[#030b0e]',
      badgeBorder: 'border-amber-500/50',
      badgeIcon: <Store className="w-2.5 h-2.5 text-amber-400" />,
    },
    OFFICER: {
      gradient: 'from-cyan-700 via-sky-800 to-slate-950',
      text: 'text-cyan-100',
      border: 'border-cyan-500/40',
      glow: 'shadow-cyan-900/20',
      badgeBg: 'bg-[#030b0e]',
      badgeBorder: 'border-cyan-500/50',
      badgeIcon: <ShieldCheck className="w-2.5 h-2.5 text-cyan-400" />,
    },
  }[role] || {
    gradient: 'from-teal-700 via-emerald-800 to-teal-950',
    text: 'text-teal-100',
    border: 'border-teal-500/40',
    glow: 'shadow-teal-900/20',
    badgeBg: 'bg-[#030b0e]',
    badgeBorder: 'border-teal-500/50',
    badgeIcon: <Sprout className="w-2.5 h-2.5 text-teal-400" />,
  };

  return (
    <div className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}>
      {!imgError && validPhoto ? (
        <img
          src={validPhoto}
          alt={user?.name || 'User'}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-full shadow-inner border border-slate-700"
        />
      ) : (
        <div
          className={`w-full h-full rounded-full bg-gradient-to-br ${roleTheme.gradient} ${roleTheme.border} ${roleTheme.glow} border flex items-center justify-center font-black tracking-wider shadow-md`}
        >
          <span className={`${roleTheme.text} text-[11px] sm:text-xs font-extrabold leading-none`}>
            {initials}
          </span>
        </div>
      )}

      {showBadge && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ${roleTheme.badgeBg} ${roleTheme.badgeBorder} border flex items-center justify-center shadow-md`}
          title={`${role} Profile`}
        >
          {roleTheme.badgeIcon}
        </span>
      )}
    </div>
  );
}
