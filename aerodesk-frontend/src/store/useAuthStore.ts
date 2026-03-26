import { create } from 'zustand'

interface AuthState {
  token: string | null;
  role: string | null;
  userId: number | null;
  setAuth: (token: string, role: string, userId: number) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),
  role: localStorage.getItem("role"),
  userId: localStorage.getItem("userId") ? parseInt(localStorage.getItem("userId")!) : null,
  setAuth: (token, role, userId) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("userId", userId.toString());
    set({ token, role, userId });
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    set({ token: null, role: null, userId: null });
  }
}));
