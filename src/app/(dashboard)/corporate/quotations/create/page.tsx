import { redirect } from "next/navigation";

export default function CorporateCreateQuotationPage() {
  redirect("/corporate/quotations?create=true");
}
