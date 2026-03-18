/**
 * KPI Stats Hooks
 *
 * React Query hooks for KPI and dashboard statistics.
 */

import { useQuery } from '@tanstack/react-query';

import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type {
  KPIFilters,
  EnhancedTechnicianStats,
  DashboardStats,
  JobsChartData,
  RevenueChartData,
  LeaderboardEntry,
} from '@/types/kpi';
import { getDateRangeForPreset, formatDateForQuery } from '@/types/kpi';

// Query keys
export const kpiKeys = {
  all: ['kpi'] as const,
  dashboard: (filters?: KPIFilters) => [...kpiKeys.all, 'dashboard', filters] as const,
  technicians: (filters?: KPIFilters) => [...kpiKeys.all, 'technicians', filters] as const,
  leaderboard: (filters?: KPIFilters) => [...kpiKeys.all, 'leaderboard', filters] as const,
  jobsChart: (filters?: KPIFilters) => [...kpiKeys.all, 'jobsChart', filters] as const,
  revenueChart: (filters?: KPIFilters) => [...kpiKeys.all, 'revenueChart', filters] as const,
};

/**
 * Get date range from filters
 */
function getDateRange(filters?: KPIFilters): { dateFrom?: string; dateTo?: string } {
  if (!filters) return {};

  if (filters.period === 'custom' && filters.dateFrom && filters.dateTo) {
    return {
      dateFrom: formatDateForQuery(filters.dateFrom),
      dateTo: formatDateForQuery(filters.dateTo),
    };
  }

  const range = getDateRangeForPreset(filters.period);
  if (!range) return {};

  return {
    dateFrom: formatDateForQuery(range.from),
    dateTo: formatDateForQuery(range.to),
  };
}

/**
 * Get dashboard stats with optional time filter
 */
export function useDashboardStats(filters?: KPIFilters) {
  return useQuery({
    queryKey: kpiKeys.dashboard(filters),
    queryFn: async (): Promise<DashboardStats> => {
      const supabase = getSupabaseBrowserClient();
      const { dateFrom, dateTo } = getDateRange(filters);

      // Build orders query
      let ordersQuery = supabase
        .from('orders')
        .select('id, status, quoted_price, created_at');

      if (filters?.branchId) {
        ordersQuery = ordersQuery.eq('branch_id', filters.branchId);
      }
      if (dateFrom) {
        ordersQuery = ordersQuery.gte('created_at', dateFrom);
      }
      if (dateTo) {
        ordersQuery = ordersQuery.lte('created_at', dateTo);
      }

      const { data: orders, error: ordersError } = await ordersQuery;

      if (ordersError) throw ordersError;

      // Get technicians
      let techQuery = supabase
        .from('users')
        .select('id, is_active')
        .eq('role', 'technician');

      if (filters?.branchId) {
        techQuery = techQuery.eq('branch_id', filters.branchId);
      }

      const { data: technicians, error: techError } = await techQuery;

      if (techError) throw techError;

      const orderList = orders || [];
      const techList = technicians || [];

      const totalOrders = orderList.length;
      const pending = orderList.filter((o) => ['new', 'assigned'].includes(o.status)).length;
      const inProgress = orderList.filter((o) => o.status === 'in_progress').length;
      const completed = orderList.filter((o) => ['job_done', 'reviewed', 'closed'].includes(o.status)).length;
      const totalRevenue = orderList
        .filter((o) => ['job_done', 'reviewed', 'closed'].includes(o.status))
        .reduce((sum, o) => sum + (o.quoted_price || 0), 0);

      return {
        totalOrders,
        pending,
        inProgress,
        completed,
        totalRevenue,
        totalTechnicians: techList.length,
        activeTechnicians: techList.filter((t) => t.is_active).length,
        completionRate: totalOrders > 0 ? (completed / totalOrders) * 100 : 0,
      };
    },
  });
}

/**
 * Get enhanced technician stats with leaderboard ranking
 */
export function useEnhancedTechnicianStats(filters?: KPIFilters) {
  return useQuery({
    queryKey: kpiKeys.technicians(filters),
    queryFn: async (): Promise<EnhancedTechnicianStats[]> => {
      const supabase = getSupabaseBrowserClient();
      const { dateFrom, dateTo } = getDateRange(filters);

      // Get technicians
      let techQuery = supabase
        .from('users')
        .select('id, name, avatar_url')
        .eq('role', 'technician')
        .eq('is_active', true);

      if (filters?.branchId) {
        techQuery = techQuery.eq('branch_id', filters.branchId);
      }

      const { data: technicians, error: techError } = await techQuery;

      if (techError) throw techError;

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const stats: EnhancedTechnicianStats[] = [];

      for (const tech of technicians || []) {
        // All orders for this technician
        let query = supabase
          .from('orders')
          .select('id, status, quoted_price, created_at')
          .eq('assigned_technician_id', tech.id);

        if (filters?.branchId) {
          query = query.eq('branch_id', filters.branchId);
        }
        if (dateFrom) {
          query = query.gte('created_at', dateFrom);
        }
        if (dateTo) {
          query = query.lte('created_at', dateTo);
        }

        const { data: orders } = await query;
        const orderList = orders || [];

        // Get orders this week
        let weekQuery = supabase
          .from('orders')
          .select('id')
          .eq('assigned_technician_id', tech.id)
          .gte('created_at', weekAgo.toISOString());

        if (filters?.branchId) {
          weekQuery = weekQuery.eq('branch_id', filters.branchId);
        }

        const { data: weekOrders } = await weekQuery;

        // Get orders this month
        let monthQuery = supabase
          .from('orders')
          .select('id, quoted_price, status')
          .eq('assigned_technician_id', tech.id)
          .gte('created_at', monthStart.toISOString());

        if (filters?.branchId) {
          monthQuery = monthQuery.eq('branch_id', filters.branchId);
        }

        const { data: monthOrders } = await monthQuery;

        const totalJobs = orderList.length;
        const completedJobs = orderList.filter(
          (o) => o.status === 'closed' || o.status === 'reviewed' || o.status === 'job_done'
        ).length;
        const pendingJobs = orderList.filter(
          (o) => o.status === 'new' || o.status === 'assigned'
        ).length;
        const inProgressJobs = orderList.filter((o) => o.status === 'in_progress').length;
        const totalRevenue = orderList
          .filter((o) => o.status === 'closed' || o.status === 'reviewed')
          .reduce((sum, o) => sum + (o.quoted_price || 0), 0);

        const monthOrdersList = monthOrders || [];
        const revenueThisMonth = monthOrdersList
          .filter((o) => o.status === 'closed' || o.status === 'reviewed')
          .reduce((sum, o) => sum + (o.quoted_price || 0), 0);

        stats.push({
          id: tech.id,
          name: tech.name,
          avatar_url: tech.avatar_url,
          totalJobs,
          completedJobs,
          pendingJobs,
          inProgressJobs,
          totalRevenue,
          completionRate: totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0,
          jobsThisWeek: weekOrders?.length || 0,
          jobsThisMonth: monthOrdersList.length,
          revenueThisMonth,
          avgCompletionTime: null, // Would need service_records data
        });
      }

      // Sort by completed jobs and add ranks
      const sorted = stats.sort((a, b) => b.completedJobs - a.completedJobs);
      sorted.forEach((stat, index) => {
        stat.rank = index + 1;
      });

      return sorted;
    },
  });
}

/**
 * Get leaderboard data
 */
export function useLeaderboard(filters?: KPIFilters) {
  return useQuery({
    queryKey: kpiKeys.leaderboard(filters),
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      const supabase = getSupabaseBrowserClient();
      const { dateFrom, dateTo } = getDateRange(filters);

      // Get technicians
      let techQuery = supabase
        .from('users')
        .select('id, name, avatar_url')
        .eq('role', 'technician')
        .eq('is_active', true);

      if (filters?.branchId) {
        techQuery = techQuery.eq('branch_id', filters.branchId);
      }

      const { data: technicians, error: techError } = await techQuery;

      if (techError) throw techError;

      const entries: LeaderboardEntry[] = [];

      for (const tech of technicians || []) {
        let query = supabase
          .from('orders')
          .select('id, status, quoted_price')
          .eq('assigned_technician_id', tech.id);

        if (filters?.branchId) {
          query = query.eq('branch_id', filters.branchId);
        }
        if (dateFrom) {
          query = query.gte('created_at', dateFrom);
        }
        if (dateTo) {
          query = query.lte('created_at', dateTo);
        }

        const { data: orders } = await query;
        const orderList = orders || [];

        const totalJobs = orderList.length;
        const completedJobs = orderList.filter(
          (o) => o.status === 'closed' || o.status === 'reviewed'
        ).length;
        const totalRevenue = orderList
          .filter((o) => o.status === 'closed' || o.status === 'reviewed')
          .reduce((sum, o) => sum + (o.quoted_price || 0), 0);

        entries.push({
          rank: 0, // Will be set after sorting
          technicianId: tech.id,
          technicianName: tech.name,
          avatar_url: tech.avatar_url,
          jobsCompleted: completedJobs,
          totalRevenue,
          completionRate: totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0,
        });
      }

      // Sort and rank
      const sorted = entries.sort((a, b) => b.jobsCompleted - a.jobsCompleted);
      sorted.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      return sorted;
    },
  });
}

/**
 * Get jobs per technician chart data
 */
export function useJobsChartData(filters?: KPIFilters) {
  return useQuery({
    queryKey: kpiKeys.jobsChart(filters),
    queryFn: async (): Promise<JobsChartData[]> => {
      const supabase = getSupabaseBrowserClient();
      const { dateFrom, dateTo } = getDateRange(filters);

      // Get technicians
      let techQuery = supabase
        .from('users')
        .select('id, name')
        .eq('role', 'technician')
        .eq('is_active', true)
        .limit(10); // Limit for chart readability

      if (filters?.branchId) {
        techQuery = techQuery.eq('branch_id', filters.branchId);
      }

      const { data: technicians } = await techQuery;

      const chartData: JobsChartData[] = [];

      for (const tech of technicians || []) {
        let query = supabase
          .from('orders')
          .select('id, status')
          .eq('assigned_technician_id', tech.id);

        if (filters?.branchId) {
          query = query.eq('branch_id', filters.branchId);
        }
        if (dateFrom) {
          query = query.gte('created_at', dateFrom);
        }
        if (dateTo) {
          query = query.lte('created_at', dateTo);
        }

        const { data: orders } = await query;
        const orderList = orders || [];

        chartData.push({
          name: tech.name.split(' ')[0], // First name only for chart
          jobs: orderList.length,
          completed: orderList.filter(
            (o) => o.status === 'closed' || o.status === 'reviewed'
          ).length,
          pending: orderList.filter(
            (o) => o.status === 'new' || o.status === 'assigned'
          ).length,
        });
      }

      return chartData.sort((a, b) => b.jobs - a.jobs);
    },
  });
}

/**
 * Get revenue over time chart data
 */
export function useRevenueChartData(filters?: KPIFilters) {
  return useQuery({
    queryKey: kpiKeys.revenueChart(filters),
    queryFn: async (): Promise<RevenueChartData[]> => {
      const supabase = getSupabaseBrowserClient();
      const { dateFrom, dateTo } = getDateRange(filters);

      let query = supabase
        .from('orders')
        .select('quoted_price, created_at, status')
        .in('status', ['job_done', 'reviewed', 'closed']);

      if (filters?.branchId) {
        query = query.eq('branch_id', filters.branchId);
      }
      if (dateFrom) {
        query = query.gte('created_at', dateFrom);
      }
      if (dateTo) {
        query = query.lte('created_at', dateTo);
      }

      const { data: orders } = await query;
      const orderList = orders || [];

      // Group by date
      const byDate: Record<string, number> = {};

      for (const order of orderList) {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        byDate[date] = (byDate[date] || 0) + (order.quoted_price || 0);
      }

      // Convert to chart data
      const chartData: RevenueChartData[] = Object.entries(byDate)
        .map(([date, revenue]) => ({
          date,
          revenue,
          label: new Date(date).toLocaleDateString('en-MY', {
            month: 'short',
            day: 'numeric',
          }),
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return chartData;
    },
  });
}
