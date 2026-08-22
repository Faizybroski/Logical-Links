import { redirect } from "next/navigation";

export default async function CorporateEditDeliveryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/corporate/deliveries?edit=${id}`);
}
