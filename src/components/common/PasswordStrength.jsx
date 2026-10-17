import React from 'react';
import { Check, X } from 'lucide-react';
import { getPasswordStrength } from '../../services/validationService';

export const PasswordStrength = ({ password }) => {
  const { checks, score, label, color } = getPasswordStrength(password || '');

  const requirements = [
    { key: 'length', text: 'At least 8 characters' },
    { key: 'lowercase', text: 'One lowercase letter (a-z)' },
    { key: 'uppercase', text: 'One uppercase letter (A-Z)' },
    { key: 'number', text: 'One numeric digit (0-9)' },
    { key: 'special', text: 'One special symbol (!@#$%^&*...)' },
  ];

  return (
    <div className="mt-2 text-xs space-y-2">
      {/* Strength Bar */}
      <div className="flex items-center justify-between">
        <span className="text-slate-500 font-medium">Password Strength:</span>
        <span className={`font-semibold ${color}`}>{label}</span>
      </div>
      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex">
        <div
          className={`h-full transition-all duration-300 ${
            score <= 2 ? 'bg-red-500' : score <= 4 ? 'bg-amber-500' : 'bg-emerald-600'
          }`}
          style={{ width: `${(score / 5) * 100}%` }}
        />
      </div>

      {/* Criteria Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
        {requirements.map((req) => {
          const met = checks[req.key];
          return (
            <div
              key={req.key}
              className={`flex items-center space-x-1.5 ${
                met ? 'text-emerald-700' : 'text-slate-400'
              }`}
            >
              {met ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              ) : (
                <X className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
              )}
              <span className={met ? 'font-medium' : ''}>{req.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
