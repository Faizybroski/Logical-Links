"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { api, type ApiResponse } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth.store";
import { dashboardPathForRole } from "@/lib/utils/dashboard-path";
import { savePendingGoogleSignup, savePendingMfaChallenge } from "@/lib/google-auth";
import type { GoogleAuthResult } from "@/types/api.types";

// Landing page for the Google OAuth redirect. Turns the Supabase Google session
// into our own app session — or, for a first-time Google user, sends them to
// /register to complete the full sign-up form.
export default function GoogleCallbackPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    // The OAuth code is single-use — don't run twice under StrictMode.
    if (started.current) return;
    started.current = true;

    (async () => {
      const params = new URLSearchParams(window.location.search);
      const oauthError = params.get("error_description") ?? params.get("error");
      if (oauthError) {
        setError(oauthError);
        return;
      }

      const supabase = createClient();

      // The browser client exchanges the ?code= itself on init; fall back to an
      // explicit exchange if it hasn't.
      let session = (await supabase.auth.getSession()).data.session;
      const code = params.get("code");
      if (!session && code) {
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError(exchangeError.message);
          return;
        }
        session = data.session;
      }
      if (!session) {
        setError("Google sign-in didn't complete. Please try again.");
        return;
      }

      let result: GoogleAuthResult;
      try {
        const res = await api.post<ApiResponse<GoogleAuthResult>>("/api/v1/auth/google", {
          accessToken: session.access_token,
        });
        result = res.data;
      } catch (err) {
        setError((err as Error).message ?? "Google sign-in failed. Please try again.");
        return;
      } finally {
        // The app runs on our own tokens — never keep a parallel Supabase session.
        await supabase.auth.signOut({ scope: "local" });
      }

      if (result.signupRequired) {
        savePendingGoogleSignup({
          signupToken: result.signupToken,
          email: result.email,
          fullName: result.fullName,
        });
        router.replace("/register?via=google");
        return;
      }

      if (result.mfaRequired) {
        savePendingMfaChallenge(result.challengeToken);
        router.replace("/login?mfa=1");
        return;
      }

      const { accessToken, refreshToken, expiresIn, user } = result;
      setAuth({ accessToken, refreshToken, expiresIn, user });
      router.replace(dashboardPathForRole(user.role));
      router.refresh();
    })();
  }, [router, setAuth]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-4xl border border-card-border bg-card p-8 text-center shadow-lg sm:p-10">
        {error ? (
          <>
            <h1 className="text-xl font-semibold text-foreground">Google sign-in failed</h1>
            <p className="mt-2 text-sm text-muted">{error}</p>
            <Link
              href="/login"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-[8px] bg-primary px-6 text-sm font-semibold text-sidebar hover:bg-primary-dark"
            >
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted">Signing you in with Google…</p>
          </>
        )}
      </div>
    </div>
  );
}
