import { redirect } from "next/navigation";

export default async function AdminEditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/invoices?edit=${id}`);
}
