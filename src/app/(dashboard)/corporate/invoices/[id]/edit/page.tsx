import { redirect } from "next/navigation";

export default async function CorporateEditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/corporate/invoices?edit=${id}`);
}
