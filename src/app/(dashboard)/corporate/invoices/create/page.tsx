import { redirect } from "next/navigation";

export default function CorporateCreateInvoicePage() {
  redirect("/corporate/invoices?create=true");
}
