// ── Shared ────────────────────────────────────────────────────────────────────

export type UserRole = "admin" | "shipper";

// ── Auth ──────────────────────────────────────────────────────────────────────

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    role: UserRole;
    fullName: string | null;
    accountId: string | null;
  };
};

// ── Accounts (Shippers) ───────────────────────────────────────────────────────

export type Account = {
  account_id: string;
  account_name: string;
  abn: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  billing_address: string | null;
  billing_city: string | null;
  billing_state: string | null;
  billing_postcode: string | null;
  billing_country: string;
  credit_limit: number;
  payment_terms: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateAccountDto = {
  accountName: string;
  abn?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingPostcode?: string;
  billingCountry?: string;
  creditLimit?: number;
  paymentTerms?: number;
};

export type UpdateAccountDto = Partial<CreateAccountDto> & {
  isActive?: boolean;
};

// ── User / Profile ────────────────────────────────────────────────────────────

export type UserProfile = {
  id: string;
  email: string;
  role: UserRole;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  accountId: string | null;
  isApproved: boolean;
  createdAt: string;
};

// ── Shipments (Loads) ─────────────────────────────────────────────────────────

export type ShipmentStatus =
  | "pending"
  | "confirmed"
  | "assigned"
  | "picked_up"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type ShipmentType = "freight" | "last_mile";

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  pending:          "Pending",
  confirmed:        "Confirmed",
  assigned:         "Assigned",
  picked_up:        "Picked Up",
  in_transit:       "In Transit",
  out_for_delivery: "Out for Delivery",
  delivered:        "Delivered",
  cancelled:        "Cancelled",
};

export const SHIPMENT_STATUS_COLORS: Record<ShipmentStatus, string> = {
  pending:          "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed:        "bg-blue-50 text-blue-700 border-blue-200",
  assigned:         "bg-violet-50 text-violet-700 border-violet-200",
  picked_up:        "bg-sky-50 text-sky-700 border-sky-200",
  in_transit:       "bg-orange-50 text-orange-700 border-orange-200",
  out_for_delivery: "bg-amber-50 text-amber-700 border-amber-200",
  delivered:        "bg-green-50 text-green-700 border-green-200",
  cancelled:        "bg-red-50 text-red-700 border-red-200",
};

export type Shipment = {
  shipment_id: string;
  load_number: string;
  shipment_type: ShipmentType;
  account_id: string | null;
  status: ShipmentStatus;

  origin_address: string;
  origin_city: string;
  origin_state: string;
  origin_postcode: string;
  origin_country: string;

  destination_address: string;
  destination_city: string;
  destination_state: string;
  destination_postcode: string;
  destination_country: string;

  cargo_description: string;
  weight_kg: number | null;
  volume_m3: number | null;
  pieces: number | null;
  is_dangerous_goods: boolean;
  requires_refrigeration: boolean;

  estimated_pickup_date: string | null;
  estimated_delivery_date: string | null;
  actual_pickup_date: string | null;
  actual_delivery_date: string | null;

  quoted_price: number | null;
  confirmed_price: number | null;
  currency: string;

  special_instructions: string | null;
  reference_number: string | null;

  created_by: string;
  created_at: string;
  updated_at: string;

  // Joined (Supabase uses the table name as the relation key)
  accounts?: Pick<Account, "account_id" | "account_name"> & { account_code?: string | null };
};

export type CreateShipmentDto = {
  shipmentType?: ShipmentType;
  /** UUID of the shipper's user profile. Backend resolves account_id internally. */
  shipperId?: string;
  originAddress: string;
  originCity: string;
  originState: string;
  originPostcode: string;
  originCountry?: string;
  destinationAddress: string;
  destinationCity: string;
  destinationState: string;
  destinationPostcode: string;
  destinationCountry?: string;
  cargoDescription: string;
  weightKg?: number;
  volumeM3?: number;
  pieces?: number;
  isDangerousGoods?: boolean;
  requiresRefrigeration?: boolean;
  estimatedPickupDate?: string;
  estimatedDeliveryDate?: string;
  quotedPrice?: number;
  currency?: string;
  specialInstructions?: string;
  referenceNumber?: string;
};

export type UpdateShipmentDto = Partial<Omit<CreateShipmentDto, "shipmentType" | "accountId">>;

export type UpdateShipmentStatusDto = {
  status: ShipmentStatus;
  reason?: string;
};

// Admin assigns a load to a specific shipper user (by their user ID).
// The backend resolves the user's account_id from their profile.
export type AssignShipmentDto = {
  userId: string;
};

export type ListShipmentsQuery = {
  page?: number;
  limit?: number;
  status?: ShipmentStatus;
  shipmentType?: ShipmentType;
  accountId?: string;
  search?: string;
};

// ── Shipper Notes (internal / admin-only) ─────────────────────────────────────

export type ShipperNote = {
  note_id: string;
  entity_type: "shipper";
  entity_id: string;
  content: string;
  is_internal: boolean;
  created_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  profiles: { id: string; full_name: string | null } | null;
};

export type CreateShipperNoteDto = {
  content: string;
};

export type UpdateShipperNoteDto = {
  content: string;
};
