import { redirect } from "next/navigation";

export default function AdminCreateLoadPage() {
  redirect("/admin/loads?create=true");
}
