"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { toastInfo } from "@/lib/toast";

// Gates any "quote" CTA on the landing pages behind auth — unauthenticated
// visitors are redirected to /login with a toast instead of reaching the
// quote form/section.
export function useQuoteGate() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return function requestQuote(onAuthenticated: () => void) {
    if (!isAuthenticated) {
      toastInfo(
        "Login required",
        "You need to be logged in to request a quote.",
      );
      router.push("/login");
      return;
    }
    onAuthenticated();
  };
}
