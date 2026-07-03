import { redirect } from "next/navigation";

export default function ShipperCreateQuotationPage() {
  redirect("/shipper/quotations?create=true");
}
