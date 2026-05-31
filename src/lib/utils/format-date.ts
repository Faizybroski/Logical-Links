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