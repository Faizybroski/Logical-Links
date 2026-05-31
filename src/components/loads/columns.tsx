import { ColumnDef } from "@tanstack/react-table";
import { MoreVertical, Pencil, Trash2, UserPlus, ArrowLeftRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/loads/status-badge";
import { Shipment, ShipmentStatus, SHIPMENT_STATUS_LABELS } from "@/types/api.types";
import { formatDate } from "@/lib/utils/format-date";

// Status transitions mirrored from backend — used to determine when
// "Change Status" should appear in the row action menu.
const STATUS_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  pending:          ["confirmed",        "cancelled"],
  confirmed:        ["assigned",         "cancelled"],
  assigned:         ["picked_up",        "cancelled"],
  picked_up:        ["in_transit",       "cancelled"],
  in_transit:       ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered",        "cancelled"],
  delivered:        [],
  cancelled:        [],
};

type ColumnsOptions = {
  isAdmin: boolean;
  canEdit: (s: Shipment) => boolean;
  canDelete: (s: Shipment) => boolean;
  canAssign: (s: Shipment) => boolean;
  onEdit: (s: Shipment) => void;
  onDelete: (s: Shipment) => void;
  onAssign: (s: Shipment) => void;
  onStatusChange: (s: Shipment) => void;
};

export function getLoadColumns({
  isAdmin,
  canEdit,
  canDelete,
  canAssign,
  onEdit,
  onDelete,
  onAssign,
  onStatusChange,
}: ColumnsOptions): ColumnDef<Shipment>[] {
  return [
    {
      accessorKey: "load_number",
      header: "Load #",
      cell: ({ row }) => (
        <span className="font-semibold text-primary">{row.original.load_number}</span>
      ),
    },

    {
      id: "shipper",
      header: "Shipper",
      cell: ({ row }) =>
        row.original.accounts?.account_name ?? (
          <span className="text-muted italic">Unassigned</span>
        ),
    },

    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },

    {
      accessorKey: "shipment_type",
      header: "Type",
      cell: ({ row }) => (
        <span className="capitalize">{row.original.shipment_type.replace("_", " ")}</span>
      ),
    },

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
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-xs text-muted">{formatDate(row.original.created_at)}</span>
      ),
    },

    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const s = row.original;
        const editable  = canEdit(s);
        const deletable = canDelete(s);
        const assignable = canAssign(s);

        const transitions = STATUS_TRANSITIONS[s.status] ?? [];
        const canChangeStatus = transitions.length > 0;

        const hasAnyAction = editable || deletable || assignable || canChangeStatus;
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

              <DropdownMenuContent align="end" className="border border-card-border bg-card shadow-md">
                {editable && (
                  <DropdownMenuItem onClick={() => onEdit(s)} className="cursor-pointer">
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}

                {canChangeStatus && (
                  <DropdownMenuItem onClick={() => onStatusChange(s)} className="cursor-pointer">
                    <ArrowLeftRight className="mr-2 h-4 w-4" />
                    Change Status
                  </DropdownMenuItem>
                )}

                {isAdmin && assignable && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onAssign(s)} className="cursor-pointer">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Assign Shipper
                    </DropdownMenuItem>
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
