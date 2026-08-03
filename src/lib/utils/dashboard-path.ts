export type DashboardRole = "admin" | "shipper" | "residential";

export function dashboardPathForRole(role: DashboardRole | string | undefined): string {
  if (role === "admin") return "/admin/dashboard";
  if (role === "residential") return "/residential/dashboard";
  return "/shipper/dashboard";
}
