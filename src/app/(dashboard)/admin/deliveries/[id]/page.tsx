import { redirect } from "next/navigation";

export default async function AdminDeliveryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/deliveries?details=${id}`);
}
