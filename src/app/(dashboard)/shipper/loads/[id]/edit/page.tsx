import { redirect } from "next/navigation";

export default async function ShipperEditLoadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/shipper/loads?edit=${id}`);
}
