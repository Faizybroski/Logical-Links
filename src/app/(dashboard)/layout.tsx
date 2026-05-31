import type { Metadata } from "next";
import DashboardShell from "@/components/layout/DashboardShell";
import AuthGuard from "@/components/layout/AuthGuard";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
