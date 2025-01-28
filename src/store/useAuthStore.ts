import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  expiresAt: number | null;
  email: string | null;
  password: string | null;
  setToken: (token: string, expiresIn: number) => void;
  setCredentials: (email: string, password: string) => void;
  clearToken: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      expiresAt: null,
      email: null,
      password: null,
      setToken: (token, expiresIn) => {
        const expiresAt = Date.now() + expiresIn * 1000;
        set({ token, expiresAt });
      },
      setCredentials: (email, password) => {
        set({ email, password });
      },
      clearToken: () =>
        set({
          token: null,
          expiresAt: null,
          email: null,
          password: null,
        }),
      isAuthenticated: () => {
        const state = get();
        return (
          !!state.token && !!state.expiresAt && state.expiresAt > Date.now()
        );
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
