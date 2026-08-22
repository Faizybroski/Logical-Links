import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import {
  MoreVertical,
  Pencil,
  Trash2,
  UserPlus,
  ArrowLeftRight,
  FileText,
  Receipt,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/deliveries/status-badge";
import { TableSortHeader } from "@/components/ui/table-sort-header";
import {
  Delivery,
  DeliveryStatus,
  DELIVERY_STATUS_LABELS,
} from "@/types/api.types";
import { formatDate } from "@/lib/utils/format-date";
import type { SortDir } from "@/hooks/use-table-filters";

const OPEN_STATUSES = new Set<DeliveryStatus>([
  "pending", "confirmed", "assigned", "picked_up", "in_transit", "out_for_delivery",
]);

export type EtaInfo =
  | { kind: "delivered"; date: string }
  | { kind: "overdue"; date: string }
  | { kind: "eta"; date: string }
  | { kind: "none" };

// Shared logic so the deliveries table and the detail sheet render ETA identically.
export function getEtaInfo(delivery: Delivery): EtaInfo {
  if (delivery.status === "delivered" && delivery.actual_delivery_date) {
    return { kind: "delivered", date: delivery.actual_delivery_date };
  }
  if (!delivery.estimated_delivery_date) return { kind: "none" };
  const isOverdue =
    OPEN_STATUSES.has(delivery.status) &&
    new Date(delivery.estimated_delivery_date) < new Date();
  return {
    kind: isOverdue ? "overdue" : "eta",
    date: delivery.estimated_delivery_date,
  };
}

export function EtaCell({ delivery }: { delivery: Delivery }) {
  const info = getEtaInfo(delivery);
  if (info.kind === "none") return <span className="text-sm text-muted">—</span>;

  const styles: Record<Exclude<EtaInfo["kind"], "none">, string> = {
    delivered: "text-green-700",
    overdue: "text-red-600 font-medium",
    eta: "text-foreground",
  };

  const label =
    info.kind === "delivered" ? "Delivered" : info.kind === "overdue" ? "Overdue" : "ETA";

  return (
    <div className={`flex items-center gap-1.5 text-sm ${styles[info.kind]}`}>
      <Clock className="h-3.5 w-3.5 shrink-0" />
      <span>
        {label} {formatDate(info.date)}
      </span>
    </div>
  );
}

// Status transitions mirrored from backend — used to determine when
// "Change Status" should appear in the row action menu.
const STATUS_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["assigned", "cancelled"],
  assigned: ["picked_up", "cancelled"],
  picked_up: ["in_transit", "cancelled"],
  in_transit: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

type ColumnsOptions = {
  isAdmin: boolean;
  basePath: string;
  docBasePath: string;
  canEdit: (s: Delivery) => boolean;
  canDelete: (s: Delivery) => boolean;
  canAssign: (s: Delivery) => boolean;
  canChangeStatus: (s: Delivery) => boolean;
  onEdit?: (s: Delivery) => void;
  onDelete: (s: Delivery) => void;
  onAssign: (s: Delivery) => void;
  onStatusChange: (s: Delivery) => void;
  onCreateQuotation?: (s: Delivery) => void;
  onCreateInvoice?: (s: Delivery) => void;
  sortBy?: string;
  sortDir?: SortDir;
  onSort?: (key: string, dir: SortDir) => void;
};

export function getDeliveryColumns({
  isAdmin,
  basePath,
  docBasePath,
  canEdit,
  canDelete,
  canAssign,
  canChangeStatus,
  onEdit,
  onDelete,
  onAssign,
  onStatusChange,
  onCreateQuotation,
  onCreateInvoice,
  sortBy = "",
  sortDir = null,
  onSort,
}: ColumnsOptions): ColumnDef<Delivery>[] {
  function sortHeader(label: string, key: string) {
    if (!onSort) return label;
    return (
      <TableSortHeader
        label={label}
        sortKey={key}
        currentSort={sortBy}
        currentDir={sortDir}
        onSort={onSort}
      />
    );
  }

  return [
    {
      accessorKey: "load_number",
      header: () => sortHeader("Delivery #", "load_number"),
      cell: ({ row }) => (
        <span className="font-semibold text-primary">
          {row.original.load_number}
        </span>
      ),
    },

    {
      accessorKey: "status",
      header: () => sortHeader("Status", "status"),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },

    // {
    //   accessorKey: "shipment_type",
    //   header: () => sortHeader("Type", "shipment_type"),
    //   cell: ({ row }) => (
    //     <span className="capitalize">
    //       {row.original.shipment_type.replace("_", " ")}
    //     </span>
    //   ),
    // },

    {
      id: "route",
      header: "Route",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.origin_city}, {row.original.origin_state}
          <span className="mx-1.5 text-muted">→</span>
          {row.original.destination_city}, {row.original.destination_state}
        </span>
      ),
    },

    {
      id: "eta",
      header: () => sortHeader("ETA", "estimated_delivery_date"),
      cell: ({ row }) => <EtaCell delivery={row.original} />,
    },

    // {
    //   accessorKey: "created_at",
    //   header: () => sortHeader("Created", "created_at"),
    //   cell: ({ row }) => (
    //     <span className="text-xs text-muted">
    //       {formatDate(row.original.created_at)}
    //     </span>
    //   ),
    // },

    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const s = row.original;
        const editable = canEdit(s);
        const deletable = canDelete(s);
        const assignable = canAssign(s);
        const transitions = STATUS_TRANSITIONS[s.status] ?? [];
        const statusChangeable = transitions.length > 0 && canChangeStatus(s);

        const hasAnyAction =
          editable ||
          deletable ||
          assignable ||
          statusChangeable ||
          !!onCreateQuotation ||
          !!onCreateInvoice;
        if (!hasAnyAction) return null;

        return (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 border-card-border bg-transparent text-foreground hover:bg-background"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="border border-card-border bg-card shadow-md"
              >
                {editable && (
                  <DropdownMenuItem
                    onClick={() => onEdit?.(s)}
                    className="cursor-pointer"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}

                {statusChangeable && (
                  <DropdownMenuItem
                    onClick={() => onStatusChange(s)}
                    className="cursor-pointer"
                  >
                    <ArrowLeftRight className="mr-2 h-4 w-4" />
                    Change Status
                  </DropdownMenuItem>
                )}

                {isAdmin && assignable && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onAssign(s)}
                      className="cursor-pointer"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Assign Employees
                    </DropdownMenuItem>
                  </>
                )}

                {(onCreateQuotation || onCreateInvoice) && (
                  <>
                    <DropdownMenuSeparator />
                    {onCreateQuotation && (
                      <DropdownMenuItem
                        asChild
                        // onClick={() => onCreateQuotation(s)}
                        className="cursor-pointer"
                      >
                        <Link
                          href={`${docBasePath}/quotations/create?loadId=${s.shipment_id}`}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Create Quotation
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {onCreateInvoice && (
                      <DropdownMenuItem
                        asChild
                        // onClick={() => onCreateInvoice(s)}
                        className="cursor-pointer"
                      >
                        <Link
                          href={`${docBasePath}/invoices/create?loadId=${s.shipment_id}`}
                        >
                          <Receipt className="mr-2 h-4 w-4" />
                          Create Invoice
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </>
                )}

                {isAdmin && deletable && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(s)}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
