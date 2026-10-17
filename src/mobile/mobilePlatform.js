/**
 * PRABRIX AI - Native Mobile Integration Hub
 * Configures Capacitor App Lifecycle, Hardware Back Button, Deep Links,
 * Status Bar (Deep Navy #0B132B), Splash Screen, and Geolocation.
 */
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Network } from '@capacitor/network';
import { Geolocation } from '@capacitor/geolocation';

export const isNativeMobile = () => Capacitor.isNativePlatform();

/**
 * Initialize native device features when running in Capacitor
 */
export const initMobileFeatures = async (navigate, showToast) => {
  if (!isNativeMobile()) return;

  try {
    // 1. Status Bar Setup: Deep Navy styling matching PRABRIX AI design
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0B132B' });
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch (err) {
    console.warn('[Mobile] StatusBar init warning:', err);
  }

  try {
    // 2. Hide Native Splash Screen once React is ready
    await SplashScreen.hide();
  } catch (err) {
    console.warn('[Mobile] SplashScreen hide warning:', err);
  }

  // 3. Android Hardware Back Button Handler
  let lastBackPressTime = 0;
  App.addListener('backButton', ({ canGoBack }) => {
    const currentPath = window.location.pathname;

    if (currentPath === '/' || currentPath === '') {
      const now = Date.now();
      if (now - lastBackPressTime < 2000) {
        // Double press within 2s exits the app
        App.exitApp();
      } else {
        lastBackPressTime = now;
        if (showToast) {
          showToast('Press back again to exit PRABRIX AI', 'info');
        }
      }
    } else {
      // Navigate backwards in router history
      if (navigate) {
        navigate(-1);
      } else {
        window.history.back();
      }
    }
  });

  // 4. Deep Linking Handler for Supabase Auth Redirects
  App.addListener('appUrlOpen', (event) => {
    try {
      const url = new URL(event.url);
      // Handles custom scheme tech.prabrix.app://path or https://tech.prabrix.app/path
      const pathWithSearch = `${url.pathname}${url.search}${url.hash}`;
      if (pathWithSearch && navigate) {
        navigate(pathWithSearch);
      }
    } catch (e) {
      console.warn('[Mobile] Could not parse deep link URL:', event.url);
    }
  });
};

/**
 * Capacitor Geolocation Wrapper with clear explanation and fallback
 */
export const getDeviceLocation = async () => {
  if (isNativeMobile()) {
    try {
      const perm = await Geolocation.checkPermissions();
      if (perm.location !== 'granted') {
        const requested = await Geolocation.requestPermissions();
        if (requested.location !== 'granted') {
          return {
            success: false,
            error: 'Location permission was denied. You can still set your land parcel marker manually on the map.',
          };
        }
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });

      return {
        success: true,
        coords: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        },
      };
    } catch (err) {
      return {
        success: false,
        error: err.message || 'Unable to retrieve GPS coordinates.',
      };
    }
  }

  // Web Browser standard Geolocation fallback
  if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            success: true,
            coords: {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            },
          });
        },
        (err) => {
          resolve({
            success: false,
            error: err.message || 'Location access denied or unavailable.',
          });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  return { success: false, error: 'Geolocation is not supported on this device.' };
};
