/**
 * PRABRIX AI - In-App Notification Service
 *
 * Dispatches and manages alerts for inquiries, offers, match discoveries, and status updates.
 * STRICT SECURITY: Users may only read or mutate their own notifications.
 */

const STORAGE_NOTIFICATIONS_KEY = 'prabrix_demo_notifications_db';

const initialDemoNotifications = [
  {
    id: 'notif-1',
    user_id: 'test-buyer',
    title: 'New High-Score Land Matched',
    body: 'A new 1-Acre agricultural parcel in Sulur, Coimbatore matches your acquisition requirement (92/100).',
    notification_type: 'matching_listing_found',
    entity_type: 'listing',
    entity_id: '11111111-1111-1111-1111-111111111101',
    is_read: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'notif-2',
    user_id: 'demo-seller-1',
    title: 'New Inquiry on Sulur Farmland',
    body: 'Buyer Ramesh Kumar sent an inquiry regarding borewell water yield and soil test reports.',
    notification_type: 'inquiry_received',
    entity_type: 'inquiry',
    entity_id: 'inq-seed-01',
    is_read: false,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'notif-3',
    user_id: 'demo-seller-1',
    title: 'Purchase Offer Received: ₹42.00 L',
    body: 'Prospective buyer submitted an offer of ₹42.00 Lakhs with token advance of ₹2.00 Lakhs.',
    notification_type: 'offer_received',
    entity_type: 'offer',
    entity_id: 'offer-seed-01',
    is_read: false,
    created_at: new Date(Date.now() - 14400000).toISOString(),
  },
];

const getStoredNotifications = () => {
  try {
    const raw = localStorage.getItem(STORAGE_NOTIFICATIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [...initialDemoNotifications];
};

const setStoredNotifications = (notifications) => {
  try {
    localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(notifications));
    notifyListeners();
  } catch (e) {}
};

const listeners = new Set();
const notifyListeners = () => {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {}
  });
};

export const notificationService = {
  subscribe(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },

  getNotifications(userId) {
    if (!userId) return [];
    const all = getStoredNotifications();
    return all
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  getUnreadCount(userId) {
    if (!userId) return 0;
    const notifications = this.getNotifications(userId);
    return notifications.filter((n) => !n.is_read).length;
  },

  createNotification({ userId, title, body, notificationType, entityType, entityId }) {
    if (!userId || !title) return null;

    const newNotif = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      user_id: userId,
      title: title.trim(),
      body: body ? body.trim() : '',
      notification_type: notificationType || 'system_alert',
      entity_type: entityType || null,
      entity_id: entityId || null,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    const all = getStoredNotifications();
    all.unshift(newNotif);
    setStoredNotifications(all);
    return newNotif;
  },

  markAsRead(notificationId, userId) {
    const all = getStoredNotifications();
    const index = all.findIndex((n) => n.id === notificationId);
    if (index === -1) return null;

    // Strict Authorization check: user may only modify own notification
    if (all[index].user_id !== userId) {
      throw new Error('Unauthorized: Cannot modify notification belonging to another user.');
    }

    all[index].is_read = true;
    all[index].read_at = new Date().toISOString();
    setStoredNotifications(all);
    return all[index];
  },

  markAllAsRead(userId) {
    if (!userId) return;
    const all = getStoredNotifications();
    let changed = false;
    all.forEach((n) => {
      if (n.user_id === userId && !n.is_read) {
        n.is_read = true;
        n.read_at = new Date().toISOString();
        changed = true;
      }
    });
    if (changed) {
      setStoredNotifications(all);
    }
  },

  deleteNotification(notificationId, userId) {
    const all = getStoredNotifications();
    const notif = all.find((n) => n.id === notificationId);
    if (!notif) return false;

    // Strict Authorization check
    if (notif.user_id !== userId) {
      throw new Error('Unauthorized: Cannot delete notification belonging to another user.');
    }

    const filtered = all.filter((n) => n.id !== notificationId);
    setStoredNotifications(filtered);
    return true;
  },

  // Reset demo storage (useful for tests)
  resetDemo() {
    setStoredNotifications([...initialDemoNotifications]);
  },
};
