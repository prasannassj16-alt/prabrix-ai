/**
 * PRABRIX AI - Property Comparison Service
 * Allows buyers to compare up to 4 land parcels side-by-side.
 */

const STORAGE_COMPARE_KEY = 'prabrix_compare_properties_db';
const MAX_COMPARE = 4;

const listeners = new Set();

const notifyListeners = (list) => {
  listeners.forEach((fn) => {
    try {
      fn(list);
    } catch (e) {}
  });
};

const getStoredCompare = () => {
  try {
    const raw = localStorage.getItem(STORAGE_COMPARE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
};

const setStoredCompare = (list) => {
  try {
    localStorage.setItem(STORAGE_COMPARE_KEY, JSON.stringify(list));
  } catch (e) {}
  notifyListeners(list);
};

export const compareService = {
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  getCompareList() {
    return getStoredCompare();
  },

  isInCompare(listingId) {
    if (!listingId) return false;
    const list = getStoredCompare();
    return list.some((l) => l.id === listingId);
  },

  addToCompare(listing) {
    if (!listing || !listing.id) return { success: false, reason: 'Invalid listing' };
    const list = getStoredCompare();

    if (list.some((l) => l.id === listing.id)) {
      return { success: false, reason: 'Already in comparison list' };
    }

    if (list.length >= MAX_COMPARE) {
      return { success: false, reason: `You can compare a maximum of ${MAX_COMPARE} properties.` };
    }

    const updated = [...list, listing];
    setStoredCompare(updated);
    return { success: true, count: updated.length };
  },

  removeFromCompare(listingId) {
    const list = getStoredCompare();
    const updated = list.filter((l) => l.id !== listingId);
    setStoredCompare(updated);
    return updated;
  },

  toggleCompare(listing) {
    if (this.isInCompare(listing.id)) {
      this.removeFromCompare(listing.id);
      return { inCompare: false, count: this.getCompareList().length };
    } else {
      const res = this.addToCompare(listing);
      return { inCompare: res.success, count: this.getCompareList().length, error: res.reason };
    }
  },

  clearCompare() {
    setStoredCompare([]);
  },
};
