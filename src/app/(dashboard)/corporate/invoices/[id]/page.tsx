import { redirect } from "next/navigation";

export default async function CorporateInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/corporate/invoices?details=${id}`);
}
