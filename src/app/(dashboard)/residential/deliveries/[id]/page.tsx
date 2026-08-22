import { redirect } from "next/navigation";

export default async function ResidentialDeliveryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/residential/deliveries?details=${id}`);
}
