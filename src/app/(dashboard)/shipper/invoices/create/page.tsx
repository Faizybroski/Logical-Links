import { redirect } from "next/navigation";

export default function ShipperCreateInvoicePage() {
  redirect("/shipper/invoices?create=true");
}
