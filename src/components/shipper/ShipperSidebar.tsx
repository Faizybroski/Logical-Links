"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  FileText,
  FileQuestion,
  Bell,
  User,
  Users,
  Building2,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/store/auth.store";
import { useMyProfile } from "@/hooks/use-accounts";
import { UserAvatar } from "@/components/ui/user-avatar";
import { CompanyLogo } from "@/components/ui/company-logo";
import { api } from "@/lib/api";

const BASE_NAVIGATION = [
  { label: "Dashboard",    href: "/shipper/dashboard",    icon: LayoutDashboard },
  { label: "My Loads",     href: "/shipper/loads",        icon: Truck },
  { label: "Invoices",     href: "/shipper/invoices",     icon: FileText },
  { label: "Quotations",   href: "/shipper/quotations",   icon: FileQuestion },
  { label: "Notifications",href: "/shipper/notifications",icon: Bell },
  { label: "My Profile",   href: "/shipper/profile",      icon: User },
];

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function ShipperSidebar({ isOpen = false, onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, refreshToken, clearAuth } = useAuthStore();
  const { data: accountRes } = useMyProfile();
  const account = accountRes?.data;

  const navigation = [
    ...BASE_NAVIGATION,
    ...(user?.companyRole === "company_admin"
      ? [
          { label: "Employees", href: "/shipper/employees", icon: Users },
          { label: "Company",   href: "/shipper/company",   icon: Building2 },
        ]
      : []),
  ];

  async function signOut() {
    console.info("[Auth][ShipperSidebar] User initiated logout — user=" + (user?.email ?? "unknown"));
    try {
      await api.post("/api/v1/auth/logout", {
        refreshToken,
        allDevices: false,
      });
    } catch (err) {
      console.warn("[Auth][ShipperSidebar] Backend logout request failed (session cleared anyway):", err);
    }
    clearAuth();
    router.push("/login");
    router.refresh();
  }

  const roleLabel = user?.companyRole === "company_admin" ? "Company Admin" : "Employee";

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-62 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 ease-out lg:relative lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <Link href="/shipper/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Image
              src="/logical-links-logo.png"
              alt="Logical Links"
              width={22}
              height={22}
              className="h-auto w-10 object-contain"
            />
          </div>
          <div>
            <h2 className="text-[13px] font-semibold tracking-wide text-white">
              Logical Links
            </h2>
            <p className="text-[11px] text-zinc-500">Shipping CMS</p>
          </div>
        </Link>
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="space-y-0.5">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all",
                  active
                    ? "bg-primary text-sidebar shadow-md"
                    : "text-zinc-300 hover:bg-sidebar-secondary hover:text-white",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        {/* Company card */}
        {account && (
          <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-sidebar-secondary px-2.5 py-2 mb-1">
            <CompanyLogo
              name={account.account_name}
              logoUrl={account.logo_url}
              size="sm"
              rounded="xl"
            />
            <div className="min-w-0">
              <p className="truncate text-[12px] font-semibold text-white">
                {account.account_name}
              </p>
              <p className="text-[10px] text-zinc-500">Shipping Company</p>
            </div>
          </div>
        )}

        {/* User card */}
        <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-sidebar-secondary p-2.5">
          <UserAvatar
            name={user?.fullName}
            avatarUrl={user?.avatarUrl}
            size="md"
            rounded="xl"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-white">
              {user?.fullName ?? (user?.companyRole === "employee" ? "Employee" : "Company Admin")}
            </p>
            <p className="truncate text-[11px] text-zinc-400">
              {user?.email ?? ""}
            </p>
            <span className="text-[10px] text-primary">{roleLabel}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-zinc-400 transition-colors hover:bg-sidebar-secondary hover:text-white"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
        <p className="text-center text-[10px] text-zinc-600">
          © 2026 Logical Links
        </p>
      </div>
    </aside>
  );
}
