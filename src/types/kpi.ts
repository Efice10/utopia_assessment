/**
 * KPI Types
 */

// Time period presets
export type TimePeriodPreset = 'today' | 'this_week' | 'this_month' | 'last_month' | 'all_time' | 'custom';

// KPI filters
export interface KPIFilters {
  period: TimePeriodPreset;
  dateFrom?: Date;
  dateTo?: Date;
  technicianId?: string;
  branchId?: string;
}

// Enhanced technician stats with additional metrics
export interface EnhancedTechnicianStats {
  id: string;
  name: string;
  avatar_url?: string | null;
  totalJobs: number;
  completedJobs: number;
  pendingJobs: number;
  inProgressJobs: number;
  totalRevenue: number;
  completionRate: number;
  // New metrics
  jobsThisWeek: number;
  jobsThisMonth: number;
  revenueThisMonth: number;
  avgCompletionTime: number | null; // in hours
  rank?: number;
}

// Dashboard overview stats
export interface DashboardStats {
  totalOrders: number;
  pending: number;
  inProgress: number;
  completed: number;
  totalRevenue: number;
  totalTechnicians: number;
  activeTechnicians: number;
  completionRate: number;
  // Period comparison
  previousPeriod?: {
    totalOrders: number;
    totalRevenue: number;
  };
  changePercent?: {
    orders: number;
    revenue: number;
  };
}

// Chart data types
export interface JobsChartData {
  name: string;
  jobs: number;
  completed: number;
  pending: number;
}

export interface RevenueChartData {
  date: string;
  revenue: number;
  label?: string;
}

export interface ServiceTypeChartData {
  name: string;
  value: number;
  color?: string;
}

// Leaderboard entry
export interface LeaderboardEntry {
  rank: number;
  technicianId: string;
  technicianName: string;
  avatar_url?: string | null;
  jobsCompleted: number;
  totalRevenue: number;
  completionRate: number;
  trend?: 'up' | 'down' | 'same';
}

// Date range helper
export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * Get date range for a preset period
 */
export function getDateRangeForPreset(preset: TimePeriodPreset): DateRange | null {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case 'today':
      return { from: today, to: now };

    case 'this_week': {
      const dayOfWeek = today.getDay();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - dayOfWeek);
      return { from: weekStart, to: now };
    }

    case 'this_month': {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: monthStart, to: now };
    }

    case 'last_month': {
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from: lastMonthStart, to: lastMonthEnd };
    }

    case 'all_time':
      return null;

    case 'custom':
      return null;

    default:
      return null;
  }
}

/**
 * Format date for API query
 */
export function formatDateForQuery(date: Date): string {
  return date.toISOString();
}
