"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  Users,
  FileText,
  FileQuestion,
  Bell,
  User,
  LogOut,
  X,
  PanelLeft,
  Circle,
  MapPin,
  Shield,
  Settings,
  LifeBuoy,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/store/auth.store";
import { UserAvatar } from "@/components/ui/user-avatar";
import { api } from "@/lib/api";

const navigation = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Deliveries", href: "/admin/loads", icon: Truck },
  { label: "Companies", href: "/admin/shippers", icon: Users },
  { label: "Invoices", href: "/admin/invoices", icon: FileText },
  { label: "Quotations", href: "/admin/quotations", icon: FileQuestion },
  { label: "Customization", href: "/admin/customization", icon: Settings },
  { label: "Alerts", href: "/admin/notifications", icon: Bell },
  { label: "Support", href: "/admin/support", icon: LifeBuoy },
  { label: "Profile", href: "/admin/profile", icon: User },
];

type SidebarMode = "expanded" | "collapsed" | "hover";

interface Props {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen = false, onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, refreshToken, clearAuth } = useAuthStore();

  const [mode, setMode] = useState<SidebarMode>("expanded");
  const [isHovered, setIsHovered] = useState(false);
  const [controlOpen, setControlOpen] = useState(false);

  const isExpanded = mode === "expanded" || (mode === "hover" && isHovered);

  useEffect(() => {
    const saved = localStorage.getItem(
      "admin-sidebar-mode",
    ) as SidebarMode | null;
    if (saved) setMode(saved);
  }, []);

  function changeMode(nextMode: SidebarMode) {
    setMode(nextMode);
    localStorage.setItem("admin-sidebar-mode", nextMode);
    setControlOpen(false);
  }

  async function signOut() {
    console.info(
      "[Auth][AdminSidebar] User initiated logout — user=" +
        (user?.email ?? "unknown"),
    );
    try {
      await api.post("/api/v1/auth/logout", {
        refreshToken,
        allDevices: false,
      });
    } catch (err) {
      console.warn(
        "[Auth][AdminSidebar] Backend logout request failed (session cleared anyway):",
        err,
      );
    }
    clearAuth();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setControlOpen(false);
      }}
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-62 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 ease-out lg:relative lg:translate-x-0",
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
          href="/admin/dashboard"
          className={cn(
            "flex items-center gap-2.5",
            !isExpanded && "justify-center",
          )}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
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
              <h2 className="text-[13px] font-semibold tracking-wide text-white">
                Logical Links
              </h2>
              <p className="text-[11px] text-zinc-500">Shipping CMS</p>
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
                  "group flex items-center rounded-xl text-[13px] font-medium transition-all duration-200",
                  isExpanded
                    ? "gap-2.5 px-3 py-2.5"
                    : "justify-center px-0 py-3",

                  active
                    ? isExpanded
                      ? "bg-primary text-sidebar shadow-md"
                      : "text-primary"
                    : "text-zinc-300 hover:bg-sidebar-secondary hover:text-white",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-all duration-200",
                    active &&
                      !isExpanded &&
                      "text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.8)]",
                  )}
                />
                {isExpanded && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
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
                {user?.fullName ?? "Admin"}
              </p>
              <p className="truncate text-[11px] text-zinc-400">
                {user?.email ?? ""}
              </p>
              <span className="inline-flex items-center gap-0.5 text-[10px] text-primary">
                <Shield className="h-2.5 w-2.5" />
                System Admin
              </span>
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
        <div className="hidden sm:block relative">
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
              "flex h-9 items-center rounded-xl border border-white/5 text-zinc-400 transition-colors hover:bg-sidebar-secondary hover:text-white",
              isExpanded ? "w-full gap-2.5 px-3" : "w-full justify-center",
            )}
          >
            <PanelLeft className="h-4 w-4" />
            {isExpanded && (
              <span className="text-[13px] font-medium">Sidebar control</span>
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
