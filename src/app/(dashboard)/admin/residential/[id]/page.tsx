"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, Mail, Phone, Calendar, Truck, LifeBuoy } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/deliveries/deliveries-table";
import { UserAvatar } from "@/components/ui/user-avatar";
import { StatusBadge } from "@/components/deliveries/status-badge";
import { SupportCaseStatusBadge } from "@/components/documents/document-status-badge";
import { CaseDetailsSheet } from "@/components/support/case-details-sheet";
import { DeliveryDetailsSheet } from "@/components/deliveries/sheets/delivery-details-sheet";
import { CustomerRewardsPanel } from "@/components/rewards/customer-rewards-panel";

import { useUser } from "@/hooks/use-users";
import { useDeliveries } from "@/hooks/use-deliveries";
import { useSupportCases } from "@/hooks/use-support";
import type { Delivery, SupportCase } from "@/types/api.types";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-AU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ResidentialCustomerDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const customerId = params.id;

  const { data: userRes, isLoading: userLoading } = useUser(customerId);
  const customer = userRes?.data;

  const { data: deliveriesRes, isLoading: deliveriesLoading } = useDeliveries(
    { customerId, limit: 20, sortBy: "created_at", sortDir: "desc" },
    { enabled: !!customerId },
  );
  const deliveries = deliveriesRes?.data ?? [];

  const { data: casesRes, isLoading: casesLoading } = useSupportCases({ userId: customerId, limit: 20 });
  const cases = casesRes?.data ?? [];

  const [openDeliveryId, setOpenDeliveryId] = useState<string | null>(null);
  const [openCaseId, setOpenCaseId] = useState<string | null>(null);

  const loadColumns: ColumnDef<Delivery>[] = [
    {
      id: "load_number",
      header: "Delivery #",
      cell: ({ row }) => <span className="text-sm font-semibold text-primary">{row.original.load_number}</span>,
    },
    {
      id: "route",
      header: "Route",
      cell: ({ row }) => (
        <span className="text-sm text-foreground">
          {row.original.origin_city}, {row.original.origin_state} → {row.original.destination_city}, {row.original.destination_state}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "created_at",
      header: "Created",
      cell: ({ row }) => <span className="text-xs text-muted">{formatDate(row.original.created_at)}</span>,
    },
  ];

  const caseColumns: ColumnDef<SupportCase>[] = [
    {
      id: "case_number",
      header: "Case #",
      cell: ({ row }) => <span className="text-sm font-semibold text-primary">{row.original.case_number}</span>,
    },
    {
      id: "subject",
      header: "Subject",
      cell: ({ row }) => <span className="block max-w-xs truncate text-sm text-foreground">{row.original.subject}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => <SupportCaseStatusBadge status={row.original.status} />,
    },
    {
      id: "updated_at",
      header: "Last Updated",
      cell: ({ row }) => <span className="text-xs text-muted tabular-nums">{formatDate(row.original.updated_at)}</span>,
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6 lg:p-2">
      <div className="mx-auto max-w-5xl space-y-6">
        <Button
          variant="outline"
          onClick={() => router.push("/admin/residential")}
          className="h-9 gap-2 rounded-lg border-card-border text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Residential Customers
        </Button>

        {userLoading ? (
          <div className="rounded-3xl border border-card-border bg-card p-10 text-center text-sm text-muted">
            Loading...
          </div>
        ) : !customer ? (
          <div className="rounded-3xl border border-card-border bg-card p-10 text-center text-sm text-muted">
            Customer not found.
          </div>
        ) : (
          <>
            {/* Profile overview */}
            <Card className="border border-card-border shadow-sm">
              <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
                <UserAvatar name={customer.fullName} avatarUrl={customer.avatarUrl} size="xl" rounded="xl" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="text-xl font-semibold text-foreground">{customer.fullName ?? "No name"}</p>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    Residential Customer
                  </span>
                  <div className="grid gap-2 pt-2 sm:grid-cols-3">
                    <p className="flex items-center gap-1.5 text-sm text-muted">
                      <Mail className="h-3.5 w-3.5 shrink-0" />{customer.email}
                    </p>
                    {customer.phone && (
                      <p className="flex items-center gap-1.5 text-sm text-muted">
                        <Phone className="h-3.5 w-3.5 shrink-0" />{customer.phone}
                      </p>
                    )}
                    <p className="flex items-center gap-1.5 text-sm text-muted">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />Registered {formatDate(customer.createdAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rewards */}
            <CustomerRewardsPanel profileId={customerId} />

            {/* Deliveries */}
            <Card className="border border-card-border shadow-sm">
              <CardHeader className="border-b border-card-border px-6 py-4">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <Truck className="h-4 w-4 text-muted" />
                  Deliveries
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <DataTable<Delivery>
                  columns={loadColumns}
                  data={deliveries}
                  isLoading={deliveriesLoading}
                  onRowClick={(s) => setOpenDeliveryId(s.shipment_id)}
                  emptyState={<span className="text-sm text-muted">No deliveries yet.</span>}
                />
              </CardContent>
            </Card>

            {/* Support tickets */}
            <Card className="border border-card-border shadow-sm">
              <CardHeader className="border-b border-card-border px-6 py-4">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <LifeBuoy className="h-4 w-4 text-muted" />
                  Support Tickets
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <DataTable<SupportCase>
                  columns={caseColumns}
                  data={cases}
                  isLoading={casesLoading}
                  onRowClick={(c) => setOpenCaseId(c.case_id)}
                  emptyState={<span className="text-sm text-muted">No support tickets yet.</span>}
                />
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <DeliveryDetailsSheet
        open={!!openDeliveryId}
        onClose={() => setOpenDeliveryId(null)}
        loadId={openDeliveryId ?? ""}
        onEditClick={() => router.push(`/admin/deliveries?edit=${openDeliveryId}`)}
      />
      <CaseDetailsSheet
        open={!!openCaseId}
        onClose={() => setOpenCaseId(null)}
        caseId={openCaseId ?? ""}
      />
    </div>
  );
}
