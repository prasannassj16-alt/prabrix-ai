/**
 * PRABRIX AI - Saved Properties (Shortlist) Service
 * Manages bookmarking and shortlisting land parcels for buyers.
 */

const STORAGE_SAVED_KEY = 'prabrix_saved_properties_db';

const getStoredSavedIds = (userId = 'anonymous') => {
  try {
    const raw = localStorage.getItem(`${STORAGE_SAVED_KEY}_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
};

const setStoredSavedIds = (savedIds, userId = 'anonymous') => {
  try {
    localStorage.setItem(`${STORAGE_SAVED_KEY}_${userId}`, JSON.stringify(savedIds));
  } catch (e) {}
};

export const savedPropertiesService = {
  isSaved(listingId, userId = 'anonymous') {
    if (!listingId) return false;
    const ids = getStoredSavedIds(userId);
    return ids.includes(listingId);
  },

  toggleSave(listingId, userId = 'anonymous') {
    if (!listingId) return false;
    const ids = getStoredSavedIds(userId);
    const exists = ids.includes(listingId);

    let updated;
    if (exists) {
      updated = ids.filter((id) => id !== listingId);
    } else {
      updated = [...ids, listingId];
    }

    setStoredSavedIds(updated, userId);
    return !exists; // Returns true if now saved, false if unsaved
  },

  removeSaved(listingId, userId = 'anonymous') {
    if (!listingId) return;
    const ids = getStoredSavedIds(userId);
    const updated = ids.filter((id) => id !== listingId);
    setStoredSavedIds(updated, userId);
  },

  getSavedListingIds(userId = 'anonymous') {
    return getStoredSavedIds(userId);
  },
};
