"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Truck,
  FileText,
  FileQuestion,
  Bell,
  User,
  Users,
  PanelLeft,
  Circle,
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
  { label: "Dashboard", href: "/shipper/dashboard", icon: LayoutDashboard },
  { label: "My Deliveries", href: "/shipper/loads", icon: Truck },
  { label: "Invoices", href: "/shipper/invoices", icon: FileText },
  { label: "Quotations", href: "/shipper/quotations", icon: FileQuestion },
  { label: "Notifications", href: "/shipper/notifications", icon: Bell },
  { label: "My Profile", href: "/shipper/profile", icon: User },
];

type SidebarMode = "expanded" | "collapsed" | "hover";

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

  const [mode, setMode] = useState<SidebarMode>("expanded");
  const [isHovered, setIsHovered] = useState(false);
  const [controlOpen, setControlOpen] = useState(false);

  const isExpanded = mode === "expanded" || (mode === "hover" && isHovered);

  useEffect(() => {
    const saved = localStorage.getItem(
      "shipper-sidebar-mode",
    ) as SidebarMode | null;

    if (saved) setMode(saved);
  }, []);

  function changeMode(nextMode: SidebarMode) {
    setMode(nextMode);
    localStorage.setItem("shipper-sidebar-mode", nextMode);
    setControlOpen(false);
  }

  const navigation = [
    ...BASE_NAVIGATION,
    ...(user?.companyRole === "company_admin"
      ? [
          { label: "Employees", href: "/shipper/employees", icon: Users },
          { label: "Company", href: "/shipper/company", icon: Building2 },
        ]
      : []),
  ];

  async function signOut() {
    console.info(
      "[Auth][ShipperSidebar] User initiated logout — user=" +
        (user?.email ?? "unknown"),
    );

    try {
      await api.post("/api/v1/auth/logout", {
        refreshToken,
        allDevices: false,
      });
    } catch (err) {
      console.warn(
        "[Auth][ShipperSidebar] Backend logout request failed:",
        err,
      );
    }

    clearAuth();
    router.push("/login");
    router.refresh();
  }

  const roleLabel =
    user?.companyRole === "company_admin" ? "Company Admin" : "Employee";

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setControlOpen(false);
      }}
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-out lg:relative lg:translate-x-0",
        isExpanded ? "w-62" : "w-[72px]",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-sidebar-border px-4",
          isExpanded ? "justify-between" : "justify-center",
        )}
      >
        <Link
          href="/shipper/dashboard"
          className={cn(
            "flex min-w-0 items-center gap-2.5",
            !isExpanded && "justify-center",
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Image
              src="/logical-links-logo.png"
              alt="Logical Links"
              width={22}
              height={22}
              className="h-auto w-10 object-contain"
            />
          </div>

          {isExpanded && (
            <div className="min-w-0">
              <h2 className="truncate text-[13px] font-semibold tracking-wide text-white">
                Logical Links
              </h2>
              <p className="truncate text-[11px] text-zinc-500">
                Shipping CMS
              </p>
            </div>
          )}
        </Link>

        {isExpanded && (
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        )}
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
                title={!isExpanded ? item.label : undefined}
                className={cn(
                  "group flex items-center rounded-xl text-[13px] font-medium transition-all",
                  isExpanded
                    ? "gap-2.5 px-3 py-2.5"
                    : "justify-center px-0 py-3",
                  active
                    ? "bg-primary text-sidebar shadow-md"
                    : "text-zinc-300 hover:bg-sidebar-secondary hover:text-white",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {isExpanded && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="space-y-2 border-t border-sidebar-border p-3">
        {/* Company card */}
        {account &&
          (isExpanded ? (
            <div className="mb-1 flex items-center gap-2 rounded-xl border border-white/5 bg-sidebar-secondary px-2.5 py-2">
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
          ) : (
            <div className="flex justify-center">
              <CompanyLogo
                name={account.account_name}
                logoUrl={account.logo_url}
                size="sm"
                rounded="xl"
              />
            </div>
          ))}

        {/* User card */}
        {isExpanded ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-sidebar-secondary p-2.5">
            <UserAvatar
              name={user?.fullName}
              avatarUrl={user?.avatarUrl}
              size="md"
              rounded="xl"
            />

            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-white">
                {user?.fullName ??
                  (user?.companyRole === "employee"
                    ? "Employee"
                    : "Company Admin")}
              </p>
              <p className="truncate text-[11px] text-zinc-400">
                {user?.email ?? ""}
              </p>
              <span className="text-[10px] text-primary">{roleLabel}</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <UserAvatar
              name={user?.fullName}
              avatarUrl={user?.avatarUrl}
              size="md"
              rounded="xl"
            />
          </div>
        )}

        <button
          type="button"
          onClick={signOut}
          title={!isExpanded ? "Sign Out" : undefined}
          className={cn(
            "flex w-full items-center rounded-xl text-[13px] font-medium text-zinc-400 transition-colors hover:bg-sidebar-secondary hover:text-white",
            isExpanded ? "gap-2.5 px-3 py-2" : "justify-center px-0 py-3",
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {isExpanded && "Sign Out"}
        </button>

        {/* Sidebar Control */}
        <div className="relative">
          {controlOpen && (
            <div className="absolute bottom-12 left-0 w-60 overflow-hidden rounded-lg border border-sidebar-border bg-[#232323] shadow-2xl">
              <div className="border-b border-white/10 px-4 py-3 text-sm font-medium text-zinc-400">
                Sidebar control
              </div>

              <button
                type="button"
                onClick={() => changeMode("expanded")}
                className="flex w-full items-center gap-3 px-5 py-3 text-sm font-medium text-zinc-300 hover:bg-white/5"
              >
                {mode === "expanded" ? (
                  <Circle className="h-3 w-3 fill-zinc-300" />
                ) : (
                  <span className="h-3 w-3" />
                )}
                Expanded
              </button>

              <button
                type="button"
                onClick={() => changeMode("collapsed")}
                className="flex w-full items-center gap-3 px-5 py-3 text-sm font-medium text-zinc-300 hover:bg-white/5"
              >
                {mode === "collapsed" ? (
                  <Circle className="h-3 w-3 fill-zinc-300" />
                ) : (
                  <span className="h-3 w-3" />
                )}
                Collapsed
              </button>

              <button
                type="button"
                onClick={() => changeMode("hover")}
                className="flex w-full items-center gap-3 px-5 py-3 text-sm font-medium text-zinc-300 hover:bg-white/5"
              >
                {mode === "hover" ? (
                  <Circle className="h-3 w-3 fill-zinc-300" />
                ) : (
                  <span className="h-3 w-3" />
                )}
                Expand on hover
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setControlOpen((prev) => !prev)}
            className={cn(
              "flex h-9 w-full items-center rounded-xl border border-white/5 text-zinc-400 transition-colors hover:bg-sidebar-secondary hover:text-white",
              isExpanded ? "gap-2.5 px-3" : "justify-center px-0",
            )}
          >
            <PanelLeft className="h-4 w-4" />
            {isExpanded && (
              <span className="text-[13px] font-medium">
                Sidebar control
              </span>
            )}
          </button>
        </div>

        {isExpanded && (
          <p className="text-center text-[10px] text-zinc-600">
            © 2026 Logical Links
          </p>
        )}
      </div>
    </aside>
  );
}