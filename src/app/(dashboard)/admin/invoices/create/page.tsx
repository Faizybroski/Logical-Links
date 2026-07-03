import { redirect } from "next/navigation";

export default function AdminCreateInvoicePage() {
  redirect("/admin/invoices?create=true");
}
