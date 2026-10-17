import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Trash2, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';

export const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const userId = user?.id || (user ? 'test-buyer' : null);

  const refreshNotifications = () => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    const list = notificationService.getNotifications(userId);
    setNotifications(list);
    setUnreadCount(list.filter((n) => !n.is_read).length);
  };

  useEffect(() => {
    refreshNotifications();
    const unsubscribe = notificationService.subscribe(refreshNotifications);
    return () => unsubscribe();
  }, [userId]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = (id) => {
    try {
      notificationService.markAsRead(id, userId);
      refreshNotifications();
    } catch (e) {}
  };

  const handleMarkAllRead = () => {
    try {
      notificationService.markAllAsRead(userId);
      refreshNotifications();
    } catch (e) {}
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    try {
      notificationService.deleteNotification(id, userId);
      refreshNotifications();
    } catch (e) {}
  };

  const handleNotificationClick = (notif) => {
    handleMarkAsRead(notif.id);
    setIsOpen(false);

    // Route based on entity type
    if (notif.entity_type === 'listing' && notif.entity_id) {
      navigate(`/property/${notif.entity_id}`);
    } else if (notif.entity_type === 'offer') {
      if (user?.role === 'seller') {
        navigate('/seller/inbox');
      } else {
        navigate('/buyer/offers');
      }
    } else if (notif.entity_type === 'inquiry') {
      if (user?.role === 'seller') {
        navigate('/seller/inbox');
      } else {
        navigate('/buyer/offers');
      }
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors focus:outline-hidden"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-rose-600 rounded-full shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-slate-800">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No notifications right now.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 transition-colors cursor-pointer flex items-start space-x-3 ${
                    notif.is_read ? 'bg-white hover:bg-slate-50' : 'bg-emerald-50/40 hover:bg-emerald-50/70'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {!notif.is_read ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 block" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-300 block" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs ${notif.is_read ? 'font-medium text-slate-700' : 'font-bold text-slate-900'}`}>
                        {notif.title}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(notif.id, e)}
                        className="text-slate-300 hover:text-rose-600 p-1 transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {notif.body}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>{new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {notif.entity_type && (
                        <span className="inline-flex items-center space-x-0.5 text-emerald-700 font-medium">
                          <span>View</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
