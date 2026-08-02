"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet } from "@/components/ui/sheet";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { CompanyLogo } from "@/components/ui/company-logo";
import { useAccounts } from "@/hooks/use-accounts";
import { useCreateAlert } from "@/hooks/use-notifications";

interface Props {
  open: boolean;
  onClose: () => void;
}

const SEVERITY_OPTIONS = [
  { value: "info",     label: "Info" },
  { value: "warning",  label: "Warning" },
  { value: "critical", label: "Critical" },
];

const CATEGORY_OPTIONS = [
  { value: "deliveries", label: "Deliveries" },
  { value: "invoices",   label: "Invoices" },
  { value: "quotes",     label: "Quotes" },
  { value: "support",    label: "Support" },
  { value: "account",    label: "Account" },
];

export function CreateAlertSheet({ open, onClose }: Props) {
  const [title, setTitle]       = useState("");
  const [body, setBody]         = useState("");
  const [severity, setSeverity] = useState<"info" | "warning" | "critical">("info");
  const [category, setCategory] = useState<"deliveries" | "invoices" | "quotes" | "support" | "account">("account");
  const [sendToAll, setSendToAll] = useState(false);
  const [accountId, setAccountId] = useState("");

  const { data: accountsRes } = useAccounts({ limit: 100, isActive: "true" }, { enabled: open });
  const companies = accountsRes?.data ?? [];

  const createAlert = useCreateAlert();

  function reset() {
    setTitle("");
    setBody("");
    setSeverity("info");
    setCategory("account");
    setSendToAll(false);
    setAccountId("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit() {
    if (!title.trim() || !body.trim()) {
      toast.error("Title and message are required");
      return;
    }
    if (!sendToAll && !accountId) {
      toast.error("Select a shipper or choose Send to All");
      return;
    }

    try {
      const res = await createAlert.mutateAsync({
        title: title.trim(),
        body: body.trim(),
        severity,
        category,
        target: sendToAll ? "all" : "account",
        accountId: sendToAll ? undefined : accountId,
      });
      const sent = (res as any)?.data?.sent ?? 0;
      toast.success(`Alert sent to ${sent} shipper${sent === 1 ? "" : "s"}`);
      handleClose();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  const companyOptions = companies.map((c) => {
    const admin = c.profiles?.find((p) => p.company_role === "company_admin");
    return {
      value: c.account_id,
      label: c.account_name,
      description: admin?.full_name ? `Admin: ${admin.full_name}` : undefined,
      icon: <CompanyLogo name={c.account_name} logoUrl={c.logo_url} size="xs" rounded="lg" />,
    };
  });

  return (
    <Sheet open={open} onClose={handleClose} size="md">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-card-border px-6 py-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Megaphone className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Create Alert</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Scheduled maintenance tonight"
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              Message <span className="text-destructive">*</span>
            </label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Alert details…"
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-muted">Severity</label>
              <SearchableSelect
                value={severity}
                onValueChange={(v) => setSeverity(v as typeof severity)}
                options={SEVERITY_OPTIONS}
                searchPlaceholder="Search severity…"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-muted">Module</label>
              <SearchableSelect
                value={category}
                onValueChange={(v) => setCategory(v as typeof category)}
                options={CATEGORY_OPTIONS}
                searchPlaceholder="Search module…"
              />
            </div>
          </div>

          <div className="space-y-2 border-t border-card-border pt-5">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-muted">Send To</label>
            <Button
              type="button"
              variant={sendToAll ? "default" : "outline"}
              onClick={() => setSendToAll((v) => !v)}
              className={`h-10 w-full justify-center gap-2 rounded-xl text-sm ${
                sendToAll ? "bg-primary text-sidebar hover:bg-primary/85" : "border-card-border"
              }`}
            >
              <Send className="h-4 w-4" />
              {sendToAll ? "Sending to All Shippers" : "Send to All Shippers"}
            </Button>

            {!sendToAll && (
              <SearchableSelect
                value={accountId}
                onValueChange={setAccountId}
                options={companyOptions}
                placeholder="Select a shipper…"
                searchPlaceholder="Search shipping companies…"
                emptyText="No active shipping companies"
              />
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-card-border px-6 py-4 shrink-0">
          <Button variant="outline" onClick={handleClose} className="h-9 rounded-lg border-card-border px-4 text-sm">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createAlert.isPending}
            className="h-9 rounded-lg bg-primary px-4 text-sm text-sidebar hover:bg-primary/85"
          >
            {createAlert.isPending ? "Sending…" : "Send Alert"}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
