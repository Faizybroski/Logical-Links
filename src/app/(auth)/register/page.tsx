"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, User, Phone, Building2, Briefcase, Factory, Hash, Globe, MapPin, Receipt, type LucideIcon } from "lucide-react";
import { z } from "zod";

import { api, ApiError, type ApiResponse } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { dashboardPathForRole } from "@/lib/utils/dashboard-path";

const corpText = z.string().optional().or(z.literal(""));

const registerSchema = z
  .object({
    accountType: z.enum(["corporate", "residential"]),
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    company: z.string().min(2, "Company name is required").optional().or(z.literal("")),
    phone: z
      .string()
      .min(7, "Phone number is too short")
      .regex(/^[0-9+()\-\s]+$/, "Invalid phone number format"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    // Corporate company profile (parity with the admin review + company pages)
    businessType: corpText,
    industry: corpText,
    abn: corpText,
    website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
    addressLine1: corpText,
    addressCity: corpText,
    addressState: corpText,
    addressPostcode: corpText,
    addressCountry: corpText,
    billingEmail: z.string().email("Enter a valid email").optional().or(z.literal("")),
    accountsPayableEmail: z.string().email("Enter a valid email").optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.accountType !== "corporate") return;
    const required: [keyof RegisterForm, string][] = [
      ["company", "Company name is required"],
      ["businessType", "Business type is required"],
      ["industry", "Industry is required"],
      ["addressLine1", "Business address is required"],
      ["addressCity", "City is required"],
      ["addressState", "State / province is required"],
      ["addressPostcode", "Postcode is required"],
    ];
    for (const [field, message] of required) {
      if (!data[field]) ctx.addIssue({ code: z.ZodIssueCode.custom, message, path: [field] });
    }
  });

type RegisterForm = z.infer<typeof registerSchema>;

const inputCls =
  "h-12 w-full rounded-2xl border border-card-border bg-background pl-12 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10";
const plainInputCls =
  "h-11 w-full rounded-xl border border-card-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10";

function IconInput({
  icon: Icon, name, value, onChange, placeholder, type = "text", error,
}: {
  icon: LucideIcon;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  error?: string;
}) {
  return (
    <div>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className={inputCls} />
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-2 block text-sm font-medium text-foreground">{children}</label>;
}

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<RegisterForm>({
    accountType: "corporate",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    company: "",
    phone: "",
    businessType: "",
    industry: "",
    abn: "",
    website: "",
    addressLine1: "",
    addressCity: "",
    addressState: "",
    addressPostcode: "",
    addressCountry: "",
    billingEmail: "",
    accountsPayableEmail: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterForm, string>>>({});

  const isCorporate = form.accountType === "corporate";

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleAccountTypeChange(accountType: "corporate" | "residential") {
    setForm((prev) => ({ ...prev, accountType }));
    setFieldErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    const result = registerSchema.safeParse(form);
    if (!result.success) {
      const formatted: Partial<Record<keyof RegisterForm, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof RegisterForm;
        formatted[field] = issue.message;
      });
      setFieldErrors(formatted);
      setLoading(false);
      return;
    }

    try {
      const fullName = `${result.data.firstName} ${result.data.lastName}`.trim();

      const res = await api.post<ApiResponse<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: { id: string; email: string; role: "admin" | "corporate" | "residential"; companyRole: "company_admin" | "employee" | null; adminRole: string | null; permissions: string[]; fullName: string | null; avatarUrl: string | null; accountId: string | null };
      }>>('/api/v1/auth/register', {
        accountType: result.data.accountType,
        email: result.data.email,
        password: result.data.password,
        fullName,
        phone: result.data.phone,
        ...(result.data.accountType === "corporate"
          ? {
              company:              result.data.company,
              businessType:         result.data.businessType,
              industry:             result.data.industry,
              abn:                  result.data.abn,
              website:              result.data.website,
              addressLine1:         result.data.addressLine1,
              addressCity:          result.data.addressCity,
              addressState:         result.data.addressState,
              addressPostcode:      result.data.addressPostcode,
              addressCountry:       result.data.addressCountry,
              billingEmail:         result.data.billingEmail,
              accountsPayableEmail: result.data.accountsPayableEmail,
            }
          : {}),
      });

      setAuth({
        accessToken:  res.data.accessToken,
        refreshToken: res.data.refreshToken,
        expiresIn:    res.data.expiresIn,
        user:         res.data.user,
      });

      router.push(dashboardPathForRole(res.data.user.role));
    } catch (err) {
      if (err instanceof ApiError) {
        // Map backend error codes to field-level errors where possible
        if (err.status === 409 || err.code === "CONFLICT") {
          if (err.message.toLowerCase().includes("email")) {
            setFieldErrors({ email: "An account with this email already exists" });
          } else if (err.message.toLowerCase().includes("company") || err.message.toLowerCase().includes("name")) {
            setFieldErrors({ company: "A company with this name already exists" });
          } else {
            setError(err.message);
          }
        } else if (err.status === 400 || err.code === "BAD_REQUEST") {
          setError(err.message);
        } else if (err.status === 422 || err.code === "UNPROCESSABLE_ENTITY") {
          setError(err.message);
        } else {
          setError(err.message);
        }
      } else {
        setError((err as Error).message ?? "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="absolute -left-30 -top-30 h-80 w-[320px] rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-30 -right-30 h-80 w-[320px] rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-4xl border border-card-border bg-card shadow-lg">
        <div className="h-1.5 w-full bg-linear-to-r from-primary-dark via-primary to-primary-light" />

        <div className="p-8 sm:p-10">
          <Link href="/" className="mb-8 flex justify-center">
            <img src="/logical-links-logo.png" alt="Logical Links" className="h-14 w-auto" />
          </Link>

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              {isCorporate ? "Create Company Account" : "Create Your Account"}
            </h1>
            <p className="mt-2 text-sm text-muted">
              {isCorporate
                ? "Register your company and get started as Company Admin"
                : "Sign up to book and track your own deliveries"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Account type */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleAccountTypeChange("residential")}
                className={`h-12 rounded-2xl border text-sm font-semibold transition ${
                  !isCorporate
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-card-border text-muted hover:text-foreground"
                }`}
              >
                Residential
              </button>
              <button
                type="button"
                onClick={() => handleAccountTypeChange("corporate")}
                className={`h-12 rounded-2xl border text-sm font-semibold transition ${
                  isCorporate
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-card-border text-muted hover:text-foreground"
                }`}
              >
                Corporate
              </button>
            </div>

            {/* First + Last Name */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className="h-12 w-full rounded-2xl border border-card-border bg-background pl-12 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </div>
                {fieldErrors.firstName && <p className="mt-1 text-xs text-danger">{fieldErrors.firstName}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Last Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className="h-12 w-full rounded-2xl border border-card-border bg-background pl-12 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                </div>
                {fieldErrors.lastName && <p className="mt-1 text-xs text-danger">{fieldErrors.lastName}</p>}
              </div>
            </div>

            {/* Company details (corporate only) — parity with the admin review
                page and the customer's own company profile */}
            {isCorporate && (
              <div className="space-y-5 rounded-2xl border border-card-border/70 bg-background/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Company Details</p>

                <div>
                  <FieldLabel>Company Name</FieldLabel>
                  <IconInput icon={Building2} name="company" value={form.company ?? ""} onChange={handleChange} placeholder="Logical Links Inc." error={fieldErrors.company} />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <FieldLabel>Business Type</FieldLabel>
                    <IconInput icon={Briefcase} name="businessType" value={form.businessType ?? ""} onChange={handleChange} placeholder="e.g. Corporation" error={fieldErrors.businessType} />
                  </div>
                  <div>
                    <FieldLabel>Industry</FieldLabel>
                    <IconInput icon={Factory} name="industry" value={form.industry ?? ""} onChange={handleChange} placeholder="e.g. Logistics" error={fieldErrors.industry} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <FieldLabel>Business Number <span className="font-normal text-muted">(optional)</span></FieldLabel>
                    <IconInput icon={Hash} name="abn" value={form.abn ?? ""} onChange={handleChange} placeholder="ABN / registration no." error={fieldErrors.abn} />
                  </div>
                  <div>
                    <FieldLabel>Website <span className="font-normal text-muted">(optional)</span></FieldLabel>
                    <IconInput icon={Globe} name="website" value={form.website ?? ""} onChange={handleChange} placeholder="https://example.com" error={fieldErrors.website} />
                  </div>
                </div>

                <div>
                  <FieldLabel>Business Address</FieldLabel>
                  <IconInput icon={MapPin} name="addressLine1" value={form.addressLine1 ?? ""} onChange={handleChange} placeholder="Street address" error={fieldErrors.addressLine1} />
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <div>
                      <input name="addressCity" value={form.addressCity ?? ""} onChange={handleChange} placeholder="City" className={plainInputCls} />
                      {fieldErrors.addressCity && <p className="mt-1 text-xs text-danger">{fieldErrors.addressCity}</p>}
                    </div>
                    <div>
                      <input name="addressState" value={form.addressState ?? ""} onChange={handleChange} placeholder="State / Province" className={plainInputCls} />
                      {fieldErrors.addressState && <p className="mt-1 text-xs text-danger">{fieldErrors.addressState}</p>}
                    </div>
                    <div>
                      <input name="addressPostcode" value={form.addressPostcode ?? ""} onChange={handleChange} placeholder="Postcode" className={plainInputCls} />
                      {fieldErrors.addressPostcode && <p className="mt-1 text-xs text-danger">{fieldErrors.addressPostcode}</p>}
                    </div>
                    <input name="addressCountry" value={form.addressCountry ?? ""} onChange={handleChange} placeholder="Country" className={plainInputCls} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <FieldLabel>Billing Email <span className="font-normal text-muted">(optional)</span></FieldLabel>
                    <IconInput icon={Mail} name="billingEmail" type="email" value={form.billingEmail ?? ""} onChange={handleChange} placeholder="billing@example.com" error={fieldErrors.billingEmail} />
                  </div>
                  <div>
                    <FieldLabel>Accounts Payable Email <span className="font-normal text-muted">(optional)</span></FieldLabel>
                    <IconInput icon={Receipt} name="accountsPayableEmail" type="email" value={form.accountsPayableEmail ?? ""} onChange={handleChange} placeholder="ap@example.com" error={fieldErrors.accountsPayableEmail} />
                  </div>
                </div>

                <p className="text-xs text-muted">
                  You&apos;ll be the company&apos;s primary contact and Company Admin. You can add
                  teammates and edit these details later from your company profile.
                </p>
              </div>
            )}

            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+1 234 567 890"
                  className="h-12 w-full rounded-2xl border border-card-border bg-background pl-12 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>
              {fieldErrors.phone && <p className="mt-1 text-xs text-danger">{fieldErrors.phone}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-2xl border border-card-border bg-background pl-12 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>
              {fieldErrors.email && <p className="mt-1 text-xs text-danger">{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="h-12 w-full rounded-2xl border border-card-border bg-background pl-12 pr-12 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {fieldErrors.password && <p className="mt-1 text-xs text-danger">{fieldErrors.password}</p>}
            </div>

            {error && (
              <div className="rounded-2xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-sidebar hover:bg-primary-dark disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-primary hover:opacity-80">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
