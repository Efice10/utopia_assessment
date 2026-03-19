import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { auditLogClient } from '@/lib/audit-client';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type {
  Branch,
  BranchInsert,
  BranchUpdate,
  Order,
} from '@/types/database';

// Query keys
export const branchKeys = {
  all: ['branches'] as const,
  lists: () => [...branchKeys.all, 'list'] as const,
  detail: (id: string) => [...branchKeys.all, 'detail', id] as const,
  orders: (id: string) => [...branchKeys.all, 'orders', id] as const,
};

// Fetch all branches
export function useBranches() {
  return useQuery({
    queryKey: branchKeys.lists(),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Branch[];
    },
  });
}

// Fetch single branch
export function useBranch(id: string) {
  return useQuery({
    queryKey: branchKeys.detail(id),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Branch;
    },
    enabled: !!id,
  });
}

// Fetch orders for a branch
export function useBranchOrders(branchId: string) {
  return useQuery({
    queryKey: branchKeys.orders(branchId),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('branch_id', branchId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
    enabled: !!branchId,
  });
}

// Create branch
export function useCreateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (branch: BranchInsert) => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('branches')
        .insert(branch as unknown as Record<string, unknown>)
        .select()
        .single();

      if (error) throw error;
      return data as Branch;
    },
    onSuccess: (data) => {
      // Log audit event
      auditLogClient.createBranch(data.id, data.name);
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
    },
  });
}

// Update branch
export function useUpdateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates, oldValues }: { id: string; updates: BranchUpdate; oldValues?: Branch }) => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('branches')
        .update(updates as unknown as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data: data as Branch, oldValues } as const;
    },
    onSuccess: ({ data, oldValues }) => {
      // Log audit event
      auditLogClient.updateBranch(
        data.id,
        data.name,
        oldValues ? (oldValues as unknown as Record<string, unknown>) : undefined,
        data as unknown as Record<string, unknown>
      );
      queryClient.invalidateQueries({ queryKey: branchKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
    },
  });
}

// Delete branch
export function useDeleteBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from('branches').delete().eq('id', id);

      if (error) throw error;
      return { id, name };
    },
    onSuccess: ({ id, name }) => {
      // Log audit event
      auditLogClient.deleteBranch(id, name);
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
    },
  });
}
