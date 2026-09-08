"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Radio } from "lucide-react";

import { useDeliveries } from "@/hooks/use-deliveries";
import {
  buildLiveMessages,
  ACTIVE_LIVE_STATUSES,
  type LiveAudience,
} from "@/lib/delivery-live-messages";

const ROTATE_MS = 6000;

type Props = {
  audience: LiveAudience;
  /** Corporate dashboards scope deliveries to the company account. */
  accountId?: string | null;
};

/**
 * Rotating "Live Updates" banner for the customer dashboards. Cycles through a
 * status message for each of the customer's active deliveries plus four generic
 * messages, on a timer. Styled to match the dashboard role banners.
 */
export function DeliveryLiveUpdates({ audience, accountId }: Props) {
  const { data } = useDeliveries(
    {
      statuses: ACTIVE_LIVE_STATUSES.join(","),
      limit: 20,
      ...(accountId ? { accountId } : {}),
    },
    { enabled: true },
  );

  const messages = useMemo(
    () => buildLiveMessages(data?.data ?? [], audience),
    [data, audience],
  );

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const reducedMotion = usePrefersReducedMotion();

  // Keep the index in range as the message pool changes.
  useEffect(() => {
    setIndex((i) => (messages.length ? i % messages.length : 0));
  }, [messages.length]);

  useEffect(() => {
    if (messages.length <= 1) return;

    if (reducedMotion) {
      const id = setInterval(
        () => setIndex((i) => (i + 1) % messages.length),
        ROTATE_MS,
      );
      return () => clearInterval(id);
    }

    const id = setInterval(() => {
      setVisible(false);
      const swap = setTimeout(() => {
        setIndex((i) => (i + 1) % messages.length);
        setVisible(true);
      }, 300);
      return () => clearTimeout(swap);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [messages.length, reducedMotion]);

  if (messages.length === 0) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-warning/20 bg-warning/5 px-4 py-2.5 text-sm text-yellow-700">
      <Radio className="h-4 w-4 shrink-0" aria-hidden />
      <span
        aria-live="polite"
        className={`font-medium transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        {messages[index]}
      </span>
    </div>
  );
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  const mql = useRef<MediaQueryList | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    mql.current = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.current.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.current.addEventListener("change", onChange);
    return () => mql.current?.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
