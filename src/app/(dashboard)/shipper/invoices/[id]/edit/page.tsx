import { redirect } from "next/navigation";

export default async function ShipperEditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/shipper/invoices?edit=${id}`);
}
