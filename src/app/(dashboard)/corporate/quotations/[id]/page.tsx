import { redirect } from "next/navigation";

export default async function CorporateQuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/corporate/quotations?details=${id}`);
}
