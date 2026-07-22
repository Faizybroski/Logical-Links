"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, User, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateAdminEmployee } from "@/hooks/use-admin-employees";
import { usePermission } from "@/hooks/use-permission";
import { ADMIN_ROLE_LABELS, type AdminRoleValue } from "@/types/api.types";

const ALL_ADMIN_ROLES: AdminRoleValue[] = ["ceo", "vp", "manager", "assistant"];

const schema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName:  z.string().min(2, "Last name must be at least 2 characters"),
  email:     z.string().email("Invalid email address"),
  phone:     z.string().min(7, "Phone number too short").regex(/^[0-9+()\-\s]+$/, "Invalid phone").optional().or(z.literal("")),
  password:  z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  adminRole: z.enum(["ceo", "vp", "manager", "assistant"]),
});

type Form = z.infer<typeof schema>;

export default function CreateAdminEmployeePage() {
  const router = useRouter();
  const createMut = useCreateAdminEmployee();
  const canCreate = usePermission("employees.create");
  const canManageRoles = usePermission("employees.manage_roles");
  const availableRoles = canManageRoles ? ALL_ADMIN_ROLES : ALL_ADMIN_ROLES.filter((r) => r !== "ceo");

  const [form, setForm] = useState<Form>({
    firstName: "",
    lastName:  "",
    email:     "",
    phone:     "",
    password:  "",
    adminRole: "assistant",
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [showPassword, setShowPassword] = useState(false);

  if (!canCreate) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted">You do not have access to create employees.</p>
      </div>
    );
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});

    const result = schema.safeParse(form);
    if (!result.success) {
      const errors: Partial<Record<keyof Form, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof Form;
        errors[field] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    try {
      const fullName = `${result.data.firstName} ${result.data.lastName}`.trim();
      await createMut.mutateAsync({
        email:     result.data.email,
        password:  result.data.password,
        fullName,
        phone:     result.data.phone || undefined,
        adminRole: result.data.adminRole,
      });
      toast.success("Employee created successfully");
      router.push("/admin/employees");
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to create employee");
    }
  }

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link
            href="/admin/employees"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-card-border bg-card text-muted transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              Internal Team
            </p>
            <h1 className="text-2xl font-bold text-foreground">Add Employee</h1>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-card-border bg-card shadow-sm">
          <div className="border-b border-card-border px-6 py-4">
            <h2 className="text-sm font-semibold text-foreground">Employee Details</h2>
            <p className="mt-0.5 text-xs text-muted">
              The employee will be able to log in with these credentials and access the admin panel per their role's permissions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-6">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="mb-2 block text-sm font-medium">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <Input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Jane" className="pl-10" />
                </div>
                {fieldErrors.firstName && <p className="mt-1 text-xs text-danger">{fieldErrors.firstName}</p>}
              </div>
              <div>
                <Label htmlFor="lastName" className="mb-2 block text-sm font-medium">Last Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <Input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Smith" className="pl-10" />
                </div>
                {fieldErrors.lastName && <p className="mt-1 text-xs text-danger">{fieldErrors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="mb-2 block text-sm font-medium">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="jane@example.com" className="pl-10" />
              </div>
              {fieldErrors.email && <p className="mt-1 text-xs text-danger">{fieldErrors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="mb-2 block text-sm font-medium">Phone <span className="text-muted">(optional)</span></Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+1 234 567 890" className="pl-10" />
              </div>
              {fieldErrors.phone && <p className="mt-1 text-xs text-danger">{fieldErrors.phone}</p>}
            </div>

            {/* Role */}
            <div>
              <Label htmlFor="adminRole" className="mb-2 block text-sm font-medium">Role</Label>
              <Select
                value={form.adminRole}
                onValueChange={(value) => setForm((prev) => ({ ...prev, adminRole: value as AdminRoleValue }))}
              >
                <SelectTrigger id="adminRole">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {ADMIN_ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.adminRole && <p className="mt-1 text-xs text-danger">{fieldErrors.adminRole}</p>}
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="mb-2 block text-sm font-medium">Initial Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password && <p className="mt-1 text-xs text-danger">{fieldErrors.password}</p>}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/employees")}
                disabled={createMut.isPending}
                className="rounded-xl border-card-border"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMut.isPending}
                className="rounded-xl bg-primary px-6 text-sidebar hover:bg-primary/85"
              >
                {createMut.isPending ? "Creating…" : "Create Employee"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
