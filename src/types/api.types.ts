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
  /** 'shipper' = created by a shipper user; assignment is permanently locked. null = pre-migration row (treated as admin-created). */
  created_by_role: 'admin' | 'shipper' | null;
  created_at: string;
  updated_at: string;

  // Joined (Supabase uses the table name as the relation key)
  accounts?: Pick<Account, "account_id" | "account_name"> & { account_code?: string | null };
  /** Profile of the user who created this load (joined via profiles!created_by). */
  profiles?: { id: string; full_name: string | null; role: 'admin' | 'shipper' } | null;
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

// ── Documents: shared ─────────────────────────────────────────────────────────

export type LineItemCategory =
  | "freight_charge"
  | "line_haul"
  | "fuel_surcharge"
  | "accessorial"
  | "loading_fee"
  | "unloading_fee"
  | "lumper_fee"
  | "toll_charges"
  | "detention"
  | "layover"
  | "storage_fee"
  | "customs_fee"
  | "administrative_fee"
  | "insurance"
  | "miscellaneous"
  | "custom";

export const LINE_ITEM_CATEGORY_LABELS: Record<LineItemCategory, string> = {
  freight_charge:    "Freight Charge",
  line_haul:         "Line Haul",
  fuel_surcharge:    "Fuel Surcharge",
  accessorial:       "Accessorial",
  loading_fee:       "Loading Fee",
  unloading_fee:     "Unloading Fee",
  lumper_fee:        "Lumper Fee",
  toll_charges:      "Toll Charges",
  detention:         "Detention",
  layover:           "Layover",
  storage_fee:       "Storage Fee",
  customs_fee:       "Customs Fee",
  administrative_fee: "Administrative Fee",
  insurance:         "Insurance",
  miscellaneous:     "Miscellaneous",
  custom:            "Custom",
};

export type LineItem = {
  id?:          string;
  description:  string;
  category:     LineItemCategory;
  quantity:     number;
  unit:         string;
  unit_price:   number;
  amount:       number;
  notes?:       string | null;
  sort_order:   number;
  created_at?:  string;
  updated_at?:  string;
};

// ── Quotations ────────────────────────────────────────────────────────────────

export type QuotationStatus = "draft" | "sent" | "accepted" | "rejected" | "expired";

export const QUOTATION_STATUS_LABELS: Record<QuotationStatus, string> = {
  draft:    "Draft",
  sent:     "Sent",
  accepted: "Accepted",
  rejected: "Rejected",
  expired:  "Expired",
};

export const QUOTATION_STATUS_COLORS: Record<QuotationStatus, string> = {
  draft:    "bg-slate-50 text-slate-700 border-slate-200",
  sent:     "bg-blue-50 text-blue-700 border-blue-200",
  accepted: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  expired:  "bg-amber-50 text-amber-700 border-amber-200",
};

export type Quotation = {
  id:               string;
  quotation_number: string;
  profile_id:       string;
  load_id:          string | null;
  status:           QuotationStatus;
  issue_date:       string;
  expiry_date:      string | null;
  customer_name:    string;
  customer_company: string | null;
  customer_email:   string | null;
  customer_phone:   string | null;
  billing_address:  string | null;
  notes:            string | null;
  terms:            string | null;
  subtotal:         number;
  discount:         number;
  tax_rate:         number;
  tax:              number;
  total:            number;
  currency:         string;
  pdf_url:          string | null;
  created_by:       string;
  created_at:       string;
  updated_at:       string;
  deleted_at:       string | null;
  profiles?:        { id: string; full_name: string | null; email: string } | null;
  shipments?:       { shipment_id: string; load_number: string; origin_city: string; destination_city: string } | null;
  quotation_items?: LineItem[];
};

export type CreateQuotationDto = {
  profileId:       string;
  loadId?:         string | null;
  status?:         QuotationStatus;
  issueDate:       string;
  expiryDate?:     string | null;
  customerName:    string;
  customerCompany?: string | null;
  customerEmail?:  string | null;
  customerPhone?:  string | null;
  billingAddress?: string | null;
  notes?:          string | null;
  terms?:          string | null;
  subtotal?:       number;
  discount?:       number;
  taxRate?:        number;
  tax?:            number;
  total?:          number;
  currency?:       string;
  items?:          Omit<LineItem, "id" | "created_at" | "updated_at">[];
};

export type UpdateQuotationDto = Partial<Omit<CreateQuotationDto, "profileId">>;

export type ListQuotationsQuery = {
  page?:      number;
  limit?:     number;
  profileId?: string;
  loadId?:    string;
  status?:    QuotationStatus;
  search?:    string;
};

// ── Invoices ──────────────────────────────────────────────────────────────────

export type InvoiceStatus = "draft" | "unpaid" | "partially_paid" | "paid" | "overdue" | "cancelled";

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft:         "Draft",
  unpaid:        "Unpaid",
  partially_paid: "Partially Paid",
  paid:          "Paid",
  overdue:       "Overdue",
  cancelled:     "Cancelled",
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft:         "bg-slate-50 text-slate-700 border-slate-200",
  unpaid:        "bg-yellow-50 text-yellow-700 border-yellow-200",
  partially_paid: "bg-blue-50 text-blue-700 border-blue-200",
  paid:          "bg-green-50 text-green-700 border-green-200",
  overdue:       "bg-red-50 text-red-700 border-red-200",
  cancelled:     "bg-slate-50 text-slate-500 border-slate-200",
};

export type Invoice = {
  id:                    string;
  invoice_number:        string;
  profile_id:            string;
  load_id:               string | null;
  quotation_id:          string | null;
  status:                InvoiceStatus;
  issue_date:            string;
  due_date:              string | null;
  customer_name:         string;
  customer_company:      string | null;
  customer_email:        string | null;
  customer_phone:        string | null;
  billing_address:       string | null;
  notes:                 string | null;
  terms:                 string | null;
  payment_instructions:  string | null;
  subtotal:              number;
  discount:              number;
  tax_rate:              number;
  tax:                   number;
  total:                 number;
  amount_paid:           number;
  balance_due:           number;
  currency:              string;
  pdf_url:               string | null;
  created_by:            string;
  created_at:            string;
  updated_at:            string;
  deleted_at:            string | null;
  profiles?:             { id: string; full_name: string | null; email: string } | null;
  shipments?:            { shipment_id: string; load_number: string; origin_city: string; destination_city: string } | null;
  quotations?:           { id: string; quotation_number: string } | null;
  invoice_items?:        LineItem[];
};

export type CreateInvoiceDto = {
  profileId:           string;
  loadId?:             string | null;
  quotationId?:        string | null;
  status?:             InvoiceStatus;
  issueDate:           string;
  dueDate?:            string | null;
  customerName:        string;
  customerCompany?:    string | null;
  customerEmail?:      string | null;
  customerPhone?:      string | null;
  billingAddress?:     string | null;
  notes?:              string | null;
  terms?:              string | null;
  paymentInstructions?: string | null;
  subtotal?:           number;
  discount?:           number;
  taxRate?:            number;
  tax?:                number;
  total?:              number;
  amountPaid?:         number;
  currency?:           string;
  items?:              Omit<LineItem, "id" | "created_at" | "updated_at">[];
};

export type UpdateInvoiceDto = Partial<Omit<CreateInvoiceDto, "profileId">>;

export type ListInvoicesQuery = {
  page?:      number;
  limit?:     number;
  profileId?: string;
  loadId?:    string;
  status?:    InvoiceStatus;
  search?:    string;
};
