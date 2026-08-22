import { redirect } from "next/navigation";

export default function AdminCreateDeliveryPage() {
  redirect("/admin/deliveries?create=true");
}
