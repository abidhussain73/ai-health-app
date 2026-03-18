import { create } from 'zustand';

type AuthUser = {
  id: string;
  email: string;
  role: string;
  plan: string;
  name: string;
};

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      document.cookie = 'accessToken=; Max-Age=0; path=/';
    }

    set({ user: null, isAuthenticated: false });
  }
}));
