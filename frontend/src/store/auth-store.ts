import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  avatarUrl?: string;
  createdAt?: string;
  addresses?: { street: string; city: string; province: string; postalCode: string }[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: { firstName?: string; lastName?: string; phone?: string }) => Promise<void>;
  clearError: () => void;
  setInitialized: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      isInitialized: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token, refreshToken } = await authApi.login({ email, password });
          set({ user, token, refreshToken, isLoading: false });
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const { user, token, refreshToken } = await authApi.register(data);
          set({ user, token, refreshToken, isLoading: false });
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, token: null, refreshToken: null, error: null });
      },

      fetchProfile: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const user = await authApi.getMe(token);
          set({ user });
        } catch {
          set({ user: null, token: null });
        }
      },

      updateProfile: async (data) => {
        const { token, user } = get();
        if (!token || !user) throw new Error('Not authenticated');
        set({ isLoading: true, error: null });
        try {
          const updatedUser = await authApi.updateProfile(token, data);
          set({ user: { ...user, ...updatedUser }, isLoading: false });
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
      setInitialized: () => set({ isInitialized: true }),
    }),
    {
      name: 'bretunetech-auth',
      partialize: (state) => ({ user: state.user, token: state.token, refreshToken: state.refreshToken }),
      onRehydrateStorage: () => (state) => {
        state?.setInitialized();
      },
    }
  )
);
