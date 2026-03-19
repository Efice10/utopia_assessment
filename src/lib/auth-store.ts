import { create } from 'zustand';

import { auditLogClient } from '@/lib/audit-client';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User } from '@/types/auth';

// Helper to set a cookie
function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

// Helper to delete a cookie
function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

interface AuthStore {
  user: User | null;
  loading: boolean;
  initialized: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  signIn: (email: string, password: string) => Promise<{ error: string | null; mustChangePassword?: boolean }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  clearMustChangePassword: () => void;
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
      must_change_password: byId.must_change_password ?? false,
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
        must_change_password: byEmail.must_change_password ?? false,
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

          // Set must_change_password cookie for middleware
          if (profile.must_change_password) {
            setCookie('must_change_password', 'true', 1);
          } else {
            deleteCookie('must_change_password');
          }

          // Log successful login
          auditLogClient.login(profile.name, profile.email);

          return { error: null, mustChangePassword: profile.must_change_password };
        } else {
          // Fallback to auth metadata if no profile exists
          const fallbackUser = {
            id: data.user.id,
            email: data.user.email ?? '',
            name: data.user.user_metadata?.name ?? 'User',
            role: 'user' as const,
          };
          set({
            user: fallbackUser,
            loading: false,
          });
          deleteCookie('must_change_password');
          // Log successful login
          auditLogClient.login(fallbackUser.name, fallbackUser.email);
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
      const currentUser = useAuthStore.getState().user;

      await supabase.auth.signOut();

      // Clear must_change_password cookie
      deleteCookie('must_change_password');

      // Log logout before clearing user
      if (currentUser) {
        auditLogClient.logout(currentUser.name, currentUser.email);
      }
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

          // Set must_change_password cookie for middleware
          if (profile.must_change_password) {
            setCookie('must_change_password', 'true', 1);
          } else {
            deleteCookie('must_change_password');
          }
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
          deleteCookie('must_change_password');
        }
      } else {
        set({ user: null, initialized: true });
        deleteCookie('must_change_password');
      }
    } catch (error) {
      console.error('Initialize auth failed:', error);
      set({ user: null, initialized: true });
    }
  },

  clearMustChangePassword: () => {
    deleteCookie('must_change_password');
    set((state) => ({
      user: state.user ? { ...state.user, must_change_password: false } : null,
    }));
  },
}));

// Selectors
export const useUser = () => useAuthStore((state) => state.user);
export const useAuthLoading = () => useAuthStore((state) => state.loading);
export const useAuthInitialized = () => useAuthStore((state) => state.initialized);
export const useLogout = () => useAuthStore((state) => state.signOut);
export const useMustChangePassword = () => useAuthStore((state) => state.user?.must_change_password ?? false);
