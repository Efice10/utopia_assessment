/**
 * User Branches Hook
 *
 * React Query hooks for managing user-branch assignments.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { getSupabaseBrowserClient } from '@/lib/supabase/client';

// Query keys
export const userBranchKeys = {
  all: ['user-branches'] as const,
  byUser: (userId: string) => [...userBranchKeys.all, 'user', userId] as const,
};

// User branch assignment type
export interface UserBranch {
  id: string;
  user_id: string;
  branch_id: string;
  is_primary: boolean;
  created_at: string;
  branch?: {
    id: string;
    name: string;
    is_hq: boolean;
    is_active: boolean;
  };
}

// Fetch user's branch assignments
export function useUserBranches(userId: string) {
  return useQuery({
    queryKey: userBranchKeys.byUser(userId),
    queryFn: async (): Promise<UserBranch[]> => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('user_branches')
        .select(`
          id,
          user_id,
          branch_id,
          is_primary,
          created_at,
          branch:branches (
            id,
            name,
            is_hq,
            is_active
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      // Transform the data to ensure branch is a single object, not an array
      return (data ?? []).map((item) => ({
        ...item,
        branch: Array.isArray(item.branch) ? item.branch[0] : item.branch,
      })) as UserBranch[];
    },
    enabled: !!userId,
  });
}

// Update user's branch assignments
export function useUpdateUserBranches() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      branchIds,
      primaryBranchId,
    }: {
      userId: string;
      branchIds: string[];
      primaryBranchId?: string;
    }) => {
      const supabase = getSupabaseBrowserClient();

      // First, delete all existing assignments
      const { error: deleteError } = await supabase
        .from('user_branches')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Then, insert new assignments
      if (branchIds.length > 0) {
        const assignments = branchIds.map((branchId) => ({
          user_id: userId,
          branch_id: branchId,
          is_primary: primaryBranchId ? branchId === primaryBranchId : branchId === branchIds[0],
        }));

        const { error: insertError } = await supabase
          .from('user_branches')
          .insert(assignments);

        if (insertError) throw insertError;
      }

      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userBranchKeys.byUser(variables.userId) });
      // Also invalidate branches list as access may have changed
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });
}

// Add a single branch assignment
export function useAddUserBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      branchId,
      isPrimary = false,
    }: {
      userId: string;
      branchId: string;
      isPrimary?: boolean;
    }) => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('user_branches')
        .insert({
          user_id: userId,
          branch_id: branchId,
          is_primary: isPrimary,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userBranchKeys.byUser(variables.userId) });
    },
  });
}

// Remove a single branch assignment
export function useRemoveUserBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      branchId,
    }: {
      userId: string;
      branchId: string;
    }) => {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from('user_branches')
        .delete()
        .eq('user_id', userId)
        .eq('branch_id', branchId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userBranchKeys.byUser(variables.userId) });
    },
  });
}

// Set primary branch
export function useSetPrimaryBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      branchId,
    }: {
      userId: string;
      branchId: string;
    }) => {
      const supabase = getSupabaseBrowserClient();

      // First, set all branches to not primary
      const { error: updateAllError } = await supabase
        .from('user_branches')
        .update({ is_primary: false })
        .eq('user_id', userId);

      if (updateAllError) throw updateAllError;

      // Then, set the selected branch as primary
      const { error: updateOneError } = await supabase
        .from('user_branches')
        .update({ is_primary: true })
        .eq('user_id', userId)
        .eq('branch_id', branchId);

      if (updateOneError) throw updateOneError;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userBranchKeys.byUser(variables.userId) });
    },
  });
}
