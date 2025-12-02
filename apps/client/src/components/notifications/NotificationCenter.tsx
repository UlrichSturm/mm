'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Bell, X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface NotificationCenterProps {
  notifications?: Notification[];
  onMarkAsRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
  className?: string;
}

// Helper function to compare notifications arrays
function areNotificationsEqual(prev: Notification[], next: Notification[]): boolean {
  if (prev.length !== next.length) {
    return false;
  }
  return prev.every((prevNotif, index) => {
    const nextNotif = next[index];
    return (
      prevNotif.id === nextNotif.id &&
      prevNotif.read === nextNotif.read &&
      prevNotif.type === nextNotif.type &&
      prevNotif.title === nextNotif.title &&
      prevNotif.message === nextNotif.message
    );
  });
}

export function NotificationCenter({
  notifications = [],
  onMarkAsRead,
  onDismiss,
  className,
}: NotificationCenterProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [localNotifications, setLocalNotifications] = useState<Notification[]>(notifications);
  const prevNotificationsRef = useRef<Notification[]>(notifications);

  useEffect(() => {
    // Only update if notifications actually changed
    if (!areNotificationsEqual(prevNotificationsRef.current, notifications)) {
      setLocalNotifications(notifications);
      prevNotificationsRef.current = notifications;
    }
  }, [notifications]);

  const unreadCount = localNotifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setLocalNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    onMarkAsRead?.(id);
  };

  const handleDismiss = (id: string) => {
    setLocalNotifications(prev => prev.filter(n => n.id !== id));
    onDismiss?.(id);
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-md hover:bg-accent transition-colors"
        aria-label={t('notifications.title')}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <Card className="absolute right-0 mt-2 w-80 sm:w-96 z-50 border shadow-lg">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold">{t('notifications.title')}</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {localNotifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{t('notifications.empty')}</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {localNotifications.map(notification => (
                      <div
                        key={notification.id}
                        className={cn(
                          'p-4 hover:bg-accent transition-colors',
                          !notification.read && 'bg-blue-50',
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">{getIcon(notification.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm mb-1">{notification.title}</h4>
                                <p className="text-xs text-muted-foreground mb-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {notification.timestamp.toLocaleString()}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleDismiss(notification.id)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                            {notification.actionUrl && (
                              <Button
                                variant="link"
                                size="sm"
                                className="mt-2 h-auto p-0 text-xs"
                                onClick={() => {
                                  handleMarkAsRead(notification.id);
                                  window.location.href = notification.actionUrl!;
                                }}
                              >
                                {t('notifications.view')}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {localNotifications.length > 0 && (
                <div className="p-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      localNotifications.forEach(n => {
                        if (!n.read) {
                          handleMarkAsRead(n.id);
                        }
                      });
                    }}
                  >
                    {t('notifications.markAllRead')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
