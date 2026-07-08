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
import { StatusBadge } from "@/components/loads/status-badge";
import { CreatorBadge, getCreatorName } from "@/components/loads/creator-badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { CompanyLogo } from "@/components/ui/company-logo";
import { TableSortHeader } from "@/components/ui/table-sort-header";
import {
  Shipment,
  ShipmentStatus,
  SHIPMENT_STATUS_LABELS,
} from "@/types/api.types";
import { formatDate } from "@/lib/utils/format-date";
import type { SortDir } from "@/hooks/use-table-filters";

const OPEN_STATUSES = new Set<ShipmentStatus>([
  "pending", "confirmed", "assigned", "picked_up", "in_transit", "out_for_delivery",
]);

export type EtaInfo =
  | { kind: "delivered"; date: string }
  | { kind: "overdue"; date: string }
  | { kind: "eta"; date: string }
  | { kind: "none" };

// Shared logic so the loads table and the detail sheet render ETA identically.
export function getEtaInfo(shipment: Shipment): EtaInfo {
  if (shipment.status === "delivered" && shipment.actual_delivery_date) {
    return { kind: "delivered", date: shipment.actual_delivery_date };
  }
  if (!shipment.estimated_delivery_date) return { kind: "none" };
  const isOverdue =
    OPEN_STATUSES.has(shipment.status) &&
    new Date(shipment.estimated_delivery_date) < new Date();
  return {
    kind: isOverdue ? "overdue" : "eta",
    date: shipment.estimated_delivery_date,
  };
}

export function EtaCell({ shipment }: { shipment: Shipment }) {
  const info = getEtaInfo(shipment);
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
const STATUS_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
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
  canEdit: (s: Shipment) => boolean;
  canDelete: (s: Shipment) => boolean;
  canAssign: (s: Shipment) => boolean;
  onEdit?: (s: Shipment) => void;
  onDelete: (s: Shipment) => void;
  onAssign: (s: Shipment) => void;
  onStatusChange: (s: Shipment) => void;
  onCreateQuotation?: (s: Shipment) => void;
  onCreateInvoice?: (s: Shipment) => void;
  sortBy?: string;
  sortDir?: SortDir;
  onSort?: (key: string, dir: SortDir) => void;
};

export function getLoadColumns({
  isAdmin,
  basePath,
  docBasePath,
  canEdit,
  canDelete,
  canAssign,
  onEdit,
  onDelete,
  onAssign,
  onStatusChange,
  onCreateQuotation,
  onCreateInvoice,
  sortBy = "",
  sortDir = null,
  onSort,
}: ColumnsOptions): ColumnDef<Shipment>[] {
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

    // {
    //   id: "created_by_col",
    //   header: "Created By",
    //   cell: ({ row }) => {
    //     const s = row.original;
    //     const name = getCreatorName(s);
    //     return (
    //       <div className="flex items-center gap-2">
    //         <UserAvatar
    //           name={name}
    //           avatarUrl={s.profiles?.avatar_url}
    //           size="sm"
    //           rounded="xl"
    //         />
    //         <div className="flex flex-col gap-0.5">
    //           <CreatorBadge shipment={s} size="sm" />
    //           <span className="text-xs text-muted truncate max-w-28" title={name}>
    //             {name}
    //           </span>
    //         </div>
    //       </div>
    //     );
    //   },
    // },

    // {
    //   id: "company",
    //   header: "Company / Employee",
    //   cell: ({ row }) => {
    //     const s = row.original;
    //     const companyName  = s.accounts?.account_name;
    //     const employeeName = s.employee?.full_name;
    //     return (
    //       <div className="flex flex-col gap-1.5">
    //         {companyName ? (
    //           <div className="flex items-center gap-1.5">
    //             <CompanyLogo
    //               name={companyName}
    //               logoUrl={s.accounts?.logo_url}
    //               size="xs"
    //               rounded="lg"
    //             />
    //             <span className="text-sm font-medium text-foreground truncate max-w-28">
    //               {companyName}
    //             </span>
    //           </div>
    //         ) : (
    //           <span className="text-muted italic text-sm">No Company</span>
    //         )}
    //         {companyName && (
    //           <div className="flex items-center gap-1.5">
    //             <UserAvatar
    //               name={employeeName}
    //               avatarUrl={s.employee?.avatar_url}
    //               size="xs"
    //               rounded="lg"
    //             />
    //             <span className="text-xs text-muted truncate max-w-28">
    //               {employeeName ?? <span className="italic">Unassigned</span>}
    //             </span>
    //           </div>
    //         )}
    //       </div>
    //     );
    //   },
    // },

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
      cell: ({ row }) => <EtaCell shipment={row.original} />,
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
        const canChangeStatus = transitions.length > 0;

        const hasAnyAction =
          editable ||
          deletable ||
          assignable ||
          canChangeStatus ||
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

                {canChangeStatus && (
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
                      Assign Company
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
