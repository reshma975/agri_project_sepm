import React from 'react';
import { Check, X, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

export const checkPasswordRules = (password = '') => {
  const rules = [
    {
      id: 'length',
      label: 'At least 8 characters',
      met: password.length >= 8,
    },
    {
      id: 'uppercase',
      label: 'At least one uppercase letter (A-Z)',
      met: /[A-Z]/.test(password),
    },
    {
      id: 'lowercase',
      label: 'At least one lowercase letter (a-z)',
      met: /[a-z]/.test(password),
    },
    {
      id: 'number',
      label: 'At least one number (0-9)',
      met: /[0-9]/.test(password),
    },
    {
      id: 'special',
      label: 'At least one special character (!@#$%^&*)',
      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password),
    },
  ];

  const metCount = rules.filter((r) => r.met).length;
  const isAllMet = metCount === rules.length;

  let strengthLabel = 'Too Weak';
  let strengthColor = 'bg-rose-500';
  let textColor = 'text-rose-400';

  if (metCount === 5) {
    strengthLabel = 'Very Strong';
    strengthColor = 'bg-emerald-400';
    textColor = 'text-emerald-400';
  } else if (metCount >= 4) {
    strengthLabel = 'Strong';
    strengthColor = 'bg-teal-400';
    textColor = 'text-teal-400';
  } else if (metCount >= 3) {
    strengthLabel = 'Medium';
    strengthColor = 'bg-amber-400';
    textColor = 'text-amber-400';
  } else if (metCount >= 1) {
    strengthLabel = 'Weak';
    strengthColor = 'bg-rose-400';
    textColor = 'text-rose-400';
  }

  return { rules, metCount, isAllMet, strengthLabel, strengthColor, textColor };
};

export default function PasswordStrengthIndicator({ password = '', showOnlyIfTyping = true }) {
  if (showOnlyIfTyping && !password) return null;

  const { rules, metCount, isAllMet, strengthLabel, strengthColor, textColor } = checkPasswordRules(password);

  return (
    <div className="p-3.5 bg-[#030b0e] rounded-2xl border border-teal-900/50 space-y-2.5 mt-2 animate-fade-in text-xs">
      {/* Strength Header & Multi-segment Meter */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          {isAllMet ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Shield className="w-3.5 h-3.5 text-teal-400" />
          )}
          <span>Password Security:</span>
        </span>
        <span className={`text-[11px] font-extrabold ${textColor}`}>
          {strengthLabel}
        </span>
      </div>

      {/* 5-Segmented Strength Bar */}
      <div className="grid grid-cols-5 gap-1.5 h-1.5 w-full">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-full rounded-full transition-all duration-300 ${
              metCount >= level ? strengthColor : 'bg-slate-800'
            }`}
          />
        ))}
      </div>

      {/* Checklist of rules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`flex items-center gap-1.5 text-[11px] transition-colors ${
              rule.met ? 'text-emerald-400 font-semibold' : 'text-slate-500'
            }`}
          >
            {rule.met ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700 ml-1 mr-1 flex-shrink-0" />
            )}
            <span>{rule.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
