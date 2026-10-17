import { Router } from 'express';

export const createNotificationRoutes = (authMiddleware, sharedDb = null) => {
  const router = Router();
  const { requireAuth, requirePhoneVerified } = authMiddleware;

  router.use(requireAuth);
  router.use(requirePhoneVerified);

  // In-memory notifications store for backend demonstration & unit tests
  let notifications = sharedDb?.notifications || [
    {
      id: 'notif-back-01',
      user_id: 'demo-verified-user',
      title: 'New High-Score Land Matched',
      body: 'A new 1-Acre agricultural parcel in Sulur matches your acquisition criteria (92/100).',
      notification_type: 'matching_listing_found',
      is_read: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 'notif-back-02',
      user_id: 'other-user-999',
      title: 'Private Alert for Another User',
      body: 'Confidential notification that must not be readable by other users.',
      notification_type: 'system_alert',
      is_read: false,
      created_at: new Date().toISOString(),
    },
  ];

  // GET /api/notifications - Strictly returns only the authenticated user's notifications
  router.get('/', (req, res) => {
    const userNotifs = notifications.filter((n) => n.user_id === req.user.id);
    res.json({
      success: true,
      notifications: userNotifs,
      unreadCount: userNotifs.filter((n) => !n.is_read).length,
    });
  });

  // PUT /api/notifications/:id/read - Marks notification as read with ownership check
  router.put('/:id/read', (req, res) => {
    const notif = notifications.find((n) => n.id === req.params.id);
    if (!notif) {
      return res.status(404).json({ error: 'NotFound', message: 'Notification not found.' });
    }

    // Strict Authorization: user may only modify own notification
    if (notif.user_id !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied. You may only modify your own notifications.',
      });
    }

    notif.is_read = true;
    notif.read_at = new Date().toISOString();

    res.json({ success: true, notification: notif });
  });

  // DELETE /api/notifications/:id - Deletes notification with ownership check
  router.delete('/:id', (req, res) => {
    const notif = notifications.find((n) => n.id === req.params.id);
    if (!notif) {
      return res.status(404).json({ error: 'NotFound', message: 'Notification not found.' });
    }

    if (notif.user_id !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied. You may only delete your own notifications.',
      });
    }

    notifications = notifications.filter((n) => n.id !== req.params.id);
    res.json({ success: true, message: 'Notification deleted successfully.' });
  });

  return router;
};
