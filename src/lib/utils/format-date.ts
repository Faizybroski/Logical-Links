export function formatDate(
  iso: string
) {
  return new Date(iso).toLocaleDateString(
    "en-PK",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}

// Converts an ISO datetime (as stored/returned by the API) to the
// "YYYY-MM-DD" value a native <input type="date"> expects.
export function isoToDateInputValue(iso?: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

// Converts a native <input type="date"> value ("YYYY-MM-DD") to a full
// ISO datetime string — the backend requires z.string().datetime({ offset: true }).
export function dateInputValueToIso(value?: string): string | undefined {
  if (!value) return undefined;
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}