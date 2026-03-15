'use client';

import * as React from 'react';

import {
  Bell,
  CheckCircle2,
  Clock,
  FileText,
  LogIn,
  LogOut,
  type LucideIcon,
  MessageSquare,
  Settings,
  UserMinus,
  UserPlus,
  Wallet,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Activity types
export type ActivityType =
  | 'new_hire'
  | 'profile_update'
  | 'leave_approved'
  | 'leave_rejected'
  | 'payroll_completed'
  | 'document_uploaded'
  | 'clock_in'
  | 'clock_out'
  | 'claim_submitted'
  | 'announcement'
  | 'system';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, unknown>;
}

interface LiveActivityTimelineProps {
  activities: Activity[];
  maxItems?: number;
  className?: string;
  title?: string;
  showHeader?: boolean;
}

const activityConfig: Record<ActivityType, { icon: LucideIcon; color: string; bgColor: string }> = {
  new_hire: {
    icon: UserPlus,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  profile_update: {
    icon: Settings,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  leave_approved: {
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  leave_rejected: {
    icon: UserMinus,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
  },
  payroll_completed: {
    icon: Wallet,
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
  },
  document_uploaded: {
    icon: FileText,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  clock_in: {
    icon: LogIn,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
  },
  clock_out: {
    icon: LogOut,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  claim_submitted: {
    icon: Wallet,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
  },
  announcement: {
    icon: Bell,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  system: {
    icon: MessageSquare,
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
  },
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function ActivityItem({ activity, isNew }: { activity: Activity; isNew?: boolean }) {
  const config = activityConfig[activity.type];
  const Icon = config.icon;
  const [timeAgo, setTimeAgo] = React.useState<string>('');
  const [mounted, setMounted] = React.useState(false);

  // Only calculate time on client to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
    setTimeAgo(formatTimeAgo(activity.timestamp));

    // Update time every minute
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(activity.timestamp));
    }, 60000);

    return () => clearInterval(interval);
  }, [activity.timestamp]);

  return (
    <div
      className={cn(
        'relative flex gap-3 py-3 px-3 rounded-xl transition-all duration-500',
        isNew && 'animate-slideIn bg-primary/5'
      )}
    >
      {/* Activity Icon */}
      <div className={cn('relative shrink-0')}>
        {activity.user ? (
          <Avatar className='h-10 w-10 ring-2 ring-background'>
            <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
            <AvatarFallback className='text-xs font-medium'>
              {getInitials(activity.user.name)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className={cn('h-10 w-10 rounded-full flex items-center justify-center', config.bgColor)}>
            <Icon className={cn('h-5 w-5', config.color)} />
          </div>
        )}
        {/* Activity type badge */}
        {activity.user && (
          <div
            className={cn(
              'absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full flex items-center justify-center ring-2 ring-background',
              config.bgColor
            )}
          >
            <Icon className={cn('h-3 w-3', config.color)} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className='flex-1 min-w-0'>
        <p className='text-sm font-medium text-foreground leading-tight'>
          {activity.title}
        </p>
        {activity.description && (
          <p className='text-xs text-muted-foreground mt-0.5 line-clamp-1'>
            {activity.description}
          </p>
        )}
        <div className='flex items-center gap-2 mt-1'>
          <Clock className='h-3 w-3 text-muted-foreground' />
          <span className='text-xs text-muted-foreground'>
            {mounted ? timeAgo : '\u00A0'}
          </span>
          {isNew && (
            <Badge variant='secondary' className='text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary'>
              New
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export function LiveActivityTimeline({
  activities,
  maxItems = 5,
  className,
  title = 'Live Activity',
  showHeader = true,
}: LiveActivityTimelineProps) {
  const [newActivityIds, setNewActivityIds] = React.useState<Set<string>>(new Set());
  const prevActivitiesRef = React.useRef<Activity[]>([]);

  // Get visible activities directly from props
  const visibleActivities = activities.slice(0, maxItems);

  // Detect new activities and mark them
  React.useEffect(() => {
    const prevActivities = prevActivitiesRef.current;
    const newIds = new Set<string>();

    // Check if the first activity is new (not in previous list)
    if (visibleActivities.length > 0 && prevActivities.length > 0) {
      const firstActivity = visibleActivities[0];
      if (!prevActivities.find((a) => a.id === firstActivity.id)) {
        newIds.add(firstActivity.id);
      }
    }

    // Update ref for next comparison
    prevActivitiesRef.current = visibleActivities;

    if (newIds.size > 0) {
      setNewActivityIds(newIds);
      const timer = setTimeout(() => {
        setNewActivityIds(new Set());
      }, 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [visibleActivities]);

  return (
    <div
      className={cn(
        'rounded-2xl border border-white/20 bg-white/80 backdrop-blur-xl shadow-xl dark:bg-gray-900/80 dark:border-gray-700/50',
        className
      )}
    >
      {showHeader && (
        <div className='flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800'>
          <div className='flex items-center gap-2'>
            <div className='relative'>
              <div className='h-2 w-2 rounded-full bg-emerald-500' />
              <div className='absolute inset-0 h-2 w-2 rounded-full bg-emerald-500 animate-ping' />
            </div>
            <h3 className='font-semibold text-sm'>{title}</h3>
          </div>
          <Badge variant='secondary' className='text-xs'>
            {activities.length} events
          </Badge>
        </div>
      )}

      <div className='divide-y divide-gray-100 dark:divide-gray-800'>
        {visibleActivities.length > 0 ? (
          visibleActivities.map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              isNew={newActivityIds.has(activity.id)}
            />
          ))
        ) : (
          <div className='py-8 text-center text-muted-foreground text-sm'>
            No recent activity
          </div>
        )}
      </div>

      {activities.length > maxItems && (
        <div className='px-4 py-3 border-t border-gray-100 dark:border-gray-800'>
          <button className='w-full text-xs text-primary hover:underline font-medium'>
            View all {activities.length} activities
          </button>
        </div>
      )}
    </div>
  );
}
