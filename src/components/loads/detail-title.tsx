export function DetailTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-[10px] border border-card-border bg-background px-4 py-3">
      <div className="flex items-center gap-2 text-muted">
        <span className="shrink-0">{icon}</span>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em]">
          {label}
        </p>
      </div>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}