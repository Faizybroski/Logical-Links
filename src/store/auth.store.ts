"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
  id: string;
  email: string;
  role: "admin" | "shipper";
  fullName: string | null;
  accountId: string | null;
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
  user: AuthUser | null;
  isAuthenticated: boolean;

  // True once the persist middleware has rehydrated state from localStorage.
  // AuthGuard must wait for this before making redirect decisions, otherwise
  // a page refresh races with rehydration and incorrectly redirects to /login.
  _hasHydrated: boolean;

  setAuth: (payload: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: AuthUser;
  }) => void;

  setAccessToken: (accessToken: string, expiresIn: number) => void;

  clearAuth: () => void;

  setHasHydrated: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      expiresIn: null,
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setAuth: ({ accessToken, refreshToken, expiresIn, user }) =>
        set({ accessToken, refreshToken, expiresIn, user, isAuthenticated: true }),

      setAccessToken: (accessToken, expiresIn) =>
        set({ accessToken, expiresIn }),

      clearAuth: () =>
        set({
          accessToken: null,
          refreshToken: null,
          expiresIn: null,
          user: null,
          isAuthenticated: false,
        }),

      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: "ll-auth",
      partialize: (state) => ({
        accessToken:     state.accessToken,
        refreshToken:    state.refreshToken,
        expiresIn:       state.expiresIn,
        user:            state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export function getAuthStore() {
  return useAuthStore.getState();
}
