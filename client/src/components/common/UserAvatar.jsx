import React from 'react';
import { Sprout, Store, ShieldCheck } from 'lucide-react';

export const getAgriculturalAvatarUrl = (user) => {
  const username = user?.username || user?.name || 'farmer';
  const role = (user?.role || 'FARMER').toUpperCase();

  // If user already has a custom image (and it is NOT the old bottts robot)
  if (user?.avatar && !user.avatar.includes('bottts') && !user.avatar.includes('dicebear.com/7.x/bottts')) {
    return user.avatar;
  }

  // Generate agricultural-themed avatar based on role
  if (role === 'FARMER') {
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(username)}&backgroundColor=064e3b,0f766e,047857&skinColor=9e5622,763900,ecad80,f2d3b1`;
  }

  if (role === 'SHOPKEEPER') {
    return `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(username)}&backgroundColor=78350f,92400e,b45309`;
  }

  // Officer / Admin
  return `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(username)}&backgroundColor=0e3a44,134e4a,0f766e`;
};

export default function UserAvatar({ user, className = 'w-full h-full', showBadge = false }) {
  const role = (user?.role || 'FARMER').toUpperCase();
  const avatarUrl = getAgriculturalAvatarUrl(user);
  const initials = (user?.name || user?.username || 'F')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const [imgError, setImgError] = React.useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      {!imgError && avatarUrl ? (
        <img
          src={avatarUrl}
          alt={user?.name || 'User'}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-full shadow-inner"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-gradient-to-br from-teal-900 to-emerald-950 flex items-center justify-center text-teal-300 font-extrabold border border-teal-500/30">
          <span className="text-xs">{initials}</span>
        </div>
      )}

      {showBadge && (
        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#030b0e] border border-teal-500/40 flex items-center justify-center shadow-xs">
          {role === 'FARMER' ? (
            <Sprout className="w-2.5 h-2.5 text-emerald-400" />
          ) : role === 'SHOPKEEPER' ? (
            <Store className="w-2.5 h-2.5 text-amber-400" />
          ) : (
            <ShieldCheck className="w-2.5 h-2.5 text-cyan-400" />
          )}
        </span>
      )}
    </div>
  );
}
