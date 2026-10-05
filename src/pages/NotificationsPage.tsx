import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquare, 
  CheckCheck, 
  Bell,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/supabase';
import type { AppNotification } from '../types';
import type { NavRoute } from '../components/layout/Sidebar';

interface NotificationsPageProps {
  onRouteChange: (route: NavRoute, reportId?: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onRouteChange }) => {
  const { user, refreshUserData } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const [showClearModal, setShowClearModal] = useState(false);

  const fetchNotifs = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await db.getNotifications(user.id);
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [user]);

  const handleMarkAllRead = async () => {
    if (!user) return;
    await db.markAllNotificationsRead(user.id);
    await fetchNotifs();
    await refreshUserData();
  };

  const handleItemClick = async (notif: AppNotification) => {
    if (!notif.is_read) {
      await db.markNotificationRead(notif.id);
      await fetchNotifs();
      await refreshUserData();
    }
    if (notif.report_id) {
      onRouteChange('tracking', notif.report_id);
    }
  };

  const handleDeleteNotification = async (notifId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Optimistically update list
    setNotifications(prev => prev.filter(n => n.id !== notifId));
    try {
      await db.deleteNotification(notifId);
      await refreshUserData();
    } catch (err) {
      console.error('Failed to delete notification:', err);
      await fetchNotifs();
    }
  };

  const handleConfirmClearAll = async () => {
    if (!user) return;
    setNotifications([]);
    setShowClearModal(false);
    try {
      await db.clearAllNotifications(user.id);
      await refreshUserData();
    } catch (err) {
      console.error('Failed to clear notifications:', err);
      await fetchNotifs();
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  // Group notifications into Today vs Earlier
  const todayNotifications: AppNotification[] = [];
  const earlierNotifications: AppNotification[] = [];

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  filteredNotifications.forEach(n => {
    const time = new Date(n.created_at).getTime();
    if (time >= todayStart - 24 * 3600 * 1000) {
      todayNotifications.push(n);
    } else {
      earlierNotifications.push(n);
    }
  });

  const renderIcon = (type: AppNotification['notification_type']) => {
    switch (type) {
      case 'in_progress':
        return (
          <div className="w-11 h-11 rounded-2xl bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 stroke-[2]" />
          </div>
        );
      case 'building_alert':
        return (
          <div className="w-11 h-11 rounded-2xl bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 stroke-[2]" />
          </div>
        );
      case 'resolved':
      case 'confirmed':
        return (
          <div className="w-11 h-11 rounded-2xl bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          </div>
        );
      case 'facilities_note':
      default:
        return (
          <div className="w-11 h-11 rounded-2xl bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 stroke-[2]" />
          </div>
        );
    }
  };

  const renderBadge = (notif: AppNotification) => {
    switch (notif.notification_type) {
      case 'in_progress':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#B45309]">
            In Progress
          </span>
        );
      case 'building_alert':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEE2E2] text-[#DC2626]">
            Building Alert
          </span>
        );
      case 'resolved':
      case 'confirmed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#059669]">
            Completed
          </span>
        );
      case 'facilities_note':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#475569]">
            Facilities Note
          </span>
        );
    }
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
            Notifications
          </h1>
          <p className="text-sm font-medium text-[#64748B] mt-1">
            Updates on reports tied to your flat
          </p>
        </div>

        {/* Filter Pills & Mark all as read */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="inline-flex p-1 bg-[#F8FAFC] rounded-xl border border-[#EAECF0]">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filter === 'unread'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer border border-[#EAECF0]"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearModal(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer border border-[#EAECF0] hover:border-red-200"
              title="Clear all notifications"
              aria-label="Clear all notifications"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block w-8 h-8 border-3 border-[#203136] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 mt-3 font-medium">Loading notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#EAECF0] shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#0F172A]">No notifications yet</h3>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-sm mx-auto">
            You're all caught up! Whenever a facilities engineer logs updates or completes work, notifications will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* TODAY Section */}
          {todayNotifications.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-[#8B9AA0] uppercase tracking-wider px-1">
                <span>TODAY</span>
                <span>{todayNotifications.length} updates</span>
              </div>

              <div className="space-y-3">
                {todayNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleItemClick(notif)}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EAECF0] shadow-xs hover:shadow-md transition-all cursor-pointer flex items-start justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-4">
                      {renderIcon(notif.notification_type)}

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {renderBadge(notif)}
                          <span className="text-xs text-[#8B9AA0] font-medium">
                            • {notif.badge_label}
                          </span>
                        </div>

                        <div className="text-sm sm:text-base font-bold text-[#0F172A] group-hover:text-[#203136] transition-colors">
                          {notif.message}
                        </div>

                        <div className="text-xs text-[#64748B]">
                          {notif.subtext}
                        </div>
                      </div>
                    </div>

                    {/* Unread Red Dot & Remove Action */}
                    <div className="flex items-center gap-2 shrink-0 self-center sm:self-start">
                      {!notif.is_read && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#E5484D] shrink-0 shadow-xs animate-pulse" title="Unread notification" />
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteNotification(notif.id, e)}
                        className="p-1.5 rounded-xl text-slate-300 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer opacity-70 group-hover:opacity-100"
                        title="Remove notification"
                        aria-label="Remove notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EARLIER THIS WEEK Section */}
          {earlierNotifications.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-[#8B9AA0] uppercase tracking-wider px-1">
                <span>EARLIER THIS WEEK</span>
                <span>{earlierNotifications.length} updates</span>
              </div>

              <div className="space-y-3">
                {earlierNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleItemClick(notif)}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EAECF0] shadow-xs hover:shadow-md transition-all cursor-pointer flex items-start justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-4">
                      {renderIcon(notif.notification_type)}

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {renderBadge(notif)}
                          <span className="text-xs text-[#8B9AA0] font-medium">
                            • {notif.badge_label}
                          </span>
                        </div>

                        <div className="text-sm sm:text-base font-bold text-[#0F172A] group-hover:text-[#203136] transition-colors">
                          {notif.message}
                        </div>

                        <div className="text-xs text-[#64748B]">
                          {notif.subtext}
                        </div>
                      </div>
                    </div>

                    {/* Unread Red Dot & Remove Action */}
                    <div className="flex items-center gap-2 shrink-0 self-center sm:self-start">
                      {!notif.is_read && (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#E5484D] shrink-0 shadow-xs animate-pulse" title="Unread notification" />
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteNotification(notif.id, e)}
                        className="p-1.5 rounded-xl text-slate-300 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer opacity-70 group-hover:opacity-100"
                        title="Remove notification"
                        aria-label="Remove notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" 
            onClick={() => setShowClearModal(false)}
          />
          <div className="relative bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                <Trash2 className="w-6 h-6 stroke-[2]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Clear All Notifications?</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  This will remove all updates from your notifications inbox. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAll}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
