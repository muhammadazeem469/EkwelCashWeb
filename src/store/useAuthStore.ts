import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  expiresAt: number | null;
  clientId: string | null;
  clientSecret: string | null;
  setToken: (token: string, expiresIn: number) => void;
  setCredentials: (clientId: string, clientSecret: string) => void;
  clearToken: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      expiresAt: null,
      clientId: null,
      clientSecret: null,
      setToken: (token, expiresIn) => {
        const expiresAt = Date.now() + expiresIn * 1000;
        set({ token, expiresAt });
      },
      setCredentials: (clientId, clientSecret) => {
        set({ clientId, clientSecret });
      },
      clearToken: () =>
        set({
          token: null,
          expiresAt: null,
          clientId: null,
          clientSecret: null,
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
