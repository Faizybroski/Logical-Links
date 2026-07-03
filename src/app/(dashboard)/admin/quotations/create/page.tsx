import { redirect } from "next/navigation";

export default function AdminCreateQuotationPage() {
  redirect("/admin/quotations?create=true");
}
