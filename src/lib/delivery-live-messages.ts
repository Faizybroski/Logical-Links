import type { Delivery, DeliveryStatus } from "@/types/api.types";

// Rotating "Live Updates" copy for the customer dashboards. Wording is taken
// verbatim from the client's spec ("Dashboard Alert" column) — do not
// paraphrase. `{load}` is the delivery's load number (e.g. LLC-0118).

export type LiveAudience = "residential" | "corporate";

// Statuses that count as "in progress" and should surface a rotating line.
export const ACTIVE_LIVE_STATUSES: DeliveryStatus[] = [
  "pending",
  "confirmed",
  "assigned",
  "picked_up",
  "in_transit",
  "out_for_delivery",
];

// One or more lines per status. `pending` carries both the "received" and the
// "under review" message, matching the spec's two rows for that stage.
const STATUS_LINES: Record<DeliveryStatus, (load: string) => string[]> = {
  pending: (load) => [
    `Booking Received: Your booking ${load} has been received.`,
    `Booking Under Review: Our team is currently reviewing ${load}.`,
  ],
  confirmed: (load) => [`Booking Confirmed: Your booking ${load} has been confirmed.`],
  assigned: (load) => [`Delivery Assigned: A driver or carrier has been assigned to ${load}.`],
  picked_up: (load) => [`Shipment Picked Up: Your shipment ${load} has been picked up.`],
  in_transit: (load) => [`In Transit: Your shipment ${load} is currently in transit.`],
  out_for_delivery: (load) => [`Out for Delivery: Your delivery ${load} is on its way to the destination.`],
  delivered: (load) => [`Delivery Completed: Your delivery ${load} has been successfully completed.`],
  cancelled: (load) => [`Booking Cancelled: Your booking ${load} has been cancelled.`],
};

// Always-on messages that rotate alongside the per-delivery status lines.
export const GENERIC_MESSAGES: string[] = [
  "Your Delivery, Your Dashboard: Check your latest delivery updates anytime.",
  "Stay Informed: Your dashboard keeps you up to date as your deliveries progress.",
  "Real-Time Updates: Access the latest status and delivery information from your dashboard.",
  "Need Assistance? Our Customer Support Team is here to help.",
];

/**
 * Build the rotating message pool: one (or two) status lines per active
 * delivery, followed by the four generic messages. Falls back to the generic
 * messages alone when there are no active deliveries.
 */
export function buildLiveMessages(
  deliveries: Delivery[],
  _audience: LiveAudience = "residential",
): string[] {
  const statusLines: string[] = [];

  for (const d of deliveries) {
    if (!ACTIVE_LIVE_STATUSES.includes(d.status)) continue;
    const load = d.load_number || d.reference_number || "your booking";
    statusLines.push(...(STATUS_LINES[d.status]?.(load) ?? []));
  }

  return [...new Set([...statusLines, ...GENERIC_MESSAGES])];
}
