import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { ServiceRecord, ServiceRecordUpdate } from '@/types/database';

// Query keys
export const serviceRecordKeys = {
  all: ['service-records'] as const,
  lists: () => [...serviceRecordKeys.all, 'list'] as const,
  list: (filters?: { orderId?: string; technicianId?: string }) =>
    [...serviceRecordKeys.lists(), filters] as const,
  details: () => [...serviceRecordKeys.all, 'detail'] as const,
  detail: (id: string) => [...serviceRecordKeys.details(), id] as const,
};

// Fetch service records
export function useServiceRecords(filters?: { orderId?: string; technicianId?: string }) {
  return useQuery({
    queryKey: serviceRecordKeys.list(filters),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      let query = supabase
        .from('service_records')
        .select(`
          *,
          order:orders(*),
          technician:users(*)
        `)
        .order('completed_at', { ascending: false });

      if (filters?.orderId) {
        query = query.eq('order_id', filters.orderId);
      }
      if (filters?.technicianId) {
        query = query.eq('technician_id', filters.technicianId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
}

// Fetch single service record
export function useServiceRecord(id: string) {
  return useQuery({
    queryKey: serviceRecordKeys.detail(id),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('service_records')
        .select(`
          *,
          order:orders(*),
          technician:users(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

// Create service record
export function useCreateServiceRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: Record<string, unknown>) => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('service_records')
        .insert(record)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceRecordKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

// Update service record
export function useUpdateServiceRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ServiceRecordUpdate }) => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('service_records')
        .update(updates as unknown as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ServiceRecord;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: serviceRecordKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: serviceRecordKeys.lists() });
    },
  });
}
