import { redirect } from "next/navigation";

export default function CorporateCreateDeliveryPage() {
  redirect("/corporate/deliveries?create=true");
}
