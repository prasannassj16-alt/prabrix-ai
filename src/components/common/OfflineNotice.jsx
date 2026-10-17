import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { Network } from '@capacitor/network';
import { isNativeMobile } from '../../mobile/mobilePlatform';

export const OfflineNotice = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // 1. Initial check
    const checkInitial = async () => {
      try {
        if (isNativeMobile()) {
          const status = await Network.getStatus();
          setIsOnline(status.connected);
        } else if (typeof navigator !== 'undefined') {
          setIsOnline(navigator.onLine);
        }
      } catch (e) {
        setIsOnline(true);
      }
    };
    checkInitial();

    // 2. Native listener if Capacitor
    let netListener = null;
    if (isNativeMobile()) {
      netListener = Network.addListener('networkStatusChange', (status) => {
        setIsOnline(status.connected);
      });
    }

    // 3. Web window events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (netListener) netListener.then((handle) => handle.remove());
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsChecking(true);
    try {
      if (isNativeMobile()) {
        const status = await Network.getStatus();
        setIsOnline(status.connected);
      } else {
        setIsOnline(navigator.onLine);
      }
    } catch (e) {
      // Fallback
    } finally {
      setTimeout(() => setIsChecking(false), 600);
    }
  };

  if (isOnline) return null;

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/95 backdrop-blur-md flex items-center justify-center p-6 text-white text-center animate-fade-in">
      <div className="max-w-sm w-full bg-navy-900 border border-navy-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <WifiOff className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-heading font-extrabold text-white">
            No Internet Connection
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            PRABRIX AI requires an active internet connection to query Tamil Nadu cadastral registries, live Overpass GIS infrastructure, and verified valuation indices.
          </p>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-navy-800 border border-navy-700 text-[11px] text-amber-300 font-mono">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Live data is not cached offline</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRetry}
          disabled={isChecking}
          className="w-full inline-flex items-center justify-center space-x-2 py-3 px-5 rounded-xl font-bold text-sm bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 active:scale-95 text-white shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
          <span>{isChecking ? 'Checking Connection...' : 'Retry Connection'}</span>
        </button>
      </div>
    </div>
  );
};
