"use client";

import { useEffect } from "react";

/**
 * Drop into the root landing page so links like /#services (from standalone
 * pages) land on the right section once the page has mounted.
 */
export default function ScrollToHash() {
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return null;
}
