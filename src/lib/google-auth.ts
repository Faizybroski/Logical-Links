import { createClient } from "@/lib/supabase/client";

// Google sign-in goes through Supabase OAuth only to prove the Google identity:
// the callback page hands the Supabase access token to POST /api/v1/auth/google,
// which returns our own app tokens (or a sign-up token for first-time users)
// and the Supabase browser session is discarded.

export const GOOGLE_CALLBACK_PATH = "/auth/google/callback";

export async function startGoogleAuth(): Promise<string | null> {
  const { error } = await createClient().auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}${GOOGLE_CALLBACK_PATH}`,
      queryParams: { prompt: "select_account" },
    },
  });
  return error ? error.message : null;
}

// ── Hand-off between the callback page and /register or /login ──────────────
// sessionStorage: tab-scoped and gone once the tab closes; the tokens inside are
// short-lived and grant no API access on their own.

export type PendingGoogleSignup = {
  signupToken: string;
  email: string;
  fullName: string;
};

const SIGNUP_KEY = "ll-google-signup";
const MFA_KEY = "ll-mfa-challenge";

function read(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {
    // Storage unavailable — the user just starts the flow again.
  }
}

export function savePendingGoogleSignup(pending: PendingGoogleSignup) {
  write(SIGNUP_KEY, JSON.stringify(pending));
}

export function loadPendingGoogleSignup(): PendingGoogleSignup | null {
  const raw = read(SIGNUP_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingGoogleSignup;
  } catch {
    return null;
  }
}

export function clearPendingGoogleSignup() {
  write(SIGNUP_KEY, null);
}

export function savePendingMfaChallenge(challengeToken: string) {
  write(MFA_KEY, challengeToken);
}

export function takePendingMfaChallenge(): string | null {
  const token = read(MFA_KEY);
  write(MFA_KEY, null);
  return token;
}
