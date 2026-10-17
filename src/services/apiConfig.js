/**
 * PRABRIX AI - Mobile & Web API Gateway Client
 * Automatically resolves backend base URL.
 * In mobile APK (Capacitor), routes requests to VITE_API_BASE_URL rather than localhost.
 */
import { Capacitor } from '@capacitor/core';

export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && !envUrl.includes('example.com')) {
    return envUrl.replace(/\/$/, '');
  }
  // If running inside Capacitor native app
  if (Capacitor.isNativePlatform()) {
    return (envUrl || '').replace(/\/$/, '');
  }
  // In local web development
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:4000';
  }
  return '';
};

export const apiFetch = async (endpoint, options = {}) => {
  const baseUrl = getApiBaseUrl();
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  return fetch(url, options);
};
