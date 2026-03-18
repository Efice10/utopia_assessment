import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type {
  Order,
  OrderInsert,
  OrderUpdate,
  OrderWithRelations,
} from '@/types/database';

// Query keys
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters?: OrderFilters) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

export interface OrderFilters {
  status?: string;
  technicianId?: string;
  serviceType?: string;
  branchId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Fetch all orders
export function useOrders(filters?: OrderFilters, enabled = true) {
  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      let query = supabase
        .from('orders')
        .select(
          `
          *,
          technician:users!assigned_technician_id(*),
          branch:branches(*)
        `
        )
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.technicianId) {
        query = query.eq('assigned_technician_id', filters.technicianId);
      }
      if (filters?.serviceType) {
        query = query.eq('service_type', filters.serviceType);
      }
      if (filters?.branchId) {
        query = query.eq('branch_id', filters.branchId);
      }
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as OrderWithRelations[];
    },
    enabled,
  });
}

// Fetch single order
export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('orders')
        .select(
          `
          *,
          technician:users!assigned_technician_id(*),
          branch:branches(*),
          service_record:service_records(*)
        `
        )
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as OrderWithRelations;
    },
    enabled: !!id,
  });
}

// Create order
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (order: OrderInsert) => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('orders')
        .insert(order as unknown as Record<string, unknown>)
        .select()
        .single();

      if (error) throw error;
      return data as Order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

// Update order
export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: OrderUpdate }) => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('orders')
        .update(updates as unknown as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Order;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

// Update order status
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Order;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

// Delete order
export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from('orders').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}
