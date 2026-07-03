import { redirect } from "next/navigation";

export default async function AdminQuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/quotations?details=${id}`);
}
