'use client';

import { useState, useEffect } from 'react';

import Link from 'next/link';

import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  BellOff,
  BellRing,
  CheckCircle,
  Clock,
  Palmtree,
  Receipt,
  DollarSign,
  Megaphone,
  AlertTriangle,
  Info,
  CheckCheck,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// Notification types and their styling
const categoryConfig: Record<string, { icon: typeof Bell; color: string; bgColor: string }> = {
  system: { icon: Info, color: 'text-blue-600', bgColor: 'bg-blue-500/10' },
  approval: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-500/10' },
  attendance: { icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-500/10' },
  payroll: { icon: DollarSign, color: 'text-emerald-600', bgColor: 'bg-emerald-500/10' },
  leave: { icon: Palmtree, color: 'text-teal-600', bgColor: 'bg-teal-500/10' },
  claim: { icon: Receipt, color: 'text-violet-600', bgColor: 'bg-violet-500/10' },
  announcement: { icon: Megaphone, color: 'text-indigo-600', bgColor: 'bg-indigo-500/10' },
  reminder: { icon: BellRing, color: 'text-amber-600', bgColor: 'bg-amber-500/10' },
  alert: { icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-500/10' },
};

interface Notification {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

// Helper to generate mock notification timestamps (only called on client)
function getMockNotifications(): Notification[] {
  const now = Date.now();
  return [
    {
      id: '1',
      title: 'Welcome to the Starter Kit',
      content: 'Get started by exploring the dashboard and settings.',
      category: 'system',
      priority: 'medium',
      is_read: false,
      action_url: '/dashboard',
      created_at: new Date(now - 1000 * 60 * 30).toISOString(),
    },
    {
      id: '2',
      title: 'Profile Setup Required',
      content: 'Complete your profile to unlock all features.',
      category: 'reminder',
      priority: 'high',
      is_read: false,
      action_url: '/dashboard/settings/profile',
      created_at: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: '3',
      title: 'New Feature Available',
      content: 'Check out our new modern table component with card view.',
      category: 'announcement',
      priority: 'medium',
      is_read: false,
      action_url: null,
      created_at: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
    },
  ];
}

interface NotificationDropdownItemProps {
  notification: Notification;
  onClick: () => void;
}

function NotificationDropdownItem({ notification, onClick }: NotificationDropdownItemProps) {
  const config = categoryConfig[notification.category] || categoryConfig.system;
  const Icon = config.icon;
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    setTimeAgo(formatDistanceToNow(new Date(notification.created_at), { addSuffix: true }));
  }, [notification.created_at]);

  return (
    <Link
      href={notification.action_url || '/notifications'}
      className={cn(
        'flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer',
        !notification.is_read && 'bg-primary/5'
      )}
      onClick={onClick}
    >
      <div className={cn('rounded-full p-2 shrink-0', config.bgColor)}>
        <Icon className={cn('h-4 w-4', config.color)} />
      </div>
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-2">
          <span className={cn('text-sm font-medium line-clamp-1', !notification.is_read && 'font-semibold')}>
            {notification.title}
          </span>
          {!notification.is_read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{notification.content}</p>
        <p className="text-xs text-muted-foreground">{timeAgo || '\u00A0'}</p>
      </div>
    </Link>
  );
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [mounted, setMounted] = useState(false);

  // Initialize notifications on client only to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    setNotifications(getMockNotifications());
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true }))
    );
  };

  const handleNotificationClick = () => {
    setOpen(false);
  };

  // Don't render badge count until mounted to avoid hydration mismatch
  const displayCount = mounted ? unreadCount : 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {displayCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/50 opacity-75" />
              <Badge
                variant="default"
                className="relative h-5 min-w-5 rounded-full px-1.5 text-[10px] font-bold"
              >
                {displayCount > 9 ? '9+' : displayCount}
              </Badge>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs" onClick={handleMarkAllAsRead}>
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {notifications.length > 0 ? (
          <ScrollArea className="h-[320px]">
            <div className="divide-y">
              {notifications.slice(0, 5).map((notification) => (
                <NotificationDropdownItem
                  key={notification.id}
                  notification={notification}
                  onClick={handleNotificationClick}
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <BellOff className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No notifications</p>
            <p className="text-xs text-muted-foreground">You're all caught up!</p>
          </div>
        )}

        <Separator />
        <div className="p-2">
          <Button variant="ghost" className="w-full justify-center text-sm" asChild onClick={() => setOpen(false)}>
            <Link href="/notifications">View all notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
