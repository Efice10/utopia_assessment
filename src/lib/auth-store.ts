import { create } from 'zustand';

import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User } from '@/types/auth';

interface AuthStore {
  user: User | null;
  loading: boolean;
  initialized: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

// Fetch user profile from users table (by ID or email as fallback)
async function fetchUserProfile(id: string, email?: string): Promise<User | null> {
  const supabase = getSupabaseBrowserClient();

  // First try by ID
  const { data: byId, error: idError } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (!idError && byId) {
    return {
      id: byId.id,
      name: byId.name,
      email: byId.email,
      avatar: byId.avatar_url ?? undefined,
      role: byId.role as 'user' | 'admin' | 'technician' | 'manager',
      branch_id: byId.branch_id,
    };
  }

  // Fallback: try by email (for cases where auth ID differs from users table ID)
  if (email) {
    const { data: byEmail, error: emailError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!emailError && byEmail) {
      return {
        id: byEmail.id,
        name: byEmail.name,
        email: byEmail.email,
        avatar: byEmail.avatar_url ?? undefined,
        role: byEmail.role as 'user' | 'admin' | 'technician' | 'manager',
        branch_id: byEmail.branch_id,
      };
    }
  }

  return null;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  loading: false,
  initialized: false,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  signIn: async (email: string, password: string) => {
    set({ loading: true });

    try {
      const supabase = getSupabaseBrowserClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set({ loading: false });
        return { error: error.message };
      }

      if (data.user) {
        // Fetch user profile from users table (by ID, fallback to email)
        const profile = await fetchUserProfile(data.user.id, data.user.email);

        if (profile) {
          set({ user: profile, loading: false });
        } else {
          // Fallback to auth metadata if no profile exists
          set({
            user: {
              id: data.user.id,
              email: data.user.email ?? '',
              name: data.user.user_metadata?.name ?? 'User',
              role: 'user',
            },
            loading: false,
          });
        }
      }

      return { error: null };
    } catch (error) {
      console.error('Sign in failed:', error);
      set({ loading: false });
      return { error: 'An unexpected error occurred' };
    }
  },

  signUp: async (email: string, password: string, name?: string) => {
    set({ loading: true });

    try {
      const supabase = getSupabaseBrowserClient();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name ?? 'User',
          },
        },
      });

      if (error) {
        set({ loading: false });
        return { error: error.message };
      }

      if (data.user) {
        // Create user profile in users table
        await supabase.from('users').insert({
          id: data.user.id,
          email,
          name: name ?? 'User',
          role: 'user',
          is_active: true,
        });

        set({
          user: {
            id: data.user.id,
            email: data.user.email ?? '',
            name: name ?? 'User',
            role: 'user',
          },
          loading: false,
        });
      }

      return { error: null };
    } catch (error) {
      console.error('Sign up failed:', error);
      set({ loading: false });
      return { error: 'An unexpected error occurred' };
    }
  },

  signOut: async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
    set({ user: null, loading: false });
  },

  initialize: async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id, session.user.email);

        if (profile) {
          set({ user: profile, initialized: true });
        } else {
          set({
            user: {
              id: session.user.id,
              email: session.user.email ?? '',
              name: session.user.user_metadata?.name ?? 'User',
              role: session.user.user_metadata?.role ?? 'user',
            },
            initialized: true,
          });
        }
      } else {
        set({ user: null, initialized: true });
      }
    } catch (error) {
      console.error('Initialize auth failed:', error);
      set({ user: null, initialized: true });
    }
  },
}));

// Selectors
export const useUser = () => useAuthStore((state) => state.user);
export const useAuthLoading = () => useAuthStore((state) => state.loading);
export const useAuthInitialized = () => useAuthStore((state) => state.initialized);
export const useLogout = () => useAuthStore((state) => state.signOut);
