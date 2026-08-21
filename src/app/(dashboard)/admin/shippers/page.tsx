import { redirect } from "next/navigation";

export default function ShippersRedirectPage() {
  redirect("/admin/corporate-customers");
}
