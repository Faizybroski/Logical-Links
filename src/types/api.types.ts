// ── Shared ────────────────────────────────────────────────────────────────────

export type UserRole    = "admin" | "corporate" | "residential";
export type CompanyRole = "company_admin" | "employee" | null;
// Admin roles are DB-driven (admin_roles table) — CEO/VP/Manager/Assistant/Driver
// ship as seeded system rows, but the CEO can add arbitrary custom roles from the
// Roles & Permissions page, so this can't be a fixed string-literal union.
export type AdminRole   = string | null;

// ── Auth ──────────────────────────────────────────────────────────────────────

export type AuthUserPayload = {
  id:          string;
  email:       string;
  role:        UserRole;
  companyRole: CompanyRole;
  adminRole:   AdminRole;
  permissions: string[];
  fullName:    string | null;
  avatarUrl:   string | null;
  accountId:   string | null;
};

export type AuthTokens = {
  mfaRequired: false;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUserPayload;
};

export type MfaChallengeRequired = {
  mfaRequired: true;
  challengeToken: string;
};

export type LoginResult = AuthTokens | MfaChallengeRequired;

// ── Accounts (Corporates) ───────────────────────────────────────────────────────

export type AccountProfile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role?: "admin" | "corporate";
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
  website: string | null;
  logo_url: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address_line1: string | null;
  address_city: string | null;
  address_state: string | null;
  address_postcode: string | null;
  address_country: string | null;
  billing_email: string | null;
  accounts_payable_email: string | null;
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
  website?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  addressLine1?: string;
  addressCity?: string;
  addressState?: string;
  addressPostcode?: string;
  addressCountry?: string;
  billingEmail?: string;
  accountsPayableEmail?: string;
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

export type UpdateOwnCompanyDto = {
  accountName?: string;
  abn?: string;
  website?: string;
  addressLine1?: string;
  addressCity?: string;
  addressState?: string;
  addressPostcode?: string;
  addressCountry?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  billingEmail?: string;
  accountsPayableEmail?: string;
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
  adminRole:   AdminRole;
  permissions: string[];
  fullName:    string | null;
  phone:       string | null;
  avatarUrl:   string | null;
  accountId:   string | null;
  isApproved:  boolean;
  createdAt:   string;
};

// ── Admin Employees (Internal Staff) ──────────────────────────────────────────

// Admin roles are DB-driven — see AdminRoleDef / useAdminRoles(). This is kept as
// a plain string alias (not a literal union) since custom roles can be added at
// runtime from the Roles & Permissions page.
export type AdminRoleValue = string;

// Fallback labels for the roles seeded at launch, used only until the real
// admin_roles list (fetched via useAdminRoles()) has loaded, or for any call
// site that can't reasonably fetch it. Prefer AdminRoleDef.label from the API
// wherever possible — this map has no entry for admin-created custom roles.
export const ADMIN_ROLE_LABELS: Record<string, string> = {
  ceo:       "CEO",
  vp:        "VP",
  manager:   "Manager",
  assistant: "Assistant",
  driver:    "Driver",
};

export type AdminRoleDef = {
  slug:       string;
  label:      string;
  is_system:  boolean;
  sort_order: number;
};

export type AdminEmployee = {
  id:          string;
  email:       string;
  full_name:   string | null;
  phone:       string | null;
  avatar_url:  string | null;
  // Nullable: an admin account promoted via the legacy /users/:id/role endpoint
  // has no admin_role until the CEO explicitly assigns one from this page.
  admin_role:  AdminRoleValue | null;
  is_active:   boolean;
  is_approved: boolean;
  created_at:  string;
  updated_at:  string;
};

export type CreateAdminEmployeeDto = {
  email:     string;
  password:  string;
  fullName:  string;
  phone?:    string;
  adminRole: AdminRoleValue;
};

export type UpdateAdminEmployeeDto = {
  fullName?:  string;
  phone?:     string;
  isActive?:  boolean;
  adminRole?: AdminRoleValue;
};

// ── Roles & Permissions ────────────────────────────────────────────────────────

export type PermissionDef = {
  key:        string;
  category:   string;
  label:      string;
  sort_order: number;
};

export type RolePermissionGrant = {
  admin_role:     AdminRoleValue;
  permission_key: string;
  granted:        boolean;
};

export type PermissionsMatrixResponse = {
  permissions: PermissionDef[];
  matrix:      RolePermissionGrant[];
  roles:       AdminRoleDef[];
};

// ── Deliveries (Deliveries) ─────────────────────────────────────────────────────────

export type DeliveryStatus =
  | "pending"
  | "confirmed"
  | "assigned"
  | "picked_up"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type DeliveryType = "freight" | "last_mile";

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  pending:          "Pending",
  confirmed:        "Confirmed",
  assigned:         "Assigned",
  picked_up:        "Picked Up",
  in_transit:       "In Transit",
  out_for_delivery: "Out for Delivery",
  delivered:        "Delivered",
  cancelled:        "Cancelled",
};

export const DELIVERY_STATUS_COLORS: Record<DeliveryStatus, string> = {
  pending:          "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed:        "bg-blue-50 text-blue-700 border-blue-200",
  assigned:         "bg-violet-50 text-violet-700 border-violet-200",
  picked_up:        "bg-sky-50 text-sky-700 border-sky-200",
  in_transit:       "bg-orange-50 text-orange-700 border-orange-200",
  out_for_delivery: "bg-amber-50 text-amber-700 border-amber-200",
  delivered:        "bg-green-50 text-green-700 border-green-200",
  cancelled:        "bg-red-50 text-red-700 border-red-200",
};

export type Delivery = {
  shipment_id:          string;
  load_number:          string;
  shipment_type:        DeliveryType;
  /** Specific last-mile service (courier/medical/grocery/etc) when shipment_type is 'last_mile'. */
  service_type:         string | null;
  /** e.g. Standard/Express/Same-Day/Priority — distinct from service_type. */
  service_level:        string | null;
  package_type:         string | null;
  /** The customer's requested delivery date — distinct from estimated_delivery_date (the ops estimate). */
  preferred_delivery_date: string | null;
  account_id:           string | null;
  status:               DeliveryStatus;

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
  /** 'corporate' = created by a corporate user; assignment is permanently locked. null = pre-migration row (treated as admin-created). */
  created_by_role: 'admin' | 'corporate' | null;
  created_at: string;
  updated_at: string;

  // Joined (Supabase uses the table name as the relation key)
  accounts?: Pick<Account, "account_id" | "account_name"> & { account_code?: string | null; logo_url?: string | null };
  /** Profile of the user who created this delivery (joined via profiles!created_by). */
  profiles?: { id: string; full_name: string | null; role: 'admin' | 'corporate'; avatar_url?: string | null } | null;
  /** Everyone currently assigned to this delivery (many-to-many — e.g. a driver AND a dispatcher at once). Always Logical Links staff; corporate customers never operate a delivery themselves. */
  assignments?: { employee_id: string; assigned_at: string; employee: { id: string; full_name: string | null; avatar_url?: string | null; admin_role?: string | null } }[];
  /** UUID of the residential customer this delivery belongs to (mutually exclusive with account_id). */
  customer_id?: string | null;
  /** Profile of the residential customer (joined via profiles!customer_id). */
  customer?: { id: string; full_name: string | null; avatar_url?: string | null } | null;
};

export type CreateDeliveryDto = {
  deliveryType?: DeliveryType;
  /** Specific last-mile service (courier/medical/grocery/etc) when deliveryType is 'last_mile'. */
  serviceType?: string;
  /** e.g. Standard/Express/Same-Day/Priority — distinct from serviceType. */
  serviceLevel?: string;
  packageType?: string;
  /** The customer's requested delivery date — distinct from estimatedDeliveryDate (the ops estimate). */
  preferredDeliveryDate?: string;
  /** UUID of the shipping company (accounts.account_id) to pre-assign. */
  accountId?: string;
  /** UUID of the residential customer (profiles.id) this delivery belongs to. Mutually exclusive with accountId. */
  customerId?: string;
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
  // Confirmation number is auto-generated (LLC-####) by the DB — not accepted on create.
};

export type UpdateDeliveryDto = Partial<Omit<CreateDeliveryDto, "deliveryType" | "accountId">> & {
  /** Confirmation number can be corrected post-creation. */
  referenceNumber?: string;
};

export type UpdateDeliveryStatusDto = {
  // Not narrowed to DeliveryStatus — the backend schema (and the
  // StatusCombobox UI this feeds) intentionally accept any custom status
  // slug, not just the fixed lifecycle enum.
  status: string;
  reason?: string;
};

// Admin assigns a delivery internally to one or more Logical Links staff at
// once (any active employee, not role-restricted) — replaces the whole
// assignee set; pass an empty array to unassign everyone.
export type AssignEmployeesDto = {
  employeeIds: string[];
};

export type ListDeliveriesQuery = {
  page?:          number;
  limit?:         number;
  status?:        string;
  statuses?:      string; // comma-separated list, takes precedence over status
  deliveryType?:  DeliveryType;
  accountId?:     string;
  customerId?:    string;
  search?:        string;
  dateFrom?:      string;
  dateTo?:        string;
  updatedFrom?:   string;
  updatedTo?:     string;
  sortBy?:        "load_number" | "status" | "shipment_type" | "created_at" | "updated_at";
  sortDir?:       "asc" | "desc";
};

// ── Corporate Notes (internal / admin-only) ─────────────────────────────────────

export type CorporateNote = {
  note_id: string;
  entity_type: "corporate" | "account";
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

export type CreateCorporateNoteDto = {
  content: string;
};

export type UpdateCorporateNoteDto = {
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

export type QuotationStatus = "requested" | "draft" | "sent" | "accepted" | "rejected" | "expired";

export const QUOTATION_STATUS_LABELS: Record<QuotationStatus, string> = {
  requested: "Requested",
  draft:    "Draft",
  sent:     "Sent",
  accepted: "Accepted",
  rejected: "Rejected",
  expired:  "Expired",
};

export const QUOTATION_STATUS_COLORS: Record<QuotationStatus, string> = {
  requested: "bg-purple-50 text-purple-700 border-purple-200",
  draft:    "bg-slate-50 text-slate-700 border-slate-200",
  sent:     "bg-blue-50 text-blue-700 border-blue-200",
  accepted: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  expired:  "bg-amber-50 text-amber-700 border-amber-200",
};

export type QuotationAcceptance = {
  acceptance_id: string;
  user_id:       string;
  full_name:     string | null;
  company_name:  string | null;
  terms_version: string;
  accepted_at:   string;
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
  /** Amount of the customer's Rewards Credit balance applied to this quotation (residential only). */
  rewards_credit_applied: number;
  currency:         string;
  origin_address:      string | null;
  origin_lat:          number | null;
  origin_lng:          number | null;
  destination_address: string | null;
  destination_lat:     number | null;
  destination_lng:     number | null;
  distance_km:         number | null;
  origin_city:         string | null;
  origin_state:        string | null;
  origin_postcode:     string | null;
  destination_city:    string | null;
  destination_state:   string | null;
  destination_postcode: string | null;
  cargo_description:   string | null;
  service_type:        string | null;
  service_level:       string | null;
  weight_kg:           number | null;
  pieces:              number | null;
  preferred_delivery_date: string | null;
  /** Corporate manual-request wishlist — additional charges the customer asked for; admin pre-ticks these when pricing. */
  requested_additional_charge_keys: string[];
  pdf_url:          string | null;
  accepted_at:      string | null;
  declined_at:      string | null;
  created_by:       string;
  created_at:       string;
  updated_at:       string;
  deleted_at:       string | null;
  profiles?:        { id: string; full_name: string | null; email: string; avatar_url?: string | null; role?: "admin" | "corporate" | "residential" } | null;
  shipments?: {
    shipment_id: string;
    load_number: string;
    origin_city: string;
    destination_city: string;
    account_id: string | null;
    assigned_employee_id: string | null;
    shipment_type: DeliveryType;
    service_type: string | null;
    service_level: string | null;
    origin_address: string;
    destination_address: string;
    cargo_description: string;
    pieces: number | null;
    package_type: string | null;
    weight_kg: number | null;
    preferred_delivery_date: string | null;
    estimated_delivery_date: string | null;
    special_instructions: string | null;
    customer_id: string | null;
    accounts?: { account_id: string; account_name: string; logo_url?: string | null } | null;
    profiles?: { id: string; full_name: string | null; avatar_url?: string | null } | null;
  } | null;
  quotation_items?: LineItem[];
  quotation_acceptances?: QuotationAcceptance[];
};

export type QuotationStats = {
  total:         number;
  pendingReview: number;
  accepted:      number;
  expired:       number;
};

export type AcceptQuotationDto = {
  termsVersion: string;
  acknowledged: true;
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
  originAddress?:      string | null;
  originLat?:          number | null;
  originLng?:          number | null;
  destinationAddress?: string | null;
  destinationLat?:     number | null;
  destinationLng?:     number | null;
  distanceKm?:         number | null;
  originCity?:            string | null;
  originState?:           string | null;
  originPostcode?:        string | null;
  destinationCity?:       string | null;
  destinationState?:      string | null;
  destinationPostcode?:   string | null;
  cargoDescription?:      string | null;
  serviceType?:           string | null;
  serviceLevel?:          string | null;
  weightKg?:              number | null;
  pieces?:                number | null;
  preferredDeliveryDate?: string | null;
  items?:          Omit<LineItem, "id" | "created_at" | "updated_at">[];
};

export type UpdateQuotationDto = Partial<Omit<CreateQuotationDto, "profileId">>;

// ── Self-service quote request ──────────────────────────────────────────────────

type QuoteRequestCommonFields = {
  customerName:    string;
  customerCompany?: string | null;
  customerEmail:   string;
  customerPhone:   string;
  originAddress:      string;
  originLat:          number;
  originLng:          number;
  originCity:         string;
  originState:        string;
  originPostcode:     string;
  destinationAddress: string;
  destinationLat:     number;
  destinationLng:     number;
  destinationCity:    string;
  destinationState:   string;
  destinationPostcode: string;
  serviceType:        string;
  serviceLevel:       string;
  cargoDescription:   string;
  pieces:             number;
  weightKg:           number;
  preferredDeliveryDate: string;
  notes?:             string | null;
};

// Shared by both self-service "instant quote" flows (residential — always;
// corporate — the "same as residential" option instead of requesting a
// manual quote). The price-preview step is just POST /pricing/calculate
// (no DB write) — this shape is only posted once the customer decides.
export type AutoQuoteRequestFields = QuoteRequestCommonFields & {
  distanceKm:           number;
  additionalChargeKeys?: string[];
};

export type ResidentialQuoteRequestDto = AutoQuoteRequestFields;

export type DecideAutoQuoteDto = AutoQuoteRequestFields & {
  decision:     "accept" | "decline";
  termsVersion?: string;
  acknowledged?: boolean;
};

// Corporate manual quote request — no price yet; admin prices it
// afterward. additionalChargeKeys is a wishlist only, pre-ticked for admin.
export type CorporateQuoteRequestDto = QuoteRequestCommonFields & {
  additionalChargeKeys?: string[];
};

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
  profiles?:             { id: string; full_name: string | null; email: string; avatar_url?: string | null; role?: "admin" | "corporate" | "residential" } | null;
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
  latitude:   number | null;
  longitude:  number | null;
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

export type Tier = {
  tier_id:            string;
  rank:                number;
  slug:                string;
  name:                string;
  min_deliveries:      number;
  benefits:            string[];
  cumulativeBenefits:  string[];
  quote_turnaround:    string;
  created_at:          string;
  updated_at:          string;
};

export type UpdateTierDto = {
  min_deliveries?:   number;
  benefits?:         string[];
  quote_turnaround?: string;
};

export type RewardsRule = {
  rule_id:     string;
  rank:        number;
  slug:        string;
  title:       string;
  description: string;
  value:       number | null;
  unit:        "usd" | "percent" | null;
  is_editable: boolean;
  created_at:  string;
  updated_at:  string;
};

export type UpdateRewardsRuleDto = {
  value?: number;
};

export type DeliveryRateCard = {
  rate_id:        string;
  service_type:   string;
  label:          string;
  base_fee:       number;
  per_km_rate:    number;
  minimum_charge: number;
  is_active:      boolean;
  created_at:     string;
  updated_at:     string;
};

export type CreateDeliveryRateDto = {
  serviceType:   string;
  label:         string;
  baseFee:       number;
  perKmRate:     number;
  minimumCharge: number;
};

export type UpdateDeliveryRateDto = {
  label?:         string;
  baseFee?:       number;
  perKmRate?:     number;
  minimumCharge?: number;
  isActive?:      boolean;
};

export type AdditionalChargeUnit = "flat" | "per_hour" | "per_stop" | "per_km";

export type AdditionalCharge = {
  charge_id:  string;
  key:        string;
  category:   string;
  label:      string;
  amount:     number | null;
  unit:       AdditionalChargeUnit;
  purpose:    string | null;
  is_active:  boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type CreateChargeDto = {
  key:      string;
  category: string;
  label:    string;
  amount?:  number;
  unit?:    AdditionalChargeUnit;
  purpose?: string;
};

export type UpdateChargeDto = {
  label?:    string;
  amount?:   number;
  unit?:     AdditionalChargeUnit;
  purpose?:  string;
  isActive?: boolean;
};

export type ServiceLevel = {
  level_id:   string;
  slug:       string;
  label:      string;
  multiplier: number;
  is_active:  boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type CreateServiceLevelDto = {
  slug:       string;
  label:      string;
  multiplier: number;
};

export type UpdateServiceLevelDto = {
  label?:      string;
  multiplier?: number;
  isActive?:   boolean;
};

export type WeightRate = {
  key:        string;
  label:      string;
  value:      number;
  unit:       string | null;
  updated_at: string;
};

export type CalculatePriceDto = {
  serviceType:          string;
  serviceLevel:         string;
  distanceKm:           number;
  weightKg?:            number;
  additionalChargeKeys: string[];
};

export type RewardsCreditBalance = {
  balance: number;
};

export type ApplyRewardsCreditResult = {
  quotation:        Quotation;
  applied:          number;
  remainingBalance: number;
};

export type PriceBreakdown = {
  serviceType:            string;
  label:                  string;
  baseFee:                number;
  distanceKm:             number;
  perKmRate:              number;
  distanceCharge:         number;
  minimumCharge:          number;
  serviceLevel:           string;
  serviceLevelLabel:      string;
  serviceLevelMultiplier: number;
  deliveryCharge:         number;
  weightKg:               number;
  weightPerKgRate:        number;
  weightCharge:           number;
  additionalCharges:      { key: string; label: string; amount: number }[];
  additionalChargesTotal: number;
  subtotal:               number;
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

// ── Delivery Tracking Events ──────────────────────────────────────────────────────

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
  locations?:       Pick<Location, "id" | "city" | "province" | "latitude" | "longitude"> | null;
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

// ── Support (assistance & ticketing) ─────────────────────────────────────────

export type SupportCaseStatus = "open" | "in_progress" | "resolved" | "closed";

export const SUPPORT_CASE_STATUS_LABELS: Record<SupportCaseStatus, string> = {
  open:        "Open",
  in_progress: "In Progress",
  resolved:    "Resolved",
  closed:      "Closed",
};

export const SUPPORT_CASE_STATUS_COLORS: Record<SupportCaseStatus, string> = {
  open:        "bg-blue-50 text-blue-700 border-blue-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  resolved:    "bg-green-50 text-green-700 border-green-200",
  closed:      "bg-slate-50 text-slate-700 border-slate-200",
};

export type SupportCaseAuthor = {
  id:        string;
  fullName:  string | null;
  avatarUrl: string | null;
} | null;

export type SupportCase = {
  case_id:     string;
  case_number: string;
  account_id:  string | null;
  created_by:  string;
  subject:     string;
  description: string;
  status:      SupportCaseStatus;
  created_at:  string;
  updated_at:  string;
  accounts?:   { account_id: string; account_name: string; logo_url: string | null } | null;
  author?:     SupportCaseAuthor; // requester — populated for admin on the list endpoint only
};

export type SupportCaseComment = {
  comment_id: string;
  case_id:    string;
  author_id:  string;
  content:    string;
  created_at: string;
  author:     SupportCaseAuthor;
};

export type SupportCaseAttachment = {
  attachment_id: string;
  case_id:       string;
  uploaded_by:   string;
  file_name:     string;
  file_path:     string;
  file_size:     number | null;
  created_at:    string;
  url:           string | null;
};

export type SupportCaseEvent = {
  event_id:    string;
  case_id:     string;
  event_type:  "created" | "status_changed" | "attachment_added";
  from_status: SupportCaseStatus | null;
  to_status:   SupportCaseStatus | null;
  note:        string | null;
  created_by:  string | null;
  created_at:  string;
  author:      SupportCaseAuthor;
};

export type SupportCaseDetail = SupportCase & {
  comments:    SupportCaseComment[];
  attachments: SupportCaseAttachment[];
  events:      SupportCaseEvent[];
};

export type CreateSupportCaseDto = {
  subject:     string;
  description: string;
};

export type UpdateCaseStatusDto = {
  status: SupportCaseStatus;
};

export type UpdateSupportCaseDto = {
  subject?:     string;
  description?: string;
};

export type ListSupportCasesQuery = {
  page?:   number;
  limit?:  number;
  status?: SupportCaseStatus;
  search?: string;
  /** Admin-only: view all cases raised by a specific user. */
  userId?: string;
};
