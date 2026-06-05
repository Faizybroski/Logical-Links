// ── Shared ────────────────────────────────────────────────────────────────────

export type UserRole    = "admin" | "shipper";
export type CompanyRole = "company_admin" | "employee" | null;

// ── Auth ──────────────────────────────────────────────────────────────────────

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id:          string;
    email:       string;
    role:        UserRole;
    companyRole: CompanyRole;
    fullName:    string | null;
    avatarUrl:   string | null;
    accountId:   string | null;
  };
};

// ── Accounts (Shippers) ───────────────────────────────────────────────────────

export type AccountProfile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role?: "admin" | "shipper";
  company_role: "company_admin" | "employee" | null;
  is_active?: boolean;
  is_approved: boolean;
  avatar_url?: string | null;
  created_at: string;
};

export type Account = {
  account_id: string;
  account_name: string;
  abn: string | null;
  logo_url: string | null;
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
  profiles?: AccountProfile[];
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

export type ListAccountsQuery = {
  page?:     number;
  limit?:    number;
  search?:   string;
  isActive?: "true" | "false";
  dateFrom?: string;
  dateTo?:   string;
  sortBy?:   "account_name" | "is_active" | "created_at";
  sortDir?:  "asc" | "desc";
};

// ── User / Profile ────────────────────────────────────────────────────────────

export type UserProfile = {
  id:          string;
  email:       string;
  role:        UserRole;
  companyRole: CompanyRole;
  fullName:    string | null;
  phone:       string | null;
  avatarUrl:   string | null;
  accountId:   string | null;
  isApproved:  boolean;
  createdAt:   string;
};

// ── Company Users (Employees) ─────────────────────────────────────────────────

export type CompanyUser = {
  id:          string;
  email:       string;
  full_name:   string | null;
  phone:       string | null;
  avatar_url:  string | null;
  company_role: "employee";
  is_active:   boolean;
  account_id:  string;
  created_at:  string;
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
  shipment_id:          string;
  load_number:          string;
  shipment_type:        ShipmentType;
  account_id:           string | null;
  assigned_employee_id: string | null;
  status:               ShipmentStatus;

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
  accounts?: Pick<Account, "account_id" | "account_name"> & { account_code?: string | null; logo_url?: string | null };
  /** Profile of the user who created this load (joined via profiles!created_by). */
  profiles?: { id: string; full_name: string | null; role: 'admin' | 'shipper'; avatar_url?: string | null } | null;
  /** Profile of the assigned employee (joined via profiles!assigned_employee_id). */
  employee?: { id: string; full_name: string | null; avatar_url?: string | null } | null;
};

export type CreateShipmentDto = {
  shipmentType?: ShipmentType;
  /** UUID of the shipping company (accounts.account_id) to pre-assign. */
  accountId?: string;
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

// Admin assigns a load to a Shipping Company by accountId.
export type AssignShipmentDto = {
  accountId: string;
};

// Company admin assigns (or unassigns) a load to an employee.
export type AssignEmployeeDto = {
  employeeId: string | null;
};

export type ListShipmentsQuery = {
  page?:          number;
  limit?:         number;
  status?:        string;
  shipmentType?:  ShipmentType;
  accountId?:     string;
  search?:        string;
  createdByRole?: "admin" | "shipper";
  dateFrom?:      string;
  dateTo?:        string;
  updatedFrom?:   string;
  updatedTo?:     string;
  sortBy?:        "load_number" | "status" | "shipment_type" | "created_at" | "updated_at";
  sortDir?:       "asc" | "desc";
};

// ── Shipper Notes (internal / admin-only) ─────────────────────────────────────

export type ShipperNote = {
  note_id: string;
  entity_type: "shipper" | "account";
  entity_id: string;
  content: string;
  is_internal: boolean;
  created_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  profiles: { id: string; full_name: string | null; avatar_url?: string | null } | null;
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
  profiles?:        { id: string; full_name: string | null; email: string; avatar_url?: string | null } | null;
  shipments?: {
    shipment_id: string;
    load_number: string;
    origin_city: string;
    destination_city: string;
    account_id: string | null;
    assigned_employee_id: string | null;
    accounts?: { account_id: string; account_name: string; logo_url?: string | null } | null;
    profiles?: { id: string; full_name: string | null; avatar_url?: string | null } | null;
  } | null;
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
  page?:           number;
  limit?:          number;
  profileId?:      string;
  loadId?:         string;
  status?:         QuotationStatus;
  search?:         string;
  issueDateFrom?:  string;
  issueDateTo?:    string;
  expiryDateFrom?: string;
  expiryDateTo?:   string;
  totalMin?:       number;
  totalMax?:       number;
  hasPdf?:         "true" | "false";
  sortBy?:         "quotation_number" | "status" | "issue_date" | "expiry_date" | "total" | "created_at";
  sortDir?:        "asc" | "desc";
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
  profiles?:             { id: string; full_name: string | null; email: string; avatar_url?: string | null } | null;
  shipments?: {
    shipment_id: string;
    load_number: string;
    origin_city: string;
    destination_city: string;
    account_id: string | null;
    assigned_employee_id: string | null;
    accounts?: { account_id: string; account_name: string; logo_url?: string | null } | null;
    profiles?: { id: string; full_name: string | null; avatar_url?: string | null } | null;
  } | null;
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
  page?:        number;
  limit?:       number;
  profileId?:   string;
  loadId?:      string;
  status?:      InvoiceStatus;
  search?:      string;
  dueDateFrom?: string;
  dueDateTo?:   string;
  totalMin?:    number;
  totalMax?:    number;
  hasPdf?:      "true" | "false";
  sortBy?:      "invoice_number" | "status" | "due_date" | "total" | "balance_due" | "created_at";
  sortDir?:     "asc" | "desc";
};

// ── Locations ─────────────────────────────────────────────────────────────────

export type Location = {
  id:         string;
  city:       string;
  province:   string;
  is_active:  boolean;
  created_at: string;
  updated_at: string;
};

export type CreateLocationDto = {
  city:     string;
  province: string;
};

export type UpdateLocationDto = Partial<CreateLocationDto>;

export type ListLocationsQuery = {
  page?:     number;
  limit?:    number;
  search?:   string;
  province?: string;
  sortBy?:   "city" | "province" | "created_at";
  sortDir?:  "asc" | "desc";
};

export const CANADIAN_PROVINCES = [
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Nova Scotia",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
  "Northwest Territories",
  "Nunavut",
  "Yukon",
] as const;

export type CanadianProvince = (typeof CANADIAN_PROVINCES)[number];

// ── Statuses ──────────────────────────────────────────────────────────────────

export type StatusType = "system" | "custom";

export type Status = {
  id:          string;
  name:        string;
  slug:        string;
  description: string | null;
  type:        StatusType;
  color:       string | null;
  is_system:   boolean;
  is_active:   boolean;
  created_at:  string;
  updated_at:  string;
};

export type CreateStatusDto = {
  name:        string;
  description?: string;
  color?:      string;
};

export type UpdateStatusDto = {
  name?:        string;
  description?: string | null;
  color?:       string | null;
  is_active?:   boolean;
};

export type ListStatusesQuery = {
  page?:     number;
  limit?:    number;
  search?:   string;
  type?:     StatusType;
  isActive?: "true" | "false";
  sortBy?:   "name" | "type" | "is_active" | "created_at";
  sortDir?:  "asc" | "desc";
};

// ── Load Tracking Events ──────────────────────────────────────────────────────

export type TrackingStatus =
  | "created"
  | "assigned"
  | "confirmed"
  | "picked_up"
  | "arrived_at_facility"
  | "departed_facility"
  | "in_transit"
  | "customs_clearance"
  | "customs_hold"
  | "out_for_delivery"
  | "delivered"
  | "delivery_failed"
  | "returned"
  | "exception";

export const TRACKING_STATUS_LABELS: Record<TrackingStatus, string> = {
  created:             "Created",
  assigned:            "Assigned",
  confirmed:           "Confirmed",
  picked_up:           "Picked Up",
  arrived_at_facility: "Arrived At Facility",
  departed_facility:   "Departed Facility",
  in_transit:          "In Transit",
  customs_clearance:   "Customs Clearance",
  customs_hold:        "Customs Hold",
  out_for_delivery:    "Out For Delivery",
  delivered:           "Delivered",
  delivery_failed:     "Delivery Failed",
  returned:            "Returned",
  exception:           "Exception",
};

export const TRACKING_STATUS_COLORS: Record<TrackingStatus, string> = {
  created:             "bg-slate-50 text-slate-700 border-slate-200",
  assigned:            "bg-violet-50 text-violet-700 border-violet-200",
  confirmed:           "bg-blue-50 text-blue-700 border-blue-200",
  picked_up:           "bg-sky-50 text-sky-700 border-sky-200",
  arrived_at_facility: "bg-indigo-50 text-indigo-700 border-indigo-200",
  departed_facility:   "bg-purple-50 text-purple-700 border-purple-200",
  in_transit:          "bg-orange-50 text-orange-700 border-orange-200",
  customs_clearance:   "bg-yellow-50 text-yellow-700 border-yellow-200",
  customs_hold:        "bg-red-50 text-red-700 border-red-200",
  out_for_delivery:    "bg-amber-50 text-amber-700 border-amber-200",
  delivered:           "bg-green-50 text-green-700 border-green-200",
  delivery_failed:     "bg-red-50 text-red-800 border-red-300",
  returned:            "bg-rose-50 text-rose-700 border-rose-200",
  exception:           "bg-red-100 text-red-900 border-red-400",
};

export type TrackingEvent = {
  id:               string;
  load_id:          string;
  location_id:      string | null;
  tracking_status:  TrackingStatus;
  notes:            string | null;
  created_by:       string;
  created_by_role:  string;
  event_timestamp:  string;
  created_at:       string;
  updated_at:       string;
  locations?:       Pick<Location, "id" | "city" | "province"> | null;
  profiles?:        { id: string; full_name: string | null; avatar_url?: string | null } | null;
};

export type CreateTrackingEventDto = {
  loadId:          string;
  locationId?:     string;
  trackingStatus:  TrackingStatus;
  notes?:          string;
  eventTimestamp?: string;
};

export type UpdateTrackingEventDto = {
  locationId?:     string | null;
  trackingStatus?: TrackingStatus;
  notes?:          string | null;
  eventTimestamp?: string;
};

export type ListTrackingEventsQuery = {
  page?:   number;
  limit?:  number;
  loadId?: string;
};
