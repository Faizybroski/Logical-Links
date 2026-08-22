import { redirect } from "next/navigation";

export default async function CorporateDeliveryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/corporate/deliveries?details=${id}`);
}
