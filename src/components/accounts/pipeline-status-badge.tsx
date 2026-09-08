import {
  CORPORATE_PIPELINE_STATUS_META,
  type AccountDisplayStatus,
} from "@/types/api.types";

export function PipelineStatusBadge({
  status,
  className = "",
}: {
  status: AccountDisplayStatus;
  className?: string;
}) {
  const meta = CORPORATE_PIPELINE_STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.badge} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}
