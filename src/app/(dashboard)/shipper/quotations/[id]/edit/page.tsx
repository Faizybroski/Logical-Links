import { redirect } from "next/navigation";

export default async function ShipperEditQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/shipper/quotations?edit=${id}`);
}
