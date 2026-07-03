import { redirect } from "next/navigation";

export default async function AdminEditLoadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/loads?edit=${id}`);
}
