import { redirect } from "next/navigation";

export default async function ResidentialLoadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/residential/loads?details=${id}`);
}
