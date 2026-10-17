import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export const DemoBanner = ({ message, testOtp }) => {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-md shadow-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-semibold text-amber-900">
            {message || 'Demo mode: no real SMS is sent.'}
          </p>
          <p className="text-xs text-amber-700 mt-1">
            Carrier SMS gateway is unconfigured. For evaluation, use test verification code:{' '}
            <span className="font-mono font-bold bg-amber-200 px-1.5 py-0.5 rounded text-amber-950">
              {testOtp || '123456'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
