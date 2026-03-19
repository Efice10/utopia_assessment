import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { auditLogClient } from '@/lib/audit-client';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User, UserInsert, UserUpdate, UserRole } from '@/types/database';

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters?: UserFilters) => [...userKeys.lists(), filters] as const,
  technicians: () => [...userKeys.all, 'technicians'] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

export interface UserFilters {
  role?: UserRole;
  branchId?: string;
  isActive?: boolean;
}

// Fetch all users
export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      let query = supabase.from('users').select('*').order('name');

      if (filters?.role) {
        query = query.eq('role', filters.role);
      }
      if (filters?.branchId) {
        query = query.eq('branch_id', filters.branchId);
      }
      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as User[];
    },
  });
}

// Fetch technicians only
export function useTechnicians(branchId?: string) {
  return useQuery({
    queryKey: [...userKeys.technicians(), branchId],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      let query = supabase
        .from('users')
        .select('*')
        .eq('role', 'technician')
        .eq('is_active', true);

      if (branchId) {
        query = query.eq('branch_id', branchId);
      }

      const { data, error } = await query.order('name');

      if (error) throw error;
      return data as User[];
    },
  });
}

// Fetch single user
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as User;
    },
    enabled: !!id,
  });
}

// Create user
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: UserInsert) => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('users')
        .insert(user as unknown as Record<string, unknown>)
        .select()
        .single();

      if (error) throw error;
      return data as User;
    },
    onSuccess: (data) => {
      // Log audit event
      auditLogClient.createUser(data.id, data.name, data.email);
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.technicians() });
    },
  });
}

// Update user
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates, oldValues }: { id: string; updates: UserUpdate; oldValues?: User }) => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('users')
        .update(updates as unknown as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data: data as User, oldValues } as const;
    },
    onSuccess: ({ data, oldValues }) => {
      // Log audit event
      auditLogClient.updateUser(
        data.id,
        data.name,
        oldValues ? (oldValues as unknown as Record<string, unknown>) : undefined,
        data as unknown as Record<string, unknown>
      );
      queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.technicians() });
    },
  });
}

// Delete user
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from('users').delete().eq('id', id);

      if (error) throw error;
      return { id, name };
    },
    onSuccess: ({ id, name }) => {
      // Log audit event
      auditLogClient.deleteUser(id, name);
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.technicians() });
    },
  });
}

// Technician performance stats
export interface TechnicianStats {
  id: string;
  name: string;
  totalJobs: number;
  completedJobs: number;
  pendingJobs: number;
  totalRevenue: number;
  completionRate: number;
}

export function useTechnicianStats(dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ['technician-stats', dateFrom, dateTo],
    queryFn: async (): Promise<TechnicianStats[]> => {
      const supabase = getSupabaseBrowserClient();

      // Get technicians
      const { data: technicians, error: techError } = await supabase
        .from('users')
        .select('id, name')
        .eq('role', 'technician')
        .eq('is_active', true);

      if (techError) throw techError;

      // Get orders for each technician
      const stats: TechnicianStats[] = [];

      for (const tech of technicians || []) {
        let query = supabase
          .from('orders')
          .select('id, status, quoted_price')
          .eq('assigned_technician_id', tech.id);

        if (dateFrom) {
          query = query.gte('created_at', dateFrom);
        }
        if (dateTo) {
          query = query.lte('created_at', dateTo);
        }

        const { data: orders } = await query;

        const orderList = orders as Array<{
          id: string;
          status: string;
          quoted_price: number;
        }> | null;

        const totalJobs = orderList?.length || 0;
        const completedJobs =
          orderList?.filter(
            (o) => o.status === 'closed' || o.status === 'reviewed'
          ).length || 0;
        const pendingJobs =
          orderList?.filter(
            (o) => o.status === 'new' || o.status === 'assigned'
          ).length || 0;
        const totalRevenue =
          orderList
            ?.filter((o) => o.status === 'closed' || o.status === 'reviewed')
            .reduce((sum, o) => sum + (o.quoted_price || 0), 0) || 0;

        stats.push({
          id: tech.id,
          name: tech.name,
          totalJobs,
          completedJobs,
          pendingJobs,
          totalRevenue,
          completionRate: totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0,
        });
      }

      return stats.sort((a, b) => b.completedJobs - a.completedJobs);
    },
  });
}
