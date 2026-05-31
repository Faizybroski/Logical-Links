"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, User, Phone, Building2 } from "lucide-react";
import { z } from "zod";

import { api, ApiError, type ApiResponse } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

const registerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  company: z.string().min(2, "Company name is required"),
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
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<RegisterForm>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    company: "",
    phone: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterForm, string>>>({});

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
        user: { id: string; email: string; role: "admin" | "shipper"; fullName: string | null; accountId: string | null };
      }>>('/api/v1/auth/register', {
        email: result.data.email,
        password: result.data.password,
        fullName,
        company: result.data.company,
        phone: result.data.phone,
      });

      setAuth({
        accessToken:  res.data.accessToken,
        refreshToken: res.data.refreshToken,
        expiresIn:    res.data.expiresIn,
        user:         res.data.user,
      });

      router.push("/shipper/dashboard");
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
              Create Account
            </h1>
            <p className="mt-2 text-sm text-muted">
              Register your logistics account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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

            {/* Company */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Company Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Logical Links Inc."
                  className="h-12 w-full rounded-2xl border border-card-border bg-background pl-12 pr-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>
              {fieldErrors.company && <p className="mt-1 text-xs text-danger">{fieldErrors.company}</p>}
            </div>

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
