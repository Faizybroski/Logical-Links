import { redirect } from "next/navigation";

export default async function AdminLoadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/loads?details=${id}`);
}
