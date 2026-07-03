import { redirect } from "next/navigation";

export default async function ShipperQuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/shipper/quotations?details=${id}`);
}
