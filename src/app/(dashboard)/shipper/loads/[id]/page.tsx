import { redirect } from "next/navigation";

export default async function ShipperLoadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/shipper/loads?details=${id}`);
}
