import { redirect } from "next/navigation";

export default async function AdminEditQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/quotations?edit=${id}`);
}
