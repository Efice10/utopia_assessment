'use client';

import * as React from 'react';

import {
  AlertCircle,
  Ban,
  CheckCircle2,
  Clock,
  DollarSign,
  Eye,
  Loader2,
  XCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Unified status types across the application
type StatusType =
  // General statuses
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  // Attendance statuses
  | 'present'
  | 'absent'
  | 'late'
  | 'leave'
  // Claim statuses
  | 'processing'
  | 'paid'
  | 'reviewed'
  // Employee/User statuses
  | 'active'
  | 'inactive'
  // Site visit statuses
  | 'completed'
  | 'scheduled'
  | 'instant';

interface StatusConfig {
  label: string;
  className: string;
  icon: React.ComponentType<{ className?: string }>;
}

const statusConfigs: Record<StatusType, StatusConfig> = {
  // General
  pending: {
    label: 'Pending',
    className: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800',
    icon: Clock,
  },
  approved: {
    label: 'Approved',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800',
    icon: CheckCircle2,
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-800',
    icon: XCircle,
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-gray-500/10 text-gray-600 border-gray-200 dark:border-gray-700',
    icon: Ban,
  },
  // Attendance
  present: {
    label: 'Present',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800',
    icon: CheckCircle2,
  },
  absent: {
    label: 'Absent',
    className: 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-800',
    icon: XCircle,
  },
  late: {
    label: 'Late',
    className: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800',
    icon: AlertCircle,
  },
  leave: {
    label: 'Leave',
    className: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800',
    icon: Clock,
  },
  // Claim
  processing: {
    label: 'Processing',
    className: 'bg-cyan-500/10 text-cyan-600 border-cyan-200 dark:border-cyan-800',
    icon: Loader2,
  },
  paid: {
    label: 'Paid',
    className: 'bg-green-500/10 text-green-600 border-green-200 dark:border-green-800',
    icon: DollarSign,
  },
  reviewed: {
    label: 'Reviewed',
    className: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800',
    icon: Eye,
  },
  // Employee/User
  active: {
    label: 'Active',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800',
    icon: CheckCircle2,
  },
  inactive: {
    label: 'Inactive',
    className: 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-800',
    icon: XCircle,
  },
  // Site visit
  completed: {
    label: 'Completed',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800',
    icon: CheckCircle2,
  },
  scheduled: {
    label: 'Scheduled',
    className: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800',
    icon: Clock,
  },
  instant: {
    label: 'Instant',
    className: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800',
    icon: Loader2,
  },
};

interface StatusBadgeProps {
  status: StatusType | string;
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  showIcon = true,
  className,
}: StatusBadgeProps) {
  // Normalize status to lowercase
  const normalizedStatus = status.toLowerCase() as StatusType;
  const config = statusConfigs[normalizedStatus];

  if (!config) {
    // Fallback for unknown statuses
    return (
      <Badge variant='outline' className={className}>
        {status}
      </Badge>
    );
  }

  const Icon = config.icon;

  return (
    <Badge
      variant='outline'
      className={cn('gap-1 font-medium', config.className, className)}
    >
      {showIcon && <Icon className='h-3 w-3' />}
      {config.label}
    </Badge>
  );
}

// Helper function to get status from string (for type safety)
export function getStatusType(status: string): StatusType | null {
  const normalized = status.toLowerCase() as StatusType;
  return statusConfigs[normalized] ? normalized : null;
}
