"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
  id:          string;
  email:       string;
  role:        "admin" | "shipper";
  companyRole: "company_admin" | "employee" | null;
  adminRole:   "ceo" | "vp" | "manager" | "assistant" | null;
  permissions: string[];
  fullName:    string | null;
  accountId:   string | null;
  avatarUrl:   string | null;
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

  // Patch individual fields of the stored user without a full re-login.
  // Used after profile updates (avatar, name) to keep the sidebar/header in sync.
  patchUser: (patch: Partial<AuthUser>) => void;

  setAccessToken: (accessToken: string, expiresIn: number) => void;

  // Used after a token refresh — updates both access and refresh tokens without
  // needing to re-supply the user object (which the /refresh endpoint doesn't return).
  setTokens: (accessToken: string, refreshToken: string, expiresIn: number) => void;

  clearAuth: () => void;

  setHasHydrated: (value: boolean) => void;
};

// ── Session hint cookie ───────────────────────────────────────────────────────
// A non-sensitive cookie (value = role) readable by Next.js middleware.
// It contains no token data — it is purely a routing hint so the middleware can
// redirect unauthenticated users server-side without reading localStorage.
// The real auth validation always happens client-side via AuthGuard / api.ts.
const SESSION_COOKIE = "ll-session";

function setSessionCookie(role: string) {
  if (typeof document === "undefined") return;
  // Session-scoped (no Max-Age / Expires) — cleared when the browser closes.
  // SameSite=Lax prevents it from being sent on cross-origin requests.
  document.cookie = `${SESSION_COOKIE}=${role}; path=/; SameSite=Lax`;
}

function clearSessionCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=; path=/; SameSite=Lax; Max-Age=0`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      expiresIn: null,
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setAuth: ({ accessToken, refreshToken, expiresIn, user }) => {
        setSessionCookie(user.role);
        set({ accessToken, refreshToken, expiresIn, user, isAuthenticated: true });
      },

      patchUser: (patch) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...patch } : state.user,
        })),

      setAccessToken: (accessToken, expiresIn) =>
        set({ accessToken, expiresIn }),

      setTokens: (accessToken, refreshToken, expiresIn) =>
        set({ accessToken, refreshToken, expiresIn }),

      clearAuth: () => {
        clearSessionCookie();
        set({
          accessToken: null,
          refreshToken: null,
          expiresIn: null,
          user: null,
          isAuthenticated: false,
        });
      },

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
        // Re-sync the session cookie from persisted state on page load.
        // This ensures the middleware hint stays in sync after a browser restart
        // where the cookie was cleared but localStorage still has valid tokens.
        if (state?.isAuthenticated && state.user) {
          setSessionCookie(state.user.role);
          console.info("[Auth][Store] Rehydrated — user=" + state.user.email + " role=" + state.user.role);
        } else {
          console.info("[Auth][Store] Rehydrated — no active session");
        }
        state?.setHasHydrated(true);
      },
    },
  ),
);

export function getAuthStore() {
  return useAuthStore.getState();
}
