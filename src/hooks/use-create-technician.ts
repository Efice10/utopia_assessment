import { useMutation, useQueryClient } from '@tanstack/react-query';

import { auditLogClient } from '@/lib/audit-client';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User } from '@/types/database';

export interface CreateTechnicianData {
  name: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  ic_number: string;
  specialties: string;
  notes?: string;
  branch_id: string;
  is_active: boolean;
}

export interface CreateTechnicianResult {
  user: User;
  authUserId: string;
}

// Create technician with auth credentials
export function useCreateTechnician() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTechnicianData): Promise<CreateTechnicianResult> => {
      const supabase = getSupabaseBrowserClient();

      // Step 1: Create Supabase Auth user using admin API
      // Note: We need to use a server-side API route for this since browser client
      // cannot use admin.createUser. For now, we'll use signUp and immediately confirm.

      // Actually, for admin-created users, we need to call our API endpoint
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
          role: 'technician',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create auth user');
      }

      const { authUserId } = await response.json();

      // Step 2: Create user record in users table with the auth user ID
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          id: authUserId,
          email: data.email,
          name: data.name,
          phone: data.phone,
          role: 'technician',
          branch_id: data.branch_id, // Set branch_id on users table
          is_active: data.is_active,
          must_change_password: true, // Force password change on first login
        })
        .select()
        .single();

      if (userError) {
        // If user insert fails, we should ideally clean up the auth user
        // But for now, we'll just throw the error
        throw new Error(`Failed to create user record: ${userError.message}`);
      }

      // Step 3: Assign branch to the technician
      const { error: branchError } = await supabase.from('user_branches').insert({
        user_id: authUserId,
        branch_id: data.branch_id,
        is_primary: true,
      });

      if (branchError) {
        console.error('Failed to assign branch:', branchError);
        // Don't throw here, the technician is already created
      }

      return {
        user: newUser as User,
        authUserId,
      };
    },
    onSuccess: (data) => {
      // Log audit event
      auditLogClient.createUser(data.user.id, data.user.name, data.user.email);

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['technicians'] });
    },
  });
}
