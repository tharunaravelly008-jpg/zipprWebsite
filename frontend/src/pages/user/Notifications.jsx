import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../../api/axiosInstance';
import { setNotifications, markAllRead as markAllReadAction } from '../../features/notifications/notificationsSlice';
import { notificationsApi } from '../../api/notificationsApi';
import { Card } from '../../components/common';
import { Bell, BellOff, CheckCheck, Info, AlertCircle, Gift, Navigation, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const ICON_MAP = {
  ride:    { icon: Navigation,   bg: 'bg-brand-indigo/10 dark:bg-brand-lime/10',  text: 'text-brand-indigo dark:text-brand-lime' },
  promo:   { icon: Gift,         bg: 'bg-purple-100 dark:bg-purple-500/15',        text: 'text-purple-600 dark:text-purple-400'  },
  alert:   { icon: AlertCircle,  bg: 'bg-red-100 dark:bg-red-500/15',             text: 'text-red-600 dark:text-red-400'        },
  info:    { icon: Info,         bg: 'bg-blue-100 dark:bg-blue-500/15',           text: 'text-blue-600 dark:text-blue-400'      },
};

const getConfig = (type) => ICON_MAP[type] || ICON_MAP.info;

const formatRelative = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading } = useSelector(s => s.notifications);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const load = async () => {
      setFetching(true);
      try {
        const data = await notificationsApi.getAll();
        dispatch(setNotifications(data));
      } catch {}
      setFetching(false);
    };
    load();
  }, [dispatch]);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      dispatch(markAllReadAction());
    } catch {}
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Notifications</h1>
          <p className="text-brand-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand-indigo dark:text-brand-lime hover:bg-brand-indigo/5 dark:hover:bg-brand-lime/10 rounded-xl transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {fetching ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-indigo dark:text-brand-lime" />
        </div>
      ) : notifications.length === 0 ? (
        <Card className="flex flex-col items-center py-20 gap-4 text-center">
          <div className="p-6 bg-brand-indigo/5 dark:bg-brand-lime/5 rounded-full">
            <BellOff className="w-10 h-10 text-brand-indigo/30 dark:text-brand-lime/30" />
          </div>
          <p className="font-bold text-lg text-brand-gray-500">No notifications yet</p>
          <p className="text-sm text-brand-gray-400 max-w-xs">
            Ride updates, promotions, and platform alerts will appear here.
          </p>
        </Card>
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="divide-y divide-brand-indigo/5 dark:divide-brand-gray-800">
            {notifications.map((n) => {
              const cfg = getConfig(n.type);
              const Icon = cfg.icon;
              return (
                <div
                  key={n.id}
                  className={cn(
                    'flex items-start gap-4 p-5 transition-colors hover:bg-brand-gray-50 dark:hover:bg-brand-gray-900/50',
                    !n.is_read && 'bg-brand-indigo/[0.02] dark:bg-brand-lime/[0.02]'
                  )}
                >
                  <div className={cn('p-2.5 rounded-xl shrink-0', cfg.bg, cfg.text)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn('font-semibold text-sm', !n.is_read && 'font-bold')}>{n.title}</p>
                      <span className="text-xs text-brand-gray-400 shrink-0 mt-0.5">{formatRelative(n.created_at)}</span>
                    </div>
                    <p className="text-sm text-brand-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                  </div>
                  {!n.is_read && (
                    <div className="w-2 h-2 rounded-full bg-brand-indigo dark:bg-brand-lime mt-1.5 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default NotificationsPage;
