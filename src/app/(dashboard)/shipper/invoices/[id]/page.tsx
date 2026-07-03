import { redirect } from "next/navigation";

export default async function ShipperInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/shipper/invoices?details=${id}`);
}
